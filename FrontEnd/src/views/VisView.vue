<template>
  <div>
    <div id="gen-chart" style="display: none"></div>
    <div id="vis-view">
      <div id="chart"></div>
      <panel-view
        ref="apply Config"
        v-show="isShowPanel"
      ></panel-view>
    </div>
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
      isShowPanel: true,

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
      vegaEmbed("#gen-chart", this.chartDec, {
        renderer: "svg",
        actions: false,
      }).then(() => {
        let pic =
          document.getElementById("gen-chart").childNodes[0].childNodes[0];
        let target = document.getElementsByClassName("table-view-svg")[0];

        pic.setAttribute("transform", "translate(" + x + "," + y + ")");
        pic.childNodes[0].childNodes[0].childNodes[0].setAttribute(
          "style",
          "fill:white"
        );
        target.appendChild(pic);
      });
    },
    GetName(d) {
      console.log("父组件收到了", d);
    },
  },
  mounted() {
    // this.GenFig(this.visHeight,this.visWidth,this.visX,this.visY);
    this.$bus.$on("apply-config", (data) => {
      this.chartDec = data;
      this.GenFig(this.visHeight, this.visWidth, this.visX, this.visY);
    });

    this.chartDec.height = 200;
    this.chartDec.width = 300;
    vegaEmbed("#chart", this.chartDec, { renderer: "svg", actions: false });
  },
  beforeDestroy() {
    this.$bus.$off("apply-config");
  },
};
</script>

<style>
#vis-view {
  background-color: white;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.5);
  padding: 0px 10px 0px 10px;
}
#chart {
  margin-top: 3%;
}
</style>