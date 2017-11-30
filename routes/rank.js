var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");
var col = "predictResults";

router.get('/bestAcc', function(req, res, next) {
	var predict_days = parseInt(req.query.d); //{d:1/3/5}
  var predict_method, fields, sort;
  if(parseInt(req.query.m)==0 || req.query.m == "binary"){
    predict_method="binary";
    fields = {"symbol":1,"test_accuracy":1};
    sort = [["test_accuracy","descending"]]
  }else{
    predict_method="multi";
    fields ={"symbol":1,"test_mae":1};
    sort = [["test_mae","ascending"]];
  }
  
  	
  mongodb.getCol(col)
  		.find({"predict_days":predict_days,type: predict_method},
				{
					"fields":fields,
					"limit":5,
          "sort":sort
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
  var predict_method, fields,sort,match;
  
  if(parseInt(req.query.m)==0 || req.query.m == "binary"){
    predict_method="binary";
    fields = {symbol: 1, data: {$slice: ["$data", 1]}, test_accuracy: 1, type: 1, predict_days: 1};
    sort = {test_accuracy: -1};
    match = {type: predict_method, predict_days: predict_days,"data.predict":(type==1?"Rise":"Fall")};
  }else{
    predict_method="multi";
    fields ={symbol: 1, data: {$slice: ["$data", 1]}, test_mae: 1, type: 1, predict_days: 1};
    sort = {"data.predict": type, test_mae: 1};
    match = {type: predict_method, predict_days: predict_days};
  }

    mongodb.getCol(col)
    		.aggregate(
    			[
    				{$project: fields},
    				{$unwind: "$data"}, 
    				{$match: match},
  				{$sort: sort},
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


router.get("/bestProfit",function(req,res){
  var predict_days = parseInt(req.query.d);
  var predict_method;
  if(parseInt(req.query.m)==0 || req.query.m == "binary"){
    predict_method="binary";
    fields = {"symbol":1,"profit":1};
  
  }else{
    predict_method="multi";
    fields ={"symbol":1,"profit":1};
   
  }
  mongodb.getCol(col).find({"predict_days":predict_days,type: predict_method},
        {
          "fields":fields,
          "limit":5,"sort":[["profit","descending"]]
        }).toArray(function(err,docs){
          if(err){
            res.json({status:500,message:err});
          }else{
            res.json(docs);
          }
        })
});

module.exports = router;
