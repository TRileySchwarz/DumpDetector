let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const fs = require('fs');


setTimeout(async function(){
    let increment = Configs.Increment;
    let eventHash = Constants.EventHashes[Configs.Event];

    let start     = 5965000;
    let finish    = 5980000;
    let batchSize = 30;

    // let _this = this;
    // await api.getCurrentBlock(function(result){
    //     _this.currentBlock = result;
    //     _this.startingBlock = result - 250;
    //     console.log('The current block is: ' + result);
    // });


    for (let from = start; from <= finish; from+=batchSize){

        let api = new EtherScanApi();

        let startBlock = from;
        let finishBlock = from + batchSize;

        let fileName = startBlock.toString() + '_' + finishBlock.toString()

        // Gets all the transaction data for the given arguments
        let data = await api.getEventTxs(startBlock, finishBlock, eventHash, increment);

        let processedData = api.processTransferData(data);
        fs.writeFileSync('./db/binanceTokenTransfers/' + fileName + '.json', JSON.stringify(processedData) , 'utf-8');
        console.log('The transaction data has been written to disk.');

        let binanceWallets = api.internalBinanceWallets;
        fs.writeFileSync('./db/internalBinanceWallets/' + fileName + '.json', JSON.stringify(binanceWallets) , 'utf-8');
        console.log('The Binance wallet mapping has been written to disk.');

        let blockMapping = api.blockNumberTimeLookup;
        fs.writeFileSync('./db/blockNumberTimeStamps/' + fileName + '.json', JSON.stringify(blockMapping) , 'utf-8');
        console.log('The block-number-timestamp mapping has been written to disk.');
    }

}, 1);
