var CappedInvestmentFund = artifacts.require("./CappedInvestmentFund.sol");

contract('CappedInvestmentFund', function(accounts) {

  it ("should add a first investment to the list", function() {

    var investmentFund;
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

      const getOfferAtKey = function (thisKey) {
        return investmentFund.getInvestmentOfferAtKey.call(thisKey).then(
          function (res) {

            orderedInvestments.push({
              investor: res[0],
              amount: res[1],
              multiplier_micro: res[2]
            });

            var nextKey = res[3];
            if (nextKey != 0) {
              /* recursive call filling orderedInvestments
              until the end of the list */
              getOfferAtKey(nextKey);

            } else {
              /* at this point all the list has been run in order */

              /* check the order is correct */
              assert.equal(orderedInvestments[0].investor, accounts[2], "investment address wrong");
              assert.equal(orderedInvestments[0].amount, web3.toWei(1.3, 'ether'), "investment amount wrong");
              assert.equal(orderedInvestments[0].multiplier_micro, 900000, "investment multiplier wrong");

              assert.equal(orderedInvestments[1].investor, accounts[0], "investment address wrong");
              assert.equal(orderedInvestments[1].amount, web3.toWei(1.1, 'ether'), "investment amount wrong");
              assert.equal(orderedInvestments[1].multiplier_micro, 1100000, "investment multiplier wrong");

              assert.equal(orderedInvestments[2].investor, accounts[1], "investment address wrong");
              assert.equal(orderedInvestments[2].amount, web3.toWei(1.2, 'ether'), "investment amount wrong");
              assert.equal(orderedInvestments[2].multiplier_micro, 1200000, "investment multiplier wrong");

              assert.equal(orderedInvestments[3].investor, accounts[3], "investment address wrong");
              assert.equal(orderedInvestments[3].amount, web3.toWei(1.4, 'ether'), "investment amount wrong");
              assert.equal(orderedInvestments[3].multiplier_micro, 1200000, "investment multiplier wrong");

              assert.equal(orderedInvestments[4].investor, accounts[4], "investment address wrong");
              assert.equal(orderedInvestments[4].amount, web3.toWei(1.5, 'ether'), "investment amount wrong");
              assert.equal(orderedInvestments[4].multiplier_micro, 1300000, "investment multiplier wrong");

            }
          }
        );
      }

      return getOfferAtKey(key);
    });

  });

});
