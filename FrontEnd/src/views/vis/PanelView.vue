<template>
  <div>
    <div id="panel">
      <div class="property">
        <el-button type="text" size="medium" @click="ApplyConfig()"
          >Apply</el-button
        >
        <el-dropdown id="add-layer">
          <el-button
            type="text"
            icon="el-icon-arrow-down"
            @click="AddTab(editableTabsValue)"
            >Add Layer</el-button
          >
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              ><div class="el-icon-circle-plus"></div>
              Rule</el-dropdown-item
            >
            <el-dropdown-item
              ><div class="el-icon-circle-plus"></div>
              Bar</el-dropdown-item
            >
            <el-dropdown-item
              ><div class="el-icon-circle-plus"></div>
              Line</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <el-tabs
        v-model="editableTabsValue"
        type="card"
        closable
        v-if="this.tabIndex > 1"
        @tab-remove="CloseTab"
      >
        <el-tab-pane
          :key="item.name"
          v-for="(item, index) in editableTabs"
          :label="item.title"
          :name="item.name"
        >
          <layer-view :index="index" :parent="vegaData"></layer-view>
        </el-tab-pane>
      </el-tabs>

      <layer-view v-if="this.tabIndex <= 1"></layer-view>
    </div>
  </div>
</template>
<script>
import ElementUI from "element-ui";
import LayerView from "./LayerView.vue";
import { mapState } from "vuex";

export default {
  components: { LayerView },
  name: "PanelView",
  data() {
    return {
      editableTabs: [],
      tabIndex: 0,
    };
  },
  computed: { ...mapState(["currentVegaJson"]),
  },
  methods: {
    ApplyConfig() {
      this.$bus.$emit("apply-config",500,200,0,0);
    },
    AddTab(targetName) {
      let newTabName = "layer" + ++this.tabIndex;
      this.editableTabs.push({
        title: newTabName,
        name: newTabName,
      });
      this.editableTabsValue = newTabName;
      if (this.tabIndex == 1) {
        // json not having layer to having layer
        this.currentVegaJson.layer = [
          { mark: this.currentVegaJson.mark, encoding: this.currentVegaJson.encoding },
        ];
        delete this.currentVegaJson.mark;
        delete this.currentVegaJson.encoding;

        this.currentVegaJson.layer.push({ mark: "point" });

        this.AddTab(newTabName);
      }
    },
    CloseTab(name) {
      this.tabIndex = this.tabIndex - 1;
      let delIndex = this.editableTabs.length;
      for (let index = 0; index < this.editableTabs.length; index++) {
        if (this.editableTabs[index].name === name) {
          delIndex = index;
        }
        if (index > delIndex) {
          let newTabName = "layer" + index;
          this.editableTabs[index].title = newTabName;
          this.editableTabs[index].name = newTabName;
        }
      }
      this.editableTabs.splice(delIndex, 1);

      // json having layer to not having layer
      if (this.tabIndex == 1) {
        this.currentVegaJson.mark = this.currentVegaJson.layer[0].mark;
        this.currentVegaJson.encoding = this.currentVegaJson.layer[0].encoding;
        delete this.currentVegaJson.layer;
        this.CloseTab(this.editableTabs[0].name);
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