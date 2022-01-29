<template>
  <div>
    <div class="card">
      <div v-for="(item, key, index) in this.encodingSchema" :key="key">
        {{ InitialUpper(key) }}<br />
        <vue-form
          v-model="encodingForm[key]"
          :schema="encodingSchema[key]"
          :form-props="formPops"
        >
          <el-dropdown>
            <span class="el-dropdown-link" style="font-size:12px">
              Add Property <i class="el-icon-circle-plus"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>1</el-dropdown-item>
              <el-dropdown-item disabled>2</el-dropdown-item>
              <el-dropdown-item divided>3</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </vue-form>
        <hr v-if="index != Object.keys(encodingSchema).length - 1" />
      </div>
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
import { encodingType, confTemplate, encodingConfig } from "./VisConfig";
export default {
  name: "EncodingView",
  props: ["config", "fields"],
  components: {
    VueForm,
  },
  created() {},
  mounted() {
    this.Convert2Schema();
  },
  data() {
    return {
      encodingSchema: {},
      encodingForm: {},
      field: ["attr1", "attr2", "attr3", "attr4", "value"],
      formPops: { labelWidth: "auto", labelPosition: "left", inline: false },
    };
  },
  methods: {
    Convert2Schema() {
      for (const key in this.config) {
        switch (key) {
          case "x":
          case "y":
          case "x2":
          case "y2":
            this.$set(
              this.encodingSchema,
              key,
              new encodingConfig.positionChannel(this.field)
            );
            this.$set(this.encodingForm, key, {});
            break;

          default:
            break;
        }
      }
    },
    InitialUpper(word) {
      return word.toUpperCase()[0] + word.slice(1);
    },
  },
  computed: {},
};
</script>
<style lang="less">
</style>