let Requester = require('../req/requester');
let Configs = require('../src/Configs');
let Constants = require('../src/Constants');
const Web3 = require('Web3');



class etherscanApi {



    constructor() {
        this.web3 = new Web3('https://mainnet.infura.io');
        this.transactionProcessed = {};
        this.processedData = [];
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

    async getEventTxs(fromBlock, currentblock, eventHash, increment){
        let data = [];
        let overflowGets = [];


        for (let i = fromBlock; i < currentblock; i += increment){
            let newData = await this.getEventTxHelper(i-1, i+increment+1, eventHash);

            if(newData.length > 950){
                overflowGets.push({'fromBlock': i, 'toBlock': i+increment});
            }

            data = data.concat(newData.result)
        }

        return data
    }

    async getEventTxHelper(fromBlock, toBlock, eventHash){
        fromBlock = fromBlock.toString();
        toBlock = toBlock.toString();

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

    processTransferData(data){
        for (let index in data){
            if(!this.transactionProcessed[data[index]['transactionHash']]){
                this.processTransferTransaction(data[index]);
            }
        }

        return this.processedData;
    }

    processTransferTransaction(transaction){
        this.transactionProcessed[transaction['transactionHash']] = true;

        if (transaction.topics.length == 3){
            let toAddress = '0x' + transaction.topics[2].substring(26);

            for (let address in Constants.BinanceWallets){
                if (toAddress == address.toLowerCase()){

                    let objectToStore = {
                        'tokenAddress': transaction['address'],
                        'amount': parseInt(transaction['data'], 16),
                        'fromAddress': '0x' + transaction.topics[1].substring(26),
                        'toAddress': '0x' + transaction.topics[2].substring(26),
                        'transactionHash': transaction['transactionHash'],
                        'timeStamp': transaction['timeStamp'],
                    };

                    this.processedData.push(objectToStore);
                }
            }

        }
    }

}


module.exports = etherscanApi;

