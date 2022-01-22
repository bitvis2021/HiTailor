<template>
  <div>
    <div id="panel">
      <el-button type="text" icon="el-icon-circle-plus">Add layer</el-button>
      <div class="layer">
        Mark
        <el-select v-model="vegaConfig.mark" placeholder="Select">
          <el-option
            v-for="item,index in mark"
            :key="index"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
        <br />
        <el-button type="text" icon="el-icon-s-operation"></el-button>
        <div class="encodings">
          <div class="encoding">
            X
            <br />
            <div class="property">
              field
              <el-select v-model="vegaConfig.encoding.x.field" placeholder="Select">
                <el-option
                  v-for="(item, index) in field"
                  :key="index"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
              <br />
            </div>
            <div class="property">
              type
              <el-select v-model="vegaConfig.encoding.x.type" placeholder="Select">
                <el-option
                  v-for="(item, index) in type"
                  :key="index"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
              <br />
            </div>
            <el-dropdown size="mini" split-button>
              Add property
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>scale</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <hr />

          <div class="encoding">
            Y
            <br />
            <div class="property">
              field
              <el-select v-model="vegaConfig.encoding.y.field" placeholder="Select">
                <el-option
                  v-for="(item, index) in field"
                  :key="index"
                  :label="item"
                  :value="item"
                ></el-option
              ></el-select>
              <br />
            </div>
            <div class="property">
              type
              <el-select v-model="vegaConfig.encoding.y.type" placeholder="Select">
                <el-option
                  v-for="(item, index) in type"
                  :key="index"
                  :label="item"
                  :value="item"
                ></el-option>
              </el-select>
              <br />
            </div>
            <el-dropdown size="mini" split-button>
              Add property
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>scale</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>

            <div class="add-encoding">
              <el-dropdown
                split-button
                szie="small"
                type="primary"
                @click="handleClick"
              >
                Add encoding
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item>黄金糕</el-dropdown-item>
                    <el-dropdown-item>狮子头</el-dropdown-item>
                    <el-dropdown-item>螺蛳粉</el-dropdown-item>
                    <el-dropdown-item>双皮奶</el-dropdown-item>
                    <el-dropdown-item>蚵仔煎</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown-menu>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
      <el-button type="text" @click="ApplyConfig">Apply</el-button>
    </div>
  </div>
</template>
<script>
import ElementUI from "element-ui";

export default {
  name: "PanelView",
  props: {
    vegaData: {
      type: Object,
    },
  },
  data() {
    return {
      value1: 10,
      mark: ["bar", "point", "line"],
      selected_mark: "",
      field: [
        "Species",
        "Island",
        "Beak Length (mm)",
        "Beak Depth (mm)",
        "Flipper Length (mm)",
        "Body Mass (g)",
        "Sex",
      ],
      type: ["quantitavie", "temporal", "ordinal", "nomianl"],
      vegaConfig: this.vegaData,
    };
  },
  methods: {
    ApplyConfig() {
      this.$emit("update-config", this.vegaConfig);
    },
  },
  mounted() {},
};
</script>
<style lang="css">
#panel {
  width: 20%;
  height: 30%;
  margin: 30px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  background-color: white;
  filter: drop-shadow(5px 5px 10px #00000055);
  border-radius: 10px;
  text-align: left;
}
.encodings {
  border-color: rgb(200, 203, 210);
  border-style: solid;
  border-width: thin;
  padding-left: 3%;
  padding-right: 3%;
  padding-top: 2%;
  padding-bottom: 2%;
  border-radius: 10px;
}
.encoding {
  padding: 2%;
}
.property {
  margin-top: 4%;
  margin-bottom: 4%;
}
.add-encoding {
  text-align: right;
  padding-top: 4%;
}
</style>