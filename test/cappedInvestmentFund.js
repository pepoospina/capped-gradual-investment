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
    getLowestKeyMethod.call().then(
      function(key) {
        console.log('first key: ' + key);
        if (key.valueOf() > 0) {
          // console.log('here');
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
        console.log('here');
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
        // console.log('nextKey:' + nextKey);
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
    var investmentsSorted = [];

    /* asserts work only for these numbers */
    var investments2 = [
      {
        investor: accounts[5],
        multiplier_micro: 1100000,
        amount_eth: 1.6
      },
      {
        investor: accounts[6],
        multiplier_micro: 1250000,
        amount_eth: 1.7
      }];
    var remainingOffers = [];
    var remainingSorted = [];
    var investmentsUsedRef = [];
    var totalAvailable = 0;
    var investorBalance = 0;
    var receiverBalance = 0;

    /* asserts work only for these numbers */
    var revenue_eth = [1, 1.5, 2.5, 1.5];

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

      investmentsSorted = JSON.parse(JSON.stringify(investments));
      investmentsSorted.sort(compareInvestments);

      assert.equal(sortedOffers.length, investmentsSorted.length, "investment number wrong");

      for (var ix in sortedOffers) {
        var offer = sortedOffers[ix];
        assert.equal(offer.investor, investmentsSorted[ix].investor, "investment address wrong");
        assert.equal(offer.multiplier_micro, investmentsSorted[ix].multiplier_micro, "investment multiplier wrong");
        assert.equal(offer.amount, web3.toWei(investmentsSorted[ix].amount_eth, "ether"), "investment amount wrong");
      }

      /* spend 80% of the first investment */
      console.log('spending 80% of first investment...');
      receiverBalance = web3.eth.getBalance(accounts[9]);
      console.log(receiverBalance);
      return investmentFund.spend(
        web3.toWei(investmentsSorted[0].amount_eth*0.8),
        accounts[9],
        { from: accounts[0] });

    }).catch(function(err) {

      console.log("error asserting sorted offers 1 or spending")
      console.log(err)

    }).then(

    function(txn) {
      var newBalance = web3.eth.getBalance(accounts[9])
      var received = new BigNumber(newBalance - receiverBalance);
      var sent = new BigNumber(web3.toWei(investmentsSorted[0].amount_eth*0.8));
      assert.equal(sent.cmp(received), 0, "funds sent not received");

      console.log('getting sorted used investments...');
      return getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey);
    }).then(

    function(usedOffers) {
      // console.dir(usedOffers)
      assert.equal(usedOffers[0].used, web3.toWei(investmentsSorted[0].amount_eth*0.8, 'ether'), "didn't used partially one offer");

      /* spend another 80% of the first investment */
      console.log('spending another 80% of first investment...');
      receiverBalance = web3.eth.getBalance(accounts[9]);
      console.log(receiverBalance);
      return investmentFund.spend(
        web3.toWei(investmentsSorted[0].amount_eth*0.8),
        accounts[9],
        { from: accounts[0] });
    }).catch(function () {

      console.log('error spending another 80%');

    }).then(

    function(txn) {
      // console.log('spent again')
      var newBalance = web3.eth.getBalance(accounts[9])
      var received = new BigNumber(newBalance - receiverBalance);
      var sent = new BigNumber(web3.toWei(investmentsSorted[0].amount_eth*0.8));
      assert.equal(sent.cmp(received), 0, "funds sent not received");

      console.log('getting sorted used investments...');
      return getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey);
    }).then(

    function(usedOffers) {
      // console.dir(usedOffers)

      /* first investment fully used - the 20% missing */
      assert.equal(usedOffers[0].used, web3.toWei(investmentsSorted[0].amount_eth, 'ether'), "error using offer");
      /* second investment used for what was missing - 60% to reach 80% */
      assert.equal(usedOffers[1].used, web3.toWei(investmentsSorted[0].amount_eth*0.6, 'ether'), "error using offer");

      console.log('getting sorted offered investments...');
      return getSortedElements(investmentFund.getLowestInvestmentOfferKey, investmentFund.getInvestmentOfferDataAtKey);
    }).then(

    function (sortedOffers) {

      // console.dir(sortedOffers);
      /* check the first offer was deleted from the offer list */
      // TODO: bug warning, if investor is the same for the two first investments this test might give a false positive.
      assert.equal(sortedOffers.length, investmentsSorted.length - 1, "too many elements");
      assert.notEqual(sortedOffers[0].investor, investmentsSorted[0].investor, "investment not removed from offers");

      /* spend two investments in a row */
      var remaining = investmentsSorted[1].amount_eth - investmentsSorted[0].amount_eth*0.6
      /* spend all what remains from second investments + all third investment + 0.1 eth if the forth investment */
      var spendNow = remaining + investmentsSorted[2].amount_eth + 0.1;

      console.log('spending more than one investment at a time...');
      return investmentFund.spend(web3.toWei(spendNow), { from: accounts[0] });

    }).then (

    function(txn) {
      // console.log('spent again')
      console.log('getting sorted used investments...');
      return getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey);
    }).then(

    function(usedOffers) {
      // console.dir(usedOffers)

      assert.equal(usedOffers[0].used, web3.toWei(investmentsSorted[0].amount_eth, 'ether'), "error using offer");
      assert.equal(usedOffers[1].used, web3.toWei(investmentsSorted[1].amount_eth, 'ether'), "error using offer");
      assert.equal(usedOffers[2].used, web3.toWei(investmentsSorted[2].amount_eth, 'ether'), "error using offer");
      assert.equal(usedOffers[3].used, web3.toWei(0.1, 'ether'), "error using offer");

      console.log('getting sorted offered investments...');
      return getSortedElements(investmentFund.getLowestInvestmentOfferKey, investmentFund.getInvestmentOfferDataAtKey);
    }).then(

    function (sortedOffers) {
      // console.dir(sortedOffers)
      assert.equal(sortedOffers.length, investmentsSorted.length - 3, "too many elements");

      remainingOffers = [];

      for (var ix in sortedOffers) {
        remainingOffers.push({
          investor: sortedOffers[ix].investor,
          amount_eth: Number(web3.fromWei(sortedOffers[ix].amount, "ether")),
          multiplier_micro: Number(sortedOffers[ix].multiplier_micro)
        })
      }

      /* lets now make another investment */
      console.log('making second row of investments...');
      return makeInvestments(investmentFund, investments2);
    }).then(

    function (txt) {
      console.log('getting sorted offered investments...');
      return getSortedElements(investmentFund.getLowestInvestmentOfferKey, investmentFund.getInvestmentOfferDataAtKey);
    }).then(

    function (sortedOffers) {
      // console.log(investmentsOffersNow)

      remainingSorted = JSON.parse(JSON.stringify(remainingOffers.concat(investments2)));
      remainingSorted.sort(compareInvestments);

      for (var ix in sortedOffers) {
        var offer = sortedOffers[ix];
        assert.equal(offer.investor, remainingSorted[ix].investor, "investment address wrong");
        assert.equal(offer.multiplier_micro, remainingSorted[ix].multiplier_micro, "investment multiplier wrong");
        assert.equal(offer.amount, web3.toWei(remainingSorted[ix].amount_eth, "ether"), "investment amount wrong");
      }

      /* now lets try to spend more than what is totally available */
      totalAvailable = 0;
      sortedOffers.forEach(function(investment) {
        totalAvailable += Number(web3.fromWei(investment.amount - investment.used), "ether");
      })

      console.log('spending more than what is totally available...');
      return investmentFund.spend(
        web3.toWei(totalAvailable + 1), accounts[9],
        { from: accounts[0] });
    }).catch(

    /* TODO: This catch catches all exceptions hapenign avo */
    function (err) {
      /* now spend almost all the funds */
      console.log('spending almost all of what is totally available...');
      receiverBalance = web3.eth.getBalance(accounts[9]);
      return investmentFund.spend(
        web3.toWei(totalAvailable - 0.1),
        accounts[9],
        { from: accounts[0] });
    }).then(

    function (txn) {
      var newBalance = web3.eth.getBalance(accounts[9])
      var received = new BigNumber(newBalance - receiverBalance);
      var sent = new BigNumber(web3.toWei(totalAvailable - 0.1));
      assert.equal(sent.cmp(received), 0, "funds sent not received");

      console.log('getting sorted used investments...');
      return getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey);
    }).then(

    function (sortedUsed) {
      // console.dir(sortedUsed)

      investmentsUsedRef = investmentsSorted.slice(0, 4).concat(remainingSorted);
      assert.equal(sortedUsed.length, investmentsUsedRef.length, "unexpected number of used investments");

      for (var ix in sortedUsed) {
        assert.equal(sortedUsed[ix].investor, investmentsUsedRef[ix].investor, "investment address wrong");
        assert.equal(sortedUsed[ix].multiplier_micro, investmentsUsedRef[ix].multiplier_micro, "investment multiplier wrong");
        assert.equal(sortedUsed[ix].amount, web3.toWei(investmentsUsedRef[ix].amount_eth, "ether"), "investment amount wrong");
      }

      for (var ix in sortedUsed) {
        /* all elements used, expect the last one*/
        if (ix < (sortedUsed.length - 1)) {
          assert.equal(sortedUsed[ix].amount.toString(), sortedUsed[ix].used.toString(), "investment amount used wrong");
        }
      }

      /* now lets receive some revenue */
      console.log('sending revenue');
      return investmentFund.sendRevenue({from: accounts[5], value: web3.toWei(revenue_eth[0], "ether")});
    }).then(

    function (txn) {
      console.log('getting sorted used investments...');
      return getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey);
    }).then(

    function (sortedUsed) {
      /* revenue is not enought to fill this investment */
      assert.equal(sortedUsed[0].filled_micros, web3.toWei(revenue_eth[0], "ether")*1000000, "to fill value not expected");

      console.log('sending revenue II');
      return investmentFund.sendRevenue({from: accounts[5], value: web3.toWei(revenue_eth[1], "ether")});
    }).then(

    function (txn) {
      console.log('getting sorted used investments...');
      return getSortedElements(investmentFund.getLowestInvestmentUsedKey, investmentFund.getInvestmentUsedDataAtKey);
    }).then(

    function (sortedUsed) {
      /* revenue is not enought to paid this investment */
      // console.dir(sortedUsed[0])
      // console.digr(investmentsUsedRef[0])

      var amount1 = new BigNumber(web3.toWei(investmentsUsedRef[0].amount_eth, "ether"));
      var mult1 = new BigNumber(investmentsUsedRef[0].multiplier_micro);
      var filled_micros1 = new BigNumber(sortedUsed[0].filled_micros);
      assert.equal(filled_micros1.cmp(amount1.times(mult1)), 0, "to fill value not expected");

      var amount2 = new BigNumber(web3.toWei(investmentsUsedRef[1].amount_eth, "ether"));
      var mult2 = new BigNumber(investmentsUsedRef[1].multiplier_micro);
      var filled_micros2 = new BigNumber(sortedUsed[1].filled_micros);
      assert.equal(filled_micros2.cmp(amount2.times(mult2)), 0, "to fill value not expected");

      var filled_micros3 = new BigNumber(sortedUsed[2].filled_micros);
      var received = new BigNumber(web3.toWei(revenue_eth[0] + revenue_eth[1], "ether"));
      var remaining_micros = received.times(1000000).minus(amount1.times(mult1).plus(amount2.times(mult2)));
      assert.equal(filled_micros3.cmp(remaining_micros), 0, "to fill value not expected");

      /* payday! test investors can withdraw their funds + multipliers */
      /* prepare by getting the investor current balance */

      console.log("investor 1 ask to be paid back...")
      investorBalance = web3.eth.getBalance(accounts[8]);
      return investmentFund.payback(1, accounts[8], { from: investmentsUsedRef[0].investor })
    }).then(

    function (txn) {
      var newBalance = web3.eth.getBalance(accounts[8])
      var received = new BigNumber(newBalance - investorBalance);
      // console.log("so he received " + web3.fromWei(received, "ether") + " ether");

      var amount1 = new BigNumber(web3.toWei(investmentsUsedRef[0].amount_eth, "ether"));
      var mult1 = new BigNumber(investmentsUsedRef[0].multiplier_micro);
      var expected_wei = amount1.times(mult1).div(1000000);

      assert.equal(expected_wei.cmp(received), 0, "not received what expected");

      /* now investor 2*/
      console.log("investor 2 ask to be paid back...")
      investorBalance = web3.eth.getBalance(accounts[9]);
      return investmentFund.payback(2, accounts[9], { from: investmentsUsedRef[1].investor })
    }).then(

    function(txn) {
      var newBalance = web3.eth.getBalance(accounts[9])
      var received = new BigNumber(newBalance - investorBalance);
      // console.log("so he received " + web3.fromWei(received, "ether") + " ether");

      var amount1 = new BigNumber(web3.toWei(investmentsUsedRef[1].amount_eth, "ether"));
      var mult1 = new BigNumber(investmentsUsedRef[1].multiplier_micro);
      var expected_wei = amount1.times(mult1).div(1000000);

      assert.equal(expected_wei.cmp(received), 0, "not received what expected");
    });
  });

});
