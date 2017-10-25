pragma solidity ^0.4.8;

import "./OrderedListManager.sol";

contract CappedInvestmentFund {

  struct Investment {
    address investor;
    uint amount;
    uint multiplier_micro;
    uint used;
    uint paid;
  }

  /* the array holds the investments, while the OrderedListManager holds
     the indexes of the array in order based on the multiplier */

  Investment[] public investmentOffers;

  using OrderedListManager for OrderedListManager.OrderedList;
  OrderedListManager.OrderedList public investmentOffersOrder;

  function CappedInvestmentFund () {
  }

  /* These two methods can be used to read the entire ordered list of investments */
  function getLowestInvestmentOfferKey ()
    public
    constant
    returns (uint nextKey)
  {
    return investmentOffersOrder.firstKey;
  }

  function getInvestmentOfferAtKey (uint key)
    public
    constant
    returns (address investor, uint amount, uint multiplier_micro, uint nextKey)
  {
      OrderedListManager.ListElement memory element = investmentOffersOrder.getElementAtKey(key);
      Investment investment = investmentOffers[element.extKey];

      return (investment.investor,
              investment.amount,
              investment.multiplier_micro,
              element.next);
  }

  /* for debug mainly */
  function getInvestmentOffersOrderAtKey (uint key)
    public
    constant
    returns (uint extKey, uint value, uint prev, uint next)
  {
        return (investmentOffersOrder.list[key].extKey,
                investmentOffersOrder.list[key].value,
                investmentOffersOrder.list[key].prev,
                investmentOffersOrder.list[key].next);
  }


  /**
  *  atKey: The key of the element in investmentOffersOrder at which the input investment
  *  cab be added safely to the right without breaking the list order.
  *  If this is the case, the gas cosumed is predictable as the insertion process does not
  *  includes searching for the correct insertion point.
  **/
  function invest(uint multiplier_micro, uint atKey)
    payable
    returns(bool success, uint ix)
  {
    /* prepare investment offer element */
    Investment memory newInvestment;

    newInvestment.investor = msg.sender;
    newInvestment.amount = msg.value;
    newInvestment.multiplier_micro = multiplier_micro;

    investmentOffers.push(newInvestment);
    ix = investmentOffers.length;

    OrderedListManager.ListElement memory listElement;
    listElement.extKey = ix - 1;
    listElement.value = multiplier_micro;

    investmentOffersOrder.addElementOrdered(listElement, atKey);
  }

  function spend (uint amount) {
    /* start consuming from the offers and create the corresponding investments */
  }

  function payback() {
  }
}
