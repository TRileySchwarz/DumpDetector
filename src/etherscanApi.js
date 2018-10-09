let Requester = require('../req/requester');
let Configs = require('../src/Configs');
let Constants = require('../src/Constants');
const Web3 = require('Web3');



class etherscanApi {



    constructor(){
        this.web3 = new Web3('https://mainnet.infura.io');
    }



    async getCurrentBlock(callback){
        await this.web3.eth.getBlockNumber(function(error, result){
            if(!error){
                callback(result);
            } else {
                console.log(error);
            }
        });
    }

    async getEventTxs(fromBlock, toBlock, eventHash){
        let url = "https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=" +
            fromBlock +
            "&toBlock=" +
            toBlock +
            "&topic0=" +
            eventHash +
            "&apikey=1RGQIXHD36B6I76NBSPADUVEEXSGF9ESZK";

        let req = new Requester();

        return await req.get(url);
    }

}


module.exports = etherscanApi;

