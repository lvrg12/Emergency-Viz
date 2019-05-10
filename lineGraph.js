var margin = {top: 20, right: 80, bottom: 30, left: 50},
    width = 900 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;


var x = d3.time.scale()
    .range([0,width]);

var y = d3.scale.linear()
    .range([height,0]);

var color = d3.scale.category10();

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return x(d.time); })
    .y(function(d) { return y(d.sentiment); });

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/test.csv", function(error, data) {


    color.domain(d3.keys(data[0]).filter(function(key) { return key == "category"; }));

    // format data

    data = data.map( function (d) {
        return {
            category: d.category,
            time: parseDate(d.time),
            sentiment: +d.sentiment };
    });


    // nest the data on category since we want to only draw one line per category
    data = d3.nest().key(function(d) { return d.category; }).entries(data);


    x.domain([d3.min(data, function(d) { return d3.min(d.values, function (d) { return d.time; }); }),
        d3.max(data, function(d) { return d3.max(d.values, function (d) { return d.time; }); })]);
    y.domain([d3.min(data, function(d) { return d3.min(d.values, function (d) { return d.sentiment; }); }),
        d3.max(data, function(d) { return d3.max(d.values, function (d) { return d.sentiment; }); })]);


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    var categories = svg.selectAll(".category")
        .data(data, function(d) { return d.key; })
        .enter().append("g")
        .attr("class", "category");

    categories.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.key); });

});