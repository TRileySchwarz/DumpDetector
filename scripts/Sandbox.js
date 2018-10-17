let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const Web3 = require('Web3');
const fs = require('fs');
let mongoose = require('mongoose');
let MongoController = require('../src/MongoController');



setTimeout(async function(){
    mongoose.connect('mongodb://localhost/test');

    var db = mongoose.connection;

     db.on('error', console.error.bind(console, 'connection error: '));
     db.once('open', async function(){
       console.log('connected to mongo db');

       let mongoInstance = new MongoController();
    });

}, 1);
