<template>
  <div class="home">
    <div class="w3-row">
      <h1>Investment Fund</h1>
    </div>
    <div class="w3-row">
      <div class="w3-col m4">
        <router-link :to="{name: 'Overview'}">
          <button class="w3-button"
            :class="{ 'w3-blue': isOverview, 'w3-gray': !isOverview }"
            type="button" name="button">
            Overview
          </button>
        </router-link>
      </div>
      <div class="w3-col m4">
        <router-link :to="{name: 'Invest'}">
          <button class="w3-button"
            :class="{ 'w3-blue': isInvest, 'w3-gray': !isInvest }"
            type="button" name="button">
            Invest
          </button>
        </router-link>
      </div>
      <div class="w3-col m4">
        <router-link :to="{name: 'Admin'}">
          <button class="w3-button"
            :class="{ 'w3-blue': isAdmin, 'w3-gray': !isAdmin }"
            type="button" name="button">
            Admin
          </button>
        </router-link>
      </div>
    </div>
    <hr>
    <router-view></router-view>
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
      from: '',
      amount: 0,
      bonusMultiplier: 1,
      sending: false
    }
  },

  computed: {
    paybackAmount () {
      return this.amount * this.bonusMultiplier
    },
    isOverview () {
      return this.$route.name === 'Overview'
    },
    isInvest () {
      return this.$route.name === 'Invest'
    },
    isAdmin () {
      return this.$route.name === 'Admin'
    }
  },

  methods: {
    updateAll () {
      web3.eth.getAccountsPromise().then((accounts) => {
        this.accounts = accounts
      })
    },
    sendInvestment () {
      var ok = true

      if (this.amount <= 0) {
        ok = false
      }

      if (this.from === '') {
        ok = false
      }

      if (ok) {
        this.sending = true
        this.fund.invest(this.bonusMultiplier * 1000000, 0, {
          from: this.from,
          value: web3.toWei(this.amount),
          gas: 500000
        }).then((txn) => {
          this.sending = false
        })
      }
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

.loading-gif {
  width: 20px;
}

button {
  width: 100%;
}

</style>
