<template>
  <div id="app1=">
    <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#676767"
        text-color="#fff"
        :default-active="activeIndex"
        active-text-color="#ffd04b">
        <el-menu-item class='labelIcon' id="title">
          {{appName}}
        </el-menu-item>
        <el-tooltip class='labelIcon' v-for="operation in operationArray" :key="operation" :content="operation" effect="light">
          <el-menu-item :index="operation">
            {{operation}}
          </el-menu-item>
        </el-tooltip>
    </el-menu>
    <div class = "content-container">
      <HelloWorld></HelloWorld>
    </div>
  </div>
</template>

<script>

import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'app',
  components: {
    HelloWorld
  },
  data() {
    return {
      appName: "Information Hiding",
      operationArray: ['#operation', '#operation'],
      activeIndex: '',
    }
  },
  methods: {
    iconClass(operation) {
      return 'icon-' + operation
    }
  }
}
</script>

<style lang="less">
html {
  font-size: 100%;
}
@menu-height: 2.5rem;
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  position: absolute;
  top: 0%;
  bottom: 0%;
  left: 0%;
  right: 0%;
  .el-menu.el-menu--horizontal {
    .el-menu-item {
      height: @menu-height;
      line-height: @menu-height;
    }
    .el-menu-item {
      border-bottom-color: rgb(84, 92, 100) !important;
      font-weight: bolder;
      font-size: 1rem;
      color: #dadada !important;
      padding: 0 10px;
      .icon {
        color: #dadada !important;
      }
    }
  }
  .labelIcon {
    font-size: 1rem;
  }
  .content-container {
    position: absolute;
    top: @menu-height;
    left: 0%;
    bottom: 0%;
    right: 0%;
  }
}
</style>
