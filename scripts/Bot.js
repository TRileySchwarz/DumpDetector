let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const Web3 = require('Web3');
const fs = require('fs');


setTimeout(async function(){
    let api = new EtherScanApi();

    let increment = 30;
    let eventHash = Constants.EventHashes['transfer'];

    let _this = this;
    await api.getCurrentBlock(function(result){
        _this.currentBlock = result;
        _this.startingBlock = result - 100;
    });

    let data = await api.getEventTxs(_this.startingBlock, _this.currentBlock, eventHash, increment);

    let processedData = api.processTransferData(data);

    fs.writeFileSync('./transferData.json', JSON.stringify(processedData) , 'utf-8');

}, 1);
