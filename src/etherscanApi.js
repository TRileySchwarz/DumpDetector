const Requester = require('../req/requester');
const Constants = require('../src/Constants');
const Web3 = require('Web3');
const fs = require('fs');
const MongoController = require('../src/MongoController');

/// Contains functions responsible for sending batch API calls to Etherscan.
class etherscanApi {
  constructor () {
    this.mongoInstance = new MongoController();

    this.web3 = new Web3('https://mainnet.infura.io');
    this.etherscanApiKey = '1RGQIXHD36B6I76NBSPADUVEEXSGF9ESZK';

    // This stores whether we have seen a transaction before,
    // so we don't accidentally process the same transaction twice.
    this.transactionProcessed = {};
  }

  /// Sets a global variable of the BinanceWallet Database
  async setBinanceWalletsGlobal () {
    // This dictionary contains all the binance wallet addresses so far.
    this.binanceWallets = await this.mongoInstance.getBinanceWalletDatabase();
  }

  /// Returns the most recent block number that is being mined.
  async getCurrentBlock (callback) {
    const _this = this;
    _this.ticker += 1;

    await this.web3.eth.getBlockNumber(function (error, result) {
      if (!error) {
        callback(result - 1);
      } else {
        console.log(error);
      }
    });
  }

  /// Initializes the GET request for a series of block numbers.
  async processEventTxs (fromBlock, currentblock, eventHash, increment) {
    console.log('Searching for: ' + Constants.EventHashesLookup[eventHash]);
    console.log('Using increments of: ' + increment);
    console.log('Total amount of blocks to process: ' + (currentblock - fromBlock));
    console.log('Processing transactions from block: ' + fromBlock + ' to ' + currentblock + '\n\n');
    console.log('------------------------Start of GET Requests------------------------------\n');

    for (let i = fromBlock; i < currentblock; i += increment + 1) {
      const from = i;
      const to = i + increment;
      let data;

      console.log('\nSending  GET request for blocks: ' + from + ' to ' + to + '...');
      const newData = await this.getEventTxHelper(from, to, eventHash);
      console.log('Received GET request for blocks: ' + from + ' to ' + to + '\n');

      // Flags if our result potentially overflowed.
      if (newData.result.length >= Constants.MaxApiResponseLength) {
        // This sends a request 1 block at a time to avoid as much overflow as possible
        console.log('   -There was an overflow for GET request blocks: ' + from + ' to ' + to + '.');
        console.log('   -Processing GET requests block by block to avoid overflows.\n');
        const singleBlockData = await this.getEventTxBySingleBlock(from, to, eventHash);

        data = singleBlockData;
      } else {
        data = newData.result;
      }

      await this.processTransferData(data);

      // Records the last block we processed
      fs.writeFileSync('./db/lastBlockParsed', to, 'utf-8');
    }

    console.log('-----------------------------End of GET Requests-------------------------');
  }

  /// Process a GET request for a single block
  /// Returns the result
  async getEventTxBySingleBlock (fromBlock, toBlock, eventHash) {
    const startBlock = fromBlock;
    const lastBlock = toBlock;

    let data = [];

    for (let x = startBlock; x <= lastBlock; x++) {
      console.log('        Sending GET request for block: ' + x + '...');
      const singleBlockData = await this.getEventTxHelper(x, x, eventHash);
      console.log('        Received GET request for blocks: ' + x);
      data = data.concat(singleBlockData.result);
    }

    return data;
  }

  /// Builds the URL and sends a single GET request
  /// Returns the result
  async getEventTxHelper (fromBlock, toBlock, eventHash) {
    fromBlock = fromBlock.toString();
    toBlock = toBlock.toString();

    const url = 'https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=' +
            fromBlock +
            '&toBlock=' +
            toBlock +
            '&topic0=' +
            eventHash +
            '&apikey=' +
            this.etherscanApiKey;

    const req = new Requester();
    const _this = this;

    try {
      return await req.get(url);
    } catch (e) {
      console.log('\n\n Promise took too long to resolve, trying again...\n');

      return await _this.getEventTxHelper(fromBlock, toBlock, eventHash);
    }
  }

