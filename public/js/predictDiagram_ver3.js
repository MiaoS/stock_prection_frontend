var _testArea= "#eee0cb";// light redish grey
var _profitColor = ["#baa898","#839788","#000000","#556699"]; //deep redish grey, deep blue-ish grey, color for profit line , color for fill prfit area

var _predictResultColor = ["#2fe50f","#bcff08","#ffd10c","#ff6f08","#ff1200"];//green to red
var _closeLineColor ="#4499ff";
var _outputColor = _profitColor[1];
var _predictColor =  _predictResultColor[3];
var _accuracyColor = "#ee9999";

var Diagram = function(selector,predict,symbol){
	this.diagramArea = d3.select(selector);
	//main figure svg
	this.svg = this.diagramArea.select(".show-area");
	//
	this.margin = {top: 40, right: 100, bottom: 110, left: 40};
	this.margin2 ={top: 430, right: 20, bottom: 30, left: 20};
	this.width =this.svg.attr("width") - this.margin.left - this.margin.right;
	this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom;
	this.mainArea = this.svg.append("g").attr("class", "focus")
								 .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
	


	this.zoomArea = this.svg.append("g").attr("class", "zoom")
								 .attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");;
	
	this.contextArea = this.svg.append("g")
								.attr("class", "context")
								.attr("transform", "translate(" + this.margin2.left + "," + this.margin2.top + ")");

	this.samplerArea=this.diagramArea.select(".model-selector");
	this.type  = TYPE;

	this.mainX =d3.scaleTime().range([0, this.svg.attr("width") - this.margin.left - this.margin.right]);
	this.mainY =d3.scaleLinear().range([this.svg.attr("height") - this.margin.top - this.margin.bottom, 0]);
	
	this.zoomY =d3.scaleLinear().range([this.svg.attr("height") - this.margin2.top - this.margin2.bottom, 0]);
	this.zoomX =d3.scaleTime().range([0, this.svg.attr("width") - this.margin2.left - this.margin2.right]);
	
	this.accY = d3.scaleLinear().range([this.svg.attr("height") - this.margin.top - this.margin.bottom, 0]);
	this.profitY = d3.scaleLinear().range([this.svg.attr("height") - this.margin.top - this.margin.bottom, 0]);

	this.annData;
	this.rfData;
	this.dtData;
	this.svmData;
	this.data;

	this.xAxis=d3.axisBottom(this.mainX);
	this.yAxis=d3.axisLeft(this.mainY);
	this.xAxis2=d3.axisBottom(this.zoomX);
	this.accYAxis;
	this.profitYAxis;
	this.predictYAxis; // for multi-label prediction

	this.closeLine;
	this.accuracyLine;
	this.predictMultiLine; // for multi -label
	this.outputMultiLine; // for multi-label
	this.profitLine;
	this.dataPath = "/predict?symbol="+symbol+"&predictDay="+predict+"&type="+TYPE;
	this.predictDay=predict;
	this.iconArea = this.svg.append("g").attr("class","icon-area");
	this.iconX = this.margin.left*2.5;
	this.iconY = 100;

}

Diagram.prototype.addIcon=function(className,outlineColor,fillingColor,descr){
	this.iconArea.append("circle")
			.attr("cx",this.iconX).attr("cy",this.iconY).attr("r","8")
			.attr("stroke",outlineColor).attr("stroke-width","2").attr("fill", fillingColor);
	this.iconArea.append("text").attr("x",this.iconX+20).attr("y",this.iconY+4).style("font-size",".8em")
		.text(descr);
	this.iconY -= 20;
}

