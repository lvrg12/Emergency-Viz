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
var electric_average = {};
var electric_count = {};
var shelter_average = {};
var shelter_count = {};

var s_date = new Date( "2020-4-6 14:33:00" );
var e_date = new Date( "2020-4-6 20:30:00" );

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
        //   update( date1, date2 )

      }
    });

    $( "#date" ).val( formatedDate(s_date) + " to " + formatedDate(e_date)  );

} );

function formatedDate( date )
{
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
}

// ------------------------------------ HEATMAP ----------------------------------------------------

// svg
var overall_svg = d3.select("svg#overall_map");
var health_svg = d3.select("svg#health_map");
var food_svg = d3.select("svg#food_map");
var water_svg = d3.select("svg#water_map");
var electric_svg = d3.select("svg#electric_map");
var shelter_svg = d3.select("svg#shelter_map");

var b_width = +overall_svg.attr("width");
var b_height = +overall_svg.attr("height");
var s_width = +health_svg.attr("width");
var s_height = +health_svg.attr("height");

// color scale
var color = d3.scale.linear()
		.domain([ -1, 0, 1 ])
        .range(["red","white","green"]);

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

    console.log(topology);
    console.log(data);

    // Map and projection
    var projection = d3.geo.mercator().scale(1).translate([0, 0]);
    var path = d3.geo.path().projection(projection);
    var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

    var geojson = topojson.feature( topology, topology.objects.StHimark );
    var b = path.bounds(geojson);
    var s = .95 / Math.max((b[1][0] - b[0][0]) / b_width, (b[1][1] - b[0][1]) / b_height);
    var t = [(b_width - s * (b[1][0] + b[0][0])) / 2, (b_height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s).translate(t);

    var overall_map = overall_svg.selectAll("overall_path").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path);

    s = .95 / Math.max((b[1][0] - b[0][0]) / s_width, (b[1][1] - b[0][1]) / s_height);
    t = [(s_width - s * (b[1][0] + b[0][0])) / 2, (s_height - s * (b[1][1] + b[0][1])) / 2];
    
    projection.scale(s).translate(t);

    var health_map = health_svg.selectAll("health_path").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path);

    var food_map = food_svg.selectAll("food_path").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path);

    var water_map = water_svg.selectAll("water_path").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path);

    var electric_map = electric_svg.selectAll("electric_path").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path);

    var shelter_map = shelter_svg.selectAll("shelter_path").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path);

    var date1 = s_date;
    var date2 = e_date;

    update( date1, date2 )

    function update( date1, date2 )
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

            electric_average[counties[i]] = 0;
            electric_count[counties[i]] = 0;

            shelter_average[counties[i]] = 0;
            shelter_count[counties[i]] = 0;
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
                    electric_average[data[i].location] += +data[i].sentiment;
                    electric_count[data[i].location]++;
                }

                if( data[i].category == "shelter" )
                {
                    shelter_average[data[i].location] += +data[i].sentiment;
                    shelter_count[data[i].location]++;
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

            if( electric_average[c] != 0 )
                electric_average[c] = electric_average[c] / electric_count[c];

            if( shelter_average[c] != 0 )
                shelter_average[c] = shelter_average[c] / shelter_count[c];
        }

        // updating maps
        overall_map.style("fill", function(d) {
            return color(overall_average[d.properties.Nbrhood])
        });

        health_map.style("fill", function(d) {
            return color(health_average[d.properties.Nbrhood])
        });

        food_map.style("fill", function(d) {
            return color(food_average[d.properties.Nbrhood])
        });

        water_map.style("fill", function(d) {
            return color(water_average[d.properties.Nbrhood])
        });

        electric_map.style("fill", function(d) {
            return color(electric_average[d.properties.Nbrhood])
        });

        shelter_map.style("fill", function(d) {
            return color(shelter_average[d.properties.Nbrhood])
        });
    }

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
              update( date1, date2 )
    
          }
        });
    
        $( "#date" ).val( formatedDate(s_date) + " to " + formatedDate(e_date)  );
    
    } );
    
    function formatedDate( date )
    {
        return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
    }
    
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
