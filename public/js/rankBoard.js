var oneRankingBoard = function(url,$scope,$http){
	console.log("start http");
	$http({
		method:"GET",
		url:url,

	}).then(function success(resp){
		console.log(resp);
		if(resp.status==200 && !resp.data.status){
			$scope.list = resp.data;
		}
		
	},function failure(resp){
		console.log(resp.statusText);
	});
}

var rankboardApp = angular.module("rankBoard",[]);

rankboardApp.controller("day1TopAcc",function($scope,$http){

    oneRankingBoard("/api/rank/bestAcc?d=1",$scope,$http);

});
rankboardApp.controller("day3TopAcc",function($scope,$http){

    oneRankingBoard("/api/rank/bestAcc?d=3",$scope,$http);

});
rankboardApp.controller("day5TopAcc",function($scope,$http){

    oneRankingBoard("/api/rank/bestAcc?d=5",$scope,$http);

});

rankboardApp.controller("day1TopRise",function($scope,$http){

    oneRankingBoard("/api/rank/recommend?d=1&type=0",$scope,$http);

});
rankboardApp.controller("day3TopRise",function($scope,$http){

    oneRankingBoard("/api/rank/recommend?d=3&type=0",$scope,$http);

});
rankboardApp.controller("day5TopRise",function($scope,$http){

    oneRankingBoard("/api/rank/recommend?d=5&type=0",$scope,$http);

});

rankboardApp.controller("day1TopFail",function($scope,$http){

    oneRankingBoard("/api/rank/recommend?d=1&type=1",$scope,$http);

});
rankboardApp.controller("day3TopFail",function($scope,$http){

    oneRankingBoard("/api/rank/recommend?d=3&type=1",$scope,$http);

});
rankboardApp.controller("day5TopFail",function($scope,$http){

    oneRankingBoard("/api/rank/recommend?d=5&type=1",$scope,$http);

});