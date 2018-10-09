const fs = require('fs');


class DatabaseParser {

    constructor (){
        this.binanceWallets = {};
    }

    // Parses a datastructue and records the Binance internal wallets.
    parseDataStructure(dataStrcuture){
        console.log('\nExtracting the internal Binance wallets from the data structure...');
        for(let transaction of dataStrcuture){
            this.binanceWallets[transaction['fromAddress']] = true;
        }

        fs.writeFileSync('./db/internalBinanceWallets.json', JSON.stringify(this.binanceWallets) , 'utf-8');
        console.log('Binance internal wallets have been written to disk.')
    }

    // Checks internalBinanceWallets data, and returns whether it contains it.
    checkBinanceAddress(address){
        let walletList = fs.readFileSync('./db/internalBinanceWallets.json','utf8');

        console.log(walletList[address]);
    }


}

module.exports = DatabaseParser;