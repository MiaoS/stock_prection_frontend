var color= {
	correct: "#0abb40",
	wrong: "#ee2222",
	default: "#4499ff"
};

var svg = d3.select("#diagram"),
	margin = {top: 20, right: 20, bottom: 110, left: 40},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom, //big diagram
    height2 = +svg.attr("height") - margin2.top - margin2.bottom; // small image

//set scales for big diagram
var x = d3.scaleTime().range([0, width]),
	y = y = d3.scaleLinear().range([height, 0]),
//set scales for small diagram
	x2 = d3.scaleTime().range([0, width]),
	y2 = d3.scaleLinear().range([height2, 0]);

//setup axis
var xAxis = d3.axisBottom(x),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y);

//setup the area where big digram will display
var brush = d3.brushX()
    .extent([[0, 0], [width, height2]])
    .on("brush end", brushed);

var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on("zoom", zoomed);

//{"date":"2017-10-27","open":159.289993,"high":163.600006,"low":158.699997,"close":163.050003,"adjClose":163.050003,"volume":44171100,"symbol":"AAPL"}
//{"date":"2017-10-26","open":157.229996,"high":157.830002,"low":156.779999,"close":157.410004,"adjClose":157.410004,"volume":17000500,"symbol":"AAPL","output":"Rise","predict_result":true}
var line1 = d3.line()
				.x(function(d){return x(new Date(d.date));})
				.y(function(d){return y(d.close);});




var line2 = d3.line()
				.x(function(d){return x2(new Date(d.date));})
				.y(function(d){return y2(d.close);});



svg.append("defs")
		.append("clipPath")
    		.attr("id", "clip")
  		.append("rect")
    		.attr("width", width)
    		.attr("height", height);

//the big map
var focus = svg.append("g").attr("class", "focus")
							 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


//the small map
var context = svg.append("g")
							.attr("class", "context")
							.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


var drawcircle = function(selection,d){
	selection.attr("cx",function(d){return x(new Date(d.date));})
						.attr("cy",function(d){return y(d.close);})
						.attr("r",2.5)
						.attr("fill",function(d){
		  						if(d.predict_result ===undefined)
									return "none";
		  						if(d.predict_result)
									return color.correct;
		  						return color.wrong;
	  							});
}

d3.json("./data/predict-modified.json",function(data){
	//set up min & max of x&y
	console.log(data[2]);
	x.domain(d3.extent(data,function(d){return new Date(d.date);}));
	y.domain([d3.min(data,function(d){return d.close*0.5;}),d3.max(data,function(d){return d.close*1.3;})]);
	x2.domain(x.domain());
	y2.domain(y.domain());
	
	//draw the big diagram
	  focus.append("path")
		  .datum(data)
		  .attr("class", "area")
		  .attr("d", line1)
		  .attr("stroke",color.default)
		  .attr("stroke-width","3").attr("fill","none");

	  focus.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height + ")")
		  .call(xAxis);

	  focus.append("g")
		  .attr("class", "axis axis--y")
		  .call(yAxis);
	
	  focus.selectAll("circle")
			.data(data).enter()
				.append("circle").call(drawcircle);
		
	  context.append("path")
      .datum(data)
      .attr("class", "area")
      .attr("d", line2)
	  .attr("stroke",color.default)
	  .attr("stroke-width","2").attr("fill","none");

	  context.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," + height2 + ")")
		  .call(xAxis2);

	  context.append("g")
		  .attr("class", "brush")
		  .call(brush)
		  .call(brush.move, x.range());

	  svg.append("rect")
		  .attr("class", "zoom")
		  .attr("width", width)
		  .attr("height", height)
		  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		  .call(zoom);
});

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.select(".area").attr("d", line1);
  focus.selectAll("circle").call(drawcircle);	
  focus.select(".axis--x").call(xAxis);
  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));
}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  focus.select(".area").attr("d", line1);
  focus.selectAll("circle").call(drawcircle);	
  focus.select(".axis--x").call(xAxis);
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}
