<template>
  <div class="table-view">
    <button class="button" id="header-button"
        draggable
        @dragstart="handle_drag()"
        @drag="handle_drag()"
        @dragend="handle_drag()" > 
      header 
    </button>
    
    <svg class="table-view-svg">
      <rect x="0" y="0" :width=cellWidth :height=cellHeight class="table-mark">
      </rect>
      
      <!-- row mark -->
      <g> 
        <rect v-for="(row, rowindex) in tabularDatasetList" :key="row.index"
          class="table-mark"
          x="0"
          :y="cal_range(0, rowindex, rowHeightList) + cellHeight" 
          :width="cellWidth"
          :height="cal_range(rowindex, rowindex+1, rowHeightList)">
        </rect>
        <text v-for="(row, rowindex) in tabularDatasetList" :key="row.index"
          class="table-mark-text" 
          :x="cellWidth/2"
          :y="cal_range(0, rowindex, rowHeightList) + cellHeight + markTextPaddingY" >
          {{rowindex + 1}}
        </text>
      </g>
      
      <!-- column mark -->
      <g> 
        <rect v-for="(column, columnindex) in columnWidthList" :key="column.index"
          class="table-mark"
          :x="cal_range(0, columnindex, columnWidthList) + cellWidth"
          y="0" 
          :width="cal_range(columnindex, columnindex+1, columnWidthList)"
          :height="cellHeight"
          >
          {{cal_column_mark(columnindex)}}
        </rect>
        <text v-for="(column, columnindex) in columnWidthList" :key="column.index"
          class="table-mark-text" 
          :x="cal_range(0, columnindex, columnWidthList) + cellWidth + columnWidthList[columnindex]/2"
          :y="markTextPaddingY">
          {{cal_column_mark(columnindex)}}
        </text>
      </g>

      <!-- cell -->
      <g v-for="(row, rowindex) in tabularDatasetList" :key="row.index"
        :transform="'translate(' + cellWidth + ',' + (cal_range(0, rowindex, rowHeightList) + cellHeight) + ')'">
        <rect v-for="(column, columnindex) in row" :key="column.index"
          class="table-cell"
          :ref="'cell(' + rowindex + ',' + columnindex +')' "
          :x="cal_range(0, column.start, columnWidthList)"
          y="0" 
          :width="cal_range(column.start, column.end+1, columnWidthList)"
          :height="rowHeightList[rowindex]"
          @mousedown="change_selected_cell(rowindex, columnindex)"
          @mouseover="handle_mouse_over(rowindex, columnindex, $event)"
          >
        </rect>
        <text v-for="(column, columnindex) in row" :key="column.index"
          v-if="column.value != 'None'"
          class="table-cell-text"
          :ref="'cellText(' + rowindex + ',' + columnindex +')' "
          :x="cal_range(0, column.start, columnWidthList) + textPaddingX" :y="textPaddingY"
          @mousedown="change_selected_cell(rowindex, columnindex)"
          @mouseover="handle_mouse_over(rowindex, columnindex, $event)"
          >
            {{get_substring(column.value, column.start, column.end, columnindex, row)}}
        </text>
      </g>

      <!-- selected cell -->
      <rect class="selected-area"
        :x="cellWidth + cal_range(0, tabularDatasetList[selectedArea.top][selectedArea.left].start, columnWidthList)" 
        :y="cellHeight + cal_range(0, selectedArea.top, rowHeightList)" 
        :width="cal_range(tabularDatasetList[selectedArea.top][selectedArea.left].start, tabularDatasetList[selectedArea.bottom][selectedArea.right].end + 1, columnWidthList)"
        :height="cal_range(selectedArea.top, selectedArea.bottom + 1, rowHeightList)"
        @mouseup="handle_mouse_up()"
        draggable
        @dragstart="handle_drag()"
        @drag="handle_drag()"
        @dragend="handle_drag()"
        >
      </rect>

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
      rowHeightList: null,
      
      selectedCell: {row:0, column:0},
      selectedArea: {top:0, left:0, bottom:0, right:0},
      mouserOverCell: {row:null, column:null}
      
    }
  },

  methods: {
    ...mapMutations([
        'UPDATE_DISPLAY_MODE'
    ]),

    cal_range(start, end, list) {
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
    },

    get_substring(text, start, end, index, row) {
      var textLength = this.get_text_width(text)
      var cellLength = this.cal_range(start, end+1, this.columnWidthList) - this.textPaddingX
      if (textLength < cellLength) { 
        return text
      }
      else if ( index+1 < row.length && row[index+1].value=='None')   // the cell after it is none
      {
        cellLength += this.cal_range(row[index+1].start, row[index+1].end+1, this.columnWidthList) - this.textPaddingX
        if (textLength < cellLength) {
          return text
        }
        else {
          var textNum = this.cal_text_num(text, cellLength)
          return text.substring(0, textNum)
        }
      }
      else {
        var textNum = this.cal_text_num(text, cellLength)
        return text.substring(0, textNum)
      }
      

    },

    get_text_width(t) {  
      var text = document.createElement("span")
      document.body.appendChild(text)
      text.style.fontFamily = "Helvetica, Tahoma, Arial";
      text.style.fontSize = "100%";
      text.style.height = 'auto';
      text.style.width = 'auto';
      text.style.position = 'absolute';
      text.style.whiteSpace = 'no-wrap';
      text.innerHTML = t
      var res = Math.ceil(text.clientWidth)
      document.body.removeChild(text)

      return res
    },

    cal_text_num(text, clen) {
      for (var i=0; i<text.length; i++) {
        var tlen = this.get_text_width(text.substring(0,i+1))
        if (tlen >= clen) {
          // console.log("text,clen,i,tlen", text, tlen, clen,i)
          return i
        }
      }
    },

    // check_cell_is_selected(row, column) {
    //   if (row == this.selectedArea.top && column == this.selectedArea.column) {
    //     return true
    //   }
    //   else {
    //     return false
    //   }
    // },

    change_selected_cell(row, column) {
      this.selectedCell.row = row
      this.selectedCell.column = column

      this.selectedArea.top = row
      this.selectedArea.left = column
      this.selectedArea.bottom = row
      this.selectedArea.right = column

      window.onmousemove = this.handle_mouse_move
    },

    handle_mouse_move(event) {
      if (this.selectedCell.row <= this.mouserOverCell.row && this.selectedCell.column <= this.mouserOverCell.column) {
        this.selectedArea.bottom = this.mouserOverCell.row
        this.selectedArea.right = this.mouserOverCell.column
      }
      else {
        this.selectedArea.bottom = this.selectedCell.row
        this.selectedArea.right = this.selectedCell.column
        this.selectedArea.top = this.mouserOverCell.row
        this.selectedArea.left = this.mouserOverCell.column

        console.log("selectedArea.bottom", this.selectedArea.bottom)
        console.log("selectedArea.right", this.selectedArea.right)
        console.log("selectedArea.top",this.selectedArea.top )
        console.log("selectedArea.left",this.selectedArea.left )
      }
      
      // console.log("mousemove", this.selectedArea.bottom, this.selectedArea.right)
    },

    handle_mouse_over(row, column) {
      this.mouserOverCell.row = row
      this.mouserOverCell.column = column
      // console.log("mouseover", row, column)
    },

    handle_mouse_up (event) {
      window.onmousemove = null
      // event.currentTarget.style.cursor = 'move'
    },

    handle_drag() {
      console.log("ininin")
    },
  },

  watch: {
      displayMode: function() {
      }
  },

  beforeMount: function() {
    this.tabularDatasetList = sysDatasetObj.tabularDatasetList
    this.columnWidthList = []
    this.rowHeightList = []
    
    // // calculate the column width based on dataset
    // var row = this.tabularDatasetList[0]
    // var item
    // for (item in row) {
    //   var lengthList = row[item].length, len
    //   for (len in lengthList) {
    //     var length = lengthList[len] * this.letterLength
    //     if (length >= this.cellWidth) {
    //       this.columnWidthList.push(length)
    //     }
    //     else {
    //       this.columnWidthList.push(this.cellWidth)
    //     }
    //   }
    // }

    // set column width to be the same
    var row = this.tabularDatasetList[0]
    var item
    for (item in row) {
      var lengthList = row[item].length, len
      for (len in lengthList) {
        this.columnWidthList.push(this.cellWidth)
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
      ])
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.table-view {
  height: 100%;
  width: 100%;
  #header-button {
    margin-top: 1%;
  }
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
    .table-mark-text {
      font-family: Helvetica, Tahoma, Arial;
      fill:black;
      font-size:105%;
      text-anchor: middle;
    }
    .table-cell {
      fill: white;
      stroke: lightslategrey;
      stroke-width: 0.2px;
    }
    .table-cell-text {
      font-family: Helvetica, Tahoma, Arial;
      text-anchor: start;
    }
    .selected-area {
      stroke: steelblue;
      fill: steelblue;
      fill-opacity: 10%;
      stroke-width: 1px;
    }
      
  }
}
</style>