Diagram.prototype.drawClosePrice = function() {
	//draw close line for main figure area
	var temp = this;
	this.closeLine = d3.line()
					.x(function(d){return temp.mainX(new Date(d.date));})
					.y(function(d){return temp.mainY(d.close);});

	this.mainX.domain(d3.extent(temp.data,function(d){return new Date(d.date);}));
	this.mainY.domain([d3.min(temp.data,function(d){return d.close;}),d3.max(temp.data,function(d){return d.close;})]);
	this.zoomX.domain(temp.mainX.domain());
	this.zoomY.domain(temp.mainY.domain());

	//draw the big diagram
	this.mainArea.append("path")
		  .datum(temp.data)
		  .attr("class", "area close-price-layer")
		  .attr("d", temp.closeLine)
		  .attr("stroke",_closeLineColor)
		  .attr("stroke-width","3").attr("fill","none");
	// draw the axis
	this.mainArea.append("g")
		  .attr("class", "axis axis--x price-close-x")
		  .attr("transform", "translate(0," + temp.height + ")")
		  .call(temp.xAxis);

	this.mainArea.append("g")
		  .attr("class", "axis axis--y price-close-y")
		  .call(temp.yAxis);
	
	this.svg.append("text")
				.attr("transform", "rotate(-90)")
				.attr("x", -110 )
				.attr("y", 20)
	 			.attr("font-size", ".8em")
				.attr("fill","white")
				.attr("stroke","black")
				.style("text-anchor", "start")
				.attr("class","close-price-layer")
				.text("Close Price");
	
	this.addIcon("color-price-layer",_closeLineColor, "none","Close Price");

};

Diagram.prototype.drawAccuracy = function(model) {
	var figure,curdata,x,y,accuracyLine;
	if(model){
		figure = this.samplerArea.select("#"+model+"-sampler").select("svg");//.append("g").attr("transform", "translate(0,0)");
		curdata = this[model+"Data"].filter(function(d){return d.test_accuracy;});
		//console.table(this);
		x = d3.scaleTime().range([0,figure.attr("width")]);
		y = d3.scaleLinear().range([figure.attr("height"),0]);

	}else{
		figure = this.mainArea.append("g").attr("class","accuracy-layer");// for jquery to troggle this class 
		curdata = this.data.filter(function(d){return d.test_accuracy;});
		x = this.mainX;
		y = this.accY;
	}
	
	if(curdata.length ==0){
		console.log(d3.select(d3.select(figure.node().parentNode).node().parentNode).attr("class"))
		d3.select(figure.node().parentNode).remove();
		return;
	}
	x.domain(d3.extent(curdata,function(d){return new Date(d.date);}));
	y.domain([0,1.1]);

	var accuracyLine = d3.line()
					.x(function(d){return x(new Date(d.date));})
					.y(function(d){return y(d.test_accuracy||0);});

	// draw the line
	figure.append("path").attr("class"," accuracy-line")
					.datum(curdata.filter(function(d){return d.test_accuracy;})).attr("stroke", _accuracyColor ).attr("stroke-width",3).attr("d", accuracyLine).attr("fill","none");

	//draw  Y axis for accuracy
	if(!model){
		this.accYAxis = d3.axisLeft(y).tickFormat(function(d){return (d*100).toFixed(0)+"%"});// for jquery to troggle this class 
		this.mainArea.append("g")
			  .attr("class", "axis axis--y accuracy-layer acc-y").attr("transform", "translate(" + (this.width+this.margin.left) + ",0)")
			  .call(this.accYAxis);
		this.accuracyLine = accuracyLine;
		
		this.svg.append("text")
				.attr("transform", "rotate(-90)")
				.attr("x", -110 )
				.attr("y", this.svg.attr("width")-this.margin.right+5)//
	 			.attr("font-size", ".8em")
				.attr("fill","white")
				.attr("stroke","black")
				.style("text-anchor", "start")
				.attr("class","accuracy-layer")
				.text("Test Acc %");
		
		this.addIcon("accuracy-layer", _accuracyColor , "none","Acc %");
	}

};

