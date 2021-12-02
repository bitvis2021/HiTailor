import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  	displayMode: 'vis'
  },
  mutations: {
    ['UPDATE_DISPLAY_MODE'] (state, displayMode) {
      state.displayMode = displayMode
    }	
  },
  actions: {

  }
})
