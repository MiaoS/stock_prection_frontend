"use strict";

var MongoClient = require('mongodb').MongoClient,
    mongoURL = "mongodb://54.196.55.209:27017/frontend",
   // col_name = "symbols",
    db;

var connectDB =MongoClient.connect(mongoURL, function (err, database) {

    if (err) { throw err; }

    db = database;

});

exports.getdb = function () {
    return db;
};

exports.getCol = function(col_name) {
    return db.collection(col_name);
}
