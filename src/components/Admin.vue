<template lang="html">

  <div class="">

    <div class="w3-row-padding">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Funds available</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model="available" class="w3-input" type="number" disabled>
      </div>
    </div>

    <div class="w3-row-padding">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Send To</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model="sendTo" class="w3-input" type="text">
      </div>
    </div>

    <div class="w3-row-padding">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>Amount</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model.number="amount" class="w3-input" type="number">
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-padding w3-right">
        <button class="w3-button w3-blue w3-round-large" type="button" name="button">Send funds</button>
      </div>
    </div>

  </div>
</template>

<script>
import { Fund, web3 } from '@/web3-loader.js'

export default {

  data () {
    return {
      owner: '',
      available: 0,
      sendTo: '',
      amount: 0
    }
  },

  methods: {
    updateAll () {
      this.fund.spend(web3.toWei(this.amount, 'ether'), {
        from: this.owner,
        gas: 500000
      }).then((txn) => {
        console.log('spent')
      })
    }
  },

  mounted () {
    Fund.deployed().then((instance) => {
      this.fund = instance
      this.fund.owner.call().then((owner) => {
        this.owner = owner
      })
      // this.updateAll()
    })
  }
}
</script>

<style lang="css">
</style>
