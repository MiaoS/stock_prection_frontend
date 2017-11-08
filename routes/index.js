var express = require('express');
var router = express.Router();
var mongodb = require("../db/mongodb");
var col = "predictResults";

/* GET home page. */
router.get('/', function(req, res, next) {

  				res.render("index_ver1",{rankboard:[
                                  [{header:"Most Accurate Symbol For Tomorrow",controler:"day1TopAcc"},
                                  {header:"Best Accurate Symbol For Next 3 day",controler:"day3TopAcc"},
                                  {header:"Best Accurate Symbol For Next 5 day",controler:"day5TopAcc"}],
                                  //day1TopRise
                                  [{header:"Symbol Increase Most For Tomorrow",controler:"day1TopRise"},
                                  {header:"Symbol Increase Most For Next 3 day",controler:"day3TopRise"},
                                  {header:"Symbol Increase Most For Next 5 day",controler:"day5TopRise"}],
                                  [{header:"Symbol Drop Most For Tomorrow",controler:"day1TopFail"},
                                  {header:"Symbol Drop Most For Next 3 day",controler:"day3TopFail"},
                                  {header:"Symbol Drop Most For Next 5 day",controler:"day5TopFail"}]
                                ]
                              });

});

module.exports = router;
