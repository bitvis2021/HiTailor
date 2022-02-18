<template>
  <div class="visview-container">
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
      <!-- return buttons -->
      <el-row type="flex" justify="end" style="margin-right: 10px">
        <el-button
          v-if="!showTemplates"
          @click="showTemplates = true"
          type="text"
          ><i class="el-icon-back"></i
        ></el-button>
        <div style="width: 250px"></div>
        <el-button type="text" @click="CLOSE_VIS_PANEL()"
          ><i class="el-icon-close"></i
        ></el-button>
      </el-row>
      <!-- 使用v-if而不是v-show，否则值会更新不上来 -->
      <templates-view
        v-if="showTemplates"
        v-on:select-template="OpenPanelView"
        :templates="this.templates"
      ></templates-view>
      <div v-else>
        <div id="chart"></div>
        <div class="panel-view-container">
          <panel-view
            :selections="this.ECSelections"
            :vegaConfig="this.vegaConfig"
            v-on:apply-config="ApplyVegaConf"
            v-on:apply-vis="ApplyVis2Table"
          ></panel-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vegaEmbed from "vega-embed";
import PanelView from "./vis/PanelView.vue";
import TemplatesView from "./vis/TemplatesView.vue";
import { GetTemplates } from "./vis/Temp2Vega";
import { mapMutations } from "vuex";

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
      showTemplates: true,
      visData: {},
      templates: [],
      vegaConfig: {}, // template -> vegaConfig <=> panelView
      ECSelections: {}, // template -> vegaSchema -> panelView
      position: {},
    };
  },
  methods: {
    ApplyVegaConf(data) {
      this.vegaConfig = data;
      this.vegaConfig.data = this.visData;
      this.$bus.$emit("preview-config");
    },
    ...mapMutations(["OPEN_VIS_PANEL", "CLOSE_VIS_PANEL"]),
    OpenPanelView(template) {
      this.vegaConfig = template.GetVegaConf();

      this.visData = this.vegaConfig.data;

      this.ECSelections = template.GetECSelections();
      this.showTemplates = false;

      this.$bus.$emit("preview-config");
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
    // get event
    this.$bus.$on("preview-config", () => {
      let data = this.vegaConfig;
      data.height = 188;
      data.width = 288;
      vegaEmbed("#chart", data, {
        renderer: "svg",
        actions: false,
      });
    });
    this.$bus.$on("visualize-selectedData", (position, jsonData, metaData) => {
      this.position = position;
      if (typeof metaData != Object) {
        metaData = JSON.parse(metaData);
      }
      this.templates = GetTemplates(metaData, jsonData);

      this.showTemplates = true;
      this.OPEN_VIS_PANEL();
    });
  },
  beforeDestroy() {
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