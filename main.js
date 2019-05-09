"use strict";

var counties = [ "Weston", "Southton", "Broadview", "West Parton", "Old Town", "Terrapin Springs",
                 "Downtown", "Southwest", "Scenic Vista", "East Parton", "Cheddarford",
                 "Palace Hills", "Safe Town", "Easton", "Chapparal", "Northwest", "Oak Willow",
                 "Pepper Mill", "Wilson Forest", "UNKNOWN", "<Location with-held due to contract>"];

var overall_average = {};
var overall_count = {};
var health_average = {};
var health_count = {};
var food_average = {};
var food_count = {};
var water_average = {};
var water_count = {};
var electricity_average = {};
var electricity_count = {};

var s_date = new Date( "2020-4-6 14:33:00" );
var e_date = new Date( "2020-4-6 20:30:00" );

const E_TIME = new Date("2020-04-06 14:33:00");

// ------------------------------------ SLIDER ----------------------------------------------------

$( function()
{
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 5606,
      values: [ 0, 330 ]
    });

    $( "#date" ).val( formatedDate(s_date) + " to " + formatedDate(e_date)  );

    function formatedDate( date )
    {
        return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    }

} );

// ------------------------------------ HEATMAP ----------------------------------------------------

// svg
var overall_svg = d3.select("svg#overall_map");
var health_svg = d3.select("svg#health_map");
var food_svg = d3.select("svg#food_map");
var water_svg = d3.select("svg#water_map");
var electricity_svg = d3.select("svg#electricity_map");

var b_width = +overall_svg.attr("width");
var b_height = +overall_svg.attr("height");
var s_width = +health_svg.attr("width");
var s_height = +health_svg.attr("height");

// color scale
var colorAverage = d3.scale.linear()
		.domain([ -1, 0, 1 ])
        .range(["red","white","green"]);

var colorCount = d3.scale.linear()
		.domain([ 0, 150, 300 ])
        .range(["white","blue"]);

// Load external data and boot
queue()
  .defer(d3.json, "https://raw.githubusercontent.com/HXDU/Project-3-Mini-Challenge-3/master/WebCode/StHimark.topojson" )
  .defer(d3.csv, "https://raw.githubusercontent.com/lvrg12/Emergency-Viz/master/data/test.csv" )
  .await(ready);

