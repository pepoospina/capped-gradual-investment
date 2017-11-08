<template>
  <div class="hello">
    <div class="w3-row">
      <h1>Investment Fund</h1>
    </div>
    <div class="w3-row w3-container">
      <select class="w3-input" v-model="from">
        <option v-for="account in accounts">
          {{ account }}
        </option>
      </select>
    </div>
  </div>
</template>

<script>
import { Fund, web3 } from '@/web3-loader.js'

export default {
  name: 'home',

  data () {
    return {
      fund: null,
      accounts: [],
      from: ''
    }
  },

  methods: {
    updateAll () {
      web3.eth.getAccountsPromise().then((accounts) => {
        this.accounts = accounts
      })
    }
  },

  mounted () {
    Fund.deployed().then((instance) => {
      this.fund = instance
      this.updateAll()
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
