var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");
var stockCol = "symbols";

/* GET users listing. */
router.get('/:symbol', function(req, res, next) {
  //var db = mongodb.getdb();
  //console.log(req.params.symbol);

  mongodb.getCol(stockCol).findOne({"Symbol":req.params.symbol.toUpperCase()},{fields:{"Symbol":1, "Name":1}},function(err,item){
  	if(err){
  		res.json(err);
  	}else{
      item.type = req.query.type||"binary";
      if(item.type=="binary"){
  		  res.render("stock",item);
      }else{
        res.render("stock_multi",item);
      }

  	}
  	
  })
  
});


module.exports = router;
