<template>
  <div id="app" v-if="!loadingData">
    <el-menu
      class="el-menu-demo"
      mode="horizontal"
      background-color="#e6e6e6"
      text-color="#000"
      active-text-color="#0087d0"
    >
      <el-menu-item id="title">
        {{ appName }}
      </el-menu-item>

      <el-menu-item
        v-for="(operation, index) in operationArray"
        :key="operation"
        @click="changeDialogVisible(operation)"
      >
        <img :src="iconPath[index]" class="icon" />
        {{ operation }}
      </el-menu-item>
      <el-menu-item
        style="width: 15%; right: 50px !important"
        class="zoom-operator"
      >
        <el-slider
          v-model="zoomScale"
          :min="10"
          :max="150"
          :step="10"
          @input="handle_zoom_scale"
        ></el-slider>
      </el-menu-item>
      <el-menu-item class="zoom-operator" @click="handle_zoom()">
        <img :src="get_zoom_icon()" class="icon" />
      </el-menu-item>
    </el-menu>

    <!-- <div class="content-container">
      <TableView :isHeaderFixed="isHeaderFixed" @changeHeaderFixed="change_is_header_fixed($event)"></TableView> 
    </div> -->

    <div
      class="content-container"
      :class="{ 'content-container-right-margin': showVisPanel }"
    >
      <TableView :key="tableViewKey"></TableView>
    </div>

    <div
      id="vis-panel"
      v-show="initializeVis"
      :class="{
        'vis-panel-slide-in': showVisPanel,
        'vis-panel-slide-out': !showVisPanel,
      }"
    >
      <VisView></VisView>
    </div>

    <el-dialog
      title="Dataset"
      id="dataset-dialog"
      :visible.sync="datasetDialogVisible"
    >
      <DataDialog
        :datasetDialogKey="datasetDialogKey"
      >
      </DataDialog>
    </el-dialog>

    <el-dialog :title="dialogTitle" :visible.sync="showDialog" width="30%">
      <span>{{ dialogText }}</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="CancelDialog">No</el-button>
        <el-button type="primary" @click="ConfirmDialog">Yes</el-button>
      </span>
    </el-dialog>

    <el-dialog title="Export" id="export-dialog" :visible.sync="exportDialogVisible">
      <ExportDialog></ExportDialog>
    </el-dialog>
  </div>
</template>

<script>
import TableView from "./views/TableView.vue";
import VisView from "./views/VisView.vue";
import { getTabularDataset } from "@/communication/communicator.js";
import { parseTabularData } from "@/utils/tabularDataParser.js";
import { Dataset } from "@/dataset/dataset.js";
import DataDialog from "@/views/dialogs/DataDialog.vue";
import ExportDialog from "@/views/dialogs/ExportDialog.vue";
import { mapState } from "vuex";

