<template>
  <div class="unit-view">
    <div class="unit-chart">
      <svg viewBox="0 0 1000 1000">
        <line
          x1="-1000"
          y1="300"
          x2="2000"
          y2="300"
          style="stroke: #dddddd; stroke-width: 4"
        />
        <line
          x1="-1000"
          y1="700"
          x2="2000"
          y2="700"
          style="stroke: #dddddd; stroke-width: 4"
        />
        <line
          x1="150"
          y1="-1000"
          x2="150"
          y2="2000"
          style="stroke: #dddddd; stroke-width: 4"
        />
        <line
          x1="850"
          y1="-1000"
          x2="850"
          y2="2000"
          style="stroke: #dddddd; stroke-width: 4"
        />

        <g
          id="preview-svg"
          height="400"
          width="700"
          transform="translate(150,300)"
          style="stroke: #dddddd; stroke-width: 4; fill: transparent"
        ></g>
      </svg>
    </div>
    <div class="apply-button">
      <el-row type="flex" class="row-bg" justify="space-around">
        <el-col :span="6">
          <el-button type="primary" @click="Apply2Vis" size="mini" round plain>
            Apply
          </el-button> </el-col
        ><el-col :span="18">
          <div>
            <div class="recommend-box">
              <label
                class="property-text"
                style="
                  font-size: 5px;
                  margin-right: 0px;
                  margin-top: 2px;
                  margin-left: 0px;
                "
                >priority:</label
              >
              <div class="slider">
                <el-slider
                  v-model="prioritySliderValue"
                  range
                  show-stops
                  :min="0"
                  :max="5"
                ></el-slider>
              </div>
              <label
                class="property-text"
                style="
                  font-size: 5px;
                  margin-right: -5px;
                  margin-top: 2px;
                  margin-left: 0px;
                "
                >direction:</label
              >
              <el-checkbox-group v-model="directionSelectValue">
                <el-checkbox-button
                  v-for="direction in directionSelections"
                  :key="direction"
                  :label="direction"
                  >{{ direction.substring(0, 3) }}</el-checkbox-button
                >
              </el-checkbox-group>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div id="unit-config-panel">
      <el-divider content-position="left">Unit Config</el-divider>
      <div style="margin-top: 25px">
        <div class="encoding-tags">
          <el-dropdown style="margin: 1%" @command="AddChannel">
            <el-button type="text" size="mini">
              <i class="el-icon-circle-plus"></i> Encoding Channel
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="disabledEncoding in disabledEncodings"
                :key="disabledEncoding.name"
                :command="disabledEncoding"
                @change="PreviewUnitConfig"
                >{{ disabledEncoding.name }}</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>

          <el-tag
            style="margin: 1%"
            size="small"
            v-for="tag in enabledEncodings"
            :key="tag.name"
            closable
            @close="CloseChannel(tag)"
          >
            {{ tag.name }}
          </el-tag>
        </div>

        <el-row type="flex" class="row-bg unit-config-box" justify="start">
          <div class="property-text">shape:</div>
          <el-select
            v-model="shape"
            placeholder="select"
            @change="PreviewUnitConfig"
          >
            <el-option
              v-for="item in shapes"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-row>

        <el-row type="flex" class="row-bg unit-config-box" justify="start">
          <div class="property-text">scale:</div>
          <el-select
            v-model="scale"
            placeholder="select"
            @change="PreviewUnitConfig"
          >
            <el-option
              v-for="item in scales"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </el-row>

        <el-row type="flex" class="row-bg unit-config-box" justify="start">
          <div class="property-text">color:</div>
          <el-color-picker v-model="color" @change="PreviewUnitConfig">
          </el-color-picker>
          <div class="color-legend" v-show="showColorLegend">
            <div style="margin-top: -20px">
              <span
                style="
                  font-size: 3px;
                  font-family: 'Avenir', Helvetica, Arial, sans-serif;
                  color: #606266;
                  margin-top: -30px;
                "
                >legend</span
              >
            </div>
            <svg id="color-seq" width="100" height="20"></svg>
            <div style="margin-top: -10px">
              <span
                style="
                  font-size: 3px;
                  font-family: 'Avenir', Helvetica, Arial, sans-serif;
                  color: #606266;
                  margin-top: -30px;
                "
                >min</span
              >
              <span
                style="
                  font-size: 3px;
                  font-family: 'Avenir', Helvetica, Arial, sans-serif;
                  color: #606266;
                  margin-top: -30px;
                  margin-left: 60px;
                "
                >max</span
              >
            </div>
          </div>
        </el-row>

        <el-row type="flex" class="row-bg unit-config-box" justify="start">
          <div class="property-text">size:</div>
          <div style="width: 70%">
            <el-slider
              v-model="relativeSize"
              :step="0.01"
              :min="0"
              :max="3"
              @input="PreviewUnitConfig"
            ></el-slider>
          </div>
        </el-row>

        <el-row type="flex" class="row-bg unit-config-box" justify="start">
          <div class="property-text">align:</div>
          <el-radio-group
            v-model="align"
            size="medium"
            @change="PreviewUnitConfig"
          >
            <div style="text-align: center; position: absolute; left: 112px">
              <el-radio-button label="top" size="mini">
                <svg
                  class="icon"
                  width="12px"
                  height="12px"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#515151"
                    d="M896 0H128C57.43 0 0 57.43 0 128v768c0 70.57 57.43 128 128 128h768c70.57 0 128-57.43 128-128V128c0-70.57-57.43-128-128-128z m42.664 896c0 23.554-19.156 42.664-42.664 42.664H128c-23.508 0-42.664-19.11-42.664-42.664V128c0-23.554 19.156-42.664 42.664-42.664h768c23.508 0 42.664 19.11 42.664 42.664z m0 0M778.664 170.664H245.336c-41.18 0-74.672 33.492-74.672 74.672v149.328c0 41.18 33.492 74.672 74.672 74.672h533.328c41.18 0 74.672-33.492 74.672-74.672v-149.328c0-41.18-33.492-74.672-74.672-74.672z m0 0"
                  /></svg
              ></el-radio-button>
            </div>
            <div style="text-align: center; position: absolute; top: 40px">
              <el-radio-button label="left" size="mini"
                ><svg
                  class="icon"
                  width="12px"
                  height="12px"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#515151"
                    d="M896 0H128C57.43 0 0 57.43 0 128v768c0 70.57 57.43 128 128 128h768c70.57 0 128-57.43 128-128V128c0-70.57-57.43-128-128-128z m42.664 896c0 23.554-19.156 42.664-42.664 42.664H128c-23.508 0-42.664-19.11-42.664-42.664V128c0-23.554 19.156-42.664 42.664-42.664h768c23.508 0 42.664 19.11 42.664 42.664z m0 0M394.664 170.664h-149.328c-41.18 0-74.672 33.492-74.672 74.672v533.328c0 41.18 33.492 74.672 74.672 74.672h149.328c41.18 0 74.672-33.492 74.672-74.672V245.336c0-41.18-33.492-74.672-74.672-74.672z m0 0"
                  /></svg
              ></el-radio-button>
              <el-radio-button label="middle" size="mini"
                ><svg
                  class="icon"
                  width="12px"
                  height="12px"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#515151"
                    d="M42.664 341.336c23.594 0 42.672-19.08 42.672-42.672V128c0-23.554 19.11-42.664 42.664-42.664h170.664c23.594 0 42.672-19.08 42.672-42.672S322.256 0 298.664 0H128C57.43 0 0 57.43 0 128v170.664c0 23.594 19.07 42.672 42.664 42.672z m0 0M981.336 682.664c-23.594 0-42.672 19.08-42.672 42.672V896c0 23.554-19.11 42.664-42.664 42.664h-170.664c-23.594 0-42.672 19.08-42.672 42.672S701.744 1024 725.336 1024H896c70.57 0 128-57.43 128-128v-170.664c0-23.594-19.07-42.672-42.664-42.672z m0 0M298.664 938.664H128c-23.554 0-42.664-19.11-42.664-42.664v-170.664c0-23.594-19.08-42.672-42.672-42.672S0 701.744 0 725.336V896c0 70.57 57.43 128 128 128h170.664c23.594 0 42.672-19.07 42.672-42.664s-19.08-42.672-42.672-42.672z m0 0M896 0h-170.664c-23.594 0-42.672 19.07-42.672 42.664s19.08 42.672 42.672 42.672H896c23.554 0 42.664 19.11 42.664 42.664v170.664c0 23.594 19.08 42.672 42.672 42.672S1024 322.256 1024 298.664V128c0-70.57-57.43-128-128-128z m0 0M213.336 330.664v362.672c0 64.726 52.6 117.328 117.328 117.328h362.672c64.726 0 117.328-52.6 117.328-117.328V330.664c0-64.726-52.6-117.328-117.328-117.328H330.664c-64.726 0-117.328 52.6-117.328 117.328z m0 0"
                  /></svg
              ></el-radio-button>
              <el-radio-button label="right" size="mini"
                ><svg
                  class="icon"
                  width="12px"
                  height="12px"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#515151"
                    d="M896 0H128C57.43 0 0 57.43 0 128v768c0 70.57 57.43 128 128 128h768c70.57 0 128-57.43 128-128V128c0-70.57-57.43-128-128-128z m42.664 896c0 23.554-19.156 42.664-42.664 42.664H128c-23.508 0-42.664-19.11-42.664-42.664V128c0-23.554 19.156-42.664 42.664-42.664h768c23.508 0 42.664 19.11 42.664 42.664z m0 0M778.664 170.664h-149.328c-41.18 0-74.672 33.492-74.672 74.672v533.328c0 41.18 33.492 74.672 74.672 74.672h149.328c41.18 0 74.672-33.492 74.672-74.672V245.336c0-41.18-33.492-74.672-74.672-74.672z m0 0"
                  /></svg
              ></el-radio-button>
            </div>
            <div
              style="
                text-align: center;
                position: absolute;
                top: 80px;
                left: 112px;
              "
            >
              <el-radio-button label="bottom" size="mini"
                ><svg
                  class="icon"
                  width="12px"
                  height="12px"
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill="#515151"
                    d="M896 0H128C57.43 0 0 57.43 0 128v768c0 70.57 57.43 128 128 128h768c70.57 0 128-57.43 128-128V128c0-70.57-57.43-128-128-128z m42.664 896c0 23.554-19.11 42.664-42.664 42.664H128c-23.554 0-42.664-19.11-42.664-42.664V128c0-23.554 19.11-42.664 42.664-42.664h768c23.554 0 42.664 19.11 42.664 42.664z m0 0M778.664 554.664H245.336c-41.18 0-74.672 33.492-74.672 74.672v149.328c0 41.18 33.492 74.672 74.672 74.672h533.328c41.18 0 74.672-33.492 74.672-74.672v-149.328c0-41.18-33.492-74.672-74.672-74.672z m0 0"
                  /></svg
              ></el-radio-button>
            </div>
          </el-radio-group>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import { VisDatabase } from "./VisDatabase";
