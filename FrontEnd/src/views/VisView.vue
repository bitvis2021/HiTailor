<template>
  <div id="view"></div>
</template>

<script>
import * as vega from "vega";
import * as vegalite from "vega-lite";
import vegaEmbed from "vega-embed";

export default {
  name: "VisView",
  props: {},
  data() {
    return {
      chartDec: {
        data: {
          url:'http://localhost:8080/seattle-weather.csv'
        },
        mark: "line",
        encoding: {
          x: { field: "date" },
          y: { field: "precipitation", type: "quantitative" }, // 需要的数据格式：csv
        },
      },
    };
  },
  methods: {
    // chart: specify height, width
    chart(height,width) {
      this.chartDec.height=height;
      this.chartDec.width=width;
      vegaEmbed("#view", this.chartDec);
    },
    // todo: functions to modify chart object's model
  },
  mounted: function () {
    this.chart(100,200);
  },

};
</script>

<style>
#view {
  height: 200px;
  width: 400px;
}
</style>