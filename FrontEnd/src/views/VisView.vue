<template>
  <!-- <div id="view"> -->
  <div>
    <el-button type="primary" @click="isShowPanel = !isShowPanel"
      >显示面板</el-button
    >
    <div id="chart" hidden="hidden"></div>
    <el-button
      style="margin: 10px"
      type="primary"
      v-on:click="GenFig(visHeight, 200, visX, visY)"
      >镶嵌</el-button
    >
    <panel-view
      ref="updateConfig"
      v-show="isShowPanel"
      :vegaData="chartDec"
    ></panel-view>
  </div>
</template>

<script>
import * as vega from "vega";
import * as vegalite from "vega-lite";
import vegaEmbed from "vega-embed";
import PanelView from "./vis/PanelView";

export default {
  name: "VisView",
  components: {
    PanelView,
  },
  props: {
    visData: {
      type: [Object, String],
      required: true,
    },
    visHeight: {
      type: Number,
      default: 200,
    },
    visWidth: {
      type: Number,
      default: 200,
    },
    visX: {
      type: Number,
      default: 0,
    },
    visY: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isShowPanel: false,

      chartDec: {
        data: {
          url: this.visData,
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
      this.chartDec.height = height;
      this.chartDec.width = width;
      vegaEmbed("#chart", this.chartDec, { renderer: "svg" }).then(() => {
        let pic =
          document.getElementById("chart").childNodes[0].childNodes[0]
            .childNodes[0].childNodes[0].childNodes[0];
        let target = document.getElementsByClassName("table-view-svg")[0];

        pic.setAttribute("transform", "translate(" + x + "," + y + ")");
        pic.childNodes[0].setAttribute("style", "fill:white");
        target.appendChild(pic);
      });
    },
    GetName(d) {
      console.log("父组件收到了", d);
    },
  },
  mounted() {
    this.$refs.updateConfig.$on("update-config", (data) => {
      this.isShowPanel = false;
      this.chartDec=data;
      this.GenFig(this.visHeight,this.visWidth,this.visX,this.visY);
    });
  },
  beforeDestroy() {},
};
</script>

<style>
#chart {
  display: none;
}
</style>