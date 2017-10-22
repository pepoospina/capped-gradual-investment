var CappedInvestmentFund = artifacts.require("./CappedInvestmentFund.sol");

contract('CappedInvestmentFund', function(accounts) {
  it("should add a the first investment to the list", function() {
    return CappedInvestmentFund.deployed().then(

    function(instance) {
      return instance.invest(10000000, 0, {from: accounts[0], value: web3.toWei(1.5, 'ether')});
    }).then(

    function(res) {
      assert.equal(res.success, true, "error making the first investment");
      assert.equal(res.ix, 1, "error making the first investment");
      return instance.getInvestmentOffers(res.ix)
    }).then(

    function(offer) {
        assert.equal(offer.amount, web3.toWei(1.5, 'ether'), "invested amount not stored correctly")
        assert.equal(offer.multiplier_micro, 10000000, "investment multiplier not stored correcly")
    });
  });
});
