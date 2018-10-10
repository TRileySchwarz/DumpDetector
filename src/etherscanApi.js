let Requester = require('../req/requester');
let Configs = require('../src/Configs');
let Constants = require('../src/Constants');
const Web3 = require('Web3');
const fs = require('fs');


/// Contains functions responsible for sending batch API calls to Etherscan.
class etherscanApi {

    constructor() {
        this.web3 = new Web3('https://mainnet.infura.io');
        this.etherscanApiKey = process.env.ETHERSCAN_API_KEY;

        // This stores whether we have seen a transaction before,
        // so we don't accidentally process the same transaction twice.
        this.transactionProcessed = {};

        // The final object we are writing to disk after we process data.
        this.processedData = [];

        // A mapping of block-numbers to time stamps.
        this.blockNumberTimeLookup = {};

        // A mapping of binance internal wallets
        this.internalBinanceWallets = {};
    }

    /// Returns the most recent block number that is being mined.
    async getCurrentBlock(callback){
        await this.web3.eth.getBlockNumber(function(error, result){
            if(!error){
                callback(result);
            } else {
                console.log(error);
            }
        });
    }

    /// Initializes the GET request for a series of block numbers.
    async getEventTxs(fromBlock, currentblock, eventHash, increment){
        console.log('Searching for: ' + Constants.EventHashesLookup[eventHash] + '\n');
        console.log('Using increments of: ' + increment);
        console.log('Total amount of blocks to process: ' + (currentblock - fromBlock));
        console.log('Processing transactions from block: ' + fromBlock + ' to ' + currentblock + '\n\n');

        let data = [];
        console.log('------------------------Start of GET Requests------------------------------\n');

        for (let i = fromBlock; i < currentblock; i += increment + 1){
            let from = i;
            let to = i + increment;

            console.log('Sending GET request for blocks: ' + from + ' to ' + to  + '...');
            let newData = await this.getEventTxHelper(from, to, eventHash);
            console.log('Received GET request for blocks: ' + from + ' to ' + to + '\n');

            // Flags if our result potentially overflowed.
            if(newData.result.length >= Constants.MaxApiResponseLength){

                // This sends a request 1 block at a time to avoid as much overflow as possible
                console.log('   -There was an overflow for GET request blocks: ' + from + ' to ' + to + '.');
                console.log('   -Processing GET requests block by block to avoid overflows.\n')
                let singleBlockData = await this.getEventTxBySingleBlock(from, to, eventHash);

                data = data.concat(singleBlockData);
            } else {
                data = data.concat(newData.result)
            }
        }
        console.log('-----------------------------End of GET Requests-------------------------');
        return data
    }


    /// Process a GET request for a single block
    async getEventTxBySingleBlock(fromBlock, toBlock, eventHash){
        let startBlock = fromBlock;
        let lastBlock = toBlock;

        let data = [];

        for (let x = startBlock; x <= lastBlock; x++){
            console.log('           Sending GET request for block: ' + x + '...');
            let singleBlockData = await this.getEventTxHelper(x, x, eventHash);
            console.log('           Received GET request for blocks: ' + x);
            data = data.concat(singleBlockData.result)
        }
        console.log('\n');

        return data;
    }

    /// Builds the URL and sends a single GET request
    async getEventTxHelper(fromBlock, toBlock, eventHash){
        fromBlock = fromBlock.toString();
        toBlock = toBlock.toString();

        let url = "https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=" +
            fromBlock +
            "&toBlock=" +
            toBlock +
            "&topic0=" +
            eventHash +
            "&apikey=" +
            this.etherscanApiKey;

        let req = new Requester();

        return await req.get(url);
    }

    /// This is proprietary for processing  ERC20 'transfer' events.
    /// Consumes an array of etherscan API results. Begins processing it.
    processTransferData(data){
        for (let index in data){
            if(!this.transactionProcessed[data[index]['transactionHash']]){
                this.processTransferTransaction(data[index]);
            }
        }

        console.log('\n\nThe transactions have all finished being processed.\n');
        return this.processedData;
    }

    /// This is proprietary for processing  ERC20 'transfer' events.
    /// Consumes an individual transaction and applies a filter.
    processTransferTransaction(transaction){
        this.transactionProcessed[transaction['transactionHash']] = true;

        // Saves a mapping of a block-number to a timestamp
        if(!this.blockNumberTimeLookup[transaction['blockNumber']]){
            this.blockNumberTimeLookup[transaction['blockNumber']] = transaction['timeStamp'];
        }

        // This filter will ignore transactions that contain more than just a single transfer event per transaction
        // ie, only transactions that do a single transaction
        if (transaction.topics.length == 3){

            // Trims the transaction data to appropriate Hash-address length
            let toAddress = '0x' + transaction.topics[2].substring(26);
            toAddress = this.web3.utils.toChecksumAddress(toAddress);

            // This defines which addresses we are trying to match with
            let addressesWeAreLookingFor = Constants.BinanceWallets;

            for (let address in addressesWeAreLookingFor){
                if (toAddress == address){

                    // This is where the object is defined that we write to disk
                    // Modify these to adjust final data structure
                    let objectToStore = {
                        'tokenAddress': transaction['address'],
                        'amount': parseInt(transaction['data'], 16),
                        'fromAddress': '0x' + transaction.topics[1].substring(26),
                        'toAddress': '0x' + transaction.topics[2].substring(26),
                        'transactionHash': transaction['transactionHash'],
                        'timeStamp': transaction['timeStamp'],
                        'blockNumber': transaction['blockNumber']
                    };

                    this.processedData.push(objectToStore);

                    // Saves the from address in a mapping
                    if(!this.internalBinanceWallets[objectToStore['fromAddress']]){
                        this.internalBinanceWallets[objectToStore['fromAddress']] = true;
                    }

                    break;
                }
            }
        }
    }
}

module.exports = etherscanApi;

