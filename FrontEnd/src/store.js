import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    displayMode: 'vis',
    showPanel: false
  },
  mutations: {
    ['UPDATE_DISPLAY_MODE'](state, displayMode) {
      state.displayMode = displayMode;
    },
    ["OPEN_VIS_PANEL"](state) {
      state.showPanel = true;
    },
    ["CLOSE_VIS_PANEL"](state) {
      state.showPanel = false;
    }
  },
  actions: {

  },
  getters: {
  }
})
