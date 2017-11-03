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
    getLowestKeyMethod.call().then(
      function(key) {
        if (key > 0) {
          // console.log('first key: ' + key)
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
            paid: res[4]
          }
        array.push(element);

        var nextKey = res[5];
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

  it ("should add a investment in order",

  function() {

    var orderedInvestments = [];
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

    return CappedInvestmentFund.deployed()
    .then(

    function(instance) {
      investmentFund = instance;
      console.log('contract address: ' + investmentFund.address);

      return makeInvestments(investmentFund, investments);
    }).then(

    function(txn) {
      return getSortedElements(investmentFund.getLowestInvestmentOfferKey, investmentFund.getInvestmentOfferDataAtKey);
    }).then(

    function(sortedOffers) {
      /* check the order is correct */
      // console.log(sortedOffers);

      var investmentsSorted = JSON.parse(JSON.stringify(investments));
      investmentsSorted.sort(compareInvestments);

      assert.equal(sortedOffers.length, investmentsSorted.length, "investment number wrong");

      for (var ix in sortedOffers) {
        var offer = sortedOffers[ix];
        assert.equal(offer.investor, investmentsSorted[ix].investor, "investment address wrong");
        assert.equal(offer.multiplier_micro, investmentsSorted[ix].multiplier_micro, "investment multiplier wrong");
        assert.equal(offer.amount, web3.toWei(investmentsSorted[ix].amount_eth, "ether"), "investment amount wrong");
      }

      return investmentFund.spend(web3.toWei(1.1), { from: accounts[0] });

    }).then(

    function(txn) {
      return getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey);
    }).then(

    function(usedOffers) {
      // console.dir(usedOffers)
      assert.equal(usedOffers[0].used, web3.toWei(1.1, 'ether'), "didn't used partially one offer");

      /* spend more */
      return investmentFund.spend(web3.toWei(0.5), { from: accounts[0] });
    }).then(

    function(txn) {
      // console.log('spent again')
      return getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey);
    }).then(

    function(usedOffers) {
      // console.dir(usedOffers)

      assert.equal(usedOffers[0].used, web3.toWei(1.3, 'ether'), "error using offer");
      assert.equal(usedOffers[1].used, web3.toWei(0.3, 'ether'), "error using offer");

      /* spend more */
      return investmentFund.spend(web3.toWei(0.9), { from: accounts[0] });
    });
  });

  // it ("should spend investments in order", function() {
  //   return investmentFund.spend(web3.toWei(1.1), { from: accounts[0] }).then(
  //   function (txn) {
  //
  //     getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey)
  //     .then(function(usedOffers) {
  //       console.log('used offers:' + usedOffers)
  //     });
  //   });
  // });
});
