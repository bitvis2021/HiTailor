<template>
  <div>
    <div id="panel">
      <div class="property">
        <el-button type="text" size="medium" @click="ApplyConfig()"
          >Apply</el-button
        >
        <el-button
          id="add-layer"
          type="text"
          icon="el-icon-circle-plus"
          @click="addTab(editableTabsValue)"
          >Add layer</el-button
        >
      </div>
      <el-tabs
        v-model="editableTabsValue"
        type="card"
        closable
        @edit="handleTabsEdit"
      >
        <el-tab-pane
          :key="item.name"
          v-for="(item, index) in editableTabs"
          :label="item.title"
          :name="item.name"
        >
        </el-tab-pane>
      </el-tabs>
      <div class="layer">
        <div class="encodings">
          Mark
          <br />
          type
          <el-select v-model="vegaConfig.mark" placeholder="Select">
            <el-option
              v-for="(item, index) in mark"
              :key="index"
              :label="item"
              :value="item"
            >
            </el-option>
          </el-select>
        </div>
        <br />
        <div class="encodings">
          <div class="encoding">
            X
            <br />
            <div class="property">
              field
              <el-select
                v-model="vegaConfig.encoding.x.field"
                placeholder="Select"
              >
                <el-option
                  v-for="(item, index) in field"
                  :key="index"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
              <br />
            </div>

            <el-dropdown size="mini" split-button>
              Add property
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>scale</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>

          <hr />

          <div class="encoding">
            Y
            <br />
            <div class="property">
              field
              <el-select
                v-model="vegaConfig.encoding.y.field"
                placeholder="Select"
              >
                <el-option
                  v-for="(item, index) in field"
                  :key="index"
                  :label="item"
                  :value="item"
                ></el-option
              ></el-select>
              <br />
            </div>

            <el-dropdown size="mini" split-button>
              Add property
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>scale</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
        </div>
        <el-dropdown class="property">
          <span class="el-dropdown-link">
            <i class="el-icon-circle-plus"></i> Add Encoding
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>黄金糕</el-dropdown-item>
            <el-dropdown-item>狮子头</el-dropdown-item>
            <el-dropdown-item>螺蛳粉</el-dropdown-item>
            <el-dropdown-item disabled>双皮奶</el-dropdown-item>
            <el-dropdown-item divided>蚵仔煎</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script>
import ElementUI from "element-ui";

export default {
  name: "PanelView",
  props: {
    vegaData: {
      type: Object,
    },
  },
  data() {
    return {
      value1: 10,
      mark: ["bar", "point", "line"],
      selected_mark: "",
      field: [
        "Species",
        "Island",
        "Beak Length (mm)",
        "Beak Depth (mm)",
        "Flipper Length (mm)",
        "Body Mass (g)",
        "Sex",
      ],
      type: ["quantitavie", "temporal", "ordinal", "nomianl"],
      vegaConfig: this.vegaData,
      editableTabsValue: "2",
      editableTabs: [
        {
          title: "Tab 1",
          name: "1",
          content: "Tab 1 content",
        },
        {
          title: "Tab 2",
          name: "2",
          content: "Tab 2 content",
        },
      ],
      tabIndex: 2,
    };
  },
  methods: {
    ApplyConfig() {
      console.log("update-config");
      this.$emit("update-config", this.vegaConfig);
    },
    addTab(targetName) {
      let newTabName = ++this.tabIndex + "";
      this.editableTabs.push({
        title: "New Tab",
        name: newTabName,
        content: "New Tab content",
      });
      this.editableTabsValue = newTabName;
    },
    handleTabsEdit(targetName, action) {
      if (action === "add") {
        let newTabName = ++this.tabIndex + "";
        this.editableTabs.push({
          title: "New Tab",
          name: newTabName,
          content: "New Tab content",
        });
        this.editableTabsValue = newTabName;
      }
      if (action === "remove") {
        let tabs = this.editableTabs;
        let activeName = this.editableTabsValue;
        if (activeName === targetName) {
          tabs.forEach((tab, index) => {
            if (tab.name === targetName) {
              let nextTab = tabs[index + 1] || tabs[index - 1];
              if (nextTab) {
                activeName = nextTab.name;
              }
            }
          });
        }

        this.editableTabsValue = activeName;
        this.editableTabs = tabs.filter((tab) => tab.name !== targetName);
      }
    },
  },
  mounted() {},
};
</script>
<style lang="less">
#panel {
  // width: 100%;
  // height: 30%;
  // margin: 0px 5px 0px 5px;
  padding: 0px 5px 0px 5px;
  // background-color: white;
  // filter: drop-shadow(5px 5px 10px #00000055);
  border-radius: 10px;
  text-align: left;
}
.encodings {
  border-color: rgb(200, 203, 210);
  border-style: solid;
  border-width: thin;
  // padding-left: 3%;
  // padding-right: 3%;
  // padding-top: 2%;
  // padding-bottom: 2%;
  border-radius: 10px;
}
.encoding {
  padding: 1%;
}
.property {
  margin-top: 2%;
  margin-bottom: 2%;
}
#add-layer {
  position: absolute;
  right: 10%;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.el-icon-arrow-down {
  font-size: 12px;
}
.el-tabs__item {
  padding: 0 10px !important;
  height: 20px !important;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  line-height: 15px !important;
  display: inline-block;
  list-style: none;
  font-size: 8px !important;
  font-weight: 500;
  color: #303133;
  position: relative;
}
</style>