var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");
var col = "predictResults";

/* GET home page. */
router.get('/', function(req, res, next) {
  mongodb.getCol(col)
  		.find({"predict_days":1},{"fields":{"symbol":1,"test_accuracy":1},"limit":5,"sort":[["test_accuracy","descending"]]})
  		.toArray(function(err,docs){
  			if(err){
  				var emptydoc = [[]];
  				res.render("index",{stock:emptydoc});
  			}else{
  				var stock=[docs];
  				mongodb.getCol(col).find({"predict_days":3},{"fields":{"symbol":1,"test_accuracy":1},"limit":5,"sort":[["test_accuracy","descending"]]})
  					.toArray(function(err,docs1){
  						console.log()
  						stock.push(docs1);				
		 				mongodb.getCol(col).find({"predict_days":5},{"fields":{"symbol":1,"test_accuracy":1},"limit":5,"sort":[["test_accuracy","descending"]]})
		  					.toArray(function(err,docs2){
		  						stock.push(docs2);
		  						res.render("index",{stock:stock,header:["Best Predict Result for 1 Day","Best Predict Result for 3 Day","Best Predict Result for 5 Day"]});
		  					});
  					});
  				
  			}
  		});
});

module.exports = router;
