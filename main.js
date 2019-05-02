"use strict";

window.addEventListener("load", function(){
    let slider = document.getElementById("myRange");
    slider.oninput = function () {
        output.innerHTML = this.value;
    };

    let output = document.getElementById("demo");
    output.innerHTML = slider.value;

    let width = 600;
    let height = 500;

    let projection = d3.geo.mercator().scale(1).translate([0, 0]);

    let path = d3.geo.path().projection(projection);

    let svg = d3.select("body").append("svg").attr("width", width).attr("height", height);

    let url = "https://raw.githubusercontent.com/HXDU/Project-3-Mini-Challenge-3/master/WebCode/StHimark.topojson";

    let tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

    d3.json(url, function (error, topology) {
        if (error)
            throw error;

        let geojson = topojson.feature(topology, topology.objects.StHimark);
        let b = path.bounds(geojson);
        let s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
        let t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

        projection.scale(s).translate(t);

        svg.selectAll("path").data(geojson.features).enter().append("path").attr("d", path).on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.properties.Nbrhood)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        }).on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
    });
    //for slider part-----------------------------------------------------------------------------------


}, false);