import { UnitCompiler, getColorFunction } from "./UnitCompiler";
export default {
  name: "UnitView",
  components: {},
  props: ["visData_arr", "figID", "newUnit"],
  data() {
    return {
      shapes: [
        { value: "circle", label: "circle" },
        { value: "square", label: "square" },
        { value: "triangle", label: "triangle" },
      ],
      scales: [
        { value: "linear", label: "linear" },
        { value: "pow", label: "pow" },
        { value: "log", label: "log" },
        { value: "sqrt", label: "sqrt" },
      ],
      scale: "linear",
      shape: "circle",
      color: "#4e78a5",
      relativeSize: 0.8,
      disabledEncodings: [
        { name: "color" },
        { name: "height" },
        { name: "width" },
        { name: "xOffset" },
        { name: "yOffset" },
      ],
      enabledEncodings: [{ name: "size" }, { name: "opacity" }],
      align: "middle",
      VisDB: new VisDatabase(this.$bus),
      visData: this.visData_arr,
      showColorLegend: false,

      prioritySliderValue: [0, 5],
      directionSelectValue: ["row", "column"],
      directionSelections: ["row", "column"],
    };
  },
  watch: {
    visData_arr(newVal, oldVal) {
      // TODO change panel when new config comes
    },
    prioritySliderValue(newVal, oldVal) {
      this.$bus.$emit("transmit-prioritySliderValue", newVal);
    },
    directionSelectValue(newVal, oldVal) {
      this.$bus.$emit("transmit-directionSelectValue", newVal);
    },
  },
  methods: {
    PreviewUnitConfig() {
      let chart = document.getElementById("preview-svg");
      let encodings = {};
      this.disabledEncodings.forEach((element) => {
        encodings[element.name] = false;
      });
      this.enabledEncodings.forEach((element) => {
        encodings[element.name] = true;
      });

      let config = this.GetConfig();
      let height = 200;
      let width = 350;

      config.size = height * 0.5;
      config.height = height * 0.5;
      config.width = height * 0.5;

      config.xOffset = 0;
      config.yOffset = 0;
      config.frameHeight = 400;
      config.frameWidth = 700;

      if (config.encodings.size) {
        config.size = height * this.relativeSize;
        config.height = height * this.relativeSize;
        config.width = height * this.relativeSize;
      }
      if (config.encodings.height) {
        config.height = height * this.relativeSize;
      }
      if (config.encodings.width) {
        config.width = width * this.relativeSize;
      }

      if (config.encodings.xOffset) {
        config.xOffset = 100;
      }
      if (config.encodings.yOffset) {
        config.yOffset = 100;
      }

      if (config.encodings.opacity) {
        config.opacity = 0.8;
      }

      if (config.encodings.color) {
        this.ShowMappedColor();
      } else {
        this.showColorLegend = false;
      }

      let preview = UnitCompiler.GetUnitDom(config);

      preview.setAttribute("transform", "translate(350,200)");

      if (chart.childElementCount == 0) {
        chart.appendChild(preview);
      } else {
        chart.childNodes[chart.childElementCount - 1].replaceWith(preview);
      }
    },
    GetConfig() {
      let encodings = {};
      this.disabledEncodings.forEach((element) => {
        encodings[element.name] = false;
      });
      this.enabledEncodings.forEach((element) => {
        encodings[element.name] = true;
      });
      return {
        encodings: encodings,
        shape: this.shape,
        color: this.color,
        relativeSize: this.relativeSize,
        scale: this.scale,
        align: this.align,
      };
    },
    CloseChannel(tag) {
      this.enabledEncodings.splice(this.enabledEncodings.indexOf(tag), 1);
      this.disabledEncodings.push(tag);
      this.PreviewUnitConfig();
    },
    AddChannel(tag) {
      this.disabledEncodings.splice(this.disabledEncodings.indexOf(tag), 1);
      this.enabledEncodings.push(tag);
      this.PreviewUnitConfig();
    },
    ShowMappedColor() {
      this.showColorLegend = true;
      let interpolator = getColorFunction(this.color);
      let id = "color-seq";

      d3.select("#" + id)
        .selectAll("*")
        .remove();

      let data = Array.from(Array(100).keys());
      let cScale = d3
        .scaleSequential()
        .interpolator(interpolator)
        .domain([0, 99]);
      let xScale = d3.scaleLinear().domain([0, 99]).range([0, 100]);
      d3.select("#" + id)
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", (d) => Math.floor(xScale(d)))
        .attr("y", 0)
        .attr("height", 20)
        .attr("width", (d) => {
          if (d == 99) {
            return 6;
          }
          return Math.floor(xScale(d + 1)) - Math.floor(xScale(d)) + 1;
        })
        .attr("fill", (d) => cScale(d));
    },
    Apply2Vis() {
      this.visData = UnitCompiler.GetUnits(this.visData_arr, this.GetConfig());
      // Use parents' figID to detect whether we should generate new data, and preserver current ID by using variable local
      if (!!this.figID && this.figID !== "") {
        for (let i = 0; i < this.visData.length; i++) {
          let db = this.VisDB.database[this.visData[i].id];
          this.VisDB.RerenderCanvas(
            this.visData[i].id,
            db.x,
            db.y,
            db.height,
            db.width,
            this.visData[i].dom
          );
        }
      } else {
        let groupId;
        let ID;
        for (let i = 0; i < this.visData.length; i++) {
          let position = this.visData[i].position;
          let dom = this.visData[i].dom;
          ID = this.VisDB.GenUnit(
            position.height,
            position.width,
            position.x,
            position.y,
            dom,
            this.visData[i].value
          );
          if (ID) {
            this.visData[i].id = ID;
            groupId = this.VisDB.AddGroupMember(groupId, ID);
          }
        }
        this.figID = ID;
      }

      this.$bus.$emit("apply-config");
    },
  },
  mounted() {},
  beforeDestroy() {},
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
.unit-view {
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
    margin-bottom: 5px;
    margin-top: 15px;
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }

  #unit-config-panel {
    padding: 0px 5px 0px 5px;
    margin-top: 20px;
    border-radius: 10px;
    text-align: left;
    top: 5%;
  }

  .unit-config-box {
    margin-top: 15px;
    margin-bottom: 15px;
    margin-right: 5px;
    margin-left: 10px;
    padding-right: 5px;
  }

  .encoding-tags {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-right: 5px;
    margin-left: 5px;
  }
  .color-legend {
    margin-left: 10px;
    margin-top: 10px;
    margin-bottom: -10px;
  }
  .recommend-box {
    text-align: left;
    text-align: left;
    display: flex;
    margin-top: 3px;
    .el-slider__button {
      width: 8px !important;
      height: 8px !important;
    }
    .el-checkbox-button__inner {
      padding-top: 3px !important;
      padding-bottom: 3px !important;
      padding-left: 5px !important;
      padding-right: 5px !important;
      font-size: 1px !important;
    }
    .el-checkbox-group {
      display: inline;
    }
    .slider {
      display: inline !important;
      margin-top: -8px;
      width: 4vw;
    }
    .el-slider__runway {
      width: 80% !important;
    }
  }
}
</style>
