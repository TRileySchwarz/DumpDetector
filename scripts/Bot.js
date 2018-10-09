let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const Web3 = require('Web3');
const fs = require('fs');


setTimeout(async function(){
    let api = new EtherScanApi();
    //let web3 = new Web3();

    let increment = Configs.Increment;
    let eventHash = Constants.EventHashes[Configs.Event];

    let _this = this;
    await api.getCurrentBlock(function(result){
        _this.currentBlock = result;
        _this.startingBlock = result - 500;
        console.log('The current block is: '+result);
        console.log()
    });

    console.log('Processing transactions from block: ' + this.startingBlock + ' to ' + this.currentBlock);
    console.log('Using increments of: ' + increment);
    console.log('Searching for: ' + Constants.EventHashesLookup[eventHash]);
    let data = await api.getEventTxs(_this.startingBlock, _this.currentBlock, eventHash, increment);

    let processedData = api.processTransferData(data);
    let badGets = api.overflowGets;
    console.log('\nThe transactions have all finished being processed.');


    fs.writeFileSync('./transferData.json', JSON.stringify(processedData) , 'utf-8');
    fs.writeFileSync('./badPulls.json', JSON.stringify(badGets) , 'utf-8');
    console.log('\nThe data has been written to disk.')
}, 1);
