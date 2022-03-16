<template>
  <div id="visview-container">
    <div class="vis-test">
      {{ this.vegaConfig }}
    </div>

    <div id="vis-view">
      <!-- return buttons -->
      <el-row
        v-if="!showUnitPanel && !showTemplates"
        type="flex"
        justify="start"
        style="margin-left: 5px"
      >
        <el-button @click="ClickReturnButton" type="text" size="medium"
          ><i class="el-icon-back"></i
        ></el-button>
      </el-row>

      <div v-if="showUnitPanel">
        <br />
        <unit-view :visData_arr="unitData_arr" :figID="this.figID"></unit-view>
      </div>
      <div v-else-if="showTemplates">
        <br />
        <templates-view
          v-on:select-template="SelectTemplate"
          :templates="this.templates"
        ></templates-view>
      </div>
      <div v-else>
        <!-- 使用v-if而不是v-show，否则值会更新不上来 -->
        <div v-if="showPanelView">
          <div class="unit-chart">
            <svg id="chart"></svg>
          </div>
          <panel-view
            :selections="this.ECSelections"
            :vegaConfig="this.vegaConfig"
            v-on:apply-config="PreviewVegaConf"
            v-on:apply-vis="ApplyVis2Table"
          ></panel-view>
        </div>
      </div>
    </div>

    <!-- remove group canvas -->
    <el-dialog
      title="Batch Operation"
      :visible.sync="showBatchDialog"
      width="30%"
    >
      <span>{{ dialogText }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="BatchCancel">No</el-button>
        <el-button type="primary" @click="BatchOperate">Yes</el-button>
      </span>
    </el-dialog>

    <div id="unit-tooltip-element">
      <table>
        <tr>
          <td class="key">value</td>
          <td class="value">10</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import vegaEmbed from "vega-embed";
import PanelView from "./vis/PanelView.vue";
import TemplatesView from "./vis/TemplatesView.vue";
import UnitView from "./vis/UnitView.vue";
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
    UnitView,
  },
  computed: {
    VegaConfigNoData() {
      return { mark: this.vegaConfig.mark, encoding: this.vegaConfig.encoding };
    },
    vegaConfig() {
      return this.currentTemplate.GetVegaConfig();
    },
    ECSelections() {
      return this.currentTemplate.GetSelections();
    },
  },
  data() {
    return {
      showTemplates: false,
      showUnitPanel: false,
      showPanelView: false,

      visData: {}, // data from visualize selected data
      metaData: {},
      position: {},

      // 1. selectTemplate -> currentTemplate.GetVegaConfig -> PanelView (tweakedData) -> VisView -> currentTemplate.CompileTweakedConfig (vega-lite) -> visualize -> visDB
      // 2. recommand -> templateName+recommandArea(meataData+visData) -> template -> visualize -> visDB
      currentTemplate: new VegaTemplate(),
      templates: [],

      VisDB: new VisDatabase(this.$bus),
      figID: "",

      showBatchDialog: false,
      dialogTexts: {
        remove: "Do you want remove other figures which belong this group?",
        reconf: "Do you want config other figures which belong this group?",
        recommend: "Do you want apply this config to recommended area?",
      },
      dialogText: "",
      currentGroupID: "",

      unitData_arr: [],
    };
  },
  methods: {
    ...mapMutations(["OPEN_VIS_PANEL", "CLOSE_VIS_PANEL"]),

    // User Operation events

    OpenUnitView() {
      this.showUnitPanel = true;
      this.showTemplates = false;
      this.showPanelView = false;
    },

    // Input data and metadata to VisTemplates. Then get the templates. Open the template view.
    OpenTemplateView() {
      this.templates = GetTemplates(this.metaData, this.visData);

      this.showTemplates = true;
      this.showUnitPanel = false;
      this.showPanelView = false;
    },

    // User select template from templateView, then update the vegaConfig
    SelectTemplate(template) {
      this.currentTemplate = template;
      this.OpenPanelView();
    },

    // Open panel view to tweak data
    OpenPanelView() {
      this.showTemplates = false;
      this.showUnitPanel = false;
      this.showPanelView = true;
      this.$bus.$emit("preview-config");
    },

    ClickReturnButton() {
      // 再写一个恢复，让点击return button后templateView自动读取metaData

      if (this.showTemplates) {
        // this.CLOSE_VIS_PANEL();
        return;
      }
      this.OpenTemplateView();
    },

    // User modified panel to update preview figure on top of the panel
    PreviewVegaConf(vegaConfig) {
      this.currentTemplate.CompileTweakedConfig(vegaConfig); // 可能有拷贝的问题
      this.$bus.$emit("preview-config"); // preview picture
    },

    // Initially apply vega-lite config to the table, then register the config in database
    ApplyVis2Table() {
      // There is no generated data. So generate a new one.
      if (this.figID == "") {
        this.figID = this.VisDB.GenFig(
          this.position.height,
          this.position.width,
          this.position.x,
          this.position.y,
          this.currentTemplate,
          this.visData,
          this.metaData
        );
      } else {
        this.VisDB.SetTemplate(this.figID, this.currentTemplate);
        this.VisDB.RerenderCanvas(this.figID);
        if (this.VisDB.GetGroupMembers(this.figID).length > 1) {
          this.dialogText = this.dialogTexts.reconf;
          this.showBatchDialog = true;
        }
      }
      // this.$bus.$emit("apply-config");
      this.showBatchDialog = true;
      this.dialogText = this.dialogTexts.recommend;
    },

    BatchOperate() {
      this.showBatchDialog = false;
      if (this.dialogText == this.dialogTexts.remove) {
        this.VisDB.DeleteGroup(this.currentGroupID);
      } else if (this.dialogText == this.dialogTexts.reconf) {
        this.VisDB.ModifyGroupFigs(this.figID, this.currentTemplate);
      } else if (this.dialogText == this.dialogTexts.recommend) {
        this.$bus.$emit("apply-config");
      }
    },
    BatchCancel() {
      this.showBatchDialog = false;
      if (this.dialogText == this.dialogTexts.recommend) {
        this.$bus.$emit("clear-selectedCell");
      }
    },
  },
  mounted() {
    this.OPEN_VIS_PANEL();

    this.$bus.$on("select-cell", () => this.VisDB.CancelAllSelections());
    this.$bus.$on("change-header", () => this.VisDB.RemoveAllCanvas());

    // Render figure on top of the side panel
    this.$bus.$on("preview-config", () => {
      if (this.showPanelView) {
        let height = document.getElementById("vis-panel").clientHeight * 0.25;
        let width = document.body.clientWidth * 0.19;
        let data = JSON.parse(
          JSON.stringify(this.currentTemplate.GetVegaLite(height, width))
        );
        vegaEmbed("#chart", data, {
          renderer: "svg",
          actions: false,
        });
      }
    });

    this.$bus.$on("visualize-recommendData", (array) => {
      this.VisDB.GenRecommendFigs(array, this.currentTemplate, this.figID);
    });

    // User select data
    this.$bus.$on("visualize-selectedData", (position, visData, metaData) => {
      this.figID = "";
      this.OPEN_VIS_PANEL();
      this.position = position; // for visDatabase to use

      this.visData = JSON.parse(visData);
      this.metaData = JSON.parse(metaData);

      if (typeof metaData != Object) {
        metaData = JSON.parse(metaData);
      }
      if (metaData.x.range == 1 && metaData.y.range == 1) {
        this.unitData_arr = JSON.parse(visData);
        this.OpenUnitView();
      } else {
        this.OpenTemplateView();
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

    // User click vis. Restore previous context.
    this.$bus.$on("select-canvas", (id) => {
      this.figID = id;
      this.currentGroupID = this.VisDB.GetGroupID(this.figID);
      if (this.VisDB.database[id].type === "vega") {
        this.currentTemplate = this.VisDB.GetTemplate(id);
        this.visData = this.VisDB.database[id].visData;
        this.metaData = this.VisDB.database[id].metaData;
        this.showPanelView = false;
        this.OpenPanelView();
      } else {
        let group = this.VisDB.GetGroupMembers(this.figID);
        this.unitData_arr = [];
        for (let i = 0; i < group.length; i++) {
          let db = this.VisDB.database[group[i]];
          if (!!db) {
            let config = {};
            config.value = db.visData;
            config.id = db.id;
            config.position = {
              x: db.x,
              y: db.y,
              height: db.height,
              width: db.width,
            };
            this.unitData_arr.push(config);
          }
        }
        this.OpenUnitView();
      }
    });

    // User close a canvas that belongs to a group
    this.$bus.$on("remove-groupCanvas", () => {
      this.showBatchDialog = true;
      this.dialogText = this.dialogTexts.remove;
    });

    // resize function
    let bus = this.$bus;
    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        if (!resizeTimeout) {
          resizeTimeout = setTimeout(function () {
            resizeTimeout = null;
            // The actualResizeHandler will execute at a rate of 15fps
            bus.$emit("preview-config");
          }, 66);
        }
      },
      false
    );
  },

  beforeDestroy() {
    this.$bus.$off("preview-config");
    this.$bus.$off("visualize-selectedData");
    this.$bus.$off("rerender-selectedData");
    this.$bus.$off("select-canvas");
    this.$bus.$off("remove-groupCanvas");
  },
};
</script>

