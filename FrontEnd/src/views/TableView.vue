<template>
  <div class="table-view">
    <svg class="table-view-svg">
      <g>
        <rect x="0" y="0" :width=cellWidth :height=cellHeight class="table-mark">
        </rect>
      </g>

      <g> 
        <rect v-for="(row, rowindex) in tabularDatasetList" :key="row.index"
            class="table-mark"
            x="0"
            :y="cal_position(0, rowindex, rowHeightList) + cellHeight" 
            :width="cellWidth"
            :height="cal_position(rowindex, rowindex+1, rowHeightList)">
        </rect>
        <text v-for="(row, rowindex) in tabularDatasetList" :key="row.index"
            class="table-mark-text" 
            :x="cellWidth/2"
            :y="cal_position(0, rowindex, rowHeightList) + cellHeight + markTextPaddingY" >
          {{rowindex + 1}}
        </text>
      </g>
      
      <g> 
        <rect v-for="(column, columnindex) in columnWidthList" :key="column.index"
            class="table-mark"
            :x="cal_position(0, columnindex, columnWidthList) + cellWidth"
            y="0" 
            :width="cal_position(columnindex, columnindex+1, columnWidthList)"
            :height="cellHeight"
            >
            {{cal_column_mark(columnindex)}}
        </rect>
        <text v-for="(column, columnindex) in columnWidthList" :key="column.index"
              class="table-mark-text" 
              :x="cal_position(0, columnindex, columnWidthList) + cellWidth + columnWidthList[columnindex]/2"
              :y="markTextPaddingY">
          {{cal_column_mark(columnindex)}}
        </text>
      </g>

      <g v-for="(row, rowindex) in tabularDatasetList" :key="row.index"
        :transform="'translate(' + cellWidth + ',' + (cal_position(0, rowindex, rowHeightList) + cellHeight) + ')'">
        <rect v-for="(column, columnindex) in row" :key="column.index"
          class="table-cell"
          :x="cal_position(0, column.start, columnWidthList)"
          y="0" 
          :width="cal_position(column.start, column.end+1, columnWidthList)"
          :height="rowHeightList[rowindex]"
          @click="">
        </rect>
        <text v-for="(column, columnindex) in row" :key="column.index"
          v-if="column.value != 'None'"
          class="table-cell-text"
          :x="cal_position(0, column.start, columnWidthList) + textPaddingX" :y="textPaddingY"
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
      cellWidth: 70,
      cellHeight: 30,
      textPaddingX: 5,
      textPaddingY: 20,
      markTextPaddingY: 22,
      letterLength: 11.5,
      tabularDatasetList: null,
      columnWidthList: null,
      rowHeightList: null
    }
  },
  methods: {
    ...mapMutations([
        'UPDATE_DISPLAY_MODE'
    ]),
    cal_position(start, end, list) {
      var res = 0
      for (var i=start; i<end; i++) {
        res = res + list[i]
      }
      return res
    },
     cal_column_mark(index) {
      var res = ""
      var first = parseInt(index / 26)
      if(first > 0) {
        res = String.fromCharCode(64+first)
      }
      res += String.fromCharCode(65+(index % 26))
      return res
    }
  },
  watch: {
      displayMode: function() {
      }
  },
  beforeMount: function() {
    this.tabularDatasetList = sysDatasetObj.tabularDatasetList
    this.columnWidthList = []
    this.rowHeightList = []
    // calculate the column width based on dataset
    var row = this.tabularDatasetList[0]
    var item
    for (item in row) {
      var lengthList = row[item].length, len
      for (len in lengthList) {
        var length = lengthList[len] * this.letterLength
        if (length >= this.cellWidth) {
          this.columnWidthList.push(length)
        }
        else {
          this.columnWidthList.push(this.cellWidth)
        }
      }
    }

    var rcount = this.tabularDatasetList.length
    for (var i=0; i<rcount; i++) {
      this.rowHeightList.push(this.cellHeight)
    }
  },
  mounted: function() {
    console.log('this.tabularDatasetList', this.tabularDatasetList)
    console.log('this.columnWidthList',this.columnWidthList)
    console.log("this.rowHeightList", this.rowHeightList)
  },
  computed: {
    ...mapState([
        'displayMode'
      ]), 
   
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
    margin-left: 1%;
    margin-top: 1%;
    .table-mark {
      fill: rgb(233, 233, 233);
      stroke: lightslategrey;
      stroke-width: 0.2px;
    }
    .table-mark-text{
      fill:black;
      font-size:105%;
      text-anchor: middle;
    }
    .table-cell {
      fill: white;
      stroke: lightslategrey;
      stroke-width: 0.2px;
    }
    .table-cell-text{
      text-anchor: start;
    }

      
  }
}
</style>
