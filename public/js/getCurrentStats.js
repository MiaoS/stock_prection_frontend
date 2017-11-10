(function(){
	var symbol = $("#symbol_name").html();
/*	var stats = "apogh"; ////a == ask////p = previous close//o = open//g = low//h = high
	$.get("http://finance.yahoo.com/d/quotes.csv?s="+symbol.toUpperCase()+"&f="+stats,function(data,status,xhr){
		console.log(status);
		console.log(data);
		console.log(xhr);
		if(status!=200||status!="200"||status!="success"||status==999){

			$("#cur_stats").html("Yahoo API is not available.");
		}else{
			var items  = data.split(",");
			$("#cur_price").html(item[0]);
			$("#previous_close").html(item[1]);
			$("#today_open").html(item[2]);
			$("#today_low").html(item[3]);
			$("#today_high").html(item[4]);
		}

	});*/
	var getStatus= function(selectorId,tagId,type,symbol,predictDay){
		if(type == "binary"){
			$.get("/predict/binary/accuracy",{symbol:symbol, predictDay:predictDay},function(data,status){
				if(status==200||status=="200"||status=="success"){
					console.log(data);
					$(selectorId).html((data.test_accuracy*100).toFixed(2)+"%");
					var label;
					if(data.predict=="Rise"){
						label = "label-success";
					}else{
						label = "label-danger";
					}
					$(tagId).addClass(label);
					$(tagId).html(data.predict);//.addClass(label);
				}
			});
		}else{
			$.get("/predict/multi/score",{symbol:symbol, predictDay:predictDay},function(data,status){
				if(status==200||status=="200"||status=="success"){
					console.log(data);
					$(selectorId).html(data.test_mae.toFixed(2));
					var label;
					if(data.predict<4){
						label = "label-success";
					}else{
						label = "label-danger";
					}
					$(tagId).addClass(label);
					$(tagId).html(data.predictResult);//.addClass(label);
				}
			});
		}
	}
	// getStatus("#acc1","#pre_res_1","binary",symbol,1);
	// getStatus("#acc2","#pre_res_2","binary",symbol,3);
	// getStatus("#acc3","#pre_res_3","binary",symbol,5);
	console.log("stats"+$("#TYPE").val())
	getStatus("#acc1","#pre_res_1",$("#TYPE").value,symbol,1);
	getStatus("#acc2","#pre_res_2",$("#TYPE").value,symbol,3);
	getStatus("#acc3","#pre_res_3",$("#TYPE").value,symbol,5);
/*	$.get("/predict/binary/accuracy",{symbol:symbol, predictDay:1},function(data,status){
		if(status==200||status=="200"||status=="success"){
			console.log(data);
			$("#acc1").html((data.test_accuracy*100).toFixed(2)+"%");
			var label;
			if(data.predict=="Rise"){
				label = "label-success";
			}else{
				label = "label-danger";
			}
			$("#pre_res_1").addClass(label);
			$("#pre_res_1").html(data.predict);//.addClass(label);
		}
	});
		$.get("/predict/binary/accuracy",{symbol:symbol, predictDay:3},function(data,status){
		if(status==200||status=="200"||status=="success"){
			console.log(data);
			$("#acc2").html((data.test_accuracy*100).toFixed(2)+"%");
			var label;
			if(data.predict=="Rise"){
				label = "label-success";
			}else{
				label = "label-danger";
			}
			$("#pre_res_2").addClass(label);
			$("#pre_res_2").html(data.predict);//.addClass(label);
		}
	});
		$.get("/predict/accuracy",{symbol:symbol, predictDay:5},function(data,status){
		if(status==200||status=="200"||status=="success"){
			console.log(data);
			$("#acc3").html((data.test_accuracy*100).toFixed(2)+"%");
						var label;
			if(data.predict<=3){
				label = "label-success";
			}else{
				label = "label-danger";
			}
			$("#pre_res_3").addClass(label);
			$("#pre_res_3").html(data.predict);//.addClass(label);
		}
	});*/
})();