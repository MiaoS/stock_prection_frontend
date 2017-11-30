var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");
var ProfitCal_binary = require("../modules/ProfitCalculator_binary");
var ProfitCal_multi = require("../modules/ProfitCalcucator_multi");



var dbCol = "predictResults";
var multi_result = [">+10%","+5~10%","+2~5%","+0~2%","-0~2%","-2~5%","-5~10%","<-10%"];
var multi_result_2 = [">+5%","+3~5%","+1~3%","+0~1%","-0~2%","-2~5%","-5~10%","<-10%"];


router.get("",function(req,res){
	var option ={};
	option.symbol = req.query.symbol.toUpperCase();
	option.predict_days = parseInt(req.query.predictDay);
	
	option.type = req.query.type;
	if(option.type)
	option.project = {
		data: {$slice: ["$data", 750]}, 
		model: 1, 
		predict_days: 1,
		test_start_date:1,
		type:1,
		symbol:1,
		rise:1,
		max_rise:1,
		profit:1
	};
	if(option.type=='binary'){
		option.project.test_accuracy= 1;
	}else{
		option.project.mae= 1;
	}

    mongodb.getCol(dbCol)
    		.aggregate(
    			[
		            {$project: option.project},
		            {$match: {type: option.type, predict_days: option.predict_days,symbol:option.symbol}},
		            {$sort: {model: -1}}, //SVM,ann, dt, rf
		            {$limit: 5}
  				],
    			function(err,docs){
    			//console.log(docs);
    			if(err){
    				var emptydoc = [];
    				res.json({status:500,message:err});
    			}else{
    				var dataonly = [];

    				for (var i = docs.length - 1; i >= 0; i--) {
    					if(option.type=="binary"){
	    					if(!docs[i].data[10].test_accuracy){
	    						ProfitCal_binary.cal_test_accuracy(docs[i]);
	    					}
	    					if(!docs[i].profit){
	    						ProfitCal_binary.cal_profit(docs[i]);
	    						ProfitCal_binary.cal_daily_profit(docs[i]);
	    					}
	    					if(!docs[i].rise){
	    						docs[i].data[0].rise =ProfitCal_binary.cal_rise(docs[i]);
	    						docs[i].data[0].max_rise = ProfitCal_binary.cal_max_rise(docs[i]);
	    					}else{
	    						docs[i].data[0].rise =docs[i].rise;
	    						docs[i].data[0].max_rise = docs[i].max_rise;
	    					}
	    					if(!docs[i].data[0].test_accuracy){
	    						docs[i].data[0].test_accuracy = docs[i].test_accuracy;
	    						console.log("cal:"+i);
	    					}
	    				}else{
	    					if(!docs[i].data[10].mae){
	    						ProfitCal_multi.cal_test_accuracy(docs[i]);
	    					}
	    					if(!docs[i].profit){
	    						ProfitCal_multi.cal_profit(docs[i]);
	    						ProfitCal_multi.cal_daily_profit(docs[i]);
	    					}
	    					if(!docs[i].rise){
	    						ProfitCal_multi.cal_rise(docs[i]);
	    						ProfitCal_multi.cal_max_rise(docs[i]);
	    						docs[i].data[0].rise =docs[i].rise;
	    						docs[i].data[0].max_rise = docs[i].max_rise;
	    					}
	    					if(!docs[i].data[0].mae){
	    						docs[i].data[0].mae = docs[i].mae;
	    						console.log("cal:"+i);
	    					}
	    				}
    					dataonly.push(docs[i].data);
    				}
    				console.log(dataonly[0][0]);
    				res.json(dataonly);  				
    			}
    		});



	// console.log(option);
	// mongodb.getCol(dbCol).findOne(option,{fields:{data:1}},function(err,item){
	// 	if(err){
	// 		console.log(err);
	// 	}
	// 	//console.log("item:"+item.test_accuracy);
	// 	res.json(item.data);
	// })
})

router.get('/binary/accuracy', function(req, res, next) {
  //var db = mongodb.getdb();
  var option ={};
  console.log(req.query.symbol);
	option.symbol = req.query.symbol.toUpperCase();
	option.predict_days = parseInt(req.query.predictDay);
	option.type= "binary";
  	mongodb.getCol(dbCol).find(
  		option,
  		{fields:{test_accuracy:1,"data":1,profit:1,max_rise:1,rise:1},
  			sort:[["test_accuracy","descending"]],
  			limit:1}).toArray(
  		function(err,item){
	  	if(err){
	  		console.log(err);
	  		res.render("error",{message:"data base error"+err, error:{status:500, stack:JSON.stringify(err)}});
	  	}else{
	  		console.log(item[0].data[0].predict);
	  		item[0].predict = item[0].data[0].predict;
	  		delete item[0].data;
	  		res.json(item[0]);
	  	}
	 });
  
});

router.get('/multi/score', function(req, res, next) {
  //var db = mongodb.getdb();
  var option ={};
  console.log(req.query.symbol);
	option.symbol = req.query.symbol.toUpperCase();
	option.predict_days = parseInt(req.query.predictDay);
	option.type= "ann_multi";
  	mongodb.getCol(dbCol).findOne(option,{fields:{test_mae:1,"data":1,profit:1,max_rise:1,rise:1}},function(err,item){
	  	if(err){
	  		console.log(err);
	  		res.render("error",{message:"data base error"+err, error:{status:500, stack:JSON.stringify(err)}});
	  	}else{
	  		console.log(item.data[0].predict);
	  		item.predict = item.data[0].predict;
	  		item.predictResult = multi_result[item.predict];
	  		delete item.data;
	  		res.json(item);

	  	}
	  	
	 });
  
});



router.get('/search',function(req,res,next){
	console.log(req.query.symbol.toUpperCase());
	mongodb.getCol(dbCol).findOne({symbol:req.query.symbol.toUpperCase()},{fields:{"symbol":1}},function(err,item){
		if(err){
			console.log(err);
			res.json({status:500,message:JSON.stringify(err)});
		}else{
			if(item==null){
				res.json({status:304,message:"symbol has not been found"});
			}else{
				console.log(item);
				res.json({status:200, symbol:item.symbol});
			}
		}
	})
});

module.exports = router;