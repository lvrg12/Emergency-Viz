"use strict";

let counties = ["Weston", "Southton", "Broadview", "West Parton", "Old Town", "Terrapin Springs",
    "Downtown", "Southwest", "Scenic Vista", "East Parton", "Cheddarford",
    "Palace Hills", "Safe Town", "Easton", "Chapparal", "Northwest", "Oak Willow",
    "Pepper Mill", "Wilson Forest", "UNKNOWN", "<Location with-held due to contract>"];

let overall_average = {};
let overall_count = {};
let health_average = {};
let health_count = {};
let food_average = {};
let food_count = {};
let water_average = {};
let water_count = {};
let electricity_average = {};
let electricity_count = {};

let s_date = new Date("2020-4-6 14:33:00");
let e_date = new Date("2020-4-6 20:30:00");

const E_TIME = new Date("2020-04-06 14:33:00");

// ------------------------------------ SLIDER ----------------------------------------------------

$(function () {
    $("#slider-range").slider({
        range: true,
        min: 0,
        max: 5606,
        values: [0, 330]
    });

    $("#date").val(formatedDate(s_date) + " to " + formatedDate(e_date));

    function formatedDate(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    }

});

// ------------------------------------ HEATMAP ----------------------------------------------------

// svg
let overall_svg = d3.select("svg#overall_map");
let health_svg = d3.select("svg#health_map");
let food_svg = d3.select("svg#food_map");
let water_svg = d3.select("svg#water_map");
let electricity_svg = d3.select("svg#electricity_map");

let b_width = +overall_svg.attr("width");
let b_height = +overall_svg.attr("height");
let s_width = +health_svg.attr("width");
let s_height = +health_svg.attr("height");

// color scale
let colorAverage = d3.scale.linear()
    .domain([-1, 0, 1])
    .range(["red", "white", "green"]);

let colorCount = d3.scale.linear()
    .domain([0, 300])
    .range(["white", "blue"]);

// Load external data and boot
queue()
    .defer(d3.json, "https://raw.githubusercontent.com/HXDU/Project-3-Mini-Challenge-3/master/WebCode/StHimark.topojson")
    .defer(d3.csv, "https://raw.githubusercontent.com/lvrg12/Emergency-Viz/master/data/test.csv")
    .await(ready);

