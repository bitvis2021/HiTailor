<template>
  <div class="mark">
    Mark
    <br />
    type
    <el-select v-model="currentConfig" placeholder="Select">
      <el-option
        v-for="(item, index) in this.mark"
        :key="index.type"
        :label="item.type"
        :value="item.type"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
import { mapState } from "vuex";
export default {
  name: "MarkView",
  props: { layer: { type: Object } },
  data() {
    return {
      value: "",
      mark: [
        {
          type: "area",
          opacity: null,
          color: null,
        },
        {
          type: "arc",
        },
        {
          type: "bar",
        },
        {
          type: "boxplot",
        },
        {
          type: "line",
        },
        {
          type: "point",
        },
        {
          type: "rule",
        },
      ],
      // currentConfig:this.index.mark
    };
  },
  methods: {
  },
  computed: {
    currentConfig:{
      get(){
        return this.layer.mark
      },
      set(value){
        this.layer.mark=value
      }
    }
  },
  mounted() {
  },
};
</script>