<template>
  <div class="invest">
    <div class="w3-row-padding">
      <div class="w3-col m3 w3-padding">
        <label class="w3-center"><b>investor:</b></label>
      </div>
      <div class="w3-col m9">
        <select class="w3-input" v-model="investor">
          <option v-for="account in accounts">
            {{ account }}
          </option>
        </select>
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label class="w3-center"><b>receiver:</b></label>
      </div>
      <div class="w3-col m9">
        <select class="w3-input" v-model="receiver">
          <option v-for="account in accounts">
            {{ account }}
          </option>
        </select>
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label for=""><b>receiver balance:</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model="balanceReceiver" class="w3-input" type="number" disabled>
      </div>
    </div>

    <hr>
    <div class="w3-row w3-center">
      <h4>Pending to be paid</h4>
    </div>

    <div class="w3-row-padding w3-margin-top w3-container">
      <table class="w3-table-all w3-card-2 w3-centered my-table">
        <thead>
          <tr>
            <th>Offered</th>
            <th>Bonus X</th>
            <th>Filled</th>
            <th>Paid</th>
            <th>Pay</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="offer in investmentsFilled">
            <td>{{ fromWei(offer.amount) }}</td>
            <td>{{ fromMicros(offer.multiplier_micro).toString() }}</td>
            <td>{{ fromWei(fromMicros(offer.filled_micros)).toString() }}</td>
            <td>{{ fromWei(fromMicros(offer.paid_micros)).toString() }}</td>
            <td>
              <button
                @click="payback(offer.key)"
                class="w3-small w3-button w3-blue w3-round-large" type="button" name="button">send to receiver</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script>
import { web3 } from '@/web3-loader.js'
const BigNumber = require('bignumber.js')

export default {
  name: 'withdraw',

  data () {
    return {
      investor: '',
      receiver: '',
      balanceReceiverWei: ''
    }
  },

  computed: {
    accounts () {
      return this.$store.state.accounts
    },
    sortedUsed () {
      return this.$store.state.sortedUsed
    },
    investmentsFilled () {
      return this.sortedUsed.filter((investment) => {
        return ((investment.investor === this.investor) && (investment.paid_micros.lt(investment.filled_micros)))
      })
    },
    balanceReceiver () {
      if (this.balanceReceiverWei !== '') {
        return web3.fromWei(this.balanceReceiverWei, 'ether').toFixed(4).toString()
      }
    }
  },

  watch: {
    receiver () {
      this.updateBalanceReceiver()
    }
  },

  methods: {
    fromWei (v) {
      return web3.fromWei(v, 'ether').toString()
    },
    fromMicros (v) {
      return v.div(1000000)
    },
    updateBalanceReceiver () {
      if (this.receiver !== '') {
        web3.eth.getBalancePromise(this.receiver).then((balance) => {
          this.balanceReceiverWei = new BigNumber(balance)
        })
      }
    },
    payback (key) {
      var error = false
      error = this.key === '' || error
      error = this.investor === '' || error
      error = this.receiver === '' || error

      if (error) return

      this.$store.state.fundInstance().payback(key, this.receiver, { from: this.investor, gas: 500000 })
      .then((txn) => {
        console.log('paid back')
        console.log(txn)
        this.updateBalanceReceiver()
        this.$store.dispatch('updateOffers')
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.my-table {
  vertical-align: middle !important;
}

tbody tr {
  height: 60px;
}

</style>
