var CappedInvestmentFund = artifacts.require("./CappedInvestmentFund.sol");

contract('CappedInvestmentFund', function(accounts) {

  it ("should add a first investment to the list", function() {

    var investmentFund;
    var amountEther = 1.5;
    var multiplier_micro = 11000000;

    return CappedInvestmentFund.deployed().then(
    function(instance) {
      console.log(instance)
      investmentFund = instance;
      return investmentFund.invest(multiplier_micro, 0, {from: accounts[0], value: web3.toWei(amountEther, 'ether')});
    }).then(

    function(txn) {
      // console.log(txn)
      return investmentFund.investmentOffers.call(0);
    }).then(

    function(offer) {
      // console.log(offer)
      var amount = offer[1];
      assert.equal(amount.toString(), web3.toWei(amountEther, 'ether'), "invested amount not stored correctly");

      var multiplier_micro = offer[2];
      assert.equal(multiplier_micro.toString(), multiplier_micro.toString(), "multiplier micro not stored correctly");
    });
  });

  it ("should add a second investment to the list", function() {

    var investmentFund;
    var amountEther = 2.5;
    var multiplier_micro = 12000000;

    return CappedInvestmentFund.deployed().then(
    function(instance) {
      investmentFund = instance;
      return investmentFund.invest(multiplier_micro, 0, {from: accounts[0], value: web3.toWei(amountEther, 'ether')});
    }).then(

    function(txn) {
      // console.log(txn)
      return investmentFund.investmentOffers.call(1);
    }).then(

    function(offer) {
      // console.log(offer)
      var amount = offer[1];
      assert.equal(amount.toString(), web3.toWei(amountEther, 'ether'), "invested amount not stored correctly");

      var multiplier_micro = offer[2];
      assert.equal(multiplier_micro.toString(), multiplier_micro.toString(), "multiplier micro not stored correctly");
    });

  });

  it ("should add a third investment to the list", function() {

    var investmentFund;
    var amountEther = 3.5;
    var multiplier_micro = 13000000;

    return CappedInvestmentFund.deployed().then(
    function(instance) {
      investmentFund = instance;
      return investmentFund.invest(multiplier_micro, 0, {from: accounts[0], value: web3.toWei(amountEther, 'ether')});
    }).then(

    function(txn) {
      // console.log(txn)
      return investmentFund.investmentOffers.call(2);
    }).then(

    function(offer) {
      // console.log(offer)
      var amount = offer[1];
      assert.equal(amount.toString(), web3.toWei(amountEther, 'ether'), "invested amount not stored correctly");

      var multiplier_micro = offer[2];
      assert.equal(multiplier_micro.toString(), multiplier_micro.toString(), "multiplier micro not stored correctly");
    });

  });
});
