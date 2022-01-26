<template>
  <div>
    <div id="gen-chart" style="display: none"></div>
    <div id="vis-view">
      <div id="chart"></div>
      <panel-view v-show="isShowPanel"></panel-view>
    </div>
  </div>
</template>

<script>
import vegaEmbed from "vega-embed";
import PanelView from "./vis/PanelView";
import { mapState, mapMutations } from "vuex";

export default {
  name: "VisView",
  components: {
    PanelView,
  },
  computed: {
    ...mapState(["currentVegaJson"]),
  },
  data() {
    return {
      isShowPanel: true,

      chartDec: {
        data: {
          url: "http://localhost:8080/penguins.json",
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
    ...mapMutations(["UPDATE_CURRENT_VEGA_JSON"]),

    GenFig(height, width, x, y, chartJson) {
      chartJson.height = height;
      chartJson.width = width;
      vegaEmbed("#gen-chart", chartJson, {
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
  },
  mounted() {
    this.UPDATE_CURRENT_VEGA_JSON(this.chartDec);

    this.$bus.$on("apply-config", (visHeight,visWidth,visX,visY) => {
      this.GenFig(visHeight, visWidth, visX, visY, this.currentVegaJson);
    });

    this.$bus.$on("preview-config", (data) => {
      data.height = 200;
      data.width = 300;
      vegaEmbed("#chart", data, {
        renderer: "svg",
        actions: false,
      });
    });
    
    this.$bus.$emit("preview-config", JSON.parse(JSON.stringify(this.currentVegaJson)));
  },
  beforeDestroy() {
    this.$bus.$off("apply-config");
    this.$bus.$off("preview-config");
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