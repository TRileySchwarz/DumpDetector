// Imports the Database Schema and pushes through the constants.
const {
    BinanceTokenTransferSchema,
    BlockNumberTimeStampSchema,
    BinanceWalletLookupSchema
} = require('../src/DatabaseSchema');

// The event hashes available to lookup on Etherscan.
const EventHashes = {
    //return keccak256("Transfer(address,address,uint256)");
    'transfer': '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
};

// Lookup table for event hashes.
const EventHashesLookup = {
    //return keccak256("Transfer(address,address,uint256)");
    '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': 'Transfer(address,address,uint256)'
};

// The addresses of Binance Exchange wallets.
const BinanceWallets = {
    '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE': 'binance1',
    '0xD551234Ae421e3BCBA99A0Da6d736074f22192FF': 'binance2',
    '0x564286362092D8e7936f0549571a803B203aAceD': 'binance3',
    '0x0681d8Db095565FE8A346fA0277bFfdE9C0eDBBF': 'binance4',
    '0xfE9e8709d3215310075d67E3ed32A380CCf451C8': 'binance5'
};

// The max length of an API get response
const MaxApiResponseLength = 1000;


module.exports = {
    EventHashes,
    BinanceWallets,
    EventHashesLookup,
    MaxApiResponseLength,
    BinanceTokenTransferSchema,
    BlockNumberTimeStampSchema,
    BinanceWalletLookupSchema
};