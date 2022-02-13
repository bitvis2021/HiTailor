<template>
  <div>
    <el-divider content-position="right">Encoding</el-divider>
    <div class="encoding-card">
      <div v-for="(encoding, key) in this.encodings" :key="key + encoding.name">
        <el-row>
          {{ InitialUpper(encoding.name) }}
        </el-row>
        <br />
        <div
          v-for="property in encoding.properties"
          :key="encoding.name + property.name"
        >
          <el-row type="flex" class="row-bg" justify="space-between">
            <span class="propertyText">
              {{ property.name + ":" }}
            </span>

            <el-select
              v-if="property.type == 'select'"
              v-model="config[encoding.name][property.name]"
              placeholder="select..."
            >
              <el-option
                v-for="(item, key) in property.selections"
                :key="encoding.name + property.name + item + key"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
            <!-- else if -->
          </el-row>
          <br />
        </div>
        <el-row type="flex" class="add-operation" justify="start">
          <el-dropdown>
            <span class="el-dropdown-link">
              <i class="el-icon-circle-plus"></i> Add Property
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>1</el-dropdown-item>
              <el-dropdown-item disabled>2</el-dropdown-item>
              <el-dropdown-item divided>3</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-row>
        <br />
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
export default {
  name: "EncodingView",
  props: ["config", "schema"],
  components: {},
  created() {},
  mounted() {
    console.log(this.schema);
  },
  data() {
    return {
      encodings: this.schema,
      config: this.config,
    };
  },
  methods: {
    InitialUpper(word) {
      return word.toUpperCase()[0] + word.slice(1);
    },
    ApplyConfig() {
      this.$emit("apply-config", this.encodingForm.encoding);
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