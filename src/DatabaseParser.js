const fs = require('fs');


class DatabaseParser {

    constructor (){
        this.binanceWallets = {};
    }

    // Checks internalBinanceWallets data, and returns whether it contains it.
    checkBinanceAddress(address){
        let walletList = fs.readFileSync('./db/internalBinanceWallets.json','utf8');

        console.log(walletList[address]);
    }
}

module.exports = DatabaseParser;