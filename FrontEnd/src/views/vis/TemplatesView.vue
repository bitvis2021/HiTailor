<template>
  <div>
    <el-divider>Templates</el-divider>
    <br />
    <div class="template-box">
      <div
        class="template-content"
        v-for="(template, index) in templates"
        :key="index + template"
      >
        <el-popover
          v-if="template.length >= 2"
          placement="top-start"
          title="Choose a direction"
          width="250"
          trigger="click"
        >
          <div class="template-pop">
            <div
              v-for="(dTemp, index) in template"
              :key="dTemp + index"
              @click="ApplyTemplate(dTemp)"
            >
              <div slot="reference">
                <el-image
                  :src="dTemp.img"
                  :fit="'cover'"
                  style="width: 112px; height: 64px"
                  class="template-img"
                >
                </el-image>
                <div class="demonstration">{{ dTemp.direction }}</div>
              </div>
            </div>
          </div>
          <div slot="reference">
            <el-image :src="template[0].img" :fit="'cover'" class="template-img">
            </el-image>
            <div class="demonstration">{{ template[0].name }}</div>
          </div>
        </el-popover>
        <div v-else @click="ApplyTemplate(template[0])">
          <el-image :src="template[0].img" :fit="'cover'" class="template-img">
          </el-image>
          <div class="demonstration">{{ template[0].name }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TemplatesView",
  props: ["templates"],
  methods: {
    ApplyTemplate(template) {
      this.$emit("select-template", template);
    },
  },
  computed: {},
  data() {
    return {};
  },
};
</script>

<style scoped lang="less">
.template-box {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: start;
}
.template-pop {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
}
.template-content {
  width: 46%;
  margin: 2%;
}
.template-img {
  width: 140px;
  height: 80px;
  border-style: solid;
  border-width: 2px;
  // border-radius: 10px;
  border-color: #dcdfe6;
  transition-duration: 0.3s;
  transition: filter cubic-bezier();
  &:hover {
    filter: drop-shadow(0px 0px 10px #0000002a);
    transition-delay: 0.05s;
  }
  cursor: pointer;
}
.demonstration {
  text-align: center;
  font-size: 13px;
  line-height: 14px;
  margin: 0px;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  color: #606266;
}
</style>