let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const fs = require('fs');
let mongoose = require('mongoose');


function printBlockWinds() {
    console.log('\n    Printing updated block windows...');

    for (let address of Object.keys(this.blockWindows)){
        console.log('      ' + Constants.TokenDatabase[address]['symbol'] + ' :: Total Value == ' + this.blockWindows[address]['totalValue']);
    }

    console.log('      Finished printing block windows')
}

setTimeout(async function(){

    // Setup the values for the bot to interact with.
    let _this = this;
    _this.api = new EtherScanApi();
    _this.blockWindows = {};
    _this.tokenAddresses = Object.keys(Constants.TokenDatabase);

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

        console.log('\n-------------------Starting Bot--------------------\n');

        while(true){
            await _this.api.getCurrentBlock(async function(result){
                if(result > _this.lastBlockParsed){

                    let start = _this.lastBlockParsed + 1;

                    for(start; start <= result; start++){

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

                                _this.blockWindows[tokenAddress]['valuesInWindow'].push(amount);
                                _this.blockWindows[tokenAddress]['totalValue'] += amount;
                            } else {
                                _this.blockWindows[tokenAddress]['valuesInWindow'].push(0)
                            }
                        }


                        console.log('Printing updated block windows...');
                        for (let address of Object.keys(_this.blockWindows)){
                            console.log(Constants.TokenDatabase[address]['symbol'] + ' :: Total Value == ' + _this.blockWindows[address]['totalValue']);
                        }
                        console.log('Finished printing block windows\n')
                    }
                    _this.lastBlockParsed = result;
                }

                console.log('No new blocks to process...\n')
            });
        }



    });



}, 1);



function sumArray(array) {
    let total = 0;

    for (let value of array){
        total += value;
    }

    return total;
}

function setupArray(){
    let arrayOfValues = [];

    for (let index = 0; index < Configs.BinanceConfirmationWindow; index++){
        arrayOfValues.push(0);
    }

    return arrayOfValues;
}

