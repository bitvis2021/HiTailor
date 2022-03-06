<template>
  <div class="unit-view">
    <div id="unit-chart">
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
      <el-row type="flex" class="row-bg" justify="space-between">
        <el-col :span="6">
          <el-button type="primary" @click="Apply2Vis" size="mini" round plain>
            Apply
          </el-button>
        </el-col>
      </el-row>
    </div>
    <br />

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
          <el-select v-model="shape" placeholder="select">
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
          <el-select v-model="scale" placeholder="select">
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
        </el-row>

        <el-row type="flex" class="row-bg unit-config-box" justify="start">
          <div class="property-text">size:</div>
          <div style="width: 70%">
            <el-slider
              v-model="relativeSize"
              :step="0.01"
              :min="0"
              :max="2"
              @change="PreviewUnitConfig"
            ></el-slider>
          </div>
        </el-row>

        <el-row type="flex" class="row-bg unit-config-box" justify="start">
          <div class="property-text">align:</div>
          <el-radio-group v-model="align" size="small">
            <el-row type="flex" justify="space-around">
              <el-radio-button label="top"></el-radio-button>
            </el-row>
            <el-radio-button label="left"></el-radio-button>
            <el-radio-button label="middle"></el-radio-button>
            <el-radio-button label="right"></el-radio-button>

            <el-row type="flex" justify="space-around">
              <el-radio-button label="bottom"></el-radio-button>
            </el-row>
          </el-radio-group>
        </el-row>
      </div>
    </div>
  </div>
</template>
<script>
import { VisDatabase } from "./VisDatabase";
import { UnitCompiler } from "./UnitCompiler";
export default {
  name: "UnitView",
  components: {},
  props: ["visData_arr"],
  data() {
    return {
      shapes: [
        { value: "circle", label: "circle" },
        { value: "square", label: "square" },
        { value: "triangle", label: "triangle" },
        { value: "diamond", label: "diamond" },
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
    };
  },
  methods: {
    PreviewUnitConfig() {
      let chart = document.getElementById("preview-svg");
      let preview = UnitCompiler.GetUnitDom({
        shape: this.shape,
        color: this.color,
        size: 200 * this.relativeSize,
      });

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
		align: this.align
      };
    },
    CloseChannel(tag) {
      this.enabledEncodings.splice(this.enabledEncodings.indexOf(tag), 1);
      this.disabledEncodings.push(tag);
    },
    AddChannel(tag) {
      this.disabledEncodings.splice(this.disabledEncodings.indexOf(tag), 1);
      this.enabledEncodings.push(tag);
    },
    Apply2Vis() {
      let visData = UnitCompiler.GetUnits(this.visData_arr, this.GetConfig());
      let groupId;

      for (let i = 0; i < visData.length; i++) {
        let position = visData[i].position;
        let dom = visData[i].dom;
        groupId = this.VisDB.AddGroupMember(
          groupId,
          this.VisDB.RenderUnit(
            position.height,
            position.width,
            position.x,
            position.y,
            dom
          )
        );
      }
    },
  },
  mounted() {
    this.PreviewUnitConfig();
  },
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
  }

  .el-dropdown-link {
    cursor: pointer;
    color: #409eff;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }

  #unit-chart {
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

  #unit-config-panel {
    padding: 0px 5px 0px 5px;
    margin-top: 5px;
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
}
</style>