Diagram.prototype.drawProfit = function() {
	var temp = this;
	this.profitY.domain([d3.min(temp.data,function(d){return d.profit;}),d3.max(temp.data,function(d){return d.profit;})]);
	this.profitYAxis = d3.axisRight(temp.profitY).tickFormat(function(d){return (d*100).toFixed(2)+"%"});

	//draw figure;
	this.profitLine = d3.area()
						.x(function(d){return temp.mainX(new Date(d.date));})
						.y1(function(d){return temp.profitY(d.profit);})
						.y0(function(d){return temp.profitY(0);});

	var profitArea = this.mainArea.append("g").attr("class","profit-layer");
	profitArea.append("path")
			.datum(temp.data.filter(function(d){return d.profit;}))
			.attr("d",this.profitLine)
			.attr("stroke",_profitColor[2])
			.attr("stroke-width",0)
			.attr("fill",_profitColor[3]).attr("opacity",0.8);

	//draw axisY
	this.mainArea.append("g")
			  .attr("class", "axis axis--y profit-layer profit-y").attr("transform", "translate("+(this.width+this.margin.left)+",0)")
			  .call(temp.profitYAxis);
	
	this.svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -110 )
		.attr("y", this.width+this.margin.right+this.margin.left)
		.attr("font-size", ".8em")
		.style("text-anchor", "start")
		.attr("class","profit-layer")
		.attr("fill","white")
		.attr("stroke","black")
		.text("Profit %");
	
 	this.addIcon("profit-layer", "none" , _profitColor[3],"Profit %");
};

Diagram.prototype.drawMae = function(model) {
	var figure,curdata,x,y;
	if(model){
		figure = this.samplerArea.select("#"+model+"-sampler").select("svg").append("g");
		curdata = this[model+"Data"].filter(function(d){return d.predict;});
		x = d3.scaleTime().range([0,this.diagramArea.select(".model-selector").select("#"+model+"-sampler").select("svg").attr("width")]);
		y = d3.scaleLinear().range([this.diagramArea.select(".model-selector").select("#"+model+"-sampler").select("svg").attr("height"),0]);
	}else{
		figure = this.mainArea.append("g").attr("class","mae-layer");
		curdata = this.data.filter(function(d){return d.predict||d.output;});
		x = this.mainX;
		y = this.accY;
	}
	if(curdata.length==0){
		//console.log(figure.attr("class"));
		console.log(d3.select(d3.select(figure.node().parentNode).node().parentNode).attr("class"))
		d3.select(d3.select(figure.node().parentNode).node().parentNode).remove();
		return;
	}
	
	
	x.domain(d3.extent(curdata,function(d){return new Date(d.date);}));
	y.domain([0,7]);

	this.predictMultiLine = d3.line()
					.x(function(d){return x(new Date(d.date));})
					.y(function(d){return y(7-d.predict);});

	this.outputMultiLine = d3.line()
					.x(function(d){return x(new Date(d.date));})
					.y(function(d){return y(7-d.output);});
	// draw the line
	
	figure.datum(curdata.filter(function(d){return d.output;})).append("path").attr("class"," mae-output-line")
					.attr("stroke", _outputColor ).attr("fill","none").attr("stroke-width",3).attr("d", this.outputMultiLine);
	figure.datum(curdata).append("path").attr("class"," mae-predict-line")
					.attr("stroke",_predictColor ).attr("fill","none").attr("stroke-width",3).attr("d", this.predictMultiLine);

	//draw  Y axis for accuracy
	if(!model){
		this.accYAxis = d3.axisLeft(y).tickFormat(function(d){
			var labels =[">10%","5~10%","2~5%","0~2%","-2~0%","-5~-2%","-10~-5%","<-10%"];
			return labels[7-d];
		});// for jquery to troggle this class 
		this.mainArea.append("g")
			  .attr("class", "axis axis--y mae-layer").attr("transform", "translate(" + (this.width+this.margin.left) + ",0)")
			  .call(this.accYAxis);
		this.svg.append("text")
			//.attr("transform", "rotate(-90)")
			.attr("x", this.width)
			.attr("y", this.margin.top/2)
			.attr("font-size", ".8em")
			.style("text-anchor", "start")
			.attr("class","accuracy-layer")
			.attr("fill","white")
			.attr("stroke","black")
			.text("Change %/"+this.predictDay+" days");
		this.addIcon("mae-layer mae-output-line", _outputColor , "none","Actual Change %");
		this.addIcon("mae-layer mae-predict-line", _predictColor , "none","Predict Change %");
	}


};

