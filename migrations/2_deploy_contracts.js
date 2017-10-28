var OrderedListManager = artifacts.require("./OrderedListManager.sol");
var CappedInvestmentFund = artifacts.require("./CappedInvestmentFund.sol");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(OrderedListManager);
  deployer.link(OrderedListManager, CappedInvestmentFund);
  deployer.deploy(CappedInvestmentFund, { from: accounts[0] });
};
