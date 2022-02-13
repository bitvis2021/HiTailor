<template>
  <div class="visview-container" v-if="this.showVisPanel">
    <div
      style="
        background-color: white;
        position: absolute;
        left: -300px;
        top: 0px;
        width: 200px;
      "
    >
      {{ this.VegaConfigNoData }}
    </div>
    <div id="gen-chart"></div>
    <div id="vis-view">
      <!-- 使用v-if而不是v-show，否则值会更新不上来 -->
      <div v-if="!showTemplates">
        <el-row type="flex" class="row-bg">
          <el-button
            type="text"
            @click="ReturnTempView"
            style="margin-top: -5px; margin-bottom: -10px; margin-left: 5px"
            ><i class="el-icon-back"></i
          ></el-button>
        </el-row>
        <div id="chart"></div>
        <div class="panel-view-container">
          <panel-view
            :vegaSchema="this.vegaSchema"
            :vegaConfig="this.vegaConfig"
            v-on:apply-config="ApplyVegaConf"
            v-on:apply-vis="ApplyVis2Table"
          ></panel-view>
        </div>
      </div>
      <templates-view
        v-if="showTemplates"
        v-on:select-template="OpenPanelView"
        :templates="this.templates"
      ></templates-view>
    </div>
  </div>
</template>

<script>
import vegaEmbed from "vega-embed";
import PanelView from "./vis/PanelView.vue";
import TemplatesView from "./vis/TemplatesView.vue";
import { GetTemplates } from "./vis/Temp2Vega";

export default {
  name: "VisView",
  components: {
    PanelView,
    TemplatesView,
  },
  computed: {
    VegaConfigNoData() {
      return { mark: this.vegaConfig.mark, encoding: this.vegaConfig.encoding };
    },
  },
  data() {
    return {
      showVisPanel: false,
      showTemplates: true,
      templates: [],
      vegaConfig: {}, // template -> vegaConfig <=> panelView
      vegaSchema: {}, // template -> vegaSchema -> panelView
      position: {},
    };
  },
  methods: {
    ApplyVegaConf(data) {
      this.vegaConfig = data;
    },
    OpenPanelView(template) {
      console.log(template);
      this.vegaSchema = template.GetSchema();
      this.vegaConfig = template.GetVegaConf();
      this.showTemplates = false;
    },
    ApplyVis2Preview() {},
    ApplyVis2Table() {
      this.GenFig(
        this.position.height - 1.2,
        this.position.width - 1.2,
        this.position.x + 0.1,
        this.position.y + 0.1,
        this.vegaConfig
      );
    },
    ReturnTempView() {
      this.showTemplates = true;
    },
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
  beforeCreate() {
    // this.$bus.$on("apply-config", (visHeight, visWidth, visX, visY, data) => {
    //   // this.GenFig(visHeight, visWidth, visX, visY, data);
    // });

    this.$bus.$on("preview-config", (data) => {
      data.height = 200;
      data.width = 300;
      // vegaEmbed("#chart", data, {
      //   renderer: "svg",
      //   actions: false,
      //   // theme: "latimes",
      // });
    });
  },
  mounted() {
    // get event
    this.$bus.$on("visualize-selectedData", (position, jsonData, metaData) => {
      this.showVisPanel = true;
      this.position = position;
      console.log(metaData)
      if (typeof metaData != Object) {
        metaData=JSON.parse(metaData)
      }
      this.templates = GetTemplates(metaData, jsonData);
    });
    this.templates = GetTemplates();
  },
  beforeDestroy() {
    // this.$bus.$off("apply-config");
    this.$bus.$off("preview-config");
  },
};
</script>

<style lang="less">
.visview-container {
  position: absolute;
  left: 0%;
  width: 100%;
  top: 0%;
  height: 100%;
  #vis-view {
    position: absolute;
    top: 0%;
    bottom: 0%;
    left: 0%;
    right: 0%;
    background-color: white;
    // padding: 0px 10px 0px 10px;
    .el-form-item {
      margin-top: 2px !important;
      margin-bottom: 2px !important;
    }
  }
  .panel-view-container {
    position: absolute;
    top: 240px;
    bottom: 0%;
    left: 0%;
    right: 0%;
  }
  .role-axis {
    display: none;
  }
}
</style>