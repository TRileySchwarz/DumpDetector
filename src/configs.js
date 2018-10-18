// Configurations for the Etherscan Bot

// The get request return a max of 1000 transactions, and does not indicate that it has overflow.
// Determines how big the block sections we are looking for, reduce this to avoid get request overflows.
// Increase this if the get request is returning less than 1000 transaction per request
const Increment = 15;

const ImportantBlockNumbers = {
    // Not actually January 1st, but very close to the block
    'January1st': 4830000,
    'EndOfCurrentDatabase': 6500000
};

// The amount of confirmations before a token can be traded on Binance
const BinanceConfirmationWindow = 20;

// Available Events:
// 'transfer'
const Event = 'transfer';

module.exports = {
    Increment,
    Event,
    ImportantBlockNumbers,
    BinanceConfirmationWindow
};