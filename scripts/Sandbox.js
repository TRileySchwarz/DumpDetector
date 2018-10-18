let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const Web3 = require('Web3');
const fs = require('fs');
let mongoose = require('mongoose');
let MongoController = require('../src/MongoController');
let telegramBot = require('../scripts/TelegramBot');



setTimeout(async function(){
    mongoose.connect('mongodb://localhost/test');

    let db = mongoose.connection;

     db.on('error', console.error.bind(console, 'connection error: '));
     db.once('open', async function(){
       console.log('connected to mongo db');

       let mongoInstance = new MongoController();



       let msgBot = new telegramBot();

       console.log(await msgBot.message("This is a test"));




    //
    //      let dataStructure = {};
    //
    //    let data = await mongoInstance.BinanceTokenTransfer.find({tokenAddress: "0xd0a4b8946cb52f0661273bfbc6fd0e0c75fc6433"});
    //
    //    for (let object of data){
    //        let number = parseInt(object['blockNumber'], 16);
    //        let numberString = number.toString();
    //
    //         if(!dataStructure[numberString]){
    //             dataStructure[numberString] = (object.amount / (10 ** 18));
    //         } else {
    //             dataStructure[numberString] += (object.amount / (10 ** 18));
    //         }
    //
    //        // if (object['amount'] / (10 ** 18) > 15000000){
    //        //     dataStructure[object['transactionHash']] = object['amount']
    //        // }
    //    }
    //
    //
    //
    //
    //
    //      // console.log(test);
    //    // let arrayOfBigNumbers = [];
    //    // for (let instance of Object.keys(dataStructure)){
    //    //     let amount = dataStructure[instance];
    //    //
    //    //     if (amount >0){
    //    //         arrayOfBigNumbers.push({
    //    //             [parseInt(instance, 16)]: amount / (10 ** 18)
    //    //         });
    //    //     }
    //    // }
    //
    //    // console.log(arrayOfBigNumbers);
    //
    //      //
    //
    //
    //
    //      let startBlock = parseInt(Configs.ImportantBlockNumbers['January1st']);
    //      let lastBlock = parseInt(fs.readFileSync('./db/lastBlockParsed','utf8'));
    //      let range = Configs.BinanceConfirmationWindow;
    //
    //     let arrayOfRollingSums = [];
    //
    //      for (startBlock; startBlock+range <= lastBlock; startBlock++){
    //          let startOfWindow = startBlock;
    //          let endOfWindow = startBlock+range;
    //
    //          let arrayKey = endOfWindow;
    //          let arrayValue = 0;
    //
    //          for(startOfWindow; startOfWindow < endOfWindow; startOfWindow++){
    //             let number = startOfWindow.toString();
    //
    //             if(dataStructure[number]){
    //                 arrayValue = arrayValue + dataStructure[number];
    //             }
    //          }
    //
    //
    //          if(arrayValue > 22000000){
    //
    //              let hexKey = arrayKey.toString(16);
    //              let front = "0x";
    //              hexKey = front.concat(hexKey);
    //
    //
    //              let key = await mongoInstance.BlockNumberTimeStamp.findOne({_id: hexKey});
    //
    //              if(key){
    //                  var date = (new Date(key['timeStamp'] * 1000)).toUTCString();
    //                  let objectToPush = {
    //                      [date]: arrayValue
    //                  };
    //
    //                  console.log(objectToPush);
    //
    //                  arrayOfRollingSums.push(objectToPush);
    //              }
    //
    //          }
    //      }
    //
    //      console.log('DONE');
    //
     });

}, 1);
