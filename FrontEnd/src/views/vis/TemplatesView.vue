<template>
  <div>
    <h3>Templates</h3>
    <div class="template-box">
      <div
        class="template-content"
        v-for="(template, index) in templates"
        :key="index"
        @click="ApplyTemplate(template)"
      >
        <el-image
          :src="template.img"
          :fit="'fill'"
          style="width: 100%; height: 80px"
        >
        </el-image>
        <div>
          {{ template.name }}
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

<style>
.template-box {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}
.template-content {
  width: 46%;
  margin: 2%;
  cursor: pointer;
}
</style>