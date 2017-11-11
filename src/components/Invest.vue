<template>
  <div class="invest">
    <div class="w3-row-padding">
      <div class="w3-col m3 w3-padding">
        <label class="w3-center"><b>from:</b></label>
      </div>
      <div class="w3-col m9">
        <select class="w3-input" v-model="from">
          <option v-for="account in accounts">
            {{ account }}
          </option>
        </select>
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label class="w3-center"><b>amount (ethers):</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model.number="amount" class="w3-input" type="number">
      </div>
    </div>

    <div class="w3-row-padding w3-margin-top">
      <div class="w3-col m3 w3-padding">
        <label class="w3-center"><b>bonus muiltiplier:</b></label>
      </div>
      <div class="w3-col m9">
        <input v-model.number="bonusMultiplier" class="w3-input" type="number" step="0.1">
      </div>
    </div>

    <div class="w3-row w3-margin-top w3-padding">
      <div class="w3-col m9">
        <h4><i>
          <span v-if="amount > 0">You could receive up to {{ paybackAmount.toFixed(2) }} ether</span>
          <span v-else>Select the amount to invest</span>
        </i></h4>

      </div>
      <div class="w3-col m3 w3-padding">
        <button v-if="!sending" @click="sendInvestment()"
          class="w3-right w3-button w3-blue w3-round-large" name="button">
          Send Investment Offer
        </button>
        <button v-else class="w3-right w3-button w3-blue w3-round-large" name="button">
          <img class="loading-gif" src="../assets/loading.gif" alt="">
        </button>
      </div>
    </div>

    <div v-if="success" class="w3-row w3-container w3-margin-top">
      <div class="w3-green w3-card-2 w3-center w3-padding">
        <h4>
          Congratulations! you succesfully offered to invest <b>{{ sent.amount }} ether</b>
          with a <b>{{ sent.bonusMultiplier }} bonus</b> multiplier!
        </h4>
      </div>
    </div>
  </div>
</template>

<script>
import { web3 } from '@/web3-loader.js'

export default {
  name: 'invest',

  data () {
    return {
      from: '',
      amount: 0,
      bonusMultiplier: 1,
      sending: false,
      sent: {},
      success: false
    }
  },

  computed: {
    paybackAmount () {
      return this.amount * this.bonusMultiplier
    },
    accounts () {
      return this.$store.state.accounts
    }
  },

  methods: {
    sendInvestment () {
      var error = false
      error = this.amount <= 0 || error
      error = this.from === '' || error

      if (error) return

      this.sending = true
      this.success = false
      this.$store.state.fundInstance().invest(this.bonusMultiplier * 1000000, 0, {
        from: this.from,
        value: web3.toWei(this.amount),
        gas: 500000
      }).then((txn) => {
        console.log('invested')
        console.log(txn)
        this.sending = false
        this.success = true
        this.sent = {
          amount: this.amount,
          bonusMultiplier: this.bonusMultiplier
        }
        this.amount = 0
        this.$store.dispatch('updateOffers')
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.loading-gif {
  width: 20px;
}

button {
  width: 100%;
}

</style>
