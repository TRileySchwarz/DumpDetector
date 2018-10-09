let Requester = require('../req/requester');
let Configs = require('../src/Configs');
let Constants = require('../src/Constants');
const Web3 = require('Web3');


/// Contains functions responsible for sending batch API calls to Etherscan.
class etherscanApi {

    constructor() {
        this.web3 = new Web3('https://mainnet.infura.io');
        this.etherscanApiKey = process.env.ETHERSCAN_API_KEY;

        // This stores whether we have seen a transaction before,
        // so we don't accidentally process the same transaction twice.
        this.transactionProcessed = {};

        // Contains the block numbers of blocks we potentially got overflowed results from.
        this.overflowGets = [];

        // The final object we are writing to disk after we process data.
        this.processedData = [];
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
        let data = [];

        for (let i = fromBlock; i < currentblock; i += increment + 1){
            let from = i;
            let to = i + increment;

            console.log('\nSending GET request for blocks: ' + from + ' to ' + to );
            let newData = await this.getEventTxHelper(from, to, eventHash);
            console.log('Received GET request for blocks: ' + from + ' to ' + to );

            // Flags if our result potentially overflowed.
            if(newData.result.length >= Constants.MaxApiResponseLength){
                this.overflowGets.push({'fromBlock': from, 'toBlock': to});
                console.log('   There was an overflow for GET request blocks: ' + from + ' to ' + to + '!!!');
            }

            data = data.concat(newData.result)
        }

        return data
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

        return this.processedData;
    }

    /// This is proprietary for processing  ERC20 'transfer' events.
    /// Consumes an individual transaction and applies a filter.
    processTransferTransaction(transaction){
        this.transactionProcessed[transaction['transactionHash']] = true;

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
                    };

                    this.processedData.push(objectToStore);
                }
            }
        }
    }
}

module.exports = etherscanApi;

