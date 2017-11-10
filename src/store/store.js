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
    sortedOffers: []
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
    }
  },

  actions: {
    updateFundInstance: (context) => {
      Fund.deployed().then((instance) => {
        /* uses a function to prevent vue reactivity to call all getters */
        context.commit('setFundInstance', function () { return instance })
        context.dispatch('updateFundOwner')
        context.dispatch('updateSortedOffers')
      })
    },

    updateFundOwner: (context) => {
      if (context.state.fundInstance !== null) {
        var instance = context.state.fundInstance()
        instance.owner.call().then((owner) => {
          context.commit('setFundOwner', owner)
        })
      }
    },

    updateAccounts: (context) => {
      web3.eth.getAccountsPromise().then((accounts) => {
        context.commit('setAccounts', accounts)
      })
    },

    updateSortedOffers: (context) => {
      if (context.state.fundInstance !== null) {
        var instance = context.state.fundInstance()
        getSortedElements(instance.getLowestInvestmentOfferKey, instance.getInvestmentOfferDataAtKey)
        .then((sortedElements) => {
          context.commit('setSortedOffers', sortedElements)
        })
      }
    }
  }
})
