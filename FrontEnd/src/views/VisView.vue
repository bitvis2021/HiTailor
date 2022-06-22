<template>
  <div id="visview-container">
    <div class="vis-test">
      {{ this.vegaConfig }}
    </div>

    <div id="vis-view">
      <!-- return buttons -->
      <el-row
        type="flex"
        justify="space-around"
        style="margin-left: 5px; margin-bottom: 10px"
      >
        <el-col :span="2">
          <el-button
            v-if="showPanelView && !showTemplates"
            @click="ClickReturnButton"
            type="text"
            size="medium"
            ><i class="el-icon-back"></i
          ></el-button>
        </el-col>
        <el-col :span="20">
          <el-button
            @click="DisableTableUnit"
            size="mini"
            plain
            style="margin-top: 5px; color: #d81e05"
            >Disable Selected Cells
            <svg
              style="transform: translateY(3px); margin-top: -5px"
              t="1648206142678"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="3218"
              width="15"
              height="15"
            >
              <path
                d="M64 66.133333a42.496 42.496 0 0 0 0 60.16l55.04 55.466667v593.066667c0 46.933333 38.4 85.333333 85.333333 85.333333h593.066667l97.706667 97.706667a42.496 42.496 0 1 0 60.16-60.16L124.16 66.133333c-8.106667-8.106667-18.773333-12.373333-29.866667-12.373333s-22.186667 4.266667-30.293333 12.373333z m225.706667 708.693334h-85.333334v-85.333334h85.333334v85.333334z m0-170.666667h-85.333334v-85.333333h85.333334v85.333333z m-85.333334-170.666667v-85.333333h85.333334v85.333333h-85.333334z m256 341.333334h-85.333333v-85.333334h85.333333v85.333334z m-85.333333-170.666667v-85.333333h85.333333v85.333333h-85.333333z m170.666667 170.666667v-85.333334h81.066666l85.333334 85.333334h-166.4z m-170.666667-597.333334h85.333333v85.333334h-19.2l104.533334 104.533333v-19.2h298.666666c23.466667 0 42.666667 19.2 42.666667 42.666667v317.866666l85.333333 85.333334V348.16c0-46.933333-38.4-85.333333-85.333333-85.333333h-341.333333v-85.333334c0-46.933333-38.4-85.333333-85.333334-85.333333H270.506667l104.533333 104.533333v-19.2z m341.333333 256h85.333334v85.333334h-85.333334v-85.333334z"
                p-id="3219"
                fill="#d81e06"
              ></path></svg
          ></el-button>
        </el-col>
        <el-col :span="4">
          <el-button @click="CloseVisPanel" type="text" size="medium"
            ><i class="el-icon-close"></i
          ></el-button>
        </el-col>
      </el-row>

      <div v-if="showUnitPanel">
        <unit-view :visData_arr="unitData_arr" :figID="this.figID" :recommendValue="recommendValue"></unit-view>
      </div>
      <div v-else-if="showTemplates">
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
            :recommendValue="recommendValue"
            v-on:apply-config="PreviewVegaConf"
            v-on:apply-vis="ApplyVis2Table"
          ></panel-view>
        </div>
      </div>
    </div>

    <div id="vg-tooltip-element"></div>
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
import {
  GetTemplates,
  VegaTemplate,
  supportedTemplate,
} from "./vis/TemplateCompiler";
import { VisDatabase } from "./vis/VisDatabase";
import { DialogTexts } from "./dialogs/DialogTexts";
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

      currentGroupID: "",

      unitData_arr: [],
      recommendData_arr: [],

      recommendValue: {priority: [0, 2], type: "name", direction:"column"}
    };
  },
  methods: {
    CloseVisPanel() {
      this.$bus.$emit("close-VisView");
    },
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
        return;
      }
      this.OpenTemplateView();
    },

    // User modified panel to update preview figure on top of the panel
    PreviewVegaConf(vegaConfig) {
      this.currentTemplate.CompileTweakedConfig(vegaConfig); // 可能有拷贝的问题
      this.$bus.$emit("preview-config"); // preview picture
    },

    DisableTableUnit() {
      this.VisDB.DisableTableUnit(
        this.position.height,
        this.position.width,
        this.position.x,
        this.position.y
      );
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
          this.$bus.$emit("show-dialog", {
            title: "Batch Operation",
            text: DialogTexts.reconf,
          });
        }
      }
      this.$bus.$emit("apply-config");
    },
  },
  mounted() {
    this.$bus.$on("transmit-recommend-value-to-panel", (priority, type, direction) => {
      this.recommendValue.priority = priority
      this.recommendValue.type = type
      this.recommendValue.direction= direction
    });

    this.$bus.$on("select-cell", () => this.VisDB.CancelAllSelections());
    this.$bus.$on("change-header", () => this.VisDB.RemoveAllCanvas());

    this.$bus.$on("confirm-dialog", (dialogText) => {
      if (dialogText == DialogTexts.remove) {
        this.VisDB.DeleteGroup(this.currentGroupID);
      } else if (dialogText == DialogTexts.reconf) {
        this.VisDB.ModifyGroupFigs(this.figID, this.currentTemplate);
      } else if (dialogText == DialogTexts.recommend) {
        this.VisDB.GenRecommendFigs(
          this.recommendData_arr,
          this.currentTemplate,
          this.figID
        );
      }
    });
    this.$bus.$on("cancel-dialog", (dialogText) => {
      if (dialogText == DialogTexts.recommend) {
        this.$bus.$emit("clear-selectedCell");
        this.recommendData_arr = [];
      }
    });

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
        }).then(() => {
          let content = document.getElementById("chart").childNodes[0];
          let width = document.getElementById("chart").clientWidth;
          let height = document.getElementById("chart").clientHeight;
          console.log("height", height, "width", width);
          if (
            this.currentTemplate.name === supportedTemplate.Q2_Horizon_Graph
          ) {
          } else if (
            content.getBBox().width > width ||
            content.getBBox().height > height
          ) {
            content.setAttribute(
              "transform",
              "translate(" +
                -5 +
                "," +
                -5 +
                ") scale(" +
                width / content.getBBox().width +
                "," +
                height / content.getBBox().height +
                ")"
            );
          }
        });
      }
    });

    this.$bus.$on("visualize-recommendData", (array) => {
      this.recommendData_arr = array;
      if (this.recommendData_arr.length > 1) {
        this.$bus.$emit("show-dialog", {
          title: "Batch Operation",
          text: DialogTexts.recommend,
        });
      }
    });

    // User select data
    this.$bus.$on("visualize-selectedData", (position, visData, metaData) => {
      this.figID = "";
      console.log("new id");
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
      this.$bus.$emit("show-dialog", {
        title: "Batch Operation",
        text: DialogTexts.remove,
      });
    });

    // resize function
    let $bus = this.$bus;
    let resizeTimeout;
    window.addEventListener(
      "resize",
      () => {
        if (!resizeTimeout) {
          resizeTimeout = setTimeout(function () {
            resizeTimeout = null;
            // The actualResizeHandler will execute at a rate of 15fps
            $bus.$emit("preview-config");
          }, 66);
        }
      },
      false
    );

    // Background hightlight
    let emitTimeout = undefined;
    let oldHoverText = [];
    let hoverText = []; // the reference should not be inside the call stack of observer. otherwise the popout will not disappear after unhover event happens.

    let isHighlight = false;

    // listen #vg-tooltip-element
    let observer = new MutationObserver(function (mutations, observer) {
      console.log(mutations);
      mutations.forEach((mutation) => {
        if (mutation.type == "childList") {
          // console.log(mutation);

          if (!emitTimeout) {
            emitTimeout = setTimeout(() => {
              let el = document.getElementById("vg-tooltip-element");

              hoverText = [];
              el.childNodes[0].childNodes[0].childNodes.forEach((childNode) =>
                childNode.childNodes.forEach((value) => {
                  let text = JSON.parse(JSON.stringify(value.textContent));
                  if (value.getAttribute("class") == "key") {
                    hoverText.push(text.substring(0, text.length - 1));
                  } else {
                    hoverText.push(text);
                  }
                })
              );

              let isEq = true;
              if (hoverText.length != oldHoverText.length) {
                isEq = false;
              } else {
                for (let i = 0; i < hoverText.length; i++) {
                  if (oldHoverText[i] != hoverText[i]) {
                    isEq = false;
                    break;
                  }
                }
              }
              if (!isEq) {
                console.log("hover Text", hoverText);
                if (isHighlight) {
                  $bus.$emit("unhover-field");
                }
                if (
                  document
                    .getElementById("vg-tooltip-element")
                    .getAttribute("class") != ""
                ) {
                  oldHoverText = hoverText;
                  hoverText.forEach((text) => {
                    // not submit headers. but if needed, we can comment the judgement below
                    if (
                      text.substring(0, 3) != "row" &&
                      text.substring(0, 3) != "col"
                    ) {
                      $bus.$emit("hover-field", text);
                    }
                  });
                  isHighlight = true;
                }
              }

              emitTimeout = undefined;
            }, 50);
          }
        } else {
          if (mutation.attributeName == "class") {
            console.log(
              "now class",
              document
                .getElementById("vg-tooltip-element")
                .getAttribute("class")
            );
            if (
              document
                .getElementById("vg-tooltip-element")
                .getAttribute("class") == ""
            ) {
              if (isHighlight) {
                $bus.$emit("unhover-field");
                isHighlight = false;
                oldHoverText = [];
              }
            }
          }
        }
      });
    });

    observer.observe(document.querySelector("#vg-tooltip-element"), {
      childList: true,
      attributes: true,
      // attributes: true,
    });
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
