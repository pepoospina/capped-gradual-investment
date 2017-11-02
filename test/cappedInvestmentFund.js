var CappedInvestmentFund = artifacts.require("./CappedInvestmentFund.sol");

const getSortedOffers = function (instance, key, sortedOffers) {
  return new Promise(function(resolve, reject) {
    instance.getInvestmentOfferDataAtKey.call(key).then(
      function (res) {

        sortedOffers.push({
          investor: res[0],
          amount: res[1],
          multiplier_micro: res[2]
        });

        var nextKey = res[3];
        if (nextKey != 0) {
          /* recursive call filling sortedOffers
          until the end of the list */
          resolve(getSortedOffers(instance, nextKey, sortedOffers));
        } else {
          resolve(sortedOffers);
        }
      });
    });
  };

contract('CappedInvestmentFund', function(accounts) {

  var investmentFund;

  it ("should add a investment in order", function() {

    var orderedInvestments = [];

    return CappedInvestmentFund.deployed().then(
    function(instance) {
      investmentFund = instance;
      return investmentFund.invest(1100000, 0, {from: accounts[0], value: web3.toWei(1.1, 'ether')});
    }).then(

    function(txn) {
      return investmentFund.invest(1200000, 0, {from: accounts[1], value: web3.toWei(1.2, 'ether')});
    }).then(

    function(txn) {
      return investmentFund.invest(900000, 0, {from: accounts[2], value: web3.toWei(1.3, 'ether')});
    }).then(

    function(txn) {
      return investmentFund.invest(1200000, 0, {from: accounts[3], value: web3.toWei(1.4, 'ether')});
    }).then(

    function(txn) {
      return investmentFund.invest(1300000, 0, {from: accounts[4], value: web3.toWei(1.5, 'ether')});
    }).then(

    function(txn) {
      return investmentFund.getLowestInvestmentOfferKey.call();
    }).then(

    function(key) {

      console.log("key: " + key);

      getSortedOffers(investmentFund, key, []).then(function(sortedOffers) {
        /* check the order is correct */
        console.log(sortedOffers);

        assert.equal(sortedOffers[0].investor, accounts[2], "investment address wrong");
        assert.equal(sortedOffers[0].amount, web3.toWei(1.3, 'ether'), "investment amount wrong");
        assert.equal(sortedOffers[0].multiplier_micro, 900000, "investment multiplier wrong");

        assert.equal(sortedOffers[1].investor, accounts[0], "investment address wrong");
        assert.equal(sortedOffers[1].amount, web3.toWei(1.1, 'ether'), "investment amount wrong");
        assert.equal(sortedOffers[1].multiplier_micro, 1100000, "investment multiplier wrong");

        assert.equal(sortedOffers[2].investor, accounts[1], "investment address wrong");
        assert.equal(sortedOffers[2].amount, web3.toWei(1.2, 'ether'), "investment amount wrong");
        assert.equal(sortedOffers[2].multiplier_micro, 1200000, "investment multiplier wrong");

        assert.equal(sortedOffers[3].investor, accounts[3], "investment address wrong");
        assert.equal(sortedOffers[3].amount, web3.toWei(1.4, 'ether'), "investment amount wrong");
        assert.equal(sortedOffers[3].multiplier_micro, 1200000, "investment multiplier wrong");

        assert.equal(sortedOffers[4].investor, accounts[4], "investment address wrong");
        assert.equal(sortedOffers[4].amount, web3.toWei(1.5, 'ether'), "investment amount wrong");
        assert.equal(sortedOffers[4].multiplier_micro, 1300000, "investment multiplier wrong");
      })

    });

  });

  // it ("should spend investments in order", function() {
  //   return investmentFund.spend(web3.toWei(1.1), { from: accounts[0] }).then(
  //
  //   function (txn) {
  //     console.log(txn)
  //   });
  //
  // });
});
