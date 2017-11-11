import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Home from '@/components/Home'
import Overview from '@/components/Overview'
import Invest from '@/components/Invest'
import Admin from '@/components/Admin'
import Withdraw from '@/components/Withdraw'

export default new Router({
  routes: [
    {
      path: '/',
      component: Home,
      children: [
        { path: '/', name: 'AppView', redirect: '/overview' },
        { path: 'overview', name: 'Overview', component: Overview },
        { path: 'invest', name: 'Invest', component: Invest },
        { path: 'admin', name: 'Admin', component: Admin },
        { path: 'withdraw', name: 'Withdraw', component: Withdraw }
      ]
    }
  ]
})
