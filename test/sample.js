const DSA =  require('dsa-sdk');
const Web3 = require('web3')

  async function loadBlockchainData(){

 const web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'))
   // in nodejs
const dsa = new DSA({
  web3: web3,
  mode: "node",
  privateKey: PRIVATE_KEY
});

var addr = await dsa.build({
  gasPrice: web3.utils.toHex(web3.utils.toWei('11', 'gwei')),
})
console.log(addr)
var addr = await dsa.getAccounts('0x39626B5a8dfD359CCe528eb5b7E8b82094d32AB2')

console.log(addr) 
 }

loadBlockchainData()