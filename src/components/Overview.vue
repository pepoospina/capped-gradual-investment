<template lang="html">
  <div class="">
    <div class="w3-row-padding">

      <div class="w3-col m4">
        <div class="w3-row">
          <h4>Offers</h4>
        </div>
        <div class="w3-row">
          <table class="w3-table-all w3-card-2 w3-centered">
            <thead>
              <tr>
                <th>Investor</th>
                <th>Offered</th>
                <th>Bonus X</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="offer in sortedOffers">
                <td>{{ offer.investor.slice(0, 8) }}</td>
                <td>{{ fromWei(offer.amount) }}</td>
                <td>{{ fromMicros(offer.multiplier_micro).toString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="w3-col m8">
        <div class="w3-row">
          <h4>Used</h4>
        </div>
        <div class="w3-row">
          <table class="w3-table-all w3-card-2 w3-centered">
            <thead>
              <tr>
                <th>Investor</th>
                <th>Offered</th>
                <th>Used</th>
                <th>Bonus X</th>
                <th>To be paid</th>
                <th>Filled</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="offer in sortedUsed">
                <td>{{ offer.investor.slice(0, 8) }}</td>
                <td>{{ fromWei(offer.amount) }}</td>
                <td>{{ fromWei(offer.used).toString() }}</td>
                <td>{{ fromMicros(offer.multiplier_micro).toString() }}</td>
                <td>{{ fromWei(toBePaid(offer)).toString() }}</td>
                <td>{{ fromWei(fromMicros(offer.filled_micros)).toString() }}</td>
                <td>{{ fromWei(fromMicros(offer.paid_micros)).toString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { web3 } from '@/web3-loader.js'
// const BigNumber = require('bignumber.js')

export default {
  data () {
    return {
    }
  },

  computed: {
    sortedOffers () {
      return this.$store.state.sortedOffers
    },
    sortedUsed () {
      return this.$store.state.sortedUsed
    }
  },

  methods: {
    fromWei (v) {
      return web3.fromWei(v, 'ether').toString()
    },
    fromMicros (v) {
      return v.div(1000000)
    },
    toBePaid (offer) {
      return offer.used.times(offer.multiplier_micro).div(1000000)
    }
  },

  mounted () {
  }
}
</script>

<style lang="css">
</style>
