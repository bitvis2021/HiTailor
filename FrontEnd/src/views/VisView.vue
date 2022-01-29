<template>
  <div>
    <div id="gen-chart"></div>
    <div id="vis-view">
      <div id="chart"></div>
      <panel-view></panel-view>
    </div>
  </div>
</template>

<script>
import vegaEmbed from "vega-embed";
import PanelView from "./vis/PanelView.vue";

export default {
  name: "VisView",
  components: {
    PanelView,
  },
  computed: {},
  data() {
    return {
      chartDec: {
        data: {
          url: "http://localhost:8080/penguins.json",
        },
        mark: "bar",
        encoding: {
          x: {
            field: "attr2",
            type: "nominal",
            scale: { zero: false },
            axis: { labels: false, ticks: false, title: null },
          },
          y: {
            aggregate:"sum",
            field: "value",
            // type: "quantitative",
            scale: { zero: false },
            axis: { labels: false, ticks: false, title: null },
          },
          // color: { field: "Species", type: "nominal", legend: false },
          // shape: { field: "Species", type: "nominal", legend: false },
        },
      },
    };
  },
  methods: {
    GenFig(height, width, x, y, chartJson,data) {
      chartJson.height = height;
      chartJson.width = width;
      if (data!==undefined) {
        chartJson.data={};
        chartJson.data.values=data;
      }
      vegaEmbed("#gen-chart", chartJson, {
        renderer: "svg",
        actions: false,
        theme: "latimes",
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
  beforeCreate() {
    this.$bus.$on("apply-config", (visHeight, visWidth, visX, visY, data) => {
      this.GenFig(visHeight, visWidth, visX, visY, data);
    });

    this.$bus.$on("preview-config", (data) => {
      data.height = 200;
      data.width = 300;
      vegaEmbed("#chart", data, {
        renderer: "svg",
        actions: false,
        // theme: "latimes",
      });
    });
  },
  mounted() {
    // get event
    this.$bus.$on("visualize-selectedData", (position, jsonData, field) => {
      this.GenFig(
        position.height - 1.2,
        position.width - 1.2,
        position.x + 0.1,
        position.y + 0.1,
        this.chartDec,
        jsonData
      );
      console.log(jsonData);
    });
  },
  beforeDestroy() {
    this.$bus.$off("apply-config");
    this.$bus.$off("preview-config");
  },
};
</script>

<style lang="less">
#vis-view {
  background-color: white;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.5);
  padding: 0px 10px 0px 10px;
    .el-form-item
    {
      margin-top:2px !important;
      margin-bottom:2px !important;
    }
}
#chart {
  margin-top: 3%;
}
.role-axis {
  display: none;
}
</style>