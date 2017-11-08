var SortedListManager = artifacts.require("./SortedListManager.sol");
var CappedInvestmentFund = artifacts.require("./CappedInvestmentFund.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(SortedListManager);
  deployer.link(SortedListManager, CappedInvestmentFund);
  deployer.deploy(CappedInvestmentFund, { from: accounts[0] });
};
