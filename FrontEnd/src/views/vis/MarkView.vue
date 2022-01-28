<template>
  <div>
    <br />
    <br />
    Mark
    <el-row>
      type
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
    <vue-form
      v-model="formData"
      :schema="schema"
      :form-props="this.formPops"
      @on-change="ApplyConfig"
      ><div></div
    ></vue-form>
  </div>
</template>

<script>
import VueForm from "@lljj/vue-json-schema-form";
import { confTemplate, markType, markConf } from "./VisConfig";
export default {
  name: "MarkView",
  props: ["config"],
  components: {
    VueForm,
  },
  data() {
    return {
      formData: {},
      markType: markType,
      type: "arc",
      formPops: { labelWidth: "auto", labelPosition: "left", inline: false },
      schema: {},
    };
  },
  methods: {
    ChangeMark(data) {
      this.$set(this.$data, "schema", new markConf[data]());
      this.$set(this.$data, "formData", {});
    },
    ApplyConfig() {
      console.log("hello");
      let markData = { type: this.type };
      for (const key in this.formData) {
        markData[key] = this.formData[key];
      }
      this.$emit("apply-config", markData);
    },
  },
  computed: {},
  mounted() {
    console.log(this.config.type);
    if ("object" == typeof this.config) {
      this.type = this.config.type;
    } else {
      this.type = this.config;
    }
    this.ChangeMark(this.type);
  },
};
</script>