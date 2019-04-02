// const EtherScanApi = require('../src/etherScanApi');
// const Constants = require('../src/constants');
const Configs = require('../src/configs');
// const Web3 = require('Web3');
const fs = require('fs');
const mongoose = require('mongoose');
const MongoController = require('../src/MongoController');
const TelegramBot = require('../scripts/TelegramBot');

setTimeout(async function () {
  mongoose.connect('mongodb://localhost/test');

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error: '));
  db.once('open', async function () {
    console.log('connected to mongo db');

    const mongoInstance = new MongoController();

    const msgBot = new TelegramBot();

    console.log(await msgBot.message('This is a test'));

    const dataStructure = {};

    const data = await mongoInstance.BinanceTokenTransfer.find(
      { tokenAddress: '0xd0a4b8946cb52f0661273bfbc6fd0e0c75fc6433' }
    );

    for (const object of data) {
      const number = parseInt(object.blockNumber, 16);
      const numberString = number.toString();

      if (!dataStructure[numberString]) {
        dataStructure[numberString] = (object.amount / (10 ** 18));
      } else {
        dataStructure[numberString] += (object.amount / (10 ** 18));
      }

      // if (object['amount'] / (10 ** 18) > 15000000){
      //     dataStructure[object['transactionHash']] = object['amount']
      // }
    }

    // console.log(test);
    // let arrayOfBigNumbers = [];
    // for (let instance of Object.keys(dataStructure)){
    //     let amount = dataStructure[instance];
    //
    //     if (amount >0){
    //         arrayOfBigNumbers.push({
    //             [parseInt(instance, 16)]: amount / (10 ** 18)
    //         });
    //     }
    // }

    // console.log(arrayOfBigNumbers);

    //

    let startBlock = parseInt(Configs.ImportantBlockNumbers.January1st);
    const lastBlock = parseInt(fs.readFileSync('./db/lastBlockParsed', 'utf8'));
    const range = Configs.BinanceConfirmationWindow;

    const arrayOfRollingSums = [];

    for (startBlock; startBlock + range <= lastBlock; startBlock++) {
      let startOfWindow = startBlock;
      const endOfWindow = startBlock + range;

      const arrayKey = endOfWindow;
      let arrayValue = 0;

      for (startOfWindow; startOfWindow < endOfWindow; startOfWindow++) {
        const number = startOfWindow.toString();

        if (dataStructure[number]) {
          arrayValue = arrayValue + dataStructure[number];
        }
      }

      if (arrayValue > 100) {
        let hexKey = arrayKey.toString(16);
        const front = '0x';
        hexKey = front.concat(hexKey);

        const key = await mongoInstance.BlockNumberTimeStamp.findOne({ _id: hexKey });

        if (key) {
          const date = (new Date(key.timeStamp * 1000)).toUTCString();
          const objectToPush = {
            [date]: arrayValue,
          };

          console.log(objectToPush);

          arrayOfRollingSums.push(objectToPush);
        }
      }
    }

    console.log('DONE');
  });
}, 1);
