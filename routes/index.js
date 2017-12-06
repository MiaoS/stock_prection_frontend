var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");
var col = "predictResults";

/* GET home page. */
router.get('/', function(req, res, next) {
    var type = req.query.type||"binary";
    if(type == "binary"){
        res.render("index_ver1",{rankboard:[
                                  [{header:"Most Accurate Symbol For Next Day",controler:"day1TopAcc"},
                                  {header:"Best Accurate Symbol For Next 3 day",controler:"day3TopAcc"},
                                  {header:"Best Accurate Symbol For Next 5 day",controler:"day5TopAcc"}],
                                  //day1TopRise
                                  [{header:"Symbol Rise For Next Day",controler:"day1TopRise"},
                                  {header:"Symbol Rise For Next 3 day",controler:"day3TopRise"},
                                  {header:"Symbol Rise For Next 5 day",controler:"day5TopRise"}],
                                  [{header:"Symbol Drop For Next Day",controler:"day1TopFail"},
                                  {header:"Symbol Drop For Next 3 day",controler:"day3TopFail"},
                                  {header:"Symbol Drop For Next 5 day",controler:"day5TopFail"}]
//                                  //profit
//                                  [{header:"Symbol Earn Most Profit Every Day",controler:"day1TopProfit"},
//                                  {header:"Symbol Earn Most Profit Every 3 Days",controler:"day3TopProfit"},
//                                  {header:"Symbol Earn Most Profit Every 5 Days",controler:"day5TopProfit"}]
                                ],
                                type:type
                              });

    }else{
  				res.render("index_ver1",{rankboard:[
                                  [{header:"Most Accurate Symbol For Next Day",controler:"day1TopAcc"},
                                  {header:"Best Accurate Symbol For Next 3 day",controler:"day3TopAcc"},
                                  {header:"Best Accurate Symbol For Next 5 day",controler:"day5TopAcc"}],
                                  //day1TopRise
                                  [{header:"Symbol Increase Most For Next Day",controler:"day1TopRise"},
                                  {header:"Symbol Increase Most For Next 3 day",controler:"day3TopRise"},
                                  {header:"Symbol Increase Most For Next 5 day",controler:"day5TopRise"}],
                                  [{header:"Symbol Drop Most For Next Day",controler:"day1TopFail"},
                                  {header:"Symbol Drop Most For Next 3 day",controler:"day3TopFail"},
                                  {header:"Symbol Drop Most For Next 5 day",controler:"day5TopFail"}]
                                  
//                                  [{header:"Symbol Earn Most Profit Every Day",controler:"day1TopProfit"},
//                                  {header:"Symbol Earn Most Profit Every 3 Days",controler:"day3TopProfit"},
//                                  {header:"Symbol Earn Most Profit Every 5 Days",controler:"day5TopProfit"}]
                                ],
                                type:type
                              });
    }

});

module.exports = router;
