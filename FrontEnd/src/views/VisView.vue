<template>
  <div class="visview-container">
    <div class="vis-test">
      {{ this.vegaConfig }}
    </div>
    <div id="gen-chart"></div>
    <div id="vis-view">
      <!-- return buttons -->
      <el-row type="flex" justify="start" style="margin-left: 10px">
        <!-- v-if="!showTemplates" -->
        <el-button @click="ClickReturnButton" type="text"
          ><i class="el-icon-back"></i
        ></el-button>
        <!-- <div style="width: 250px"></div> -->
        <!-- <el-button type="text" @click="CLOSE_VIS_PANEL()"
          ><i class="el-icon-close"></i
        ></el-button> -->
      </el-row>
      <!-- 使用v-if而不是v-show，否则值会更新不上来 -->
      <templates-view
        v-if="showTemplates"
        v-on:select-template="SelectTemplate"
        :templates="this.templates"
      ></templates-view>
      <div v-else>
        <div id="chart"></div>

        <!-- 直接点击已生成图像时，弹出的面板是tweakpanel -->
        <div class="panel-view-container">
          <panel-view
            v-if="showTweakPanel"
            :selections="this.ECSelections"
            :vegaConfig="this.vegaConfig"
            v-on:apply-config="ApplyVegaConf"
            v-on:apply-vis="ApplyTweak2Table"
          ></panel-view>
          <div v-else-if="showUnitPanel">
            <br />
            Unit Panel
          </div>
          <panel-view
            v-else
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
import vegaEmbed, { vega } from "vega-embed";
import PanelView from "./vis/PanelView.vue";
import TemplatesView from "./vis/TemplatesView.vue";
import { GetTemplates } from "./vis/VisTemplates";
import { mapMutations } from "vuex";
import { VisDatabase } from "./vis/VisDatabase";
import { tupleid } from "vega";
// visualize-selectedData -> visView -> TemplateView ->(vegaConfig) visView -> Panel -> (metaData+vegaConfig+data) VisDataBase -> visualization
// visualize-data -> visView (template) -> VisTemplates -> (vegaConfig) visView -> Panel -> (meataData+vegaConfig+data) VisDataBase -> visualization
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
      showUnitPanel: false,
      templates: [],

      ECSelections: {}, // template -> vegaSchema -> panelView

      VisDB: new VisDatabase(),
      figID: "",
      position: {},

      vegaConfig: {}, // template -> vegaConfig <=> panelView
      visData: {}, // data from visualize selected data
      metaData: {},
    };
  },
  methods: {
    ...mapMutations(["OPEN_VIS_PANEL", "CLOSE_VIS_PANEL"]),

    // Input data and metadata to VisTemplates. Then get the templates. Open the template view.
    OpenTemplateView(metaData, visData) {
      this.templates = GetTemplates(metaData, visData);

      // get data that is needed in visualization
      this.visData = visData;
      this.metaData = metaData;

      this.showTemplates = true;
      this.showTweakPanel = false;
      this.showUnitPanel = false;
    },

    // Open panel view to tweak data
    OpenPanelView(vegaData, selections) {
      this.vegaConfig = vegaData;
      this.ECSelections = selections;
      console.log("now config", this.vegaConfig);
      this.showTweakPanel = false;
      this.showTemplates = false;
      this.showUnitPanel = false;
      this.$bus.$emit("preview-config");
    },

    // Update vegaConfig from VisDatabase, and then close everthing but open the tweak view.
    OpenTweakView(vegaData, selections) {
      this.vegaConfig = vegaData;
      this.ECSelections = selections;

      this.showTweakPanel = true;
      this.showTemplates = false;
      this.showUnitPanel = false;
      this.$bus.$emit("preview-config");
    },

    OpenUnitView() {
      this.showUnitPanel = true;
      this.showTemplates = false;
      this.showTweakPanel = false;
    },

    ClickReturnButton() {
      if (this.showTweakPanel) {
        // regenerate template from the data
        alert("it is not implemented");
      }
      if (this.showTemplates) {
        this.CLOSE_VIS_PANEL();
        return;
      }
      this.OpenTemplateView(this.metaData, this.visData);
    },

    // User modified panel to update preview figure on top of the panel
    ApplyVegaConf(data) {
      this.vegaConfig = data;
      this.$bus.$emit("preview-config"); // preview picture
    },

    // User select template from templateView, then update the vegaConfig
    SelectTemplate(template) {
      // templateName + originData => vegaConfig
      // 从template view中获得vegaConfig以及对应的数据组织形式
      this.OpenPanelView(template.GetVegaConfig(), template.selections);
    },

    // Initially apply vega-lite config to the table, then register the config in database
    ApplyVis2Table() {
      this.figID = this.VisDB.GenFig(
        this.position.height,
        this.position.width,
        this.position.x,
        this.position.y,
        this.vegaConfig,
        this.metaData,
        this.ECSelections
      );
    },

    // Update tweaked data to vis database and then generate the vega-lite config to the table
    ApplyTweak2Table() {
      console.log("apply tweak");
      this.showTemplates = true;
      this.showTweakPanel = false;
      this.VisDB.RerenderCanvas(this.figID);
    },
  },
  mounted() {
    this.OPEN_VIS_PANEL();
    // Render figure on top of the side panel
    this.$bus.$on("preview-config", () => {
      let data = JSON.parse(JSON.stringify(this.vegaConfig));
      data.height = 188;
      data.width = 288;
      console.log("preview data", data);
      vegaEmbed("#chart", data, {
        renderer: "svg",
        actions: false,
        height: 200,
        width: 300,
      });
    });
    // User select data
    this.$bus.$on("visualize-selectedData", (position, visData, metaData) => {
      this.OPEN_VIS_PANEL();
      this.position = position; // for visDatabase to use
      if (typeof metaData != Object) {
        metaData = JSON.parse(metaData);
      }
      if (metaData.x.range == 1 && metaData.y.range == 1) {
        this.OpenUnitView();
      } else {
        this.OpenTemplateView(metaData, visData);
      }
    });

    // User move table line and modify available space
    this.$bus.$on("rerender-selectedData", (prePosition, afterPosition) => {
      this.VisDB.ReconfigAllCanvas(
        prePosition.x,
        prePosition.y,
        afterPosition.x,
        afterPosition.y
      );
    });

    // Make VisDatabase to send signal
    this.VisDB.RegisterBus(this.$bus);
    
    // User click vis figure
    this.$bus.$on("select-canvas", (figMetadata) => {
      console.log("meta data", figMetadata);
      this.figID = figMetadata.id;
      this.OpenTweakView(figMetadata.vegaConfig, figMetadata.selections);

    });
  },
  beforeDestroy() {
    this.$bus.$off("preview-config");
    this.$bus.$off("visualize-selectedData");
    this.$bus.$off("rerender-selectedData");
    // this.$bus.$off("close-tweakPanel");
    this.$bus.$off("select-canvas");
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
    // position: absolute;
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
  // display: none;
  background-color: white;
  position: absolute;
  left: -300px;
  top: 0px;
  width: 200px;
}
#chart {
  width: 300px;
  height: 200px;
  display: inline-block;
  margin-right: 2%;
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