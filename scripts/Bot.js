let EtherScanApi = require('../src/etherScanApi');
const Constants = require('../src/constants');
const Configs = require('../src/configs');


setTimeout(async function(){
    let api = new EtherScanApi();
    let _this = this;

    await api.getCurrentBlock(function(result){
        let currentBlock = result;
        _this.fromBlock = (currentBlock - Configs.BlockBuffer['before']).toString();
        _this.toBlock = (currentBlock + Configs.BlockBuffer['after']).toString();
        _this.eventHash = Constants.EventHashes['transfer'];
    });

    let data = await api.getEventTxs(_this.fromBlock, _this.toBlock, _this.eventHash);
    console.log(data);
}, 1);