Diagram.prototype.drawZoom = function() {
	var closeline = this.closeLine;
	var accuracyLine = this.accuracyLine;
	var profitLine = this.profitLine;
	var predictMultiLine = this.predictMultiLine;
	var outputMultiLine = this.outputMultiLine;

	var accYAxis = this.accYAxis;
	var predictYAxis = this.predictYAxis;
	var profitYAxis = this.profitYAxis;
	var xAxis = this.xAxis;

	var mainArea  = this.mainArea;
	var svg = this.svg;
	var mainX = this.mainX;
	var zoomX = this.zoomX;
	var zoomY = this.zoomY;
	var contextArea = this.contextArea;
	var width = this.width;

	var zoomLine = d3.line()
						.x(function(d){return zoomX(new Date(d.date));})
						.y(function(d){return zoomY(d.close);});

	this.svg.append("defs")
				.append("clipPath")
		    		.attr("id", "clip")
		  		.append("rect")
		    		.attr("width", this.width)
		    		.attr("height", this.height);

	var brush = d3.brushX()
	    .extent([[0, 0], [this.svg.attr("width") - this.margin2.left - this.margin2.right, this.svg.attr("height") - this.margin2.top - this.margin2.bottom]])
	    .on("brush end", brushed);

	var zoom = d3.zoom()
	    .scaleExtent([1, Infinity])
	    .translateExtent([[0, 0], [this.width, this.height]])
	    .extent([[0, 0], [this.width, this.height]])
	    .on("zoom", zoomed);


	this.contextArea.append("path")
      .datum(this.data)
      .attr("class", "area")
      .attr("d", zoomLine)
	  .attr("stroke",_closeLineColor)
	  .attr("stroke-width","2").attr("fill","none");

	this.contextArea.append("g")
		  .attr("class", "axis axis--x")
		  .attr("transform", "translate(0," +(this.svg.attr("height") - this.margin2.top - this.margin2.bottom) + ")")
		  .call(this.xAxis2);

	this.contextArea.append("g")
		  .attr("class", "brush")
		  .call(brush)
		  .call(brush.move, this.mainX.range());

	function brushed() {
	  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom

	  var s = d3.event.selection || zoomX.range();
	  mainX.domain(s.map(zoomX.invert, zoomX));
	  // update main figure;
	  mainArea.select(".area").attr("d", closeline); // big figure
	  if(accuracyLine)
	  	mainArea.select(".accuracy-line").attr("d",accuracyLine);
	  if(outputMultiLine){
	  	mainArea.select(".mae-output-line").attr("d",outputMultiLine);
	  	mainArea.select(".mae-predict-line").attr("d",predictMultiLine);
	  }
	  mainArea.select(".profit-layer").select("path").attr("d",profitLine);

	  // update axises
	  mainArea.select(".price-close-x").call(xAxis);
	  mainArea.select(".profit-y").call(profitYAxis);

	  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity.scale(width / (s[1] - s[0]))
	      .translate(-s[0], 0));
	}

	function zoomed() {
	  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
	  var t = d3.event.transform;
	  mainX.domain(t.rescaleX(zoomX).domain());

	  mainArea.select(".area").attr("d", closeline);

	  if(accuracyLine)
	  	mainArea.select(".accuracy-line").attr("d",accuracyLine);
	  if(outputMultiLine){
	  	mainArea.select(".mae-output-line").attr("d",outputMultiLine);
	  	mainArea.select(".mae-predict-line").attr("d",predictMultiLine);
	  }
	  mainArea.select(".profit-layer").select("path").attr("d",profitLine);


	  mainArea.select(".price-close-x").call(xAxis);
	  mainArea.select(".profit-y").call(profitYAxis);

	  contextArea.select(".brush").call(brush.move, mainX.range().map(t.invertX, t));
	}

};

