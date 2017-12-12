var TYPE = $("#TYPE").val();
var setDefault= function(){
	TYPE = "binary";
	$("#TYPE").val(TYPE);

}
var setAdvance=function(){
	TYPE = "multi";
	$("#TYPE").val(TYPE);
}

var searchFunction = function(){
	var symbol = $("#search_symbol").val();
	$.get("/predict/search",{"symbol":symbol},function(data,status){
		console.log(JSON.stringify(data));
		if(!(status==200||status=="200"||status=="success")||data.status!==200){
			var waring = $("<div class='col-lg-8 col-md-8 col-lg-offset-4 text-danger'></div>").text(data.message);
			$("#search_bar").append(waring);
		}else{
			location.assign("/symbol/"+data.symbol+"?type="+TYPE);
		}
	})
}


	$("#search_symbol").keyup(function(event) {
	    if (event.keyCode === 13) {
	        $("#search-btn").click();
	    }
	});
