<template>
  <div class="panel-view">
    <div id="apply-button">
      <el-row type="flex" class="row-bg" justify="space-between">
        <el-col :span="6">
          <el-button type="primary" size="mini" round plain>
            Apply
          </el-button>
        </el-col>
        <el-col :span="8">
          <el-button type="text" size="mini">
            <i class="el-icon-circle-plus"></i>Add Layer
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div id="panel">
      <layer-view :config="chartDec"></layer-view>
    </div>
  </div>
</template>
<script>
import ElementUI from "element-ui";
import LayerView from "./LayerView.vue";

export default {
  components: { LayerView },
  name: "PanelView",
  data() {
    return {
      editableTabs: [],
      editableTabsValue: "",
      chartDec: {
        data: {
          url: "http://localhost:8080/penguins.json",
        },
        mark: "point",
        encoding: {
          x: {
            field: "Flipper Length (mm)",
            type: "quantitative",
            scale: { zero: false },
            axis: { labels: false, ticks: false, title: null },
          },
          y: {
            field: "Body Mass (g)",
            type: "quantitative",
            scale: { zero: false },
            axis: { labels: false, ticks: false, title: null },
          },
          color: { field: "Species", type: "nominal", legend: false },
          shape: { field: "Species", type: "nominal", legend: false },
        },
      },
    };
  },
  computed: {},
  methods: {
    ApplyConfig() {
      this.$bus.$emit("apply-config", 500, 200, 0, 0);
    },
    AddTab() {
      let newTabName = "layer" + ++this.tabIndex;
      this.editableTabs.push({
        title: newTabName,
        name: newTabName,
      });
      this.editableTabsValue = newTabName;
      if (this.tabIndex == 1) {
        // json not having layer to having layer
        this.currentVegaJson.layer = [
          {
            mark: this.currentVegaJson.mark,
            encoding: this.currentVegaJson.encoding,
          },
        ];
        delete this.currentVegaJson.mark;
        delete this.currentVegaJson.encoding;

        this.currentVegaJson.layer.push({ mark: "point" });

        this.AddTab(newTabName);
      }
    },
    CloseTab(name) {
      this.tabIndex = this.tabIndex - 1;
      let delIndex = this.editableTabs.length;
      for (let index = 0; index < this.editableTabs.length; index++) {
        if (this.editableTabs[index].name === name) {
          delIndex = index;
        }
        if (index > delIndex) {
          let newTabName = "layer" + index;
          this.editableTabs[index].title = newTabName;
          this.editableTabs[index].name = newTabName;
        }
      }
      this.editableTabs.splice(delIndex, 1);

      // json having layer to not having layer
      if (this.tabIndex == 1) {
        this.currentVegaJson.mark = this.currentVegaJson.layer[0].mark;
        this.currentVegaJson.encoding = this.currentVegaJson.layer[0].encoding;
        delete this.currentVegaJson.layer;
        this.CloseTab(this.editableTabs[0].name);
      }
    },
  },
  mounted() {
    // console.log('thischart',this.chartDec)
    this.$bus.$emit(
      "preview-config",
      JSON.parse(JSON.stringify(this.chartDec))
    );
  },
};
</script>
<style lang="less">
.panel-view {
  position: absolute;
  left: 0%;
  width: 100%;
  top: 0%;
  height: 100%;
  #apply-button {
    position: absolute;
    left: 0%;
    width: 100%;
    height: 5%;
    top: 0%;
    // padding: 0px 5px 0px 5px;
    border-bottom: solid #efefef 1px;
  }
  #panel {
    position: absolute;
    // margin: 0px 5px 0px 5px;
    padding: 0px 5px 0px 5px;
    border-radius: 10px;
    text-align: left;
    top: 5%;
    max-height: 95%;
    overflow: scroll;
    &::-webkit-scrollbar {
      width: 5px;
      background: rgb(255, 255, 255);
      border-radius: 5px;
      // height: 8px;
    }
    &:hover::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 5px;
    }
  }
  #add-layer {
    position: absolute;
    right: 10%;
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .el-tabs__item {
    padding: 0 10px !important;
    height: 20px !important;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    line-height: 15px !important;
    display: inline-block;
    list-style: none;
    font-size: 8px !important;
    font-weight: 500;
    color: #303133;
    position: relative;
  }
}
</style>