var causes = ["situation","health","food","water","electric","shelter"];

var parseDate = d3.time.format("%m/%d/%Y %H:%M").parse;

var margin = {top: 20, right: 50, bottom: 60, left: 20},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width]);

var y = d3.scale.linear()
    .rangeRound([height, 0]);

var z = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickFormat(d3.time.format("%m/%d/%Y %H:%M"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right");

var c10 = d3.scale.category10();

var stack_svg = d3.select("#content").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

addTitle(stack_svg,width,20,"20px","Messages Posted per Hour");
addLegend(stack_svg);

d3.csv("data/aggregate.csv", type, function(error, crimea) {
  if (error) throw error;

  var layers = d3.layout.stack()(causes.map(function(c) {
    return crimea.map(function(d) {
      return {x: d.date, y: d[c]};
    });
  }));

  x.domain(layers[0].map(function(d) { return d.x; }));
  y.domain([0, d3.max(layers[layers.length - 1], function(d) { return d.y0 + d.y; })]).nice();

  var layer = stack_svg.selectAll(".layer")
      .data(layers)
    .enter().append("g")
      .attr("class", "layer")
      .style("fill", function(d, i) { return z(i); });

  layer.selectAll("rect")
      .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.x); })
      .attr("y", function(d) { return y(d.y + d.y0); })
      .attr("height", function(d) { return y(d.y0) - y(d.y + d.y0); })
      .attr("width", x.rangeBand() - 1);

      stack_svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start")
        .style("font-size","6px")

      stack_svg.append("g")
      .attr("class", "yAxis")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);

    //   stack_svg.selectAll(".xAxis text")
    //     .attr("transform", "rotate(90)")
    //     .style("text-anchor", "start")
    //     .style("text-size","5px");
});

function type(d) {
  d.date = parseDate(d.date);
  causes.forEach(function(c) { d[c] = +d[c]; });
  return d;
}

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