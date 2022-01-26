import Vue from 'vue'
import App from './App.vue'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(ElementUI)


Vue.config.productionTip = false

import * as d3 from "d3"
window.d3 = d3

import * as $ from 'jquery'
window.$ = $

new Vue({
  store,
  render: h => h(App),
  beforeCreate() {
    Vue.prototype.$bus=this; // Installing Gloabal event bus
  }
}).$mount('#app')
