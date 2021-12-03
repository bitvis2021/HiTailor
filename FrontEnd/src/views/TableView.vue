<template>
  <div class="table-view">
    <svg class="table-view-svg">
      <g v-for="(row, rowindex) in tabularDatasetList" 
        :transform="'translate(0,'+ rowindex * cellHeight +')'">
        <rect v-for="(column, columnindex) in row" 
          class="table-cell"
          :x="columnindex*cellWidth" :width="cellWidth"
          y="0" :height="cellHeight">
        </rect>
      </g>
    </svg>
  </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';

export default {
  name: 'TableView',
  props: {
  },
  data() {
    return {
      cellWidth: 40,
      cellHeight: 20,
      tabularDatasetList: sysDatasetObj.tabularDatasetList
    }
  },
  watch: {
      displayMode: function() {
      }
  },
  mounted: function() {
    console.log('this.tabularDatasetList', this.tabularDatasetList)
  },
  computed: {
    ...mapState([
        'displayMode'
      ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.table-view {
  height: 100%;
  width: 100%;
  .table-view-svg {
    height: 100%;
    width: 100%;
    .table-cell {
      fill: #eeeeee;
      stroke: white;
    }
  }
}
</style>
