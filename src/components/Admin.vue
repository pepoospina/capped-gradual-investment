<template lang="html">

  <div class="">

    <div class="w3-row-padding">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Funds available:</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model="available" class="w3-input" type="number" disabled>
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Send to:</b></label>
      </div>
      <div class="w3-col m9">
        <select class="w3-input" v-model="sendTo">
          <option v-for="account in accounts">
            {{ account }}
          </option>
        </select>
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Balance:</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model="balance" class="w3-input" type="number" disabled>
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Amount:</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model.number="amount" class="w3-input" type="number">
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-padding w3-right">
        <button @click="spendFunds()"
          class="w3-button w3-blue w3-round-large" type="button" name="button">Send funds</button>
      </div>
    </div>

  </div>
</template>

<script>
import { web3 } from '@/web3-loader.js'
const BigNumber = require('bignumber.js')

export default {

  data () {
    return {
      owner: '',
      sendTo: '',
      balanceWei: '',
      amount: 0
    }
  },

  computed: {
    available () {
      return web3.fromWei(this.$store.getters.totalOfferedWei, 'ether').toString()
    },
    accounts () {
      return this.$store.state.accounts
    },
    fundOwner () {
      return this.$store.state.fundOwner
    },
    balance () {
      if (this.balanceWei !== '') {
        return web3.fromWei(this.balanceWei, 'ether').toFixed(4).toString()
      }
    }
  },

  watch: {
    sendTo () {
      this.updateBalance()
    }
  },

  methods: {
    spendFunds () {
      var error = false
      error = this.sendTo === '' || error
      error = this.amount === 0 || error

      if (error) return

      this.$store.state.fundInstance().spend(
        web3.toWei(this.amount, 'ether'),
        this.sendTo,
        {
          from: this.fundOwner,
          gas: 500000
        }).then((txn) => {
          console.log('spent')
          this.$store.dispatch('updateSortedOffers')
          this.updateBalance()
        })
    },

    updateBalance () {
      if (this.sendTo !== '') {
        web3.eth.getBalancePromise(this.sendTo).then((balance) => {
          this.balanceWei = new BigNumber(balance)
        })
      }
    }
  },

  mounted () {
  }
}
</script>

<style lang="css">
</style>
