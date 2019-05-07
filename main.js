"use strict";

var counties = [ "Weston", "Southton", "Broadview", "West Parton", "Old Town", "Terrapin Springs",
                 "Downtown", "Southwest", "Scenic Vista", "East Parton", "Cheddarford",
                 "Palace Hills", "Safe Town", "Easton", "Chapparal", "Northwest", "Oak Willow",
                 "Pepper Mill", "Wilson Forest", "UNKNOWN", "<Location with-held due to contract>"];
var counties_average = {};
var counties_totals = {};

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

function update(year)
{
    slider.property("value", year);
    d3.select(".year").text(year);
    countyShapes.style("fill", function(d) {
        return color(d.properties.years[year][0].rate)
    });
}

// ------------------------------------ HEATMAP ----------------------------------------------------

// The svg
var svg = d3.select("svg");
var width = +svg.attr("width");
var height = +svg.attr("height");

// color scale
var color = d3.scale.threshold()
		.domain([ -1, -0.5, 0, 0.5, 1 ])
		.range(["#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);

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
    var s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    projection.scale(s).translate(t);

    var paths = svg.selectAll("path").data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        // .on("mouseover", function (d){
        //     tooltip.transition()
        //         .duration(200)
        //         .style("opacity", .9);
        //     tooltip.html(d.properties.Nbrhood)
        //         .style("left", (d3.event.pageX) + "px")
        //         .style("top", (d3.event.pageY - 28) + "px");
        //     })
        // .on("mouseout", function (d) {
        //     tooltip.transition()
        //         .duration(500)
        //         .style("opacity", 0);
        //     });

    //

    var date1 = s_date;
    var date2 = e_date;

    // initializing variables
    for( var i=0; i<counties.length; i++ )
    {
        counties_average[counties[i]] = 0;
        counties_totals[counties[i]] = 0;
    }

    // filtering data
    for( var i=0; i<data.length; i++ )
    {
        if( data[i].time >= date1
            & data[i].time < date2
            & data[i].category != "none" )
        {
            counties_average[data[i].location] += +data[i].sentiment;
            counties_totals[data[i].location]++;
        }
    }

    // computing average
    for( var c in counties_average )
    {
        if( counties_average[c] == 0 ) continue; 
        counties_average[c] = counties_average[c] / counties_totals[c];
    }

    // updating map
    // svg.selectAll("path")
    //     .style("fill", color(Math.random()) );

    paths.style("fill", function(d) {
        return color(counties_average[d.properties.Nbrhood])
    });


    function update(year)
    {
		slider.property("value", year);
		d3.select(".year").text(year);
		countyShapes.style("fill", function(d) {
			return color(d.properties.years[year][0].rate)
		});
    }
    
}


function reacdy(error, data, us) 
{

	var countyShapes = svg.selectAll(".county")
		.data(counties.features)
		.enter()
		.append("path")
			.attr("class", "county")
			.attr("d", path);

	countyShapes
		.on("mouseover", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 1);
			tooltip.html(
			"<p><strong>" + d.properties.years[1996][0].county + ", " + d.properties.years[1996][0].state + "</strong></p>" +
			"<table><tbody><tr><td class='wide'>Smoking rate in 1996:</td><td>" + formatPercent((d.properties.years[1996][0].rate)/100) + "</td></tr>" +
			"<tr><td>Smoking rate in 2012:</td><td>" + formatPercent((d.properties.years[2012][0].rate)/100) + "</td></tr>" +
			"<tr><td>Change:</td><td>" + formatPercent((d.properties.years[2012][0].rate-d.properties.years[1996][0].rate)/100) + "</td></tr></tbody></table>"
			)
			.style("left", (d3.event.pageX + 15) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			tooltip.transition()
			.duration(250)
			.style("opacity", 0);
		});


	function update(year){
		slider.property("value", year);
		d3.select(".year").text(year);
		countyShapes.style("fill", function(d) {
			return color(d.properties.years[year][0].rate)
		});
	}

	var slider = d3.select(".slider")
		.append("input")
			.attr("type", "range")
			.attr("min", 1996)
			.attr("max", 2012)
			.attr("step", 1)
			.on("input", function() {
				var year = this.value;
				update(year);
			});

update(1996);

}

// d3.select(self.frameElement).style("height", "685px");