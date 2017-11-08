var searchFunction = function(){
	var symbol = $("#search_symbol").val();
	$.get("/predict/search",{"symbol":symbol},function(data,status){
		console.log(JSON.stringify(data));
		if(!(status==200||status=="200"||status=="success")){
			var waring = $("<div></div>").text(data.message).css("class","col-lg-12 col-md-12 damage");
			$("#search_bar").append(waring);
		}else{
			location.assign("/symbol/"+data.symbol);
		}
	})
}


	$("#search_symbol").keyup(function(event) {
	    if (event.keyCode === 13) {
	        $("#search-btn").click();
	    }
	});
