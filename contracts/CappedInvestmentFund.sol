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

  Investment[] investmentOffers;

  using OrderedListManager for OrderedListManager.OrderedList;
  OrderedListManager.OrderedList investmentOffersOrder;

  function CappedInvestmentFund () {
  }

  /**
  *  atKey: The key of the element in investmentOffersOrder at which the input investment
  *  cab be added safely to the right without breaking the list order.
  *  If this is the case, the gas cosumed is predictable as the insertion process does not
  *  includes searching for the correct insertion point.
  **/
  function invest(uint multiplier_micro, uint atKey)
    payable
    returns(bool success)
  {
    /* prepare investment offer element */
    Investment memory newInvestment;

    newInvestment.investor = msg.sender;
    newInvestment.amount = msg.value;
    newInvestment.multiplier_micro = multiplier_micro;

    investmentOffers.push(newInvestment);
    uint ix = investmentOffers.length;

    OrderedListManager.ListElement memory listElement;
    listElement.extKey = ix;
    listElement.value = multiplier_micro;

    investmentOffersOrder.addElementOrdered(listElement, atKey);
  }

  function spend (uint amount) {
    /* start consuming from the offers and create the corresponding investments */
  }

  function payback() {
  }
}
