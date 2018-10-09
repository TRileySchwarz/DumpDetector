let EtherScanApi = require('../src/etherScanApi');
let DatabaseParser = require('../src/DatabaseParser');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const Web3 = require('Web3');
const fs = require('fs');


setTimeout(async function(){
    let api = new EtherScanApi();
    let parser = new DatabaseParser();
    //let web3 = new Web3();

    let increment = Configs.Increment;
    let eventHash = Constants.EventHashes[Configs.Event];

    let _this = this;
    await api.getCurrentBlock(function(result){
        _this.currentBlock = result;
        _this.startingBlock = result - 250;
        console.log('The current block is: '+result);
        console.log()
    });

    // Gets all the transaction data for the given arguments
    let data = await api.getEventTxs(_this.startingBlock, _this.currentBlock, eventHash, increment);

    let processedData = api.processTransferData(data);
    let badGets = api.overflowGets;

    fs.writeFileSync('./db/binanceTokenTransfers.json', JSON.stringify(processedData) , 'utf-8');
    fs.writeFileSync('./db/badBinanceGetRequests.json', JSON.stringify(badGets) , 'utf-8');
    console.log('The data has been written to disk.');

    parser.parseDataStructure(processedData);
}, 1);
