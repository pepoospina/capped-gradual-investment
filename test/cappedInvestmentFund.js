var CappedInvestmentFund = artifacts.require("./CappedInvestmentFund.sol");

contract('CappedInvestmentFund', function(accounts) {
  it("should add the first investment to the list", function() {

    var investmentFund;

    return CappedInvestmentFund.deployed().then(
    function(instance) {
      investmentFund = instance;
      return investmentFund.invest(10000000, 0, {from: accounts[0], value: web3.toWei(1.5, 'ether')});
    }).then(

    function(txn) {
      return investmentFund.investmentOffers(1)
    }).then(

    function(offer) {
      console.log(offer)
      assert.equal(offer.amount, web3.toWei(1.5, 'ether'), "invested amount not stored correctly")
      assert.equal(offer.multiplier_micro, 10000000, "investment multiplier not stored correcly")
    });
  });
});
