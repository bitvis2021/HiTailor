<template>
  <div class="mark-container">
    <el-divider content-position="left">Mark</el-divider>
    <div class="mark-card">
      <el-row class="el-form-item">
        <label class="el-form-item__label"> type: </label>
        <el-select v-model="type" placeholder="Select" v-on:change="ChangeMark">
          <el-option
            v-for="(item, index) in markType"
            :key="item + index"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-row>
      <div v-if="this.isMultipleProperty">
        <vue-form
          v-model="formData"
          :schema="schema"
          :form-props="this.formPops"
          @on-change="ApplyConfig"
          ><div></div
        ></vue-form>
      </div>
      <el-button v-else type="text" @click="AddProperty" size="small"
        ><div class="el-icon-circle-plus"></div>
        Adjust Mark Property</el-button
      >
    </div>
  </div>
</template>

<script>
import VueForm from "@lljj/vue-json-schema-form";
import { markType, markConf } from "./SchemaCompiler";
export default {
  name: "MarkView",
  props: ["config"],
  components: {
    VueForm,
  },
  data() {
    return {
      isMultipleProperty: false,
      formData: {},
      markType: markType,
      type: "bar",
      formPops: { labelWidth: "auto", labelPosition: "left", inline: false },
      schema: {},
    };
  },
  watch: {
    config(newVal, oldVal) {
      if ("object" == typeof newVal) {
        this.type = newVal.type;
        this.isMultipleProperty = true;
      } else {
        this.type = newVal;
        this.isMultipleProperty = false;
      }
      this.ChangeForm(this.type);
    },
  },
  methods: {
    ChangeMark(mark) {
      if (this.isMultipleProperty) {
        this.ChangeForm(mark);
      } else {
        this.type = mark;
        this.$emit("apply-config", this.type);
      }
    },
    ChangeForm(mark) {
      this.$set(this.$data, "schema", new markConf[mark]());
      this.$set(this.$data, "formData", {});
    },
    // only multiple property can be applied
    ApplyConfig() {
      let markData = { type: this.type };
      for (const key in this.formData) {
        markData[key] = this.formData[key];
      }
      this.$emit("apply-config", markData);
    },
    AddProperty() {
      this.isMultipleProperty = true;
      this.ChangeForm(this.type);
    },
    toSingle() {
      this.isMultipleProperty = false;
    },
  },
  computed: {},
  mounted() {
    if ("object" == typeof this.config) {
      this.type = this.config.type;
      this.isMultipleProperty = true;
    } else {
      this.type = this.config;
      this.isMultipleProperty = false;
    }
    this.ChangeForm(this.type);
  },
};
</script>

<style lang="less">
.el-form-item__label-wrap {
  margin-left: 0px !important;
}
.fieldGroupWrap_box {
  display: flex !important;
  justify-content: space-between !important;
  margin-top: 10px !important;
}
.mark-container {
  margin-top: 10px;
  // text-align: left;
  .mark-card {
    padding: 15px;
    margin-top: 5px;
  }
}
</style>