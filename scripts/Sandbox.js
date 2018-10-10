let EtherScanApi = require('../src/etherScanApi');
let DatabaseParser = require('../src/DatabaseParser');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const Web3 = require('Web3');
const fs = require('fs');


setTimeout(async function(){
    let api = new EtherScanApi();
    let parser = new DatabaseParser();

    let data = fs.readFileSync('./db/internalBinanceWallets.json', 'utf-8');

    console.log(data.length);

}, 1);
