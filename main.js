"use strict";

const E_TIME = new Date("2020-04-06 14:33:00");

// ------------------------------------ SLIDER ----------------------------------------------------

$( function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 5606,
      values: [ 0, 330 ],
      slide: function( event, ui )
      {
          var date1 = new Date( E_TIME.getTime() );
          var date2 = new Date( E_TIME.getTime() );

          date1.setMinutes( date1.getMinutes() +  ui.values[ 0 ] );
          date2.setMinutes( date2.getMinutes() +  ui.values[ 1 ] );

          $( "#date" ).val( formatedDate(date1) + " to " + formatedDate(date2)  );

          // update map visualization using data points between date1 and date2
          // updateViz( date1, date2 )

      }
    });

    var date1 = new Date( E_TIME.getTime() );
    var date2 = new Date( E_TIME.getTime() );

    date1.setMinutes( date1.getMinutes() +  $( "#slider-range" ).slider( "values", 0 ) );
    date2.setMinutes( date2.getMinutes() +  $( "#slider-range" ).slider( "values", 1 ) );

    $( "#date" ).val( formatedDate(date1) + " to " + formatedDate(date2)  );


    // update map visualization using data points between date1 and date2
    // updateViz( date1, date2 )

} );

function formatedDate( date )
{
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
}


// ------------------------------------ HEATMAP ----------------------------------------------------

(function(){

let width = 600,
    height = 500;
let projection = d3.geo.mercator()
    .scale(1)
    .translate([0, 0]);
let path = d3.geo.path()
    .projection(projection);
let svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);
let url = "https://raw.githubusercontent.com/HXDU/Project-3-Mini-Challenge-3/master/WebCode/StHimark.topojson";
let tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
d3.json(url, function (error, topology) {
    if (error) throw error;
    let geojson = topojson.feature(topology, topology.objects.StHimark);
    let b = path.bounds(geojson),
        s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
        t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];
    projection
        .scale(s)
        .translate(t);
    svg.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .style("fill","red")
        .style("opacity", Math.random )
        .on("mouseover", function (d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.properties.Nbrhood)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
});


})();