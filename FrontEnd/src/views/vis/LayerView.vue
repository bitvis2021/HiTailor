<template>
  <div class="layer">
    <div class="encodings">
      Mark
      <br />
      type
      <el-select v-model="layerConfig.mark" placeholder="Select">
        <el-option
          v-for="(item, index) in mark"
          :key="index"
          :label="item"
          :value="item"
        >
        </el-option>
      </el-select>
    </div>
    <br />
    <div v-if="'encoding' in layerConfig" class="encodings">
      <div class="encoding">
        X
        <br />
        <div class="property">
          field
          <el-select
            v-model="layerConfig.encoding.x.field"
            placeholder="Select"
          >
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
          <el-select
            v-model="layerConfig.encoding.y.field"
            placeholder="Select"
          >
            <el-option
              v-for="(item, index) in field"
              :key="index"
              :label="item"
              :value="item"
            ></el-option
          ></el-select>
          <br />
        </div>

        <el-dropdown size="mini" split-button>
          Add property
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>scale</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
    <el-dropdown class="property">
      <span class="el-dropdown-link">
        <i class="el-icon-circle-plus"></i> Add Encoding
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item>黄金糕</el-dropdown-item>
        <el-dropdown-item>狮子头</el-dropdown-item>
        <el-dropdown-item>螺蛳粉</el-dropdown-item>
        <el-dropdown-item disabled>双皮奶</el-dropdown-item>
        <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>
<script>
import { mapState, mapMutations } from 'vuex';
export default {
  name: "LayerView",
  props: { index: { type: Number }, parent: { type: Object } },
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

      editableTabsValue: "2",
    };
  },
  methods: {},
  computed: {
    ...mapState(['currentVegaJson']),
    layerConfig() {
      if (this.index == undefined) {
        return this.currentVegaJson;
      } else {
        return this.currentVegaJson.layer[this.index];
      }
    },
  },
  mounted() {},
};
</script>
<style lang="less">
.encodings {
  border-color: rgb(200, 203, 210);
  border-style: solid;
  border-width: thin;
  border-radius: 10px;
}
</style>