<style lang="less">
#visview-container {
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
    overflow: hidden;
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

.role-axis-grid {
  display: none;
}
.role-axis-domain {
  display: none;
}
.background {
  display: none;
}

.unit-chart {
  margin: 10px;
  width: 93%;
  height: 24vh;
  border: 1px solid #dddddd;
  overflow: hidden;
  svg {
    height: 100%;
    width: 100%;
  }
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

#chart {
  width: 100%;
  height: 25vh;
  overflow: hidden;
}

.vis-picture-button {
  cursor: pointer;
  fill: rgb(90, 156, 248);
  &:hover {
    fill: rgb(153, 195, 250);
  }
}
.property-text {
  font-size: 14px;
  line-height: 15px;
  margin-top: 7px;
  margin-right: 10px;
  padding-right: 10px;
  margin-left: 5px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #606266;
}
#unit-tooltip-element {
  visibility: hidden;
  padding: 8px;
  position: fixed;
  z-index: 1000;
  font-family: sans-serif;
  font-size: 11px;
  border-radius: 3px;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  /* The default theme is the light theme. */
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid #d9d9d9;
  color: black;
}
#unit-tooltip-element.visible {
  visibility: visible;
}
#unit-tooltip-element h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 13px;
}
#unit-tooltip-element img {
  max-width: 200px;
  max-height: 200px;
}
#unit-tooltip-element table {
  border-spacing: 0;
}
#unit-tooltip-element table tr {
  border: none;
}
#unit-tooltip-element table tr td {
  overflow: hidden;
  text-overflow: ellipsis;
  padding-top: 2px;
  padding-bottom: 2px;
}
#unit-tooltip-element table tr td.key {
  color: #808080;
  max-width: 150px;
  text-align: right;
  padding-right: 4px;
}
#unit-tooltip-element table tr td.value {
  display: block;
  max-width: 300px;
  max-height: 7em;
  text-align: left;
}
#unit-tooltip-element.dark-theme {
  background-color: rgba(32, 32, 32, 0.9);
  border: 1px solid #f5f5f5;
  color: white;
}
#unit-tooltip-element.dark-theme td.key {
  color: #bfbfbf;
}
</style>
