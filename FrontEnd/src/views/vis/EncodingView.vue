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
          <el-select
            v-else-if="property.type == 'group select'"
            placeholder="select..."
            @change="ApplyConfig"
            v-model="property.value"
          >
            <el-option-group
              v-for="(group, key) in property.selections"
              :key="group + key"
              :label="key"
            >
              <el-option
                v-for="item in group"
                :key="eName + item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-option-group>
          </el-select>
          <br />
          <br />
        </el-row>
        <!-- Add Property Button -->
        <el-row type="flex" class="add-operation" justify="start">
          <el-dropdown
            @command="
              (value) => {
                schema[eName].push(EC.GetNewProperty(eName, value));
              }
            "
          >
            <span class="el-dropdown-link">
              <i class="el-icon-circle-plus"></i> Add Property
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="(value, index) in EC.GetProperties(schema, eName)"
                :command="value"
                :key="index + value"
                >{{ value }}</el-dropdown-item
              >
              <el-dropdown-item
                disabled
                v-if="EC.GetProperties(schema, eName).length == 0"
                >You have added all properties</el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </el-row>
        <br />
        <el-divider></el-divider>
        <br />
      </div>
    </div>
    <el-row type="flex" class="add-operation" justify="end">
      <el-dropdown @command="this.AddEncoding">
        <el-button type="primary" plain size="small"
          ><i class="el-icon-plus"></i> Add Encoding
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(value, index) in EC.GetEncodings(schema)"
            :command="value"
            :key="index + value"
            >{{ value }}</el-dropdown-item
          >
          <el-dropdown-item disabled v-if="EC.GetEncodings(schema).length == 0"
            >You have added all encodings</el-dropdown-item
          >
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
      addProperties: {},
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
    AddEncoding(encodingName) {
      console.log("new Schema", this.schema);
      this.$set(
        this.schema,
        encodingName,
        this.EC.GetNewEncoding(encodingName)
      );
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
  .el-dropdown-link {
    font-size: 12px !important;
    color: #409eff;
  }
}
</style>