var _color= {
	correct: "#0abb40",
	wrong: "#ee2222",
	default: "#4499ff"
};

var _color_multi = {
	red:["#ff8e8b","#ff4b45","#ff0800","#ba0600","#8c0500","#5d0300"],
	green:["#17ff5f","#00d142","#008c2c","#004616"],
	default:"#4499ff"
}
var _operation_settings ={
	"hold_50%":{color:"#008800",size:0.5},
	"hold_100%":{color:"#00ff00",size:1},
	"sell_50%":{color:"#880000",size:0.5},
	"buy_50%":{color:"#008800",size:0.5},
	"sell_100%":{color:"#ff0000",size:0.1},

	"hold":{color:"#888888",size:1},
	"wait":{color:"#888888",size:0.1},
	"sell":{color:"#ff0000",size:0.1},
	"buy":{color:"#000088",size:1}
}


var generateColor ={
	binary: function(d){
		if(d.predict_result ===undefined)
			return "none";
		if(d.predict_result || d.predict == d.output)
			return _color.correct;
		return _color.wrong;
	},
	multiple:function(d){
		if(d.predict === undefined && d.output === undefined)
			return "none";
		if(d.output === undefined)
			return _color_multi.default;
		if((d.predict>3 && d.output >3 )||(d.predict <4 && d.output < 4)){
			return _color_multi.green[3-Math.abs(d.predict - d.output)];
		}else {
			return _color_multi.red[Math.abs(d.predict-d.output)-1];
		}

	}
}



var Diagram  = function(selector,input_data, type){

	///tooltip
	var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);
    ///end tooltip;




	console.log("dig"+type)
	var svg = d3.select(selector),
		margin = {top: 20, right: 20, bottom: 110, left: 40},
	    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
	    width = +svg.attr("width") - margin.left - margin.right,
	    height = +svg.attr("height") - margin.top - margin.bottom, //big diagram
	    height2 = +svg.attr("height") - margin2.top - margin2.bottom; // small image

	//set scales for big diagram
	var x = d3.scaleTime().range([0, width]),
		y = d3.scaleLinear().range([height, 0]),
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
		var colorFunc;
		console.log(type);
		if(type == "multi"){
			colorFunc = generateColor.multiple;
		}else{
			colorFunc= generateColor.binary;
		}
		selection.attr("cx",function(d){return x(new Date(d.date));})
							.attr("cy",function(d){return y(d.close);})
							.attr("r",3)
							.attr("fill",colorFunc);

							

	}

	var drawOperation = function(selection,d){
		selection
				.attr("x", function(d){return x(new Date(d.date))-2;})
				.attr("width",10)
				.attr("y",function(d){return y(d.close)-4/*height-2-(d.operation?_operation_settings[d.operation].size*50:0)*/;})
				.attr("height",function(d){
					if(!d.operation)
						return 0;
					return _operation_settings[d.operation].size*8;
				
				})
				.attr("style",function(d){
							//console.log(d.operation);							
							if(d.operation)
								return "fill:"+_operation_settings[d.operation].color;
							return "fill:none";
							});
	}

// 	var drawOperation2 = function(selection,data){
// 		var localline = d3.line()
// 					.x(function(d){return x(new Date(d.date));})
// 					.y(function(d){return y(d.close)-2;});

// 					//console.log(data);

// //
// //		  context.append("path")
// //	      .datum(data)
// //	      .attr("class", "area")
// //	      .attr("d", line2)
// //		  .attr("stroke",_color.default)
// //		  .attr("stroke-width","2").attr("fill","none");

// 		selection.append("path")
// 			.attr("stroke",function(d){
// 				// console.log("stroke--"+JSON.stringify(data));
// 				// if(!d[0].operation)
// 				// 	return "none";
// 				// return _operation_settings[d[0].operation].color;c
// 				console.log(d);
// 				return "#aaa";
// 			}).attr("stroke-width",function(data){
// 				// if(!d[0].operation)
// 				// 	return 0;
// 				// return _operation_settings[d[0].operation].size*6;
// 				return 10;
// 			}).attr("fill","none")
// 			.attr("class", "operation")
// 			.datum(function(d){return d;})
// 			.attr("d", line1);

// 	}

	d3.json(input_data,function(data){
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
			  .attr("stroke",_color.default)
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

		  focus.append('g').attr('class',"operation-area").selectAll("box")//.append("g").attr("class","operation-area")
		  		.data(data)
		  		.enter().append("rect").attr("class","operation").call(drawOperation);


		  // focus.append('g').attr('class',"operation-area").selectAll("op")
		  // 		.data(data,function(d,i){
		  // 		//console.log(i);
		  // 		//console.log(data[i]);
		  // 	if(i>0){
		  // 		return [data[i-1],data[i]];
		  // 	}
		  // 	return [data[0],data[0]];
		  // }).enter().call(drawOperation2);
		
//---------------------------------------------------------------------------



		  context.append("path")
	      .datum(data)
	      .attr("class", "area")
	      .attr("d", line2)
		  .attr("stroke",_color.default)
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
	  focus.select(".operation-area").selectAll("rect").call(drawOperation);
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
	  focus.selectAll(".operation").call(drawOperation);	
	  focus.select(".axis--x").call(xAxis);
	  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
	}
}




var populateFigure = function(predictDay,selector,type){
	var symbol = $("#symbol_name").html();

	new Diagram(selector[0],"/predict?symbol="+symbol+"&predictDay="+predictDay+"&type="+type, type);
}
var predictFigure1 = populateFigure(1,["#diagram"],TYPE);
var predictFigure2 = populateFigure(3,["#diagram2"],TYPE);
var predictFigure2 = populateFigure(5,["#diagram3"],TYPE);

$("input[name='predictResult']").on("change",function(){
	$(this).parents('.diagram-controler').siblings("svg").children("g.focus").children("circle").toggle();
})

$("input[name='b_action']").on("change",function(){
	$(this).parents('.diagram-controler').siblings("svg").children("g.focus").children("g.operation-area").toggle();
})


