var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");

var dbCol = "predictResults";
var multi_result = [">+10%","+5~10%","+2~5%","+0~2%","-0~2%","-2~5%","-5~10%","<-10%"];
var multi_result_2 = [">+5%","+3~5%","+1~3%","+0~1%","-0~2%","-2~5%","-5~10%","<-10%"];


router.get("",function(req,res){
	var option ={};
	option.symbol = req.query.symbol.toUpperCase();
	option.predict_days = parseInt(req.query.predictDay);
	if(req.query.type == "binary"){
		option.type = "ann_binary";
	}else{
		option.type = "ann_multi";
	}
	console.log(option);
	mongodb.getCol(dbCol).findOne(option,{fields:{data:1}},function(err,item){
		if(err){
			console.log(err);
		}
		//console.log("item:"+item.test_accuracy);
		res.json(item.data);
	})
})

router.get('/binary/accuracy', function(req, res, next) {
  //var db = mongodb.getdb();
  var option ={};
  console.log(req.query.symbol);
	option.symbol = req.query.symbol.toUpperCase();
	option.predict_days = parseInt(req.query.predictDay);
	option.type= "ann_binary";
  	mongodb.getCol(dbCol).findOne(option,{fields:{test_accuracy:1,"data":1,profit:1,max_rise:1,rise:1}},function(err,item){
	  	if(err){
	  		console.log(err);
	  		res.render("error",{message:"data base error"+err, error:{status:500, stack:JSON.stringify(err)}});
	  	}else{
	  		console.log(item.data[0].predict);
	  		item.predict = item.data[0].predict;
	  		delete item.data;
	  		res.json(item);

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