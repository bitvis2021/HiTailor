<template>
  <div class="layer">
    <mark-view
      :config="this.markJson"
      v-on:apply-config="ApplyMark"
    ></mark-view>
    <encoding-view
      :config="this.encodingJson"
      :selections="this.selections"
      v-on:apply-config="ApplyEncoding"
    ></encoding-view>
  </div>
</template>
<script>
import MarkView from "./MarkView.vue";
import EncodingView from "./EncodingView.vue";
export default {
  name: "LayerView",
  props: ["vegaConfig", "selections"],
  components: { MarkView, EncodingView },
  data() {
    return {
      markJson: this.vegaConfig.mark,
      encodingJson: this.vegaConfig.encoding,
    };
  },
  methods: {
    ApplyMark(data) {
      this.markJson = data;
      this.$emit("apply-config", {
        mark: this.markJson,
        encoding: this.encodingJson,
      });
    },
    ApplyEncoding(data) {
      this.encodingJson = data;
      this.$emit("apply-config", {
        mark: this.markJson,
        encoding: this.encodingJson,
      });
    },
  },
  computed: {},
  mounted() {
  },
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