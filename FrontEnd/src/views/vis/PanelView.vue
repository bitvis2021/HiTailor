<template>
  <div>
    <div id="panel">
      <el-slider v-model="value1" show-input></el-slider>
      <el-button type="primary" @click="SubmitParam">提交</el-button>
      <el-button @click="SendName">把名字给父组件</el-button>
      <br />
    </div>
  </div>
</template>
<script>
import ElementUI from "element-ui";

export default {
  name: "PanelView",
  data() {
    return {
      value1: 10,
    };
  },
  methods: {
    SendName(){
      this.$emit('send-name',{data1:"hello",data2:"world!"})
    }    

  },
  mounted(){
  },
};
</script>
<style lang="css">
</style>