let EtherScanApi = require('../src/etherscanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const Web3 = require('Web3');
const fs = require('fs');
let mongoose = require('mongoose');
let MongoController = require('../src/MongoController');



setTimeout(async function(){
    mongoose.connect('mongodb://localhost/test');

    let db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error: '));
    db.once('open', async function(){
        console.log('We have connected to the mongo Database system. \n');

        let mongoInstance = new MongoController();

        // let newAddresses = await getNewBinanceWalletAddresses();
        //
        // for(let address of newAddresses){
        //     await mongoInstance.setBinanceWalletAddress(address);
        // }

        // let newBlockNumbers = await getNewTokenTransferEvents();
        //
        // for (let blockNumber of Object.keys(newBlockNumbers)){
        //     let blockToAdd = {
        //         _id: blockNumber,
        //         timeStamp: newBlockNumbers[blockNumber]
        //     };
        //
        //     await mongoInstance.setBlockNumberTimeStamp(blockToAdd);
        // }

        let newBlockNumbers = await getNewBinanceTransferEvents();

        for (let blockNumber of Object.keys(newBlockNumbers)){
            let blockToAdd = newBlockNumbers[blockNumber];

            await mongoInstance.setBinanceTokenTransfer(blockToAdd);
        }
    });




}, 1);

async function getNewBinanceWalletAddresses(){
    let completeData = {};
    let arrayOfAddresses = [];

    fs.readdirSync('./db/DataToAdd/internalBinanceWallets/').forEach(file => {
        if(file != '.DS_Store'){
            let fileName = './db/DataToAdd/internalBinanceWallets/' + file;

            let data = fs.readFileSync(fileName, 'utf-8');
            let object = JSON.parse(data);
            let addressArray = Object.keys(object);

            console.log(addressArray.length);

            for(let address of addressArray){
                if(!completeData[address]){
                    completeData[address] = true;
                    arrayOfAddresses.push(address);
                }
            }
        }
    });

    return arrayOfAddresses;
}

async function getNewBlockStampEvents(){
    let completeData = {};

    fs.readdirSync('./db/DataToAdd/blockNumberTimeStamps/').forEach(file => {
        if(file != '.DS_Store'){
            let fileName = './db/DataToAdd/blockNumberTimeStamps/' + file;

            let data = fs.readFileSync(fileName, 'utf-8');
            let object = JSON.parse(data);
            let blockArray = Object.keys(object);

            console.log(blockArray.length);

            for(let block of blockArray){
                if(!completeData[block]){
                    completeData[block] = object[block];
                }
            }
        }
    });

    return completeData;
}

async function getNewBinanceTransferEvents(){
    let completeData = {};

    fs.readdirSync('./db/DataToAdd/binanceTokenTransfers/').forEach(file => {
        if(file != '.DS_Store'){
            let fileName = './db/DataToAdd/binanceTokenTransfers/' + file;

            let data = fs.readFileSync(fileName, 'utf-8');
            let transferArray = JSON.parse(data);

            console.log(transferArray.length);

            for(let transfer of transferArray){
                if(!completeData[transfer['transactionHash']]){

                    transfer['_id'] = transfer['transactionHash'];

                    completeData[transfer['transactionHash']] = transfer;
                } else {
                    console.log("duplicate value detected");
                }
            }
        }
    });

    return completeData;
}