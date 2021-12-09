<template>
  <div class="table-view">
    <svg class="table-view-svg">
      <g v-for="(row, rowindex) in tabularDatasetList" 
        :transform="'translate(0,'+ rowindex * cellHeight +')'">
        <rect v-for="(column, columnindex) in row" 
          class="table-cell"
          :x="cal_x(row, columnindex)"
          y="0" 
          :width="cal_width(row, columnindex)"
          :height="cellHeight">
        </rect>
        <text v-for="(column, columnindex) in row" 
          v-if="column.value != 'None'"
          class="table-cell-text"
          :x="cal_x(row, columnindex)" :y="textY"
          xml:space="preserve"
          >
          {{column.value}}
        </text>
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
      cellWidth: 50,
      cellHeight: 25,
      textX: 5,
      textY: 20,
      tabularDatasetList: null
    }
  },
  methods: {
    ...mapMutations([
        'UPDATE_DISPLAY_MODE',
        'UPDATE_COLUMN_WIDTH_LIST'
    ]),
    cal_x(row, index) {
      var padding = 10;
      var res = 0;
      for (var i=0; i<index; i++) {
        res = res + row[i].length;
      }
      return res * padding;
    },

    cal_width(row, index) {
      var padding = 10;
      return row[index].length * padding;
    }
  },
  watch: {
      displayMode: function() {
      }
  },
  beforeMount: function() {
    this.tabularDatasetList = sysDatasetObj.tabularDatasetList

  },
  mounted: function() {
    console.log('this.tabularDatasetList', this.tabularDatasetList)
    console.log('before',this.displayMode)
    this.UPDATE_DISPLAY_MODE('hi')
    console.log('after',this.displayMode)
    console.log('this.columnWidthList', this.columnWidthList)

  },
  computed: {
    ...mapState([
        'displayMode',
        'columnWidthList'
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
      fill: white;
      stroke: #eeeeee;
      stroke-width: 0.5px;
    }
    .table-cell-text{
      text-anchor: middle;
    }
  }
}
</style>
