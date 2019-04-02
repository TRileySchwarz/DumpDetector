const EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const fs = require('fs');
const mongoose = require('mongoose');

/// @title DatabaseBuilder
/// This function will parse blocks between the 'db/lastBlockParsed' file, and the current block in the Ethereum chain
/// The purpose is to build a database of internal Binance Wallets that we will monitor via the TransferBot
setTimeout(async function () {
  // Initialize a connection to Mongo Database
  mongoose.connect('mongodb://localhost/test');
  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error: '));

  db.once('open', async function () {
    console.log('**- We have connected to the Mongo Database system -**\n');

    const _this = this;
    _this.api = new EtherScanApi();

    await _this.api.getCurrentBlock(async function (result) {
      const finishBlock = result;
      const startBlock = parseInt(fs.readFileSync('./db/lastBlockParsed', 'utf8'));
      const increment = Configs.Increment;
      const eventHash = Constants.EventHashes[Configs.Event];

      // Process transaction events, and store results in Mongo DB
      await _this.api.processEventTxs(startBlock, finishBlock, eventHash, increment);

      console.log('\n\n*~*~*~*~The database has been updated!~*~*~*~*');
    });
  });
}, 1);
