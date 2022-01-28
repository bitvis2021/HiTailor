<template>
  <div class="layer">
    mark:{{ markJson }}
    <br />
    <br />
    <mark-view :config="markJson" v-on:apply-config="ApplyMark"></mark-view>
    <encoding-view></encoding-view>
  </div>
</template>
<script>
import MarkView from "./MarkView.vue";
import EncodingView from "./EncodingView.vue";
export default {
  name: "LayerView",
  props: { config: { type: Object } },
  components: { MarkView, EncodingView },
  data() {
    return {
      markJson: "bar",
    };
  },
  methods: {
    ApplyMark(data) {
      this.markJson = data;
    },
  },
  computed: {},
};
</script>
<style lang="less">
.encodings {
  border-color: rgb(200, 203, 210);
  border-style: solid;
  border-width: thin;
  border-radius: 10px;
}
</style>