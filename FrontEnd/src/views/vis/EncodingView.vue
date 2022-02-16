<template>
  <div>
    <el-divider content-position="right">Encoding</el-divider>
    <div class="encoding-card">
      <div
        v-for="(encoding, eName) in this.schema"
        :key="eName + encoding.name"
      >
        <div>
          {{ eName }}
        </div>
        <br />
        <el-row
          type="flex"
          class="row-bg"
          justify="space-between"
          v-for="(property, key) in encoding"
          :key="key + property.name"
        >
          <span class="propertyText">
            {{ property.name + ":" }}
          </span>
          <el-select
            v-if="property.type == 'select'"
            v-model="property.value"
            @change="ApplyConfig"
            placeholder="select..."
          >
            <el-option
              v-for="item in property.selections"
              :key="eName + item"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
          <br />
          <br />
        </el-row>
        <el-divider></el-divider>
        <br />
      </div>
    </div>
    <el-row type="flex" class="add-operation" justify="start">
      <el-dropdown>
        <span class="el-dropdown-link">
          <i class="el-icon-circle-plus"></i> Add Encoding
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>1</el-dropdown-item>
          <el-dropdown-item disabled>2</el-dropdown-item>
          <el-dropdown-item divided>3</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </el-row>
  </div>
</template>
<script>
import { EncodingCompiler } from "./SchemaCompiler";
export default {
  name: "EncodingView",
  props: ["config", "selections"],
  components: {},
  created() {},
  mounted() {
    this.EC = new EncodingCompiler(this.config, this.selections);
    this.schema = this.EC.GetSchema();
  },
  data() {
    return {
      encoding: this.config,
      schema: {},
      EC: {},
    };
  },
  methods: {
    InitialUpper(word) {
      return word.toUpperCase()[0] + word.slice(1);
    },
    ApplyConfig() {
      this.encoding = this.EC.GetVegaConfig(this.schema);
      this.$emit("apply-config", this.encoding);
    },
  },
  computed: {},
};
</script>
<style lang="less">
.propertyText {
  font-size: 14px;
  line-height: 15px;
  height: 28px;
  padding: 0 12px 0 0;
  margin: 0px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #606266;
}
.fieldGroupWrap_title {
  margin: 0px !important;
  line-height: 15px !important;
  font-family: "Avenir", Helvetica, Arial, sans-serif !important;
  font-size: 14px !important;
}
.genFormLabel {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
}
.encoding-card {
  border-style: none !important;
  padding: 10px 10px 0px 10px;
}
.el-divider--horizontal {
  margin: 0px !important;
}
.add-operation {
  padding-left: 10px;
  .el-dropdown-link {
    font-size: 12px !important;
    color: #409eff;
  }
}
</style>