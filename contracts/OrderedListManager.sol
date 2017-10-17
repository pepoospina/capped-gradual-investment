pragma solidity ^0.4.16;

contract OrderedListManager is OrderedListStructs, Owned {

  OrderedList list;

  /* support functions to manipulate the list */
  function internal addElement(
    ListElement element,
    uint atKey,
    bool toTheRight)
  {
    /* the keys are a sequence, they also provides the length of the list
      WARING: keys dont provide the list order! */
    uint newKey = list.currentKey + 1;
    list.currentKey = newKey;

    /* check if this is the first element ever in the list`*/
    if (list.currentKey = 1) {
      /* the first element is the only element */
      firstKey = newKey;
      /* the element is added to the map */
      list.map[newKey] = investment;
    } else {
      /* check there is indeed an element at atKey */
      InvestmentElement thisElement = list[atKey];
      if (thisElement.offer.address == 0) throw;

      /* add the investment */
      list.map[newKey].investment = investment;

      /* link with the rest of elements */
      if (toTheRight) {
        /* add the new element to the right of the atKey element */
        uint rightKey = list[atKey].next;

        /* update the links to the element at the left */
        list.map[newKey].prev = atKey;
        list.map[atKey].next = newKey;

        /* update the linkts of the next element at tthe right
           only if it exist */
        if (rightKey > 0) {
          list.map[newKey].next = rightKey;
          list.map[rightKey].prev = newKey;
        }

      } else {
        /* add the new element to the right of the atKey element */
        uint leftKey = list[atKey].prev;

        /* update the links to the element at the right */
        list.map[newKey].next = atKey;
        list.map[atKey].prev = newKey;

        /* update the linkts of the next element at the left
           only if it exist */
        if (leftKey > 0) {
          list.map[newKey].prev = leftKey;
          list.map[leftKey].next = newKey;
        } else {
          /* this element becomes the element at the top left of the list and is
           therefore the first element */
          list.firstKey = newKey;
        }
      }
    }
  }

  function public addElementOrdered(
    Investment investment,
    uint atKey)
  {
    uint nextKey = list.map[atKey].next;
    uint prevKey = list.map[atKey].prev;

    if (list.currentKey > 0) {
      if (atKey > 0) {
        if (list.map[atKey].value < element.value) {
          /* this element value is larger*/
          if (nextKey) {
            /* if there is an element to the right */
            if (investment.multiplier_micro < list.map[nextKey].investment.multiplier_micro) {
              /* new element should be placed at the right of atKey */
              addElement(list, investment, atKey, true);
              return;
              } else {
                /* keep looking to the right */
                addElementOrdered(list, investment, nextKey);
              }
          } else {
            addElement(list, investment, atKey, true);
          }
        } else {
          /* this investment multiplier is smaller */
          if (prevKey) {
            /* if there is an element to the left */
            if (investment.multiplier_micro > list.map[prevKey].investment.multiplier_micro) {
              /* new element should be placed at the left of atKey */
              addElement(list, investment, atKey, false);
              return;
              } else {
                /* keep looking to the left */
                addElementOrdered(list, investment, prevKey);
              }
          } else {
            addElement(list, investment, atKey, true);
          }
        }
      } else {
        /* no atKey provided, start from the beginning
          WARNING: unpredicatble and unbounded gas consumption */
        addElementOrdered(list, investment, list.fistKey);
      }
    } else {
      /* first element */
      addElement(investment, 0, true);
    }
  }

  function CappedInvestmentFund () {

  }

  function invest(uint multiplier_micro, uint atKey)
    payable
    returns(bool success)
  {

    /* prepare investment offer element */
    Investment memory newInvestment;

    newInvestment.investor = msg.sender;
    newInvestment.amount = msg.value;
    newInvestment.multiplier_micro = multiplier_micro;

    addElementOrdered(investmentOffers, newInvestment, atKey);
  }

  function spend (uint amount, bytes32 motiveHash) {
    /* start consuming from the offers and create the corresponding investments */
    uint spent;
    uint missing;
    uint nextOffer = lowestOfferId;

    while (spent < amount) {
      missing = amount - spent;
      uint availableHere = investmentOffers[nextOffer].amount - investmentOffers[nextOffer].fundsUsed;

      /* this offer is enough to fund the missing spenditure */
      investment.investor = investmentOffers[nextOffer].investor;
      investmentOffers[nextOffer].fundsUsed += missing;

      investment.amount = missing;

    }

  }

  function payback() {
    if (owner != msg.sender) throw;

    uint revenue = this.balance - totalInvested;

    /* if there is enough revenue to distribute */
    if (revenue > 0) {

      /* go over all the investmen */
      uint ix = 0;
      while (ix < investmentWell.length) {

      }
    }
  }
}
