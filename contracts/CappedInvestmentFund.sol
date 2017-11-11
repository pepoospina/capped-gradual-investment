pragma solidity ^0.4.18;

import "./Ownable.sol";
import "./SortedListManager.sol";

contract CappedInvestmentFund is Ownable {

  struct Investment {
    address investor;
    uint amount;
    uint multiplier_micro;
    uint used;
    uint filled_micros;
    uint paid_micros;
  }

  /* the array holds the investments, while the OrderedListManager holds
     the indexes of the array in order based on the multiplier */

  Investment[] public investments;

  using SortedListManager for SortedListManager.SortedList;

  SortedListManager.SortedList public investmentOffersOrder;
  SortedListManager.SortedList public investmentsUsedOrder;

  uint currToFillKey = 0;
  uint public minInvestment = 100000000000000000; // 0,1 ether by default
  uint public superavit = 0;

  /* setter  */
  function setMinInvestment(uint value) public onlyOwner {
     minInvestment = value;
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
    constant
    returns (Investment investment)
  {
    SortedListManager.ListElement memory element = investmentOffersOrder.get(key);
    return investments[element.extKey];
  }

  function getInvestmentUsedAtKey (uint key)
    private
    constant
    returns (Investment investment)
  {
    SortedListManager.ListElement memory element = investmentsUsedOrder.get(key);
    return investments[element.extKey];
  }

  function getInvestmentOfferDataAtKey (uint key)
    public
    constant
    returns (address investor, uint amount, uint multiplier_micro, uint used, uint filled_micros, uint paid_micros, uint nextKey)
  {
    if (key > 0) {
      SortedListManager.ListElement memory element = investmentOffersOrder.get(key);
      (investor, amount, multiplier_micro, used, filled_micros, paid_micros, nextKey) =
        getInvestmentDataAtIx(element.extKey, element.next);
      return;
    } else {
      return (0, 0, 0, 0, 0, 0, 0);
    }
  }

  function getInvestmentUsedDataAtKey (uint key)
    public
    constant
    returns (address investor, uint amount, uint multiplier_micro, uint used, uint filled_micros, uint paid_micros, uint nextKey)
  {
    if (key > 0) {
      SortedListManager.ListElement memory element = investmentsUsedOrder.get(key);
      (investor, amount, multiplier_micro, used, filled_micros, paid_micros, nextKey) =
        getInvestmentDataAtIx(element.extKey, element.next);
      return;
    } else {
      return (0, 0, 0, 0, 0, 0, 0);
    }
  }

  function getInvestmentDataAtIx (uint ix, uint nextKey)
    public
    constant
    returns (address investor, uint amount, uint multiplier_micro, uint used, uint filled_micros, uint paid_micros, uint nextKeyOut)
  {
    Investment memory investment = investments[ix];

    return (investment.investor,
            investment.amount,
            investment.multiplier_micro,
            investment.used,
            investment.filled_micros,
            investment.paid_micros,
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
    public
    returns(uint ix)
  {

    if (msg.value < minInvestment) revert();
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

  /* method to spend funds. They are first marked as "used" by moving it
  to the UsedInvestments list, and then sent to the sendTo address */
  function spend (uint amount, address sendTo)
    public
    onlyOwner
  {

    /* just valid transfers */
    if (amount <= 0) revert();
    /* valid send to */
    if (sendTo == address(0)) revert();

    /* amount coverered with superavit */
    uint covered = 0;

    /* min between superavit and amount is what is covered without
    using investment offers */
    covered = superavit > amount ? amount : superavit;
    superavit -= covered;

    /* mark the missing funds as used */
    uint stillToSpend = amount - covered;

    /* if funds need to be used from the investment offers, register it */
    if (stillToSpend > 0) use(stillToSpend);

    /* and then transfer them funds */
    sendTo.transfer(amount);
  }

  function use (uint amount)
    private
  {
    if (investmentOffersOrder.getSize() == 0) revert();

    uint stillToSpend = amount;

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
        if (investmentOffersOrder.getSize() == 0) revert();

        elementInOffers = investmentOffersOrder.getFirst();
        ix = elementInOffers.extKey;
        investment = investments[ix];
      }
    }
  }

  function receiveRevenue ()
    payable
    public
  {

    /* check they sent something */
    if (msg.value == 0) revert();

    /* if there are not used investments, store the
    revenue as superavit */
    if (investmentsUsedOrder.getSize() == 0) {
      superavit += msg.value;
      return;
    }
    /* else */

    uint stillToFill_micros = msg.value*1000000;

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
            funds are converted into superavit. */
          superavit += stillToFill_micros / 1000000;
          stillToFill_micros = 0;
        }
      }
    }
  }

  /* the key is the key on the usedInvestements list,
     sendTo is received so that txn fees are not paid
     by the receiver. However, only the investor can
     trigger the payback */
  function payback (uint key, address sendTo)
    public
  {
    SortedListManager.ListElement memory elementInOffers = investmentsUsedOrder.get(key);
    Investment storage investment = investments[elementInOffers.extKey];

    /* only the investor can withdraw his/her invested funds */
    if (investment.investor != msg.sender) revert();
    if (sendTo == address(0)) revert();

    uint toPay_micros = investment.filled_micros - investment.paid_micros;
    if (toPay_micros > 0) {
      investment.paid_micros += toPay_micros;
      uint toPay_wei = investment.paid_micros/1000000;
      sendTo.transfer(toPay_wei);
    }
  }

}
