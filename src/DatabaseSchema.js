let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Example input = {
// "tokenAddress":"0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
// "amount":4.79e+21,
// "fromAddress": "0x77cdc9a4f33f8cf2392a651553519923ef23808a",
// "toAddress":"0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be",
// "transactionHash":"0xdcf194aed18214b430918a1a0934840ec196230b71f0977a3613614bcf7cac9c",
// "timeStamp":"0x5a48df59",
// "blockNumber":"0x49b331"
// };
const BinanceTokenTransferSchema = new Schema({
    _id: String,
    tokenAddress: String,
    amount: Number,
    fromAddress: String,
    toAddress: String,
    transactionHash: String,
    timeStamp: String,
    blockNumber: String
});

// Example Input = {
// _id: "0x49b330",
// timeStamp: "0x5a48df44"
// };
const BlockNumberTimeStampSchema = new Schema({
    _id: String,
    timeStamp: String
});

// Example Input = {
// _id: "0x77cdc9a4f33f8cf2392a651553519923ef23808a",
// walletAddress: "0x77cdc9a4f33f8cf2392a651553519923ef23808a"
// };
const BinanceWalletLookupSchema = new Schema({
    _id: String,
    walletAddress: String
});

module.exports = {
    BinanceTokenTransferSchema,
    BlockNumberTimeStampSchema,
    BinanceWalletLookupSchema
};
