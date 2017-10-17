pragma solidity ^0.4.16;

import ./InvestmentListManager.sol

contract CappedInvestmentFund  {

  address owner;
  uint totalInvested;

  InvestmentListManager investmentOffers;
  InvestmentListManager investments;

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
