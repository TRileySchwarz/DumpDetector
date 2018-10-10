// Configurations for the Etherscan Bot

// The get request return a max of 1000 transactions, and does not indicate that it has overflow.
// Determines how big the block sections we are looking for, reduce this to avoid get request overflows.
// Increase this if the get request is returning less than 1000 transaction per request
const Increment = 15;

const ImportantBlockNumbers = {
    //'January1st':
}

// Available Events:
// 'transfer'
const Event = 'transfer';

module.exports = {
    Increment,
    Event,
    ImportantBlockNumbers
};