Diagram.prototype.populateData = function() {
	var bestacc=(TYPE=='binary')?0:9;
    var temp = this;


    d3.json(this.dataPath,function(data){

    	
    	if(TYPE == "binary"){
			temp.dtData = data[0]; //DT
    		temp.svmData= data[1]; // SVM
	    	temp.annData=data[2];  // ann
	    	temp.rfData = data[3];  // rf

    		if(temp.svmData.length!=0 
			   && (temp.annData.length ==0 || temp.svmData[0].test_accuracy>=temp.annData[0].test_accuracy) 
			   && (temp.rfData.length ==0 || temp.svmData[0].test_accuracy>=temp.rfData[0].test_accuracy) 
			   && (temp.dtData.length ==0 || temp.svmData[0].test_accuracy >= temp.dtData[0].test_accuracy)){
    			temp.data= temp.svmData;
    			temp.samplerArea.select("#svm-sampler").classed("selected",true);
    		}else if(temp.annData.length!=0
					 && (temp.svmData.length==0||temp.annData[0].test_accuracy>=temp.svmData[0].test_accuracy) 
					 && (temp.rfData.length ==0 || temp.annData[0].test_accuracy>=temp.rfData[0].test_accuracy )
					 && (temp.dtData.length ==0 ||temp.annData[0].test_accuracy >= temp.dtData[0].test_accuracy)){
    			temp.data= temp.annData;
    			temp.samplerArea.select("#ann-sampler").classed("selected",true);
    		}else if(temp.rfData.length!=0
					 && (temp.annData.length ==0||temp.rfData[0].test_accuracy>=temp.annData[0].test_accuracy) 
					 && (temp.svmData.length==0||temp.rfData[0].test_accuracy>=temp.svmData[0].test_accuracy )
					 && (temp.dtData.length==0||temp.rfData[0].test_accuracy >= temp.dtData[0].test_accuracy)){
    			temp.data= temp.rfData;
    			temp.samplerArea.select("#rf-sampler").classed("selected",true);
    		}else{
				temp.data= temp.dtData;
    			temp.samplerArea.select("#dt-sampler").classed("selected",true);
			}
    	}else{
	    	temp.annData=data[0];	    	
	    	temp.rfData = data[1];
	    	if(temp.annData.length!=0&& (temp.rfData.length ==0 ||temp.annData[0].test_mae <= temp.rfData[0].test_mae)){
	    		temp.data = temp.annData;
				temp.samplerArea.select("#ann-sampler").classed("selected",true);
	    	}else{
				temp.data = temp.rfData;
				temp.samplerArea.select("#rf-sampler").classed("selected",true);
			}
    	}
    	if(TYPE=="binary"){
    		temp.drawAccuracy("svm");
    		temp.drawAccuracy("ann");
    		temp.drawAccuracy("rf");
    		temp.drawAccuracy("dt");
			temp.drawAccuracy();
    	}else{
    		temp.drawMae("ann");
    		temp.drawMae("rf");
    		temp.drawMae();
    	}
	    temp.drawClosePrice();
	    temp.drawProfit()
		temp.drawZoom();
		temp.selectionOperaton();
		/////---------
		updateTabFields(temp);


    });
	return this;
};

var updateTabFields= function(temp,data){
	if(!data){
		data = temp.data;
	}
	
		if(TYPE == "binary"){
			console.log(data[0].profit);
			
			$("#acc"+temp.predictDay).html((data[0].test_accuracy*100).toFixed(2)+"%");
			var label;
			if(temp.data[0].predict=="Rise"){
				label = "label label-success";
			}else{
				label = "label label-danger";
			}
			$("#pre_res_"+temp.predictDay).attr("class",label);
			$("#pre_res_"+temp.predictDay).html(data[0].predict);//.addClass(label);
			$("#profit"+temp.predictDay).html((data[0].profit*100).toFixed(2)+"%");
			$("#cpm"+temp.predictDay).html((data[0].max_rise*100).toFixed(2)+"%");
			if(data[0].predict == "Rise"){
				$("#op"+temp.predictDay).html("Buy");
			}else{
				$("#op"+temp.predictDay).html("Sell");
			}

			$("#cp"+temp.predictDay).html((data[0].rise*100).toFixed(2)+"%");
			//console.table(data[0]);
			$("#tsd"+temp.predictDay).html(data[0].test_start_date.substring(0,10));
			
		}else{
		
			$("span.accuName").html("Test_MAE: ");
			$("#acc"+temp.predictDay).html((data[0].test_mae).toFixed(2));
			var label;
			if(data[0].predict<4){
				label = "label label-success";
			}else{
				label = "label label-danger";
			}
			$("#pre_res_"+temp.predictDay).attr("class",label);
			$("#pre_res_"+temp.predictDay).html(data[0].predictResult);//.addClass(label);
			$("#profit"+temp.predictDay).html((data[0].profit*100).toFixed(2)+"%");
			$("#cp"+temp.predictDay).html((data[0].rise*100).toFixed(2)+"%");
			$("#cpm"+temp.predictDay).html((data[0].max_rise*100).toFixed(2)+"%");
			
			$("#tsd"+temp.predictDay).html(data[0].test_start_date.substring(0,10));

			if(temp.data[0].predict <=2 ){
				$("#op"+temp.predictDay).html("All In");
			}else if(temp.data[0].predict <=3){
				$("#op"+temp.predictDay).html("50% In");
			}else{
				$("#op"+temp.predictDay).html("All Out");
			}
		}

}

