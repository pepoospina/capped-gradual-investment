<template lang="html">
  <div class="">
    <div class="w3-row-padding">
      <div class="w3-col m4">
        <div class="w3-row">
          <h4>Offers</h4>
        </div>
        <div class="w3-row">
          <table class="w3-table-all w3-centered">
            <thead>
              <tr>
                <th>Investor</th>
                <th>Ether</th>
                <th>Bonus X</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="offer in sortedOffers">
                <td>{{ offer.investor.slice(0, 8) }}</td>
                <td>{{ fromWei(offer.amount) }}</td>
                <td>{{ fromMicrosString(offer.multiplier_micro) }}</td>
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

export default {
  data () {
    return {
    }
  },

  computed: {
    sortedOffers () {
      return this.$store.state.sortedOffers
    }
  },

  methods: {
    fromWei (v) {
      return web3.fromWei(v, 'ether').toString()
    },
    fromMicrosString (s) {
      return Number(s) / 1000000
    }
  },

  mounted () {
  }
}
</script>

<style lang="css">
</style>