function ready(error, topology, data) {
    if (error)
        throw error;

    data.forEach(function (d) {
        d.time = new Date(d.time);
    });

    // console.log(topology);
    // console.log(data);

    // Map and projection
    let projection = d3.geo.mercator().scale(1).translate([0, 0]);
    let path = d3.geo.path().projection(projection);
    let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

    let geojson = topojson.feature(topology, topology.objects.StHimark);
    let b = path.bounds(geojson);
    let s = .95 / Math.max((b[1][0] - b[0][0]) / b_width, (b[1][1] - b[0][1]) / b_height);
    let t = [(b_width - s * (b[1][0] + b[0][0])) / 2, (b_height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s).translate(t);

    geojson.features.forEach(function (d) {
        d.properties.average = {};
        d.properties.count = {};
    });

    let overall_map = overall_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", function (d) { showTooltip(d, "overall") })
        .on("mouseout", hideTooltip);

    s = .95 / Math.max((b[1][0] - b[0][0]) / s_width, (b[1][1] - b[0][1]) / s_height);
    t = [(s_width - s * (b[1][0] + b[0][0])) / 2, (s_height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s).translate(t);

    addAverageLegend(overall_svg);
    addCountLegend(overall_svg);

    let health_map = health_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", function (d) { showTooltip(d, "health") })
        .on("mouseout", hideTooltip);

    let food_map = food_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", function (d) { showTooltip(d, "food") })
        .on("mouseout", hideTooltip);

    let water_map = water_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", function (d) { showTooltip(d, "water") })
        .on("mouseout", hideTooltip);

    let electricity_map = electricity_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", function (d) { showTooltip(d, "electricity") })
        .on("mouseout", hideTooltip);

    addTitle(overall_svg, b_width, 17, "16px", "Overall Resource Map");
    addTitle(health_svg, s_width, 10, "12px", "Health Map");
    addTitle(food_svg, s_width, 10, "12px", "Food Map");
    addTitle(water_svg, s_width, 10, "12px", "Water Map");
    addTitle(electricity_svg, s_width, 10, "12px", "Electricity Map");

    function showTooltip(d, type) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(

            "<div style='text-align:center'><strong>" + d.properties.Nbrhood + "</strong></div>" +
            "<table><tr><td>Avg. Sentiment Score:</td><td>" + d.properties.average[type].toFixed(2) + "</td></tr>" +
            "<tr><td>Message Count:</td><td>" + d.properties.count[type] + "</td></tr></table>"

        )
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function hideTooltip(d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    let update = function update(date1, date2) {
        let operation = document.getElementById("operation").value;

        // initializing letiables
        for (let i = 0; i < counties.length; i++) {
            overall_average[counties[i]] = 0;
            overall_count[counties[i]] = 0;

            health_average[counties[i]] = 0;
            health_count[counties[i]] = 0;

            food_average[counties[i]] = 0;
            food_count[counties[i]] = 0;

            water_average[counties[i]] = 0;
            water_count[counties[i]] = 0;

            electricity_average[counties[i]] = 0;
            electricity_count[counties[i]] = 0;

        }


        // filtering data
        for (let i = 0; i < data.length; i++) {
            if (data[i].time >= date1
                & data[i].time < date2
                & (data[i].category != "none" & data[i].category != "situation" & data[i].category != "shelter")) {
                overall_average[data[i].location] += +data[i].sentiment;
                overall_count[data[i].location]++;

                if (data[i].category == "health") {
                    health_average[data[i].location] += +data[i].sentiment;
                    health_count[data[i].location]++;
                } else if (data[i].category == "food") {
                    food_average[data[i].location] += +data[i].sentiment;
                    food_count[data[i].location]++;
                } else if (data[i].category == "water") {
                    water_average[data[i].location] += +data[i].sentiment;
                    water_count[data[i].location]++;
                } else if (data[i].category == "electric") {
                    electricity_average[data[i].location] += +data[i].sentiment;
                    electricity_count[data[i].location]++;
                }

            }
        }

        // computing average
        for (let c in overall_average) {
            if (overall_average[c] != 0)
                overall_average[c] = overall_average[c] / overall_count[c];

            if (health_average[c] != 0)
                health_average[c] = health_average[c] / health_count[c];

            if (food_average[c] != 0)
                food_average[c] = food_average[c] / food_count[c];

            if (water_average[c] != 0)
                water_average[c] = water_average[c] / water_count[c];

            if (electricity_average[c] != 0)
                electricity_average[c] = electricity_average[c] / electricity_count[c];

        }

        geojson.features.forEach(function (d) {
            d.properties.average["overall"] = overall_average[d.properties.Nbrhood];
            d.properties.average["health"] = health_average[d.properties.Nbrhood];
            d.properties.average["food"] = food_average[d.properties.Nbrhood];
            d.properties.average["water"] = water_average[d.properties.Nbrhood];
            d.properties.average["electricity"] = electricity_average[d.properties.Nbrhood];

            d.properties.count["overall"] = overall_count[d.properties.Nbrhood];
            d.properties.count["health"] = health_count[d.properties.Nbrhood];
            d.properties.count["food"] = food_count[d.properties.Nbrhood];
            d.properties.count["water"] = water_count[d.properties.Nbrhood];
            d.properties.count["electricity"] = electricity_count[d.properties.Nbrhood];
        });

        // updating maps
        updateMaps(overall_map, overall_average, overall_count);
        updateMaps(health_map, health_average, health_count);
        updateMaps(food_map, food_average, food_count);
        updateMaps(water_map, water_average, water_count);
        updateMaps(electricity_map, electricity_average, electricity_count);

        function updateMaps(map, average, count) {

            if (operation == "average") {
                map.style("fill", function (d) {
                    return colorAverage(average[d.properties.Nbrhood])
                });
            } else {
                map.style("fill", function (d) {
                    return colorCount(count[d.properties.Nbrhood])
                });
            }

            // map.on( "mousedown", console.log("helloworld"));

        }

        if (operation == "average") {
            d3.select("#average_legend").style("opacity", 1);
            d3.select("#count_legend").style("opacity", 0);
        } else {
            d3.select("#average_legend").style("opacity", 0);
            d3.select("#count_legend").style("opacity", 1);
        }

    }

    update(s_date, e_date);

    function addTitle(svg, w, h, size, text) {
        svg.append("text")
            .attr("x", w / 2)
            .attr("y", h)
            .style("text-anchor", "middle")
            .style("font-size", size)
            .text(text);
    }

    function addAverageLegend(svg) {
        let legendText = ["-1", "-0.5", "0", "0.5", "1"];

        let legendColors = [colorAverage(-1), colorAverage(-0.5), colorAverage(0),
        colorAverage(0.5), colorAverage(1)];

        let legend = svg.append("g")
            .attr("id", "average_legend")
            .attr("transform", "translate(0,30)")
            .style("opacity", 0);

        legend.append("text")
            .attr("x", 25 * 2.5)
            .attr("y", -15)
            .style("text-anchor", "middle")
            .style("font-size", "8px")
            .text("Sentiment Analysis Score");

        let legenditem = legend.selectAll(".legenditem")
            .data(d3.range(5))
            .enter()
            .append("g")
            .attr("class", "legenditem")
            .attr("transform", function (d, i) { return "translate(" + i * 26 + ",0)"; });

        legenditem.append("rect")
            .attr("x", 0)
            .attr("y", -7)
            .attr("width", 25)
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

    function addCountLegend(svg) {
        let legendText = ["0", "75", "150", "225", ">300"];

        let legendColors = [colorCount(0), colorCount(75), colorCount(150),
        colorCount(225), colorCount(300)];

        let legend = svg.append("g")
            .attr("id", "count_legend")
            .attr("transform", "translate(0,30)")
            .style("opacity", 0);

        legend.append("text")
            .attr("x", 25 * 2.5)
            .attr("y", -15)
            .style("text-anchor", "middle")
            .style("font-size", "8px")
            .text("Message Count");

        let legenditem = legend.selectAll(".legenditem")
            .data(d3.range(5))
            .enter()
            .append("g")
            .attr("class", "legenditem")
            .attr("transform", function (d, i) { return "translate(" + i * 26 + ",0)"; });

        legenditem.append("rect")
            .attr("x", 0)
            .attr("y", -7)
            .attr("width", 25)
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

    function getDate(value) {
        let date = new Date(E_TIME.getTime());
        date.setMinutes(date.getMinutes() + value);
        return date;
    }

    function formatedDate(date) {
        return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    }

    $(function () {
        $("#slider-range").slider({
            range: true,
            min: 0,
            max: 5606,
            values: [0, 330],
            slide: function (event, ui) {
                let date1 = getDate(ui.values[0]);
                let date2 = getDate(ui.values[1])
                $("#date").val(formatedDate(date1) + " TO " + formatedDate(date2));

                // update map visualization using data points between date1 and date2
                update(date1, date2)

            }
        });

        $("#date").val(formatedDate(s_date) + " to " + formatedDate(e_date));

    });


    document.getElementById("operation").onchange = update(getDate($("#slider-range").slider("values", 0)), getDate($("#slider-range").slider("values", 1)));

}