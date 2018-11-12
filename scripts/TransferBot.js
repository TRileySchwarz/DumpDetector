let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
let mongoose = require('mongoose');
let TelegramBot = require('../scripts/TelegramBot');

setTimeout(async function(){

    // Setup the values for the bot to interact with.
    let _this = this;
    _this.api = new EtherScanApi();
    _this.blockWindows = {};
    _this.tokenAddresses = Object.keys(Constants.TokenDatabase);
    _this.telegramBot = new TelegramBot();

    for (let tokenAddress of _this.tokenAddresses){
        _this.blockWindows[tokenAddress] = {
            valuesInWindow: setupArray(),
            totalValue: 0
        }
    }

    await _this.api.getCurrentBlock(async function(result){
        // This is set to start the bot, the variable name is not accurate for this line, but subsequent lines it is.
        _this.lastBlockParsed = result;
    });


    // Initialize a connection to Mongo Database
    mongoose.connect('mongodb://localhost/test');
    let db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error: '));

    db.once('open', async function() {
        console.log('**- We have connected to the Mongo Database system -**\n');
        await _this.api.setBinanceWalletsGlobal();

        let startBot = '-------------------Starting Bot--------------------';
        console.log('\n' + startBot +'\n');

        while(true){
            await _this.api.getCurrentBlock(async function(result){
                if(result > _this.lastBlockParsed){

                    for(let start = _this.lastBlockParsed + 1; start <= result; start++){

                        let newTransferData = {};
                        let newDataToParse = await _this.api.getEventTxBySingleBlock(start, start, Constants.EventHashes[Configs.Event]);

                        for (let transfer of newDataToParse){
                            let transferObject = await _this.api.processTransferTransactionLive(transfer);

                            if(transferObject){
                                let tokenAddress = transferObject['tokenAddress'];

                                if(newTransferData[tokenAddress]) {
                                    newTransferData[tokenAddress] += transferObject['amount'];
                                } else {
                                    newTransferData[tokenAddress] = transferObject['amount'];
                                }
                            }
                        }

                        for (let tokenAddress of Object.keys(_this.blockWindows)){
                            let valueRemoved = _this.blockWindows[tokenAddress]['valuesInWindow'].shift();
                            _this.blockWindows[tokenAddress]['totalValue'] -= valueRemoved;

                            if(newTransferData[tokenAddress]){
                                // Accommodating for decimals in the tokens
                                let amount = newTransferData[tokenAddress] / (10 ** Constants.TokenDatabase[tokenAddress]['decimals']);
                                amount = amount.toFixed();
                                amount = parseInt(amount);

                                _this.blockWindows[tokenAddress]['valuesInWindow'].push(amount);
                                _this.blockWindows[tokenAddress]['totalValue'] += amount;
                            } else {
                                _this.blockWindows[tokenAddress]['valuesInWindow'].push(0)
                            }
                        }

                        let startOfProcessText = '\n-------Block ' + start + ' has been mined-------\n' +
                            'The total amount of tokens transferred to Binance in the last ' + Configs.BinanceConfirmationWindow
                            + ' blocks are as follows:\n\n';

                        console.log(startOfProcessText);

                        let textForTelegramBot = '';

                        for (let address of Object.keys(_this.blockWindows)){
                            let textToPrint = "    "+ Constants.TokenDatabase[address]['symbol'] + ' ::= ' + _this.blockWindows[address]['totalValue'];
                            textForTelegramBot = textForTelegramBot.concat(textToPrint + '\n');
                            console.log(textToPrint);

                            // !!! Insert check for threshold here!!! if (_this.blockWindows[address]['totalValue']) is greater than threshold, then tell us!!!!!!
                        }
                        console.log('\n');

                        _this.telegramBot.message(startOfProcessText + textForTelegramBot);
                    }
                    _this.lastBlockParsed = result;
                }
            });
        }
    });
}, 1);


function setupArray(){
    let arrayOfValues = [];

    for (let index = 0; index < Configs.BinanceConfirmationWindow; index++){
        arrayOfValues.push(0);
    }

    return arrayOfValues;
}

