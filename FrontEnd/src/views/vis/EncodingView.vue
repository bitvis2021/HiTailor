<template>
  <div>
    <div class="card">
      <vue-form
        v-model="encodingForm"
        :schema="encodingSchema"
        :form-props="formPops"
        :ui-schema="uiSchema"
        @on-change="ApplyConfig">
      <div>
      </div>
        </vue-form>
      </div>
    <el-row type="flex" class="row-bg" justify="end">
      <el-dropdown>
        <span class="el-dropdown-link">
          Add Encoding <i class="el-icon-circle-plus"></i>
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
import VueForm from "@lljj/vue-json-schema-form";
import { encodingSchema } from "./VisConfig";
export default {
  name: "EncodingView",
  props: ["config", "fields"],
  components: {
    VueForm,
  },
  created() {},
  mounted() {
    // 初始化UI的配置
    for (const key in this.encodingSchema.properties.addEncoding.properties) {
      // 绑定属性显示,
      this.$set(this.uiSchema.encoding, key, {
        "ui:hidden": (parentFormData, rootFormData) =>
          !rootFormData.addEncoding[key],
      });
    }
  },
  data() {
    return {
      encodingSchema,
      encodingForm: {
        encoding: this.config,
      },
      uiSchema: {
        addEncoding: {},
        encoding: {},
      },
      field: ["attr1", "attr2", "attr3", "attr4", "value"],
      formPops: { labelWidth: "auto", labelPosition: "left", inline: false },
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
</style>