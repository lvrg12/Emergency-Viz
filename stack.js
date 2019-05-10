var causes = ["situation","health","food","water","electric","shelter"];

var parseDate = d3.time.format("%m/%d/%Y %H:%M").parse;

var margin = {top: 20, right: 50, bottom: 30, left: 20},
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
    .tickFormat(d3.time.format("%b"));

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("right");

var stack_svg = d3.select("#content").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

addTitle(stack_svg,width,20,"20px","Messages Posted per Hour");

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
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

      stack_svg.append("g")
      .attr("class", "axis axis--y")
      .attr("transform", "translate(" + width + ",0)")
      .call(yAxis);
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