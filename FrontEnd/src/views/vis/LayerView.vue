<template>
  <div class="layer">
    <!-- 临时debug -->
    <mark-view
      :config="this.markJson"
      v-on:apply-config="ApplyMark"
    ></mark-view>
    <encoding-view
      :config="this.encodingJson"
      v-on:apply-config="ApplyEncoding"
    ></encoding-view>
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
      markJson: this.config.mark,
      encodingJson: this.config.encoding,
    };
  },
  methods: {
    ApplyMark(data) {
      this.markJson = data;
    },
    ApplyEncoding(data) {
      this.encodingJson = data;
    },
  },
  computed: {},
};
</script>
<style lang="less">
.card {
  border-color: rgb(200, 203, 210);
  border-style: solid;
  border-width: thin;
  border-radius: 10px;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}
</style>