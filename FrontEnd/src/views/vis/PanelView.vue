<template>
  <div>
    <div id="chart"></div>
    <el-button type="primary" v-on:click="GenFig(200, 200, 200, 200)"
      >镶嵌</el-button
    >
    <div id="panel">
      <el-slider v-model="value1" show-input></el-slider>
      <br />
    </div>
  </div>
</template>
<script>
import ElementUI from "element-ui";
import vegaEmbed, { vega } from "vega-embed";

export default {
  name: "PanelView",
  props: {},
  data() {
    return {
      value1: 10,
      chartDec: {
        data: {
          url: "http://localhost:8081/penguins.json",
        },
        mark: "point",
        encoding: {
          x: {
            field: "Flipper Length (mm)",
            type: "quantitative",
            scale: { zero: false },
            axis: { labels: false, ticks: false, title: null },
          },
          y: {
            field: "Body Mass (g)",
            type: "quantitative",
            scale: { zero: false },
            axis: { labels: false, ticks: false, title: null },
          },
          color: { field: "Species", type: "nominal", legend: false },
          shape: { field: "Species", type: "nominal", legend: false },
        },
      },
    };
  },
  methods: {
    GenFig(height, width, x, y) {
      let pic =
        document.getElementById("chart").childNodes[0].childNodes[0]
          .childNodes[0].childNodes[0].childNodes[0];
      let target = document.getElementsByClassName("table-view-svg")[0];

      pic.setAttribute("transform", "translate(" + x + "," + y + ")");
      pic.childNodes[0].setAttribute("style", "fill:white");
      target.appendChild(pic);
    },
  },
  mounted: function () {
    vegaEmbed("#chart", this.chartDec, { renderer: "svg" });
    // The main problem of current method: they cannot appear at same function (maybe performance issue?)
  },
};
</script>
<style lang="css">
#panel {
  width: 20%;
  height: 30%;
  margin: 10%;
  padding: 20px;
  background-color: whitesmoke;
  filter: drop-shadow(5px 5px 10px #00000055);
  border-radius: 10px;
  align-self: center;
  float: right;
}
</style>