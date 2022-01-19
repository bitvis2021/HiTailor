<template>
  <!-- <div id="view"> -->
  <div>
  <panel-view></panel-view>
  </div>
</template>

<script>
import * as vega from "vega";
import * as vegalite from "vega-lite";
import vegaEmbed from "vega-embed";
import PanelView from "./vis/PanelView"

export default {
  name: "VisView",
  props: {},
  components:{
    PanelView
  },
  data() {
    return {
      chartDec: {
        data: {
          url: "http://localhost:8081/seattle-weather.csv",
        },
        mark: "line",
        encoding: {
          x: { field: "date", axis: { labels: false, ticks: false, title: null}},
          y: { field: "precipitation", type: "quantitative" ,axis: { labels: false, ticks: false, title: null}}, // 需要的数据格式：csv
        },
      },
    };
  },
  methods: {
    // chart: specify height, width
    chart(height, width) {
      this.chartDec.height = height;
      this.chartDec.width = width;
      vegaEmbed("#view", this.chartDec,{renderer:"svg"});
    },
    // todo: functions to modify chart object's model
  },
  mounted: function () {
    this.chart(300,200);
  },
};
</script>

<style>
</style>