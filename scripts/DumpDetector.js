const EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');
const mongoose = require('mongoose');
const TelegramBot = require('../scripts/TelegramBot');

/// @title TransferBot
/// This bot will monitor all ERC20 transfer events live from the Ethereum. It will then flag transfers coming into
/// Internal Binance wallets. The results can be monitored via the Telegram channel, or the console logs.
/// Refer to the README.md for more information on configuring this tool.
setTimeout(async function () {
  // Setup the values for the bot to interact with.
  const _this = this;
  _this.api = new EtherScanApi();
  _this.blockWindows = {};
  _this.tokenAddresses = Object.keys(Constants.TokenDatabase);
  _this.telegramBot = new TelegramBot();

  for (const tokenAddress of _this.tokenAddresses) {
    _this.blockWindows[tokenAddress] = {
      valuesInWindow: setupArray(),
      totalValue: 0,
    };
  }

  await _this.api.getCurrentBlock(async function (result) {
    // This is set to start the bot, the variable name is not accurate for this line, but subsequent lines it is.
    _this.lastBlockParsed = result;
  });

  // Initialize a connection to Mongo Database
  mongoose.connect('mongodb://localhost/test');
  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error: '));

  db.once('open', async function () {
    console.log('**- We have connected to the Mongo Database system -**\n');
    await _this.api.setBinanceWalletsGlobal();

    const startBot = '-------------------Starting Bot--------------------';
    console.log('\n' + startBot + '\n');

    setInterval(async function () {
      // Gets the current block of the chain
      await _this.api.getCurrentBlock(async function (result) {

        // If this is greater than the last block parse, ie is a new block we havent checked yet,
        // then pull the ERC20 transfer data from it
        if (result > _this.lastBlockParsed) {

          // If for some reason two blocks have been mined we will parse all of the new ones.
          // This ensures we dont skip a block by accident
          for (let start = _this.lastBlockParsed + 1; start <= result; start++) {
            const newTransferData = {};
            const newDataToParse = await _this.api.getEventTxBySingleBlock(
              start,
              start,
              Constants.EventHashes[Configs.Event]
            );

            // Populates the amount of token transfers per token in the TokenDatabase.js
            for (const transfer of newDataToParse) {
              const transferObject = await _this.api.processTransferTransactionLive(transfer);

              if (transferObject) {
                const tokenAddress = transferObject.tokenAddress;

                if (newTransferData[tokenAddress]) {
                  newTransferData[tokenAddress] += transferObject.amount;
                } else {
                  newTransferData[tokenAddress] = transferObject.amount;
                }
              }
            }

            // This allows for us to keep track of the 36 block window it takes of confirmations
            // After which the users are able to transfer out their funds
            for (const tokenAddress of Object.keys(_this.blockWindows)) {
              const valueRemoved = _this.blockWindows[tokenAddress].valuesInWindow.shift();
              _this.blockWindows[tokenAddress].totalValue -= valueRemoved;

              if (newTransferData[tokenAddress]) {
                // Accommodating for decimals in the tokens
                let amount = newTransferData[tokenAddress] / (10 ** Constants.TokenDatabase[tokenAddress].decimals);
                amount = amount.toFixed();
                amount = parseInt(amount);

                _this.blockWindows[tokenAddress].valuesInWindow.push(amount);
                _this.blockWindows[tokenAddress].totalValue += amount;
              } else {
                _this.blockWindows[tokenAddress].valuesInWindow.push(0);
              }
            }

            const startOfProcessText = '\n-------Block ' + start + ' has been mined-------\n' +
                'The total amount of tokens transferred to Binance in the last ' + Configs.BinanceConfirmationWindow +
                ' blocks are as follows:\n\n';

            console.log(startOfProcessText);

            let textForTelegramBot = '';

            // Allows us to format how we want to display notifications of information
            for (const address of Object.keys(_this.blockWindows)) {
              const textToPrint = '    ' +
                  Constants.TokenDatabase[address].symbol +
                  ' ::= ' +
                  _this.blockWindows[address].totalValue;

              textForTelegramBot = textForTelegramBot.concat(textToPrint + '\n');
              console.log(textToPrint);

              // !!! Insert check for threshold here!!!
              // if (_this.blockWindows[address]['totalValue']) is greater than threshold, then tell us!!!!!!
            }
            console.log('\n');

            // Sends the message notification to our Telegram Bot we have setup
            _this.telegramBot.message(startOfProcessText + textForTelegramBot);
          }

          // Sets the last block parsed so we can keep track of what the last parsed block is
          _this.lastBlockParsed = result;
        }
      });

      // Set to check for new blocks every second to avoid getting rate limited
    }, 1000);
  });
}, 1);

// This sets up an array according to the Binance confirmation window variable we setup in Configs
function setupArray () {
  const arrayOfValues = [];

  for (let index = 0; index < Configs.BinanceConfirmationWindow; index++) {
    arrayOfValues.push(0);
  }

  return arrayOfValues;
}
