import Vue from 'vue'
import Vuex from 'vuex'

import { getSortedElements } from '@/support.js'
import { Fund, web3 } from '@/web3-loader.js'

const BigNumber = require('bignumber.js')

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    fundInstance: null,
    fundOwner: '',
    accounts: [],
    sortedOffers: [],
    sortedUsed: [],
    superavit: 0,
    events: []
  },

  getters: {
    totalOfferedWei: (state) => {
      var total = new BigNumber(0)
      for (var ix in state.sortedOffers) {
        total = total.plus(state.sortedOffers[ix].amount.minus(state.sortedOffers[ix].used))
      }
      return total
    }
  },

  mutations: {
    setFundInstance: (state, payload) => {
      state.fundInstance = payload
    },
    setFundOwner: (state, payload) => {
      state.fundOwner = payload
    },
    setAccounts: (state, payload) => {
      state.accounts = payload
    },
    setSortedOffers: (state, payload) => {
      state.sortedOffers = payload
    },
    setSortedUsed: (state, payload) => {
      state.sortedUsed = payload
    },
    setSuperavit: (state, payload) => {
      state.superavit = payload
    },
    pushEvent: (state, payload) => {
      state.events.push(payload)
    }
  },

  actions: {
    updateFundInstance: (context) => {
      Fund.deployed().then((instance) => {
        console.log('fund deployed at:' + instance.address)

        /* register events */
        context.commit('setLoading', true)

        instance.LogInvestmentOfferReceived({}, { fromBlock: 0 })
        .watch((err, event) => {
          console.log(err)
          console.log('LogInvestmentOfferReceived')

          var eventString = event.args.investor + ' offered an investment of ' +
            web3.fromWei(event.args.amount).toString() +
            ' ether with a ' + (event.args.multiplier_micros / 1000000).toString() + ' multiplier'

          context.commit('pushEvent', { block: event.blockNumber, eventString: eventString })
          context.dispatch('updateOffers')
        })

        instance.LogInvestmentOfferUsed({}, { fromBlock: 0 })
        .watch((err, event) => {
          console.log(err)
          console.log('LogInvestmentOfferUsed')

          var eventString = 'investment from ' + event.args.investor + ' of ' +
            web3.fromWei(event.args.amount).toString() +
            ' ether with a ' + (event.args.multiplier_micros / 1000000).toString() + ' multiplier was used'

          context.commit('pushEvent', { block: event.blockNumber, eventString: eventString })
          context.dispatch('updateOffers')
        })

        instance.LogFundsSent({}, { fromBlock: 0 })
        .watch((err, event) => {
          console.log(err)
          console.log('LogFundsSent')

          var eventString = '"The Fund" sent ' + web3.fromWei(event.args.amount).toString() + ' ether to ' + event.args.to

          context.commit('pushEvent', { block: event.blockNumber, eventString: eventString })
          context.dispatch('updateOffers')
        })

        instance.LogSuperavitIncreased({}, { fromBlock: 0 })
        .watch((err, event) => {
          console.log(err)
          console.log('LogSuperavitIncreased')

          var eventString = 'superavit increased by ' + web3.fromWei(event.args.increaseAmount).toString() +
            ' ether up to ' + web3.fromWei(event.args.superavit).toString() + ' ether'

          context.commit('pushEvent', { block: event.blockNumber, eventString: eventString })
          context.dispatch('updateOffers')
        })

        instance.LogInvestmentOfferFilled({}, { fromBlock: 0 })
        .watch((err, event) => {
          console.log(err)
          console.log('LogInvestmentOfferFilled')

          var eventString = 'investment from ' + event.args.investor + ' of ' +
            web3.fromWei(event.args.amount).toString() + ' ether with a ' +
            (event.args.multiplier_micros / 1000000).toString() + ' multiplier was filled with revenue'

          context.commit('pushEvent', { block: event.blockNumber, eventString: eventString })
          context.dispatch('updateOffers')
        })

        instance.LogInvestmentOfferPaid({}, { fromBlock: 0 })
        .watch((err, event) => {
          console.log(err)
          console.log('LogInvestmentOfferPaid')

          var eventString = 'investment from ' + event.args.investor + ' of ' +
            web3.fromWei(event.args.amount).toString() + ' ether with a ' +
            (event.args.multiplier_micros / 1000000).toString() + ' multiplier was paidback to the investor'

          context.commit('pushEvent', { block: event.blockNumber, eventString: eventString })
          context.dispatch('updateOffers')
        })

        /* uses a function to prevent vue reactivity to call all getters */
        context.commit('setFundInstance', function () { return instance })

        /* dispatch update data */
        context.dispatch('updateFundOwner')
        context.dispatch('updateOffers')
      })
    },

    updateFundOwner: (context) => {
      if (context.state.fundInstance !== null) {
        var instance = context.state.fundInstance()
        instance.owner.call().then((owner) => {
          console.log('fund owner:' + owner)
          context.commit('setFundOwner', owner)
        })
      }
    },

    updateSuperavit: (context) => {
      if (context.state.fundInstance !== null) {
        var instance = context.state.fundInstance()
        instance.superavit.call().then((superavit) => {
          // console.log('superavit:' + superavit)
          context.commit('setSuperavit', superavit)
        })
      }
    },

    updateAccounts: (context) => {
      web3.eth.getAccountsPromise().then((accounts) => {
        context.commit('setAccounts', accounts)
      })
    },

    updateOffers: (context) => {
      context.dispatch('updateSortedOffers')
      context.dispatch('updateSortedUsed')
      context.dispatch('updateSuperavit')
    },

    updateSortedOffers: (context) => {
      if (context.state.fundInstance !== null) {
        var instance = context.state.fundInstance()
        getSortedElements(instance.getLowestInvestmentOfferKey, instance.getInvestmentOfferDataAtKey)
        .then((sortedElements) => {
          context.commit('setSortedOffers', sortedElements)
        })
      }
    },

    updateSortedUsed: (context) => {
      if (context.state.fundInstance !== null) {
        var instance = context.state.fundInstance()
        getSortedElements(instance.getLowestInvestmentUsedKey, instance.getInvestmentUsedDataAtKey)
        .then((sortedElements) => {
          context.commit('setSortedUsed', sortedElements)
        })
      }
    }
  }
})
