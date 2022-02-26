<template>
  <div>
    <el-divider content-position="right">Encoding</el-divider>
    <div class="encoding-card">
      <div
        v-for="(encoding, eName) in this.schema"
        :key="eName + encoding.name + GenID()"
      >
        <!-- delete encoding -->
        <div class="close-box">
          {{ eName }}
          <el-button
            size="mini"
            type="text"
            class="close-button"
            @click="DeletEncoding(eName)"
            ><i class="el-icon-close"></i
          ></el-button>
        </div>
        <el-row
          type="flex"
          class="row-bg property-box"
          justify="start"
          v-for="(property, key) in encoding"
          :gutter="20"
          :key="GenID() + key"
        >
          <!-- delete property -->
          <div class="close-button">
            <el-button
              v-if="property.name != 'field'"
              size="mini"
              type="text"
              @click="DeletProperty(eName, property.name)"
              ><i class="el-icon-close"></i
            ></el-button>
            <el-button v-else size="mini" type="text" disabled
              ><i class="el-icon-close"></i
            ></el-button>
          </div>
          <div class="property-text">
            {{ property.name + ":" }}
          </div>
          <el-col>
            <el-select
              v-if="property.type == 'select'"
              v-model="property.value"
              @change="ApplyConfig"
              placeholder="select..."
            >
              <el-option
                v-for="item in property.selections"
                :key="eName + item + GenID()"
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
                :key="GenID() + key"
                :label="key"
              >
                <el-option
                  v-for="item in group"
                  :key="GenID() + item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-option-group>
            </el-select>
          </el-col>
        </el-row>
        <!-- Add Property Button -->
        <el-row type="flex" class="add-operation" justify="start">
          <el-dropdown @command="(command) => AddProperty(eName, command)">
            <span class="el-dropdown-link">
              <i class="el-icon-circle-plus"></i> Add Property
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                v-for="(value, index) in EC.GetProperties(schema, eName)"
                :command="value"
                :key="GenID() + index"
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
      </div>
    </div>
    <br />
    <el-row type="flex" class="add-operation" justify="end">
      <el-dropdown @command="AddEncoding">
        <el-button type="primary" plain size="small"
          ><i class="el-icon-plus"></i> Add Encoding
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item
            v-for="(value, index) in EC.GetEncodings(schema)"
            :command="value"
            :key="GenID() + index"
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
  created() {
    console.log("encoding get", this.config);
    console.log("encoding get", this.selections);
  },
  mounted() {
    // this.EC = new EncodingCompiler(this.config, this.selections);
    this.schema = this.EC.GetSchema();
  },
  data() {
    return {
      EC: new EncodingCompiler(this.config, this.selections),
      encoding: this.config,
      schema: {},
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
      this.$set(
        this.schema,
        encodingName,
        this.EC.GetNewEncoding(encodingName)
      );
      this.ApplyConfig();
    },
    AddProperty(encodingName, propertyName) {
      this.schema[encodingName].push(
        this.EC.GetNewProperty(encodingName, propertyName)
      );
      this.ApplyConfig();
    },
    DeletEncoding(encodingName) {
      this.$delete(this.schema, encodingName);
      // 在vega-lite上操作(因为encoding compiler不是一对一的绑定)
      this.EC.DeletEncodingOnVega(encodingName);
      // update config
      this.ApplyConfig();
    },
    DeletProperty(encodingName, propertyName) {
      let propertyIndex = this.schema[encodingName].findIndex(
        (item) => item.name == propertyName
      );
      this.schema[encodingName].splice(propertyIndex, 1);
      this.EC.DeletPropertyOnVega(encodingName, propertyName);
      this.ApplyConfig();
    },
    GenID() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return (
        S4() +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        "-" +
        S4() +
        S4() +
        S4()
      );
    },
  },
  computed: {},
};
</script>
<style lang="less">
.property-text {
  font-size: 14px;
  line-height: 15px;
  margin-top: 7px;
  margin-right: 10px;
  padding-right: 10px;
  margin-left: 5px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #606266;
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
.close-box {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: -10px;
  margin-top: 5px;
  margin-left: 10px;

  .close-button {
    visibility: hidden;
  }
  &:hover .close-button {
    visibility: visible;
  }
}
.property-box {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-right: 5px;
  padding-right: 5px;
  .close-button {
    visibility: hidden;
    margin-top: 2px;
    width: 10px;
  }
  &:hover .close-button {
    visibility: visible;
  }
}
</style>