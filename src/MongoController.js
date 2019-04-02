const mongoose = require('mongoose');

const {
  BinanceTokenTransferSchema,
  BlockNumberTimeStampSchema,
  BinanceWalletLookupSchema,
} = require('../src/Constants');

const consoleLogBuffer = '          ';

class MongoController {
  constructor () {
    // Contains our Binance Wallet Database
    this.BinanceWallet = mongoose.model('BinanceWallet', BinanceWalletLookupSchema);

    // Contains our Block Number Time Stamps
    this.BlockNumberTimeStamp = mongoose.model('BlockNumberTimeStamp', BlockNumberTimeStampSchema);

    // Contains our Binance Token Transfer Database
    this.BinanceTokenTransfer = mongoose.model('BinanceTokenTransfer', BinanceTokenTransferSchema);
  }

  // --------------Adding to Database Methods

  /// Adds a new wallet to the Binance Wallet Database.
  /// If it has already been added, print a message that states a duplicate has been skipped
  /// Param: addressObject = {
  /// _id: "0x77cdc9a4f33f8cf2392a651553519923ef23808a",
  /// walletAddress: "0x77cdc9a4f33f8cf2392a651553519923ef23808a"
  /// };
  async setBinanceWalletAddress (addressObject) {
    const newWallet = new this.BinanceWallet(addressObject);

    try {
      if (!await this.isBinanceWalletStored(addressObject._id)) {
        await newWallet.save();
        console.log(consoleLogBuffer + 'Added    BinanceWallet Database: ' + addressObject._id);
      } else {
        console.log(consoleLogBuffer + 'Skipped  Address has already been added: ' + addressObject._id);
      }
    } catch (e) {
      console.log(consoleLogBuffer + 'binanceWallet exception');
      console.log(e);
    }
  }

  /// Adds a new wallet to the BlockNumberTimeStamp Database.
  /// If it has already been added, print a message that states a duplicate has been skipped.
  /// Param: blockNumberObject = {
  /// _id: "0x49b330",
  /// timeStamp: "0x5a48df44"
  /// };
  async setBlockNumberTimeStamp (blockNumberObject) {
    const newEntry = new this.BlockNumberTimeStamp(blockNumberObject);

    try {
      if (!await this.isBlockNumberStored(blockNumberObject._id)) {
        await newEntry.save();
        console.log(consoleLogBuffer + 'Added    BlockNumberTimeStamp Database: ' + blockNumberObject._id);
      } else {
        console.log(consoleLogBuffer + 'Skipped  Block has already been added: ' + blockNumberObject._id);
      }
    } catch (e) {
      console.log(consoleLogBuffer + 'blockNumber exception');
      console.log(e);
    }
  }

  /// Adds a new Binance transfer event to the BinanceTokenTransfer Database.
  /// If it has already been added, print a message that states a duplicate has been skipped.
  /// Param: binanceTransferObject = {
  /// "_id":"0xdcf194aed18214b430918a1a0934840ec196230b71f0977a3613614bcf7cac9c",
  /// "tokenAddress":"0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
  /// "amount":4.79e+21,
  /// "fromAddress": "0x77cdc9a4f33f8cf2392a651553519923ef23808a",
  /// "toAddress":"0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
  /// "transactionHash":"0xdcf194aed18214b430918a1a0934840ec196230b71f0977a3613614bcf7cac9c",
  /// "timeStamp":"0x5a48df59",
  /// "blockNumber":"0x49b331"
  /// };
  async setBinanceTokenTransfer (binanceTransferObject) {
    const newEntry = new this.BinanceTokenTransfer(binanceTransferObject);

    try {
      if (!await this.isBinanceTransferStored(binanceTransferObject._id)) {
        await newEntry.save();
        console.log(consoleLogBuffer + 'Added    BinanceTokenTransfer Database: ' + binanceTransferObject._id);
      } else {
        console.log(consoleLogBuffer + 'Skipped  Transfer has already been added: ' + binanceTransferObject._id);
      }
    } catch (e) {
      console.log(consoleLogBuffer + 'binanceTransfer exception');
      console.log(e);
    }
  }

  // --------------Check if Database Contains Methods

  /// Returns whether or not a blockNumber exists in the BlockNumber Database
  /// True if it has, false if it hasn't.
  /// Param: String(addressToCheck = "0x77cdc9a4f33f8cf2392a651553519923ef23808a")
  async isBinanceWalletStored (addressToCheck) {
    const result = await this.BinanceWallet.find({ _id: addressToCheck });

    return result.length !== 0;
  }

  /// Returns whether or not a blockNumber is stored already.
  /// True if it has, false if it hasn't.
  /// Param: String(blockNumber = "0x49b330")
  async isBlockNumberStored (blockNumber) {
    const result = await this.BlockNumberTimeStamp.find({ _id: blockNumber });

    return result.length !== 0;
  }

  /// Returns whether or not the transfer event is stored already.
  /// True if it has, false if it hasn't.
  /// Param: String(transactionHash = "0xdcf194aed18214b430918a1a0934840ec196230b71f0977a3613614bcf7cac9c")
  async isBinanceTransferStored (transactionHash) {
    const result = await this.BinanceTokenTransfer.find({ _id: transactionHash });

    return result.length !== 0;
  }

  // --------------Delete Methods

  /// Deletes an address from the BinanceWallet Database.
  /// Returns true if it did.
  /// Throws an exception if there is an error checking the database.
  /// Param: String(addressToDelete = "0x77cdc9a4f33f8cf2392a651553519923ef23808a")
  async deleteBinanceWalletAddress (addressToDelete) {
    return this.BinanceWallet.deleteOne({ _id: addressToDelete });
  }

  /// Deletes a block number from the BlockNumber Database.
  /// Returns true if it did.
  /// Throws an exception if there is an error checking the database.
  /// Param: String(blockNumber = "0x49b330")
  async deleteBlocknumber (blockNumberToDelete) {
    return this.BlockNumberTimeStamp.deleteOne({ _id: blockNumberToDelete });
  }

  /// Deletes a transfer event from the BinanceTokenTransfer Database.
  /// Returns true if it did.
  /// Throws an exception if there is an error checking the database.
  /// Param: String(transactionHash = "0xdcf194aed18214b430918a1a0934840ec196230b71f0977a3613614bcf7cac9c")
  deleteTransferEvent (blockNumberToDelete) {
    return this.BinanceTokenTransfer.deleteOne({ _id: blockNumberToDelete });
  }

  // --------------Get Entire Database Methods

  /// Returns the entire instance of BinanceWallet Database.
  /// Throws an exception if there is an error accessing the database.
  async getBinanceWalletDatabase () {
    return await this.BinanceWallet.find({});
  }

  /// Returns the entire instance of BlockTimeStamp Database.
  /// Throws an exception if there is an error accessing the database.
  async getBlockTimeStampDatabase () {
    return await this.BlockNumberTimeStamp.find({});
  }

  /// Returns the entire instance of BinanceTokenTransfer Database.
  /// Throws an exception if there is an error accessing the database.
  async getBinanceTokenTransferDatabase () {
    return await this.BinanceTokenTransfer.find({});
  }

  // TODO add checkers for schema object formation.
}

module.exports = MongoController;
