var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");

var dbCol = "predictResults";

router.get("",function(req,res){
	var option ={};
	option.symbol = req.query.symbol;
	option.predict_days = parseInt(req.query.predictDay);
	console.log(option);
	mongodb.getCol(dbCol).findOne(option,{fields:{data:1}},function(err,item){
		if(err){
			console.log(err);
		}
		//console.log("item:"+item.test_accuracy);
		res.json(item.data);
	})
})

router.get('/accuracy', function(req, res, next) {
  //var db = mongodb.getdb();
  var option ={};
  console.log(req.query.symbol);
	option.symbol = req.query.symbol;
	option.predict_days = parseInt(req.query.predictDay);
  mongodb.getCol(dbCol).findOne(option,{fields:{test_accuracy:1,"data":1}},function(err,item){
  	if(err){
  		console.log(err);
  		res.render("error",{message:"data base error"+err, error:{status:500, stack:JSON.stringify(err)}});
  	}else{
  		console.log(item.data[0].predict);
  		item.predict = item.data[0].predict;
  		delete item.data;
  		res.json(item);

  	}
  	
  })
  
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