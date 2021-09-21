import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import { routes } from './routes'
import axios from 'axios'
// import VueAxios from 'vue-axios'

Vue.use(VueRouter)
// Vue.use(VueAxios, axios)

Vue.prototype.$http = axios

const router = new VueRouter({
  routes: routes,
  mode: 'history',
  scrollBehaviour (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { selector: to.hash }
    }
    return { x: 0, y: 0 }
  }
})

Vue.config.productionTip = false

new Vue({
  router: router,
  render: h => h(App)
}).$mount('#app')
