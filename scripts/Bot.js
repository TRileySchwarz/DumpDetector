let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const fs = require('fs');
let mongoose = require('mongoose');


setTimeout(async function(){
    // Initialize a connection to Mongo Database
    mongoose.connect('mongodb://localhost/test');
    let db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error: '));

    db.once('open', async function() {
        console.log('**- We have connected to the Mongo Database system -**\n');

            let _this = this;
            _this.api = new EtherScanApi();

            await _this.api.getCurrentBlock(async function(result){
                let finishBlock = result;
                let startBlock = parseInt(fs.readFileSync('./db/lastBlockParsed','utf8'));
                let increment = Configs.Increment;
                let eventHash = Constants.EventHashes[Configs.Event];

                // Process transaction events, and store results in Mongo DB
                await _this.api.processEventTxs(startBlock, finishBlock, eventHash, increment);
            });
    });

}, 1);
