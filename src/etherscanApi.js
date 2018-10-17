let Requester = require('../req/requester');
let Configs = require('../src/Configs');
let Constants = require('../src/Constants');
const Web3 = require('Web3');
const fs = require('fs');
let MongoController = require('../src/MongoController');


/// Contains functions responsible for sending batch API calls to Etherscan.
class etherscanApi {

    constructor() {
        this.mongoInstance = new MongoController();

        this.web3 = new Web3('https://mainnet.infura.io');
        this.etherscanApiKey = '1RGQIXHD36B6I76NBSPADUVEEXSGF9ESZK';

        // This stores whether we have seen a transaction before,
        // so we don't accidentally process the same transaction twice.
        this.transactionProcessed = {};
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
    async processEventTxs(fromBlock, currentblock, eventHash, increment){
        console.log('Searching for: ' + Constants.EventHashesLookup[eventHash]);
        console.log('Using increments of: ' + increment);
        console.log('Total amount of blocks to process: ' + (currentblock - fromBlock));
        console.log('Processing transactions from block: ' + fromBlock + ' to ' + currentblock + '\n\n');
        console.log('------------------------Start of GET Requests------------------------------\n');

        for (let i = fromBlock; i < currentblock; i += increment + 1){
            let from = i;
            let to = i + increment;
            let data;

            console.log('\nSending  GET request for blocks: ' + from + ' to ' + to  + '...');
            let newData = await this.getEventTxHelper(from, to, eventHash);
            console.log('Received GET request for blocks: ' + from + ' to ' + to + '\n');

            // Flags if our result potentially overflowed.
            if(newData.result.length >= Constants.MaxApiResponseLength){

                // This sends a request 1 block at a time to avoid as much overflow as possible
                console.log('   -There was an overflow for GET request blocks: ' + from + ' to ' + to + '.');
                console.log('   -Processing GET requests block by block to avoid overflows.\n');
                let singleBlockData = await this.getEventTxBySingleBlock(from, to, eventHash);

                data = singleBlockData;
            } else {
                data = newData.result;
            }

            await this.processTransferData(data);

            // Records the last block we processed
            fs.writeFileSync('./db/lastBlockParsed', to , 'utf-8');
        }

        console.log('-----------------------------End of GET Requests-------------------------');
    }


    /// Process a GET request for a single block.
    /// Returns the result.
    async getEventTxBySingleBlock(fromBlock, toBlock, eventHash){
        let startBlock = fromBlock;
        let lastBlock = toBlock;

        let data = [];

        for (let x = startBlock; x <= lastBlock; x++){
            console.log('        Sending GET request for block: ' + x + '...');
            let singleBlockData = await this.getEventTxHelper(x, x, eventHash);
            console.log('        Received GET request for blocks: ' + x);
            data = data.concat(singleBlockData.result)
        }
        console.log('\n');

        return data;
    }

    /// Builds the URL and sends a single GET request.
    /// Returns the result.
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
        let _this = this;

        try {
            return await req.get(url);
        } catch (e){
            console.log('\n\n Promise took too long to resolve, trying again...\n');

            return await _this.getEventTxHelper(fromBlock, toBlock, eventHash);
        }
    }

    /// This is proprietary for processing  ERC20 'transfer' events.
    /// Consumes an array of etherscan API results. Begins processing it.
    async processTransferData(data){
        for (let index in data){
            if(!this.transactionProcessed[data[index]['transactionHash']]){
                await this.processTransferTransaction(data[index]);
            }
        }
    }

    /// This is proprietary for processing  ERC20 'transfer' events.
    /// Consumes an individual transaction and applies a filter.
    async processTransferTransaction(transaction){
        this.transactionProcessed[transaction['transactionHash']] = true;

        // This filter will ignore transactions that contain more than just a single transfer event per transaction
        // ie, only transactions that do a single transaction
        if (transaction.topics.length === 3){

            // Trims the transaction data to appropriate Hash-address length
            let toAddress = '0x' + transaction.topics[2].substring(26);
            toAddress = this.web3.utils.toChecksumAddress(toAddress);

            // This defines which addresses we are trying to match with
            let addressesWeAreLookingFor = Constants.BinanceWallets;

            for (let address in addressesWeAreLookingFor){
                if (toAddress === address){

                    // Define the values stored in our transfer object
                    let transferObject = {
                        '_id' : transaction['transactionHash'],
                        'tokenAddress': transaction['address'],
                        'amount': parseInt(transaction['data'], 16),
                        'fromAddress': '0x' + transaction.topics[1].substring(26),
                        'toAddress': '0x' + transaction.topics[2].substring(26),
                        'transactionHash': transaction['transactionHash'],
                        'timeStamp': transaction['timeStamp'],
                        'blockNumber': transaction['blockNumber']
                    };

                    // Define the values stored in our wallet object
                    let binanceWalletObject = {
                        '_id': transferObject['fromAddress'],
                        'walletAddress': transferObject['fromAddress']
                    };

                    // Define the values stored in our blockstamp object
                    let blockStampObject = {
                        '_id': transaction['blockNumber'],
                        'timeStamp': transaction['timeStamp']
                    };

                    // Stores the objects in our Database
                    await this.mongoInstance.setBinanceTokenTransfer(transferObject);
                    await this.mongoInstance.setBinanceWalletAddress(binanceWalletObject);
                    await this.mongoInstance.setBlockNumberTimeStamp(blockStampObject);

                    break;
                }
            }
        }
    }
}

module.exports = etherscanApi;


