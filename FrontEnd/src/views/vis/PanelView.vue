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
    <div id="layer">
      <mark-view
        :config="this.markJson"
        v-on:apply-config="ApplyMark"
      ></mark-view>
      <encoding-view
        :config="this.encodingJson"
        :selections="this.selections"
        v-on:apply-config="ApplyEncoding"
      ></encoding-view>
    </div>
  </div>
</template>
<script>
import MarkView from "./MarkView.vue";
import EncodingView from "./EncodingView.vue";

export default {
  name: "PanelView",
  components: { MarkView, EncodingView },
  props: ["vegaConfig", "selections"],
  data() {
    return {
      visData: this.vegaConfig.data,
      markJson: this.vegaConfig.mark,
      encodingJson: this.vegaConfig.encoding,
    };
  },
  methods: {
    // like v-model. submit the modified data to visView
    Apply2Vis() {
      this.$emit("apply-vis");
    },
    ApplyMark(data) {
      this.markJson = data;
      this.EmitVegaConfig();
    },
    ApplyEncoding(data) {
      this.encodingJson = data;
      this.EmitVegaConfig();
    },
    EmitVegaConfig() {
      this.$emit("apply-config", {
        data: this.visData,
        mark: this.markJson,
        encoding: this.encodingJson,
      });
    },
  },
  mounted() {},
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
    margin-top: 5px;
  }
  #layer {
    height: 100px;
    overflow: scroll;
    height: 65vh;
    padding: 5px;
    &::-webkit-scrollbar {
      width: 5px;
      height: 5px;
      background: rgb(255, 255, 255);
      border-radius: 5px;
      // height: 8px;
    }
    &:hover::-webkit-scrollbar-thumb {
      background-color: #dcdfe6;
      border-radius: 5px;
    }
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
}
</style>
