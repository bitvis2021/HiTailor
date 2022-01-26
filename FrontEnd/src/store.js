import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  	displayMode: 'vis',
    currentVegaJson:{},
  },
  mutations: {
    ['UPDATE_DISPLAY_MODE'] (state, displayMode) {
      state.displayMode = displayMode;
    },
    ['UPDATE_CURRENT_VEGA_JSON'] (state, newVegaJson) {
      state.currentVegaJson = newVegaJson;
    }
  },
  actions: {

  },
  getters:{
    getLayer:(state,layerIndex)=>{
      if (layerIndex==undefined) {
        return this.currentVegaJson;
      }
      else{
        return this.currentVegaJson['layer'][layerIndex];
      }
    }
  }
})