export default {
  name: "app",
  components: {
    VisView,
    TableView,
    DataDialog,
    ExportDialog
  },
  computed: {},
  data() {
    return {
      appName: "HiTailor",
      operationArray: ["Open Example Data", "Upload Your Data", "Export"],
      iconPath: ["./icon/open-file.svg", "./icon/upload.svg", "./icon/save.svg"],
      // activeIndex: "",
      datasetDialogVisible: false,
      exportDialogVisible: false,
      datasetDialogKey: 0,
      loadingData: true,

      initializeVis: false,
      showVisPanel: false,
      // isHeaderFixed: false,
      // currView: "Transformation",

      showDialog: false,
      dialogTitle: "",
      dialogText: "",

      isZoomOut: false,

      zoomScale: 100,
      tableViewKey: 1
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
        let processed_tabular_dataobj_list = parseTabularData(
          processed_tabular_datalist_str
        );
        console.log(
          "processed_tabular_dataobj_list",
          processed_tabular_dataobj_list
        );
        sysDatasetObj.updateTabularDatasetList(processed_tabular_dataobj_list);
        tabularDataDeferObj.resolve();
        // processed_tabular_datalist_str = processed_tabular_datalist_str.replace(/"/g, '?')
        // console.log('processed_tabular_datalist_str', processed_tabular_datalist_str)
        // processed_tabular_datalist_str = processed_tabular_datalist_str.replace(/'/g, '"')
        // let processed_tabular_datalist = JSON.parse(
        //   processed_tabular_datalist_str
        // )
        // for (let i = 0;i < processed_tabular_datalist.length;i++) {
        //   let processed_tabular_dataobj = processed_tabular_datalist[i]
        //   processed_tabular_dataobj['content'] = processed_tabular_dataobj['content'].replace(/[?=]/g, '"')
        //   console.log('processed_tabular_datalist_str', processed_tabular_dataobj['content'])
        //   processed_tabular_dataobj['content'] = JSON.parse(processed_tabular_dataobj['content'])
        // }
        // console.log("processed_tabular_datalist", processed_tabular_datalist);

        // processed_tabular_datalist_str = processed_tabular_datalist_str.replace(/'/g, '"')
        // console.log('processed_tabular_datalist_str', processed_tabular_datalist_str)
        // let processed_tabular_datalist = JSON.parse(
        //   processed_tabular_datalist_str
        // );
        // console.log("processed_tabular_datalist", processed_tabular_datalist);
        // sysDatasetObj.updateTabularDatasetList(processed_tabular_datalist);
        //
      }
    );
  },
  mounted: function () {
    let self = this
    this.$bus.$on("visualize-selectedData", () => {
      this.initializeVis = true;
      this.showVisPanel = true;
    });

    this.$bus.$on("update-selected-dataset", () => {
      self.tableViewKey = (self.tableViewKey + 1) % 2
      console.log('update selected dataset')
    })

    this.$bus.$on("select-canvas", () => {
      this.showVisPanel = true;
    });

    this.$bus.$on("show-dialog", (data) => {
      this.showDialog = true;
      this.dialogTitle = data.title;
      this.dialogText = data.text;
    });

    this.$bus.$on("close-data-dialog" , () => {
      this.datasetDialogVisible = false
    })

    this.$bus.$on("close-VisView", () => {
      this.showVisPanel = false;
    });
    this.$bus.$on("change-zoomScale", (value) => {
      this.zoomScale=value;
    });
  },
  methods: {
    iconClass(operation) {
      return "icon-" + operation;
    },
    // closeDataDialog() {
    //   this.datasetDialogVisible = false
    // },
    changeDialogVisible(panel_name) {
      console.log("panel_name", panel_name);
      if (panel_name === "Open Example Data") {
        this.datasetDialogVisible = true;
      }
      if (panel_name === "Upload Your Data") {
      }
      if (panel_name === "Export") {
        this.exportDialogVisible = true;
      }
    },
    ConfirmDialog() {
      this.showDialog = false;
      this.$bus.$emit("confirm-dialog", this.dialogText);
    },
    CancelDialog() {
      this.showDialog = false;
      this.$bus.$emit("cancel-dialog", this.dialogText);
    },
    get_zoom_icon() {
      if (this.isZoomOut) {
        return "./icon/resume.svg";
      } else return "./icon/fitin.svg";
    },
    handle_zoom() {
      this.isZoomOut = !this.isZoomOut;
      this.$bus.$emit("change-zoom");
    },
    handle_zoom_scale(value) {
      this.$bus.$emit("change-zoom", value);
    },
  },
};
</script>

<style lang="less">
@side-panel-width: 20%;
@padding: 0.7rem;
@menu-height: 2.5rem;
@icon-size: 1.4rem;

html {
  font-size: 100%;
}
.zoom-operator {
  position: absolute !important;
  right: 10px !important;
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
  overflow: hidden;
  .el-menu.el-menu--horizontal {
    border-bottom: none;
    .el-menu-item {
      height: @menu-height;
      line-height: @menu-height;
      font-size: 90%;
      padding: 0 10px;
      .icon {
        width: @icon-size;
        height: @icon-size;
      }
    }
    #title {
      font-weight: bolder;
      font-size: 115%;
    }
  }
  .el-slider__runway {
    background-color: white !important;
  }
  .vis-panel-slide-in {
    animation: slide-in 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    transform: translateX(0);
  }
  .vis-panel-slide-out {
    animation: slide-out 0.3s cubic-bezier(0.36, 0.07, 0.19, 0.97);
    transform: translateX(100%);
    transition-delay: display 2s;
  }
  @keyframes slide-out {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }

  .content-container-right-margin {
    transition-delay: 0.3s;
    right: @side-panel-width !important;
  }

  @keyframes slide-in {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  .content-container {
    position: absolute;
    top: @menu-height;
    left: 0;
    bottom: 0;
    right: 0;
    margin-right: @padding;
  }
  svg:not(:root) {
    overflow: visible;
  }
  #vis-panel {
    position: absolute;
    right: 0%;
    width: @side-panel-width;
    top: @menu-height;
    bottom: 0%;
    border-left: solid #efefef 1px;
    background-color: white;
  }

  // scroll bar
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    border-radius: 5px;
  }
  ::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 5px;
    // visibility: hidden;
    &:hover {
      visibility: visible;
    }
  }
}
</style>
