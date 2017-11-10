const BigNumber = require('bignumber.js')

var CappedInvestmentFund = artifacts.require("./CappedInvestmentFund.sol");

const makeInvestments = function (instance, investments) {
  var promises = []
  for (var ix in investments) {
    var investment = investments[ix];
    var p = new Promise(function(resolve, reject) {
      instance.invest(investment.multiplier_micro, 0, { from: investment.investor, value: web3.toWei(investment.amount_eth, 'ether') })
      .then(
      function (txn) {
        resolve();
      });
    });
    promises.push(p);
  }

  // console.log(promises)
  return Promise.all(promises);
}

const compareInvestments = function(a, b) {
  if (a.multiplier_micro < b.multiplier_micro) {
    return -1;
  }
  if (a.multiplier_micro > b.multiplier_micro) {
    return 1;
  }
  return 0;
}

const getSortedElements = function (getLowestKeyMethod, getElementAtKeyMethod) {
  var array = [];
  return new Promise(function(resolve, reject) {
    getLowestKeyMethod.call()
    .catch(function(err) {

      console.log("error getting lowest key");
      console.log(err);

    }).then(
      function(key) {
        console.log('first key: ' + key)
        if (key.valueOf() > 0) {
          console.log('greater than zero')
          getSortedElementsRec(getElementAtKeyMethod, key, array).then(
            function (array) {
              resolve(array);
            })
        } else {
          resolve([]);
        }

      });
  });
}

const getSortedElementsRec = function (getElementAtKeyMethod, key, array) {
  return new Promise(function(resolve, reject) {
    getElementAtKeyMethod.call(key).then(
      function (res) {

        var element = {
          investor: res[0],
          amount: res[1],
          multiplier_micro: res[2],
          used: res[3],
          filled_micros: res[4],
          paid_micros: res[5]
        }

        array.push(element);
        console.log('array:');
        console.dir(array);_

        var nextKey = res[6];
        console.log('nextKey:' + nextKey);
        if (nextKey != 0) {
          /* recursive call filling sortedOffers
          until the end of the list */
          resolve(getSortedElementsRec(getElementAtKeyMethod, nextKey, array));
        } else {
          resolve(array);
        }
      });
    });
};

contract('CappedInvestmentFund', function(accounts) {

  var investmentFund;

  it ("should add multiple investments, use them and opay",

  function() {

    var orderedInvestments = [];
    /* asserts work only for these numbers */
    var investments = [
      {
        investor: accounts[0],
        multiplier_micro: 1100000,
        amount_eth: 1.1
      },
      {
        investor: accounts[1],
        multiplier_micro: 1200000,
        amount_eth: 1.2
      },
      {
        investor: accounts[2],
        multiplier_micro: 900000,
        amount_eth: 1.3
      },
      {
        investor: accounts[3],
        multiplier_micro: 1200000,
        amount_eth: 1.4
      },
      {
        investor: accounts[4],
        multiplier_micro: 1300000,
        amount_eth: 1.5
      } ];

    console.log('getting instance...');
    return CappedInvestmentFund.deployed()
    .then(

    function(instance) {

      investmentFund = instance;
      console.log('contract address: ' + investmentFund.address);

      console.log('making investments...');
      return makeInvestments(investmentFund, investments);

    }).catch(function(err) {

      console.log("error making investments")
      console.log(err)

    }).then(

    function(txn) {

      console.log('getting sorted elements...');
      return getSortedElements(
        investmentFund.getLowestInvestmentOfferKey,
        investmentFund.getInvestmentOfferDataAtKey);

    }).catch(function(err) {

      console.log("error getting sorted elements")
      console.log(err)

    }).then(

    function(sortedOffers) {
      /* check the order is correct */
      console.log(sortedOffers);

    });
  });
});
