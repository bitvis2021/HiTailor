<template>
  <div class="visview-container">
    <div class="vis-test">
      {{ this.vegaConfig }}
    </div>
    <div id="gen-chart"></div>
    <div id="vis-view">
      <!-- return buttons -->
      <el-row type="flex" justify="start" style="margin-left: 5px">
        <!-- v-if="!showTemplates" -->
        <el-button @click="ClickReturnButton" type="text" size="medium"
          ><i class="el-icon-back"></i
        ></el-button>
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
            v-on:apply-config="PreviewVegaConf"
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
            v-on:apply-config="PreviewVegaConf"
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
import { GetTemplates, VegaTemplate } from "./vis/TemplateCompiler";
import { mapMutations } from "vuex";
import { VisDatabase } from "./vis/VisDatabase";
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

      visData: {}, // data from visualize selected data
      metaData: {},
      position: {},

      // 1. selectTemplate -> currentTemplate.GetVegaConfig -> PanelView (tweakedData) -> VisView -> currentTemplate.CompileTweakedConfig (vega-lite) -> visualize -> visDB
      // 2. recommand -> templateName+recommandArea(meataData+visData) -> template -> visualize -> visDB
      currentTemplate: new VegaTemplate(),
      templates: [],

      VisDB: new VisDatabase(),
      figID: "",
    };
  },
  computed: {
    // user visible config
    vegaConfig() {
      return this.currentTemplate.GetVegaConfig();
    },
    ECSelections() {
      return this.currentTemplate.GetSelections();
    },
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
    OpenPanelView(template) {
      this.currentTemplate = template;

      this.showTweakPanel = false;
      this.showTemplates = false;
      this.showUnitPanel = false;
      this.$bus.$emit("preview-config");
    },

    // Update vegaConfig from VisDatabase, and then close everthing but open the tweak view.
    OpenTweakView(template) {
      this.currentTemplate = template;

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
    PreviewVegaConf(vegaConfig) {
      this.currentTemplate.CompileTweakedConfig(vegaConfig); // 可能有拷贝的问题
      this.$bus.$emit("preview-config"); // preview picture
    },

    // User select template from templateView, then update the vegaConfig
    SelectTemplate(template) {
      // templateName + originData => vegaConfig
      // 从template view中获得vegaConfig以及对应的数据组织形式
      this.OpenPanelView(template);
    },

    // Initially apply vega-lite config to the table, then register the config in database
    ApplyVis2Table() {
      this.figID = this.VisDB.GenFig(
        this.position.height,
        this.position.width,
        this.position.x,
        this.position.y,
        this.currentTemplate
      );
    },

    // Update tweaked data to vis database and then generate the vega-lite config to the table
    ApplyTweak2Table() {
      // this.showTemplates = true;
      // this.showTweakPanel = false;
      this.VisDB.SetTemplate(this.figID, this.currentTemplate);
      this.VisDB.RerenderCanvas(this.figID);
    },
  },
  mounted() {
    this.OPEN_VIS_PANEL();

    // Render figure on top of the side panel
    this.$bus.$on("preview-config", () => {
      let height = document.getElementById("vis-panel").clientHeight * 0.25;
      let width = document.body.clientWidth * 0.2;
      let data = JSON.parse(
        JSON.stringify(this.currentTemplate.GetVegaLite(height, width))
      );
      data.height = height;
      data.width = width;
      console.log("preview data", data);
      vegaEmbed("#chart", data, {
        renderer: "svg",
        actions: false,
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
    this.$bus.$on("select-canvas", (id) => {
      this.figID = id;
      this.OpenTweakView(this.VisDB.GetTemplate(id));
    });
  },
  beforeDestroy() {
    this.$bus.$off("preview-config");
    this.$bus.$off("visualize-selectedData");
    this.$bus.$off("rerender-selectedData");
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
    .el-form-item {
      margin-top: 2px !important;
      margin-bottom: 2px !important;
    }
  }
  .panel-view-container {
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

.vis-picture-button {
  cursor: pointer;
  fill: rgb(90, 156, 248);
  &:hover {
    fill: rgb(153, 195, 250);
  }
}
</style>