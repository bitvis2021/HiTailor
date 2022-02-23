<template>
  <div class="visview-container">
    <div class="vis-test">
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
            v-if="!showTweakPanel"
            :selections="this.ECSelections"
            :vegaConfig="this.vegaConfig"
            v-on:apply-config="ApplyVegaConf"
            v-on:apply-vis="ApplyVis2Table"
          ></panel-view>
          <panel-view
            v-else
            :selections="this.ECSelections"
            :vegaConfig="this.vegaConfig"
            v-on:apply-config="ApplyVegaConf"
            v-on:apply-vis="ApplyTweak2Table"
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
import { VisDatabase } from "./vis/VisDatabase";

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
      showTweakPanel: false,
      visData: {},
      templates: [],
      vegaConfig: {}, // template -> vegaConfig <=> panelView
      ECSelections: {}, // template -> vegaSchema -> panelView
      position: {},
      VisDB: new VisDatabase(),
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
      this.showTweakPanel = false;

      this.$bus.$emit("preview-config");
    },
    ApplyVis2Preview() {},
    ApplyVis2Table() {
      this.VisDB.GenFig(
        this.position.height,
        this.position.width,
        this.position.x,
        this.position.y,
        this.vegaConfig
      );
    },
    ApplyTweak2Table() {
      this.showTemplates = true;
      this.showTweakPanel = false;
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
    this.$bus.$on("rerender-selectedData", (prePosition, afterPosition) => {
      this.VisDB.ReconfigAllCanvas(
        prePosition.x,
        prePosition.y,
        afterPosition.x,
        afterPosition.y
      );
    });

    this.VisDB.RegisterBus(this.$bus);
    this.$bus.$on("open-tweakPanel", (vegaData) => {
      this.showTweakPanel = true;
      this.showTemplates = false;
      this.vegaConfig = vegaData;
    });
    this.$bus.$on("close-tweakPanel", () => {
      this.showTweakPanel = false;
      this.showTemplates = true;
      this.CLOSE_VIS_PANEL();
    });
  },
  beforeDestroy() {
    this.$bus.$off("preview-config");
    this.$bus.$off("visualize-selectedData");
    this.$bus.$off("rerender-selectedData");
    this.$bus.$off("close-tweakPanel");
    this.$bus.$off("open-tweakPanel");
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
}
.role-axis {
  display: none;
}
.vis-test {
  display: none;
  background-color: white;
  position: absolute;
  left: -300px;
  top: 0px;
  width: 200px;
}

.vis-picture {
  .vis-picture-hButton {
    fill: rgb(90, 156, 248);
    visibility: hidden;
    cursor: pointer;
    &:hover {
      fill: rgb(153, 195, 250);
    }
  }
  &:hover .vis-picture-hButton {
    visibility: visible;
  }

  .vis-picture-mButton {
    fill: rgb(90, 156, 248);
    cursor: pointer;
    visibility: visible;
    &:hover {
      fill: rgb(153, 195, 250);
    }
  }
}

.vis-picture-mButton:hover + .vis-picture-hButton {
  visibility: hidden;
}

.vis-picture-button {
  cursor: pointer;
  fill: rgb(90, 156, 248);
  &:hover {
    fill: rgb(153, 195, 250);
  }
}
</style>