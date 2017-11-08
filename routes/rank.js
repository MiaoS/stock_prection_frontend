var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");
var col = "predictResults";

router.get('/bestAcc', function(req, res, next) {
	var predict_days = parseInt(req.query.d); //{d:1/3/5}
  	
  mongodb.getCol(col)
  		.find({"predict_days":predict_days,type: "ann_multi"},
				{
					"fields":{"symbol":1,"test_mae":1},
					"limit":5,"sort":[["test_mae","ascending"]]
				})
  		.toArray(function(err,docs){
  			if(err){
  				var emptydoc = [];
  				res.json({status:500,message:err});
  			}else{
  				res.json(docs);  				
  			}
  		});
});

router.get('/recommend', function(req, res, next) {
	var predict_days = parseInt(req.query.d); //{d:1/3/5}
	//var type = "ascending";
	if(req.query.type == 0|| req.query.type =="0"){
		type = 1; //top rise
	}else{
		type = -1;//top drop
	}

  mongodb.getCol(col)
  		.aggregate(
  			[
  				{$project: {symbol: 1, data: {$slice: ["$data", 1]}, test_mae: 1, type: 1, predict_days: 1}},
  				{$unwind: "$data"}, 
  				{$match: {type: "ann_multi", predict_days: predict_days}},
				{$sort: {"data.predict": type, test_mae: 1}},
				{$limit: 5}
			],
  			function(err,docs){
  			console.log(docs);
  			if(err){
  				var emptydoc = [];
  				res.json({status:500,message:err});
  			}else{
  				res.json(docs);  				
  			}
  		});
});


module.exports = router;
