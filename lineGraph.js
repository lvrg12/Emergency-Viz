"use strict";

let lineGraph = function (date1, date2) {
    let margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 1500 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;


    let x = d3.time.scale()
        .range([0, width]);

    let y = d3.scale.linear()
        .range([height, 0]);

    let color = d3.scale.category10();

    let xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    let yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    let line = d3.svg.line()
        .interpolate("basis")
        .x(function (d) {
            return x(d.time);
        })
        .y(function (d) {
            return y(d.sentiment);
        });
    d3.select("div#content").select('#lineGraph').remove();
    let svg = d3.select("div#content").append("svg").attr('id', 'lineGraph')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    let sentimentData;
    d3.csv("data/test3.csv", function (error, data) {
        sentimentData = data;
        drawLineGraph(date1, date2);
    });
    function drawLineGraph(date1, date2) {
        let data = sentimentData.slice();
        let tmp = [];
        data.forEach( function(d)
        {
            if(d.category!="none")
                tmp.push(d);
        });

        data = tmp;
        color.domain(d3.keys(data[0]).filter(function (key) {
            return key == "category";
        }));

        // format data

        data = data.map(function (d) {
            return {
                category: d.category,
                time: parseDate(d.time),
                sentiment: +d.sentiment
            };
        });
        //Filter data
        if(date1 && date2){
            data = data.filter(d=>d.time>=date1 && d.time<=date2);
        }

        // nest the data on category since we want to only draw one line per category
        data = d3.nest().key(function (d) {
            return d.category;
        }).entries(data);


        x.domain([d3.min(data, function (d) {
            return d3.min(d.values, function (d) {
                return d.time;
            });
        }),
            d3.max(data, function (d) {
                return d3.max(d.values, function (d) {
                    return d.time;
                });
            })]);
        y.domain([d3.min(data, function (d) {
            return d3.min(d.values, function (d) {
                return d.sentiment;
            });
        }),
            d3.max(data, function (d) {
                return d3.max(d.values, function (d) {
                    return d.sentiment;
                });
            })]);


        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        addTitle(svg,width,20,"20px","Sentiment Analysis Score");
        addLegend(svg);

        let categories = svg.selectAll(".category")
            .data(data, function (d) {
                return d.key;
            })
            .enter().append("g")
            .attr("class", "category");

        categories.append("path")
            .attr("class", "line")
            .attr("d", function (d) {
                return line(d.values);
            })
            .style("stroke", function (d) {
                return c10(d.key);
            });

            function addTitle(svg, w, h, size, text) {
                svg.append("text")
                    .attr("x", w / 2)
                    .attr("y", h)
                    .style("text-anchor", "middle")
                    .style("font-size", size)
                    .text(text);
            }
            
            function addLegend(svg) {
                let legendText = causes;

                let legendColors = [c10(causes[0]), c10(causes[1]), c10(causes[2]), c10(causes[3]), c10(causes[4]), c10(causes[5]) ];

                let legend = svg.append("g")
                    .attr("id", "average_legend")
                    .attr("transform", "translate(0,30)");
            
                legend.append("text")
                    .attr("x", 25 * 3)
                    .attr("y", -15)
                    .style("text-anchor", "middle")
                    .style("font-size", "8px")
                    .text("Resource Type");
            
                let legenditem = legend.selectAll(".legenditem")
                    .data(d3.range(6))
                    .enter()
                    .append("g")
                    .attr("class", "legenditem")
                    .attr("transform", function (d, i) { return "translate(" + i * 32 + ",0)"; });
            
                legenditem.append("rect")
                    .attr("x", 0)
                    .attr("y", -7)
                    .attr("width", 30)
                    .attr("height", 6)
                    .attr("class", "rect")
                    .style("fill", function (d, i) { return legendColors[i]; });
            
                legenditem.append("text")
                    .attr("x", 12.5)
                    .attr("y", 9)
                    .style("text-anchor", "middle")
                    .style("font-size", "8px")
                    .text(function (d, i) { return legendText[i]; });
            
            }

    }

};
lineGraph();