function ready( error, topology, data )
{
    if (error)
        throw error;

    data.forEach( function(d) {
        d.time = new Date( d.time );
    });

    // console.log(topology);
    // console.log(data);

    // Map and projection
    var projection = d3.geo.mercator().scale(1).translate([0, 0]);
    var path = d3.geo.path().projection(projection);
    var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

    var geojson = topojson.feature( topology, topology.objects.StHimark );
    var b = path.bounds(geojson);
    var s = .95 / Math.max((b[1][0] - b[0][0]) / b_width, (b[1][1] - b[0][1]) / b_height);
    var t = [(b_width - s * (b[1][0] + b[0][0])) / 2, (b_height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s).translate(t);

    var overall_map = overall_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    s = .95 / Math.max((b[1][0] - b[0][0]) / s_width, (b[1][1] - b[0][1]) / s_height);
    t = [(s_width - s * (b[1][0] + b[0][0])) / 2, (s_height - s * (b[1][1] + b[0][1])) / 2];
    
    projection.scale(s).translate(t);

    addColorGradientLegend( overall_svg, 140, 400 );

    var health_map = health_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    var food_map = food_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    var water_map = water_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    var electricity_map = electricity_svg.selectAll("map").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);

    addTitle( overall_svg, b_width, 17, "16px", "Overall Resource Map" );
    addTitle( health_svg, s_width, 10,"12px", "Health Map" );
    addTitle( food_svg, s_width, 10,"12px", "Food Map" );
    addTitle( water_svg, s_width, 10,"12px", "Water Map" );
    addTitle( electricity_svg, s_width, 10,"12px", "Electricity Map" );

    function showTooltip(d)
    {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(d.properties.Nbrhood)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function hideTooltip(d)
    {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    var update = function update( date1, date2 )
    {
        // initializing variables
        for( var i=0; i<counties.length; i++ )
        {
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
        for( var i=0; i<data.length; i++ )
        {
            if( data[i].time >= date1
                & data[i].time < date2
                & data[i].category != "none" )
            {
                overall_average[data[i].location] += +data[i].sentiment;
                overall_count[data[i].location]++;

                if( data[i].category == "health" )
                {
                    health_average[data[i].location] += +data[i].sentiment;
                    health_count[data[i].location]++;
                }
                
                if( data[i].category == "food" )
                {
                    food_average[data[i].location] += +data[i].sentiment;
                    food_count[data[i].location]++;
                }

                if( data[i].category == "water" )
                {
                    water_average[data[i].location] += +data[i].sentiment;
                    water_count[data[i].location]++;
                }

                if( data[i].category == "electric" )
                {
                    electricity_average[data[i].location] += +data[i].sentiment;
                    electricity_count[data[i].location]++;
                }

            }
        }

        // computing average
        for( var c in overall_average )
        {
            if( overall_average[c] != 0 )
                overall_average[c] = overall_average[c] / overall_count[c];

            if( health_average[c] != 0 )
                health_average[c] = health_average[c] / health_count[c];

            if( food_average[c] != 0 )
                food_average[c] = food_average[c] / food_count[c];

            if( water_average[c] != 0 )
                water_average[c] = water_average[c] / water_count[c];

            if( electricity_average[c] != 0 )
                electricity_average[c] = electricity_average[c] / electricity_count[c];

        }

        // updating maps
        updateMaps( overall_map, overall_average, overall_count );
        updateMaps( health_map, health_average, health_count );
        updateMaps( food_map, food_average, food_count );
        updateMaps( water_map, water_average, water_count );
        updateMaps( electricity_map, electricity_average, electricity_count );

        function updateMaps( map, average, count )
        {
            var operation = document.getElementById("operation").value;

            if( operation == "average" )
            {
                map.style("fill", function(d) {
                    return colorAverage(average[d.properties.Nbrhood])
                });
            }
            else
            {
                map.style("fill", function(d) {
                    return colorCount(count[d.properties.Nbrhood])
                });
            }

        }

    }

    update( s_date, e_date );

    function addTitle( svg, w, h, size, text )
    {
        svg.append("text")
            .attr("x", w / 2 )             
            .attr("y", h )
            .style("text-anchor", "middle")
            .style("font-size", size) 
            .text( text );
    }

    function addColorGradientLegend( svg, w, h )
    {
        var legendText = ["-1","-0.5","0","0.5","1"];

        var legendColors = [colorAverage(-1),colorAverage(-0.5), colorAverage(0),
                            colorAverage(0.5), colorAverage(1)];

        var legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(0,30)")

        legend.append("text")
            .attr("x", 25 * 2.5)
            .attr("y", -15)
            .style("text-anchor", "middle")
            .style("font-size", "8px") 
            .text("Sentiment Analysis Score");

        var legenditem = legend.selectAll(".legenditem")
            .data(d3.range(5))
            .enter()
            .append("g")
                .attr("class", "legenditem")
                .attr("transform", function(d, i) { return "translate(" + i * 26 + ",0)"; });

        legenditem.append("rect")
            .attr("x", 0)
            .attr("y", -7)
            .attr("width", 25)
            .attr("height", 6)
            .attr("class", "rect")
            .style("fill", function(d, i) { return legendColors[i]; });

        legenditem.append("text")
            .attr("x", 12.5)
            .attr("y", 9)
            .style("text-anchor", "middle")
            .style("font-size", "8px") 
            .text(function(d, i) { return legendText[i]; });

    }

    function addColorGradientLegend2( svg, w, h )
    {
        var key = svg.append("svg")
            .attr("width", w)
            .attr("height", h);
    
        var legend = key.append("defs")
            .append("linearGradient")
            .attr("id", "gradient")
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");
    
        legend.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "red")
            .attr("stop-opacity", 1);

        legend.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 1);
        
        legend.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "green")
            .attr("stop-opacity", 1);

        key.append("rect")
            .attr("width", w - 100)
            .attr("height", h - 100)
            .style("fill", "url(#gradient)")
            .attr("transform", "translate(0,10)");
    
        var y = d3.scale.linear().range([300, 0]).domain([-1, 1]);
    
        var yAxis = d3.svg.axis().scale(y).orient("right");
    
        key.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(41,10)")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 30)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("axis title");
        
    }

    function getDate( value )
    {
        var date = new Date( E_TIME.getTime() );
        date.setMinutes( date.getMinutes() +  value );
        return date;
    }

    function formatedDate( date )
    {
        return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    }

    $( function()
    {
        $( "#slider-range" ).slider({
          range: true,
          min: 0,
          max: 5606,
          values: [ 0, 330 ],
          slide: function( event, ui )
          {
              var date1 = getDate(ui.values[0]);
              var date2 = getDate(ui.values[1])
              $( "#date" ).val( formatedDate( date1 ) + " TO " + formatedDate( date2 ) );
    
              // update map visualization using data points between date1 and date2
              update( date1, date2 )
    
          }
        });
    
        $( "#date" ).val( formatedDate(s_date) + " to " + formatedDate(e_date)  );
    
    } );


    document.getElementById("operation").onchange = update( getDate( $( "#slider-range" ).slider( "values", 0 ) ), getDate( $( "#slider-range" ).slider( "values", 1 ) ) );
    
}


// var overall_map = svg.selectAll("path").data(geojson.features)
//         .enter()
//         .append("path")
//         .attr("d", path)
//         .on("mouseover", function (d){
//             tooltip.transition()
//                 .duration(200)
//                 .style("opacity", .9);
//             tooltip.html(d.properties.Nbrhood)
//                 .style("left", (d3.event.pageX) + "px")
//                 .style("top", (d3.event.pageY - 28) + "px");
//             })
//         .on("mouseout", function (d) {
//             tooltip.transition()
//                 .duration(500)
//                 .style("opacity", 0);
//             });