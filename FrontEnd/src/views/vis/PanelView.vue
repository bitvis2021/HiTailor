<template>
  <div class="panel-view">
    <div class="apply-button">
      <el-row type="flex" class="row-bg" justify="space-around">
        <el-col :span="5">
          <el-button type="primary" @click="Apply2Vis" size="mini" round plain>
            Apply
          </el-button>
        </el-col>
        <el-col :span="15">
          <div>
            <div class="recommend-box">
              <label
                class="property-text"
                style="font-size: 5px; margin-top: 5px;width:35px"
                >direction:</label
              >
              <el-radio-group v-model="directionSelectValue" size="mini"
                ><el-radio-button
                  v-for="direction in directionSelections"
                  :key="direction"
                  :label="direction"
                  >{{ direction.substring(0, 3) }}</el-radio-button
                >
              </el-radio-group>
            </div>
            
            <div class="recommend-box">
              <label
                class="property-text"
                style="font-size: 5px; margin-top: 12px;width:35px"
                >type:</label
              >
              <el-radio-group v-model="typeSelectValue" size="mini" style="margin-top: 11px"
                ><el-radio-button
                  v-for="type in typeSelections"
                  :key="type"
                  :label="type"
                  >{{type}}</el-radio-button
                >
              </el-radio-group>
            </div>

            <div class="recommend-box">
              <label
                class="property-text"
                style="font-size: 5px; margin-top: 10px; width:38px"
                >priority:</label
              >
              <div class="slider">
                <el-slider
                  v-model="prioritySliderValue"  style="margin-top: 8px"
                  range
                  show-stops
                  :min="0"
                  :max="2"
                ></el-slider>
              </div>
            </div>
            
          </div>
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
  props: ["vegaConfig", "selections", "recommendValue"],
  data() {
    return {
      visData: this.vegaConfig.data,
      markJson: this.vegaConfig.mark,
      encodingJson: this.vegaConfig.encoding,
      prioritySliderValue: this.recommendValue.priority,
      directionSelectValue: this.recommendValue.direction,
      directionSelections: ["row", "column"],
      typeSelectValue: this.recommendValue.type,
      typeSelections: ["name", "subtree"],
    };
  },
  watch: {
    vegaConfig(newVal, oldVal) {
      this.encodingJson = newVal.encoding;
      this.markJson = newVal.mark;
    },
    selections(newVal, oldVal) {
      this.selections = newVal;
    },
    prioritySliderValue(newVal, oldVal) {
      this.$bus.$emit("transmit-prioritySliderValue", newVal);
    },
    directionSelectValue(newVal, oldVal) {
      this.$bus.$emit("transmit-directionSelectValue", newVal);
    },
    typeSelectValue(newVal, oldVal) {
      this.$bus.$emit("transmit-typeSelectValue", newVal);
    },
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
  mounted() {
    // this.$bus.$on("transmit-recommend-value-to-panel", (priority, type, direction) => {
    //   this.prioritySliderValue = priority
    //   this.typeSelectValue = type
    //   this.directionSelectValue = direction
    // })
    this.$bus.$on("transmit-value-after-changing-recommend-direction", (priority, type) => {
      this.prioritySliderValue = priority
      this.typeSelectValue = type
    })
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
.panel-view {
  // position: absolute;
  left: 0%;
  width: 100%;
  top: 0%;
  height: 100%;
  .apply-button {
    // position: absolute;
    left: 0%;
    width: 100%;
    height: 8%;
    top: 0%;
    z-index: 100;
    background-color: white;
    margin-top: 15px;
    margin-bottom: 5px;
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
    // &:hover::-webkit-scrollbar-thumb {
    //   visibility: visible;
    // }
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
  .recommend-box {
    text-align: left;
    display: flex;
    margin-top: -5px;
    .el-slider__button {
      width: 8px !important;
      height: 8px !important;
      border-radius: 50% !important;
      transition: 0s !important;
    }
    .el-checkbox-button__inner {
      padding-top: 4px !important;
      padding-bottom: 4px !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      // font-size: 1px !important;
    }
    .el-radio-button__inner {
      padding-top: 4px !important;
      padding-bottom: 4px !important;
      padding-left: 8px !important;
      padding-right: 8px !important;
      // font-size: 1px !important;
    }
    .el-checkbox-group {
      display: inline;
    }
    .el-radio-group {
      display: inline;
    }
    .slider {
      display: inline !important;
      margin-top: -8px;
      width: 100px;
    }
    .el-slider__runway {
      width: 80% !important;
    }
  }
}
</style>