  /// This is proprietary for processing  ERC20 'transfer' events
  /// Consumes an array of etherscan API results. Begins processing it
  async processTransferData (data) {
    for (const index in data) {
      if (!this.transactionProcessed[data[index].transactionHash]) {
        await this.processTransferTransaction(data[index]);
      }
    }
  }

  /// This is proprietary for processing  ERC20 'transfer' events.
  /// Consumes an individual transaction and applies a filter.
  async processTransferTransaction (transaction) {
    this.transactionProcessed[transaction.transactionHash] = true;

    // This filter will ignore transactions that contain more than just a single transfer event per transaction
    // ie, only transactions that do a single transaction
    if (transaction.topics.length === 3) {
      // Trims the transaction data to appropriate Hash-address length
      let toAddress = '0x' + transaction.topics[2].substring(26);
      toAddress = this.web3.utils.toChecksumAddress(toAddress);
      let fromAddress = '0x' + transaction.topics[1].substring(26);
      fromAddress = this.web3.utils.toChecksumAddress(fromAddress);

      // This defines which addresses we are trying to match with
      const addressesWeAreLookingFor = Constants.BinanceWallets;

      for (const address in addressesWeAreLookingFor) {
        if (toAddress === address && !Constants.BinanceWallets[fromAddress]) {
          // Define the values stored in our transfer object
          const transferObject = {
            '_id': transaction.transactionHash,
            'tokenAddress': transaction.address,
            'amount': parseInt(transaction.data, 16),
            'fromAddress': '0x' + transaction.topics[1].substring(26),
            'toAddress': '0x' + transaction.topics[2].substring(26),
            'transactionHash': transaction.transactionHash,
            'timeStamp': transaction.timeStamp,
            'blockNumber': transaction.blockNumber,
          };

          // Define the values stored in our wallet object
          const binanceWalletObject = {
            '_id': transferObject.fromAddress,
            'walletAddress': transferObject.fromAddress,
          };

          // Define the values stored in our blockstamp object
          const blockStampObject = {
            '_id': transaction.blockNumber,
            'timeStamp': transaction.timeStamp,
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

  /// This is proprietary for processing  ERC20 'transfer' events.
  /// Consumes an individual transaction and applies a filter.
  /// Used for live pulling transaction data that has been processed through a Binance wallet
  async processTransferTransactionLive (transaction) {
    // This filter will ignore transactions that contain more than just a single transfer event per transaction
    // ie, only transactions that do a single transaction
    if (transaction.topics.length === 3) {
      // Trims the transaction data to appropriate Hash-address length
      let toAddress = '0x' + transaction.topics[2].substring(26);
      toAddress = this.web3.utils.toChecksumAddress(toAddress);
      let fromAddress = '0x' + transaction.topics[1].substring(26);
      fromAddress = this.web3.utils.toChecksumAddress(fromAddress);

      let transferObject;

      // This verifies we are only flagging transactions that contain tokens we have set in our token database
      if (Constants.TokenDatabase[transaction.address]) {
        if (this.binanceWallets[toAddress]) {
          // Define the values stored in our transfer object
          transferObject = {
            'tokenAddress': transaction.address,
            'amount': parseInt(transaction.data, 16),
          };
        } else {
          // This is a brand new Binance interim wallet address.
          if (Constants.BinanceWallets[toAddress]) {
            console.log('********* New interim address found');

            // Flag this wallet as an interim wallet without having to pull a new version of mongoDB
            this.binanceWallets[fromAddress] = true;

            // Update our binance wallet database in Mongo
            const binanceWalletObject = {
              '_id': fromAddress,
              'walletAddress': fromAddress,
            };

            await this.mongoInstance.setBinanceWalletAddress(binanceWalletObject);

            // The trade was from interim to Binance, we should still record it, even if data is a bit late
            transferObject = {
              'tokenAddress': transaction.address,
              'amount': parseInt(transaction.data, 16),
            };
          }
        }
      }

      return transferObject;
    }
  }
}

module.exports = etherscanApi;
