pragma solidity ^0.4.8;

import "./Ownable.sol";
import "./SortedListManager.sol";

contract CappedInvestmentFund is Ownable {

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

  using SortedListManager for SortedListManager.SortedList;

  SortedListManager.SortedList public investmentOffersOrder;
  SortedListManager.SortedList public investmentsUsedOrder;

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
    private
  {
    SortedListManager.ListElement memory element = investmentOffersOrder.get(key);
    return investmentOffers[element.extKey];
  }

  function getInvestmentOfferDataAtKey (uint key)
    public
    constant
    returns (address investor, uint amount, uint multiplier_micro, uint nextKey)
  {
    Investment investment = getInvestmentOfferAtKey(key)

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

    SortedListManager.ListElement memory listElement;
    listElement.extKey = ix - 1;
    listElement.value = multiplier_micro;

    investmentOffersOrder.addSorted(listElement, atKey);
  }

  /* start consuming from the offers and add the used investments to the investmentsUsedOrder list.
  * If an offer is not fully used, it will remain both in the investmentOffersOrder list and in the
  * investmentsUsedOrder list */
  function spend (uint amount)
    public
    onlyOwner
  {
    uint totalToSpend = msg.value;
    uint spent = 0;
    uint stillToSpend = totalToSpend - spent;
    uint currentKey = getLowestInvestmentOfferKey();

    SortedListManager.ListElement memory elementInOffers = investmentOffersOrder.getFirst();
    uint ix = elementInOffers.extKey;

    Investment memory investment = investmentOffers[ix];

    while (stillToSpend > 0) {

      uint available = investment.amount - investment.used;

      if (available > stillToSpend) {
        /* if there is more available than needed */
        investment.used += stillToSpend;
        stillToSpend = 0;
      } else {
        /* if there is less or equal available than needed */
        investment.used += available;
        stillToSpend -= available;
      }

      /* add the investment to the investmentsUsedOrder list if not already added */
      if (investmentOffersOrder.getFirst(1).extKey != ix) {
        /* not yet added */
        listElement.extKey = ix - 1;
        listElement.value = multiplier_micro;
        investmentOffersOrder.push(listElement);
      }

      if (investment.used >= investment.amount) {
        /* TODO: Actually it should only be ==, but... i am scared that
        the whole process breaks for a minor overshoot... */

        /* remove the element from the offer list because it has been fully used */
        investmentOffersOrder.popFirst();
      }
    }
  }

  function payback() {
  }
}
