let EtherScanApi = require('../src/etherScanApi');
let DatabaseParser = require('../src/DatabaseParser');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const Web3 = require('Web3');
const fs = require('fs');


setTimeout(async function(){
    let api = new EtherScanApi();
    let parser = new DatabaseParser();

    let completeData = {};


    // fs.readdirSync('./db/internalBinanceWallets/').forEach(file => {
    //     if(file != '.DS_Store'){
    //         let fileName = './db/internalBinanceWallets/' + file;
    //
    //         let data = fs.readFileSync(fileName, 'utf-8');
    //         let object = JSON.parse(data);
    //         let addressArray = Object.keys(object);
    //
    //         console.log(addressArray.length);
    //
    //         for(let address of addressArray){
    //             if(!completeData[address]){
    //                 completeData[address] = true;
    //             }
    //         }
    //     }
    // });
    // fs.writeFileSync('./db/InternalBinanceWalletsAggregate.json', JSON.stringify(completeData) , 'utf-8');

    // fs.readdirSync('./db/blockNumberTimeStamps/').forEach(file => {
    //     //     if(file != '.DS_Store'){
    //     //         let fileName = './db/blockNumberTimeStamps/' + file;
    //     //
    //     //         let data = fs.readFileSync(fileName, 'utf-8');
    //     //         let object = JSON.parse(data);
    //     //         let blockArray = Object.keys(object);
    //     //
    //     //         console.log(blockArray.length);
    //     //
    //     //         for(let block of blockArray){
    //     //             if(!completeData[block]){
    //     //                 completeData[block] = object[block];
    //     //             }
    //     //         }
    //     //     }
    //     // });
    //     // fs.writeFileSync('./db/BlockNumberTimeStampsAggregate.json', JSON.stringify(completeData) , 'utf-8');

    //fs.writeFileSync('./db/BinanceTokenTransfersAggregate.json', "[" , 'utf-8');

    fs.readdirSync('./db/binanceTokenTransfers/').forEach(file => {
        if(file != '.DS_Store'){
            let fileName = './db/binanceTokenTransfers/' + file;

            let data = fs.readFileSync(fileName, 'utf-8');
            let transferArray = JSON.parse(data);

            console.log(transferArray.length);

            for(let transfer of transferArray){
                if(!completeData[transfer['transactionHash']]){

                    completeData[transfer['transactionHash']] = true;

                    //fs.appendFileSync('./db/BinanceTokenTransfersAggregate.json',  JSON.stringify(transfer) + ",",'utf8');
                } else {
                    console.log("duplicate value detected");
                }
            }
        }
    });

    //fs.appendFileSync('./db/BinanceTokenTransfersAggregate.json', "]",'utf8');

    // let chad = {'chad': 10};
    // let chill = {'chill': 15};


    // fs.writeFileSync('./db/BinanceTokenTransfersAggregate.json', "[" , 'utf-8');
    //
    // fs.appendFileSync('./db/BinanceTokenTransfersAggregate.json',  JSON.stringify(chill) + ",",'utf8');
    //
    // fs.appendFileSync('./db/BinanceTokenTransfersAggregate.json', "]",'utf8');



}, 1);