var updateDiagram = function(data,obj){
	obj.data = data;
	obj.profitY.domain([d3.min(data,function(d){return d.profit;}),d3.max(data,function(d){return d.profit;})]);
	obj.mainX.domain(d3.extent(data,function(d){return new Date(d.date);}));

	//update lines
	obj.mainArea.select(".area").attr("d", obj.closeLine); // big figure
	//sconsole.log(obj.closeLine)
	 if(obj.accuracyLine){
	  	obj.mainArea.select(".accuracy-line").datum(data.filter(function(d){return d.test_accuracy;})).attr("d",obj.accuracyLine);
	  	obj.mainArea.select(".acc-y").call(obj.accYAxis);
	  }
	 if(obj.outputMultiLine){
	  	obj.mainArea.select(".mae-output-line").datum(data.filter(function(d){return d.output;})).attr("d",obj.outputMultiLine);
	  	obj.mainArea.select(".mae-predict-line").datum(data.filter(function(d){return d.predict;})).attr("d",obj.predictMultiLine);
	  }
	 if(obj.profitLine){
		//console.table(data);
		//obj.profitY.domain([d3.min(data,function(d){return d.profit||0;}),d3.max(data,function(d){return d.profit||0;})]);
		obj.mainArea.select(".profit-layer").select("path").datum(data.filter(function(d){return d.profit;})).attr("d",obj.profitLine);
		obj.mainArea.select(".profit-y").call(obj.profitYAxis);
	}

	//update axises
	obj.mainArea.select(".price-close-x").call(obj.xAxis);
	
	
}



Diagram.prototype.selectionOperaton=function(){
	var data;
	var temp = this;
	//update diagram &data;
	this.samplerArea.selectAll("figure")
			.on("click",function(d,i,nodes){
				d3.selectAll(nodes).classed("selected",false);
				var selector = d3.select(this)
				selector.classed("selected",true);
				if(selector.attr("id")== "dt-sampler"){
					updateDiagram(temp.dtData,temp);
					updateTabFields(temp,temp.dtData);
				}else if(selector.attr("id")== "ann-sampler"){
					updateDiagram(temp.annData,temp);
					updateTabFields(temp,temp.annData);
				}else if(selector.attr("id")== "rf-sampler"){
					updateDiagram(temp.rfData,temp);
					updateTabFields(temp,temp.rfData);
				}else{
					updateDiagram(temp.svmData,temp);
					updateTabFields(temp,temp.svmData);
				}
			});
}




var populateFigure = function(predictDay,selector){
	var symbol = $("#symbol_name").html();

	var diag = new Diagram(selector,predictDay,symbol);

	diag.populateData();

}
var predictFigure1 = populateFigure(1,"#predict_one_day");
var predictFigure2 = populateFigure(3,"#predict_three_day");
var predictFigure2 = populateFigure(5,"#predict_five_day");

$("input[name='predictResult']").on("change",function(){
	if(TYPE == "binary"){
		$(this).parents('.diagram-controler').siblings("svg").find(".accuracy-layer").toggle();
	}else{
		$(this).parents('.diagram-controler').siblings("svg").find(".mae-layer").toggle();
	}
})

$("input[name='profit']").on("change",function(){
	$(this).parents('.diagram-controler').siblings("svg").find(".profit-layer").toggle();
})

$("input[name='close_prices']").on("change",function(){
	$(this).parents('.diagram-controler').siblings("svg").find(".close-price-layer").toggle();
})


