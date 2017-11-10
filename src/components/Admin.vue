<template lang="html">

  <div class="">

    <h3>Spend Funds</h3>

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
        <input v-model="balanceTo" class="w3-input" type="number" disabled>
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Amount:</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model.number="amountSpend" class="w3-input" type="number">
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-padding w3-right">
        <button @click="spendFunds()"
          class="w3-button w3-blue w3-round-large" type="button" name="button">Send funds</button>
      </div>
    </div>

    <hr>

    <h3>Receive Revenue</h3>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Receive from:</b></label>
      </div>
      <div class="w3-col m9">
        <select class="w3-input" v-model="receiveFrom">
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
        <input v-model="balanceFrom" class="w3-input" type="number" disabled>
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Amount:</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model.number="amountReceive" class="w3-input" type="number">
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-padding w3-right">
        <button @click="receiveRevenue()"
          class="w3-button w3-blue w3-round-large" type="button" name="button">Receive revenue</button>
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
      balanceToWei: '',
      amountSpend: 0,
      receiveFrom: '',
      balanceFromWei: '',
      amountReceive: 0
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
    balanceTo () {
      if (this.balanceToWei !== '') {
        return web3.fromWei(this.balanceToWei, 'ether').toFixed(4).toString()
      }
    },
    balanceFrom () {
      if (this.balanceFromWei !== '') {
        return web3.fromWei(this.balanceFromWei, 'ether').toFixed(4).toString()
      }
    }
  },

  watch: {
    sendTo () {
      this.updateBalanceTo()
    },
    receiveFrom () {
      this.updateBalanceFrom()
    }
  },

  methods: {
    spendFunds () {
      var error = false
      error = this.sendTo === '' || error
      error = this.amountSpend === 0 || error

      if (error) return

      this.$store.state.fundInstance().spend(
        web3.toWei(this.amountSpend, 'ether'),
        this.sendTo,
        {
          from: this.fundOwner,
          gas: 500000
        }).then((txn) => {
          console.log('spent')
          this.$store.dispatch('updateOffers')
          this.updateBalanceTo()
        })
    },

    receiveRevenue () {
      var error = false
      error = this.receiveFrom === '' || error
      error = this.amountReceive === 0 || error

      if (error) return

      this.$store.state.fundInstance().receiveRevenue(
        {
          from: this.receiveFrom,
          value: web3.toWei(this.amountReceive, 'ether'),
          gas: 500000
        }).then((txn) => {
          console.log('received')
          this.$store.dispatch('updateOffers')
          this.updateBalanceFrom()
        })
    },

    updateBalanceTo () {
      if (this.sendTo !== '') {
        web3.eth.getBalancePromise(this.sendTo).then((balance) => {
          this.balanceToWei = new BigNumber(balance)
        })
      }
    },

    updateBalanceFrom () {
      if (this.receiveFrom !== '') {
        web3.eth.getBalancePromise(this.receiveFrom).then((balance) => {
          this.balanceFromWei = new BigNumber(balance)
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
