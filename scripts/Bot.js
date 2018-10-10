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
        _this.startingBlock = result - 5000;
        console.log('The current block is: '+result);
    });

    // Approx 14 days
    //let testStart = 6399600;
    //let testFinish = 6485483;

    // Gets all the transaction data for the given arguments
    let data = await api.getEventTxs(_this.startingBlock, _this.currentBlock, eventHash, increment);
    //let data = await api.getEventTxs(testStart, testFinish, eventHash, increment);

    let processedData = api.processTransferData(data);
    fs.writeFileSync('./db/binanceTokenTransfers.json', JSON.stringify(processedData) , 'utf-8');
    console.log('The transaction data has been written to disk.');

    let binanceWallets = api.internalBinanceWallets;
    fs.writeFileSync('./db/internalBinanceWallets.json', JSON.stringify(binanceWallets) , 'utf-8');
    console.log('The Binance wallet mapping has been written to disk.');

    let blockMapping = api.blockNumberTimeLookup;
    fs.writeFileSync('./db/blockNumberTimeStamps.json', JSON.stringify(blockMapping) , 'utf-8');
    console.log('The block-number-timestamp mapping has been written to disk.');

}, 1);
