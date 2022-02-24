<template>
  <div id="app" v-if="!loadingData">
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      background-color="#676767"
      text-color="#fff"
      :default-active="activeIndex"
      active-text-color="#ffd04b"
    >
      <el-menu-item class="labelIcon" id="title">
        {{ appName }}
      </el-menu-item>
      <el-tooltip
        class="labelIcon"
        v-for="operation in operationArray"
        :key="operation"
        :content="operation"
        effect="light"
      >
        <el-menu-item
          :index="operation"
          @click="changeDialogVisible(operation)"
        >
          {{ operation }}
        </el-menu-item>
      </el-tooltip>
    </el-menu>

    <div class="content-container">
      <TableView
        :isHeaderFixed="isHeaderFixed"
        :isTransformView="currView == 'Transformation'"
        @changeHeaderFixed="change_is_header_fixed($event)"
      ></TableView>
    </div>
    <div id="vis-panel" v-show="currView != 'Transformation'">
      <VisView v-show="showPanel"></VisView>
      <div v-show="!showPanel">Select Data to Continue</div>
    </div>

    <div class="change-view-button-container" v-if="isHeaderFixed">
      <el-radio-group
        class="change-view-button"
        v-model="currView"
        size="medium"
      >
        <el-radio-button label="Transformation"></el-radio-button>
        <el-radio-button label="Visualization"></el-radio-button>
      </el-radio-group>
    </div>

    <el-dialog
      title="Dataset"
      id="dataset-dialog"
      :visible.sync="datasetDialogVisible"
    >
      <DataDialog
        :datasetDialogKey="datasetDialogKey"
        @closeDataDialog="closeDataDialog"
      >
      </DataDialog>
    </el-dialog>
  </div>
</template>

<script>
import TableView from "./views/TableView.vue";
import VisView from "./views/VisView.vue";
import { getTabularDataset } from "@/communication/communicator.js";
import { Dataset } from "@/dataset/dataset.js";
import DataDialog from "@/views/dialogs/DataDialog.vue";
import { mapState } from "vuex";
export default {
  name: "app",
  components: {
    VisView,
    TableView,
    DataDialog,
  },
  computed: {
    ...mapState(["showPanel"]),
  },
  data() {
    return {
      appName: "TableVis",
      operationArray: ["dataset"],
      activeIndex: "",
      datasetDialogVisible: false,
      datasetDialogKey: 0,
      loadingData: true,

      isHeaderFixed: false,
      currView: "Transformation",
    };
  },
  beforeMount: function () {
    let self = this;
    window.sysDatasetObj = new Dataset();
    let tabularDataDeferObj = $.Deferred();
    $.when(tabularDataDeferObj).then(function () {
      self.loadingData = false;
    });
    let tabularDataList = ["*"];
    // initialize the tabular dataset
    getTabularDataset(
      tabularDataList,
      function (processed_tabular_datalist_str) {
        let processed_tabular_datalist = JSON.parse(
          processed_tabular_datalist_str
        );
        console.log("processed_tabular_datalist", processed_tabular_datalist);
        sysDatasetObj.updateTabularDatasetList(processed_tabular_datalist);
        tabularDataDeferObj.resolve();
      }
    );
  },
  mounted: function () {},
  methods: {
    iconClass(operation) {
      return "icon-" + operation;
    },
    closeDataDialog() {},
    changeDialogVisible(panel_name) {
      console.log("panel_name", panel_name);
      if (panel_name === "dataset") {
        this.datasetDialogVisible = true;
      }
    },
    change_is_header_fixed(state) {
      this.isHeaderFixed = state;
    },
  },
};
</script>

<style lang="less">
@side-panel-width: 20%;
@padding: 1%;
@menu-height: 2.5rem;
@change-view-button-container-height: 3.5rem;
html {
  font-size: 100%;
}
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  position: absolute;
  top: 0%;
  bottom: 0%;
  left: 0%;
  right: 0%;
  .el-menu.el-menu--horizontal {
    .el-menu-item {
      height: @menu-height;
      line-height: @menu-height;
    }
    .el-menu-item {
      border-bottom-color: rgb(84, 92, 100) !important;
      font-weight: bolder;
      font-size: 1rem;
      color: #dadada !important;
      padding: 0 10px;
      .icon {
        color: #dadada !important;
      }
    }
  }
  .change-view-button-container {
    position: absolute;
    top: @menu-height;
    left: 0%;
    height: @change-view-button-container-height;
    right: @side-panel-width;
    .change-view-button {
      margin-top: 10px;
    }
  }
  .labelIcon {
    font-size: 1rem;
  }
  .content-container {
    position: absolute;
    top: @menu-height + @change-view-button-container-height;
    left: @padding;
    bottom: @padding;
    right: @side-panel-width + @padding;
  }
  svg:not(:root) {
    overflow: visible;
  }
  #vis-panel {
    position: absolute;
    right: 1%;
    width: @side-panel-width;
    top: @menu-height;
    bottom: 0%;
    border-left: solid #efefef 1px;
    background-color: white;
  }
}
</style>
