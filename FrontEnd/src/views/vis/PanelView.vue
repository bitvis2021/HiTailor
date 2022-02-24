<template>
  <div class="panel-view">
    <div id="apply-button">
      <el-row type="flex" class="row-bg" justify="space-between">
        <el-col :span="6">
          <el-button type="primary" @click="Apply2Vis" size="mini" round plain>
            Apply
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div id="panel">
      <layer-view
        :selections="this.selections"
        :vegaConfig="this.vegaConfig"
        v-on:apply-config="this.ApplyConfig"
      ></layer-view>
    </div>
  </div>
</template>
<script>
import LayerView from "./LayerView.vue";

export default {
  components: { LayerView },
  name: "PanelView",
  props: ["vegaConfig", "selections"],
  data() {
    return {
      editableTabs: [],
      editableTabsValue: "",
    };
  },
  methods: {
    // like v-model. submit the modified data to visView
    Apply2Vis() {
      this.$emit("apply-vis");
    },
    ApplyConfig(data) {
      this.$emit("apply-config", data);
    }
  },
  mounted() {
  },
};
</script>
<style lang="less">
@input-height: 28px;
.el-input__inner {
  height: @input-height !important;
  line-height: @input-height !important;
}
.el-form-item__label {
  height: @input-height !important;
  line-height: @input-height !important;
}
.el-input__icon {
  height: @input-height !important;
  line-height: @input-height !important;
}
.el-form-item__content {
  line-height: @input-height !important;
}
</style>
<style scoped lang="less">
.panel-view {
  // position: absolute;
  left: 0%;
  width: 100%;
  top: 0%;
  height: 100%;
  #apply-button {
    // position: absolute;
    left: 0%;
    width: 100%;
    height: 8%;
    top: 0%;
    z-index: 100;
    background-color: white;
    // padding: 0px 5px 0px 5px;
    // border-bottom: solid #efefef 1px;
  }
  #panel {
    // position: absolute;
    padding: 0px 5px 0px 5px;
    border-radius: 10px;
    text-align: left;
    top: 5%;
    height: 60vh;
    overflow: scroll;
    margin-top: 5px;
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
    // position: absolute;
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
