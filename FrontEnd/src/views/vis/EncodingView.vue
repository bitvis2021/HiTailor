<template>
  <div>
    <el-divider content-position="right">Encoding</el-divider>
    <div class="encoding-card">
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
    console.log('this.encodingSchema', this.encodingSchema)
    // 初始化UI的配置
    // for (const key in this.encodingSchema.properties.addEncoding.properties) {
    //   // 绑定属性显示,
    //   this.$set(this.uiSchema.encoding, key, {
    //     "ui:hidden": (parentFormData, rootFormData) =>
    //       !rootFormData.addEncoding[key],
    //   });
    // }
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
  .fieldGroupWrap_title {
    margin: 0px !important;
    line-height: 15px !important;
    font-family: 'Avenir', Helvetica, Arial, sans-serif !important;
    font-size: 14px !important;
    font-weight: bold !important;
  }
  .genFormLabel {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
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
      color: #409EFF;
    }
  }
</style>