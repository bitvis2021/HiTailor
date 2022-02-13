<template>
  <div>
    <el-divider content-position="right">Encoding</el-divider>
    <div class="encoding-card"></div>
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
  props: ["config", "fields"],
  components: {},
  created() {},
  mounted() {},
  data() {
    return {};
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
.fieldGroupWrap_title {
  margin: 0px !important;
  line-height: 15px !important;
  font-family: "Avenir", Helvetica, Arial, sans-serif !important;
  font-size: 14px !important;
  font-weight: bold !important;
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