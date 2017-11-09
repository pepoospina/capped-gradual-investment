import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

import Home from '@/components/Home'
import Overview from '@/components/Overview'
import Invest from '@/components/Invest'
import Admin from '@/components/Admin'

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      children: [
        { path: 'overview', name: 'Overview', component: Overview },
        { path: 'invest', name: 'Invest', component: Invest },
        { path: 'admin', name: 'Admin', component: Admin }
      ]
    }
  ]
})
