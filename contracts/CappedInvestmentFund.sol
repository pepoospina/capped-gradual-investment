pragma solidity ^0.4.8;

import "./Ownable.sol";
import "./SortedListManager.sol";

contract CappedInvestmentFund is Ownable {

  struct Investment {
    address investor;
    uint amount;
    uint multiplier_micro;
    uint used;
    uint filled_micros;
    uint paid;
  }

  /* the array holds the investments, while the OrderedListManager holds
     the indexes of the array in order based on the multiplier */

  Investment[] public investments;

  using SortedListManager for SortedListManager.SortedList;

  SortedListManager.SortedList public investmentOffersOrder;
  SortedListManager.SortedList public investmentsUsedOrder;

  uint currToFillKey = 0;

  function CappedInvestmentFund () {
  }

  /* These two methods can be used to read the entire ordered list of investments */
  function getLowestInvestmentOfferKey ()
    public
    constant
    returns (uint key)
  {
    return investmentOffersOrder.firstKey;
  }

  function getLowestInvestmentUsedKey ()
    public
    constant
    returns (uint key)
  {
    return investmentsUsedOrder.firstKey;
  }

  function getInvestmentOfferAtKey (uint key)
    private
    returns (Investment investment)
  {
    SortedListManager.ListElement memory element = investmentOffersOrder.get(key);
    return investments[element.extKey];
  }

  function getInvestmentUsedAtKey (uint key)
    private
    returns (Investment investment)
  {
    SortedListManager.ListElement memory element = investmentsUsedOrder.get(key);
    return investments[element.extKey];
  }

  function getInvestmentOfferDataAtKey (uint key)
    public
    constant
    returns (address investor, uint amount, uint multiplier_micro, uint used, uint filled_micros, uint paid, uint nextKey)
  {
    if (key > 0) {
      SortedListManager.ListElement memory element = investmentOffersOrder.get(key);
      (investor, amount, multiplier_micro, used, filled_micros, paid, nextKey) =
        getInvestmentDataAtIx(element.extKey, element.next);
      return;
    } else {
      return (0, 0, 0, 0, 0, 0, 0);
    }
  }

  function getInvestmentUsedDataAtKey (uint key)
    public
    constant
    returns (address investor, uint amount, uint multiplier_micro, uint used, uint filled_micros, uint paid, uint nextKey)
  {
    if (key > 0) {
      SortedListManager.ListElement memory element = investmentsUsedOrder.get(key);
      (investor, amount, multiplier_micro, used, filled_micros, paid, nextKey) =
        getInvestmentDataAtIx(element.extKey, element.next);
      return;
    } else {
      return (0, 0, 0, 0, 0, 0, 0);
    }
  }

  function getInvestmentDataAtIx (uint ix, uint nextKey)
    public
    constant
    returns (address investor, uint amount, uint multiplier_micro, uint used, uint filled_micros, uint paid, uint nextKeyOut)
  {
    Investment memory investment = investments[ix];

    return (investment.investor,
            investment.amount,
            investment.multiplier_micro,
            investment.used,
            investment.filled_micros,
            investment.paid,
            nextKey);
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

  function getInvestmentsUsedOrderAtKey (uint key)
    public
    constant
    returns (uint extKey, uint value, uint prev, uint next)
  {
        return (investmentsUsedOrder.list[key].extKey,
                investmentsUsedOrder.list[key].value,
                investmentsUsedOrder.list[key].prev,
                investmentsUsedOrder.list[key].next);
  }


  /**
  *  atKey: The key of the element in investmentOffersOrder at which the input investment
  *  cab be added safely to the right without breaking the list order.
  *  If this is the case, the gas cosumed is predictable as the insertion process does not
  *  includes searching for the correct insertion point.
  **/
  function invest(uint multiplier_micro, uint atKey)
    payable
    returns(uint ix)
  {
    /* prepare investment offer element */
    Investment memory newInvestment;

    newInvestment.investor = msg.sender;
    newInvestment.amount = msg.value;
    newInvestment.multiplier_micro = multiplier_micro;

    investments.push(newInvestment);
    ix = investments.length;

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
    uint totalToSpend = amount;
    uint spent = 0;
    uint stillToSpend = totalToSpend - spent;

    if (investmentOffersOrder.getSize() == 0) throw;

    SortedListManager.ListElement memory elementInOffers = investmentOffersOrder.getFirst();
    uint ix = elementInOffers.extKey;
    Investment storage investment = investments[ix];

    while (stillToSpend > 0) {

      uint available = investment.amount - investment.used;
      bool isEnough = false;

      if (available >= stillToSpend) {
        isEnough = true;
      }

      if (isEnough) {
        /* if there is more available than needed */
        investment.used += stillToSpend;
        stillToSpend = 0;
      } else {
        /* if there is less or equal available than needed */
        investment.used += available;
        stillToSpend -= available;
      }

      /* add the investment to the investmentsUsedOrder list if not already added */
      if (investmentsUsedOrder.getSize() == 0 || investmentsUsedOrder.getLast().extKey != ix) {
        /* not yet added */
        SortedListManager.ListElement memory listElement;
        listElement.extKey = ix;
        listElement.value = investment.multiplier_micro;
        investmentsUsedOrder.push(listElement);
      }

      if (investment.used >= investment.amount) {
        /* remove the element from the offer list because it has been fully used */
        investmentOffersOrder.popFirst();
      }

      if (!isEnough) {
        /* ups, not enough offers to fill this expenditure */
        if (investmentOffersOrder.getSize() == 0) throw;

        elementInOffers = investmentOffersOrder.getFirst();
        ix = elementInOffers.extKey;
        investment = investments[ix];
      }
    }
  }

  function sendRevenue()
    payable
    public
  {
    uint stillToFill_micros = msg.value*1000000;

    if (investmentsUsedOrder.getSize() == 0) throw;

    if (currToFillKey == 0) {
      currToFillKey = investmentsUsedOrder.getFirstKey();
    }

    SortedListManager.ListElement memory currentElement = investmentsUsedOrder.get(currToFillKey);
    Investment storage investment = investments[currentElement.extKey];

    while (stillToFill_micros > 0) {
      uint thisDebt_micros = investment.used*investment.multiplier_micro - investment.filled_micros;
      bool justEnoughForThis = false;

      if (thisDebt_micros >= stillToFill_micros) {
        /* it means that there are more funds than those needed
           by the current investment in the used list. */
        justEnoughForThis = true;
      }

      if (justEnoughForThis) {
        /* use all the funds to fill this investment */
        investment.filled_micros += stillToFill_micros;
        stillToFill_micros = 0;
      } else {
        /* fill this investment and substract to the funds remaing to
           fill other investments */
        investment.filled_micros += thisDebt_micros;
        stillToFill_micros -= thisDebt_micros;

        /* go and fill the next investment */
        if (currentElement.next > 0) {
          currToFillKey = currentElement.next;
          currentElement = investmentsUsedOrder.get(currToFillKey);
          investment = investments[currentElement.extKey];
        }  else {
          /* eventhough there are more funds, no investments are to be fullfiled
            funds are then sink wihtin the contract. */
          stillToFill_micros = 0;
        }
      }
    }

  }
}
