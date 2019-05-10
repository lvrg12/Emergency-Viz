"use strict";

(function () {
    let format = d3.time.format("%Y-%m-%d %H:%M:%S");

    let margin = { top: 20, right: 30, bottom: 30, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    let x = d3.time.scale()
        .range([0, width]);

    let y = d3.scale.linear()
        .range([height, 0]);

    let z = d3.scale.category20c();

    let xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    let yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    let stack = d3.layout.stack()
        .offset("zero")
        .values(function (d) { return d.values; })
        .x(function (d) { return d.time; })
        .y(function (d) { return d.sentiment; });

    let nest = d3.nest()
        .key(function (d) { return d.category; });
    
    let area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.time); })
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.y); });

    let svg = d3.select("div#content").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("data/test.csv", function (error, data) {
        if (error) throw error;

        data.forEach(function (d) {
            d.time = format.parse(d.time);
            d.sentiment = +d.sentiment;
        });

        let layers = stack(nest.entries(data));

        x.domain(d3.extent(data, function (d) { return d.time; }));
        y.domain([0, d3.max(data, function (d) { return d.y0 + d.y; })]);

        svg.selectAll(".layer")
            .data(layers)
            .enter().append("path")
            .attr("class", "layer")
            .attr("d", function (d) { return area(d.values); })
            .style("fill", function (d, i) { return z(i); });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
    });
})();