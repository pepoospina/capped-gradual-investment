const Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))

const Promise = require('bluebird')
Promise.promisifyAll(web3.eth, { suffix: 'Promise' })
Promise.promisifyAll(web3.version, { suffix: 'Promise' })

const truffleContract = require('truffle-contract')
/* eslint-disable no-path-concat */
const Fund = truffleContract(require(__dirname + '/../build/contracts/CappedInvestmentFund.json'))
Fund.setProvider(web3.currentProvider)

export {
  web3,
  Fund
}
