<template>
  <div class="table-view">
    <button class="button" id="header-button"
        draggable
        @dragstart="handle_drag()"
        @drag="handle_drag()"
        @dragend="handle_drag()" > 
      header 
    </button>
    
    <svg class="table-view-svg"
      @mouseup="handle_mouse_up()"
      @mousemove="handle_mouse_move($event)">
      <rect x="0" y="0" :width=cellWidth :height=cellHeight class="table-mark">
      </rect>
      
      <!-- row mark -->
      <g> 
        <rect v-for="(row, rowindex) in rowHeightList" :key="row.index"
          :class="{'chosen-table-mark': selectByMark.row && isMarkSelected(rowindex, 'row'), 
            'selected-table-mark': !selectByMark.row && isMarkSelected(rowindex, 'row'),
            'hovered-table-mark': (mouseOverMark.index==rowindex && mouseOverMark.type=='row') || (selectedMark.index==rowindex && selectedMark.type=='row')}"
          class="table-mark"
          x="0"
          :y="heightRangeList[rowindex] + cellHeight" 
          :width="cellWidth"
          :height="heightRangeList[rowindex+1] - heightRangeList[rowindex]"
          @mousemove="handle_mouse_move($event)"
          @mouseover="handle_mouse_over_mark(rowindex,'row')"
          @mousedown="handle_mouse_down_mark(rowindex,'row')"
          @mouseout="handle_mouse_out_mark()">
        </rect>
        <text v-for="(row, rowindex) in rowHeightList" :key="row.index"
          :class="{'chosen-table-mark-text': selectByMark.row && isMarkSelected(rowindex, 'row'), 
            'selected-table-mark-text': !selectByMark.row && isMarkSelected(rowindex, 'row'),
            'hovered-table-mark-text': (mouseOverMark.index==rowindex && mouseOverMark.type=='row') || (selectedMark.index==rowindex && selectedMark.type=='row')}"
          class="table-mark-text"
          :x="cellWidth/2"
          :y="heightRangeList[rowindex] + cellHeight + markTextPaddingY" 
          @mousemove="handle_mouse_move($event)"
          @mouseover="handle_mouse_over_mark(rowindex,'row')"
          @mousedown="handle_mouse_down_mark(rowindex,'row')"
          @mouseout="handle_mouse_out_mark()">
          {{rowindex + 1}}
        </text>
      </g>
      
      <!-- column mark -->
      <g> 
        <rect v-for="(column, columnindex) in columnWidthList" :key="column.index"
          :class="{'chosen-table-mark': selectByMark.column && isMarkSelected(columnindex, 'column'), 
            'selected-table-mark': !selectByMark.column && isMarkSelected(columnindex, 'column'),
            'hovered-table-mark': (mouseOverMark.index==columnindex && mouseOverMark.type=='column') || (selectedMark.index==columnindex && selectedMark.type=='column')}"
          class="table-mark"
          :x="widthRangeList[columnindex] + cellWidth"
          y="0" 
          :width="widthRangeList[columnindex+1] - widthRangeList[columnindex]"
          :height="cellHeight"
          @mousemove="handle_mouse_move($event)"
          @mouseover="handle_mouse_over_mark(columnindex, 'column')"
          @mousedown="handle_mouse_down_mark(columnindex, 'column')"
          @mouseout="handle_mouse_out_mark()">
          {{cal_column_mark(columnindex)}}
        </rect>
        <text v-for="(column, columnindex) in columnWidthList" :key="column.index"
          :class="{'hovered-table-mark-text': (mouseOverMark.index==columnindex && mouseOverMark.type=='column') || (selectedMark.index==columnindex && selectedMark.type=='column'), 
            'selected-table-mark-text': !selectByMark.column && isMarkSelected(columnindex, 'column'),
            'chosen-table-mark-text': selectByMark.column && isMarkSelected(columnindex, 'column')}"
          class="table-mark-text"
          :x="widthRangeList[columnindex] + cellWidth + columnWidthList[columnindex]/2"
          :y="markTextPaddingY"
          @mousemove="handle_mouse_move($event)"
          @mouseover="handle_mouse_over_mark(columnindex, 'column')"
          @mousedown="handle_mouse_down_mark(columnindex, 'column')"
          @mouseout="handle_mouse_out_mark()">
          {{cal_column_mark(columnindex)}}
        </text>
      </g>

      <!-- cell -->
      <g v-for="(row, rowindex) in tabularDatasetList" :key="row.index"
        :transform="'translate(' + cellWidth + ',' + (heightRangeList[rowindex] + cellHeight) + ')'">
        <rect v-for="(column, columnindex) in row" :key="column.index"
          class="table-cell"
          :ref="'cell(' + rowindex + ',' + columnindex +')' "
          :x="widthRangeList[column.start]"
          y="0" 
          :width="widthRangeList[column.end+1] - widthRangeList[column.start]"
          :height="rowHeightList[rowindex]"
          @mousedown="handle_mouse_down(rowindex, columnindex, column.start, column.end)"
          @mousemove="handle_mouse_move($event)"
          @mouseup="handle_mouse_up()"
          >
        </rect>
        <text v-for="(column, columnindex) in row" :key="column.index"
          v-if="column.value != 'None'"
          class="table-cell-text"
          :ref="'cellText(' + rowindex + ',' + columnindex +')' "
          :x="widthRangeList[column.start] + textPaddingX" :y="textPaddingY"
          @mousedown="handle_mouse_down(rowindex, columnindex, column.start, column.end)"
          @mousemove="handle_mouse_move($event)"
          @mouseup="handle_mouse_up()"
          >
            {{get_substring(column.value, column.start, column.end, columnindex, row)}}
        </text>
      </g>

      <!-- selected area -->
      <rect class="selected-area"
        :x="cellWidth + widthRangeList[selectedArea.left]" 
        :y="cellHeight + heightRangeList[selectedArea.top]" 
        :width="widthRangeList[selectedArea.right+1] - widthRangeList[selectedArea.left]"
        :height="heightRangeList[selectedArea.bottom+1] - heightRangeList[selectedArea.top]"
        @mousedown="handle_mouse_down_selected($event)"
        @mousemove="handle_mouse_move($event)"
        @mouseup="handle_mouse_up()"
        >
      </rect>

      <!-- row highlight line -->
      <line class="highlight-line"
        :x1="cellWidth"
        :x2="cellWidth"
        :y1="heightRangeList[selectedArea.top] + cellHeight"
        :y2="heightRangeList[selectedArea.bottom] + 2*cellHeight">
      </line>

      <!-- column highlight line -->
      <line class="highlight-line"
        :x1="widthRangeList[selectedArea.left] + cellWidth"
        :x2="widthRangeList[selectedArea.right] + 2*cellWidth"
        :y1="cellHeight"
        :y2="cellHeight">

      </line>

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

      tabularDatasetList: null,
      rowDistributionList: null,
      columnWidthList: null,
      widthRangeList: null,
      widthChangeSignal: true,
      rowHeightList: null,
      heightRangeList: null,
      heightChangeSignal: true,

      selectedCell: {row:0, column:0, start:null, end:null},
      selectedArea: {top:0, left:0, bottom:0, right:0},
      selectedMark: {index:null, type:null},
      mouseOverCell: {row:null, column:null, start:null, end:null, current:null},
      mouseOverMark: {index:null, type:null},
      mouseDownState: false,
      mouseDownMarkState: false,
      selectByMark: {row:false, column:false}
    }
  },

  methods: {
    ...mapMutations([
        'UPDATE_DISPLAY_MODE'
    ]),
    cal_range_list(list, listType) {
      var res = [0], i
      for (i in list) {
        var tmp=0
        for (var j=0; j<=i; j++) {
          tmp += list[j]
        }
        res.push(tmp)
      }
      if (listType == "width") {
        this.widthRangeList = res
      }
      else {
        this.heightRangeList = res
      }
    },
    // cal_range(start, end, list) {
    //   var res = 0
    //   for (var i=start; i<end; i++) {
    //     res = res + list[i]
    //   }
    //   return res
    // },
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
      var cellLength = this.widthRangeList[end+1] - this.widthRangeList[start] - this.textPaddingX
      if (textLength < cellLength) { 
        return text
      }
      else if ( index+1 < row.length && row[index+1].value=='None')   // the cell after it is none
      {
        cellLength += this.widthRangeList[row[index+1].end+1] - this.widthRangeList[row[index+1].start] - this.textPaddingX
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
    cal_mouse_over_cell(x, y) {
      x = x - this.cellWidth
      y = y - this.cellHeight

      if (x < 0)  x = 0
      if (y < 0)  y = 0

      var row, rowFlag=false
      for (row=0; row<this.heightRangeList.length; row++) {
        if (y >= this.heightRangeList[row] && y < this.heightRangeList[row+1]) {
          rowFlag = true
          break
        }
      }
      if (!rowFlag && row!=0) {
        row -= 2
      }
      this.mouseOverCell.row = row
      
      var columnindex, column, columnFlag=false
      for (columnindex=0; columnindex<this.widthRangeList.length; columnindex++) {
        if (x >= this.widthRangeList[columnindex] && x < this.widthRangeList[columnindex+1]) {
          columnFlag = true
          break
        }
      }
      if (!columnFlag) {
        columnindex -= 2
      }
      this.mouseOverCell.current = columnindex
      for (column=0; column<this.rowDistributionList[row].length; column++) {
        if (columnindex >= this.rowDistributionList[row][column].start && columnindex <= this.rowDistributionList[row][column].end) {
          break
        }
      }
      this.mouseOverCell.column = column
      this.mouseOverCell.start = this.rowDistributionList[row][column].start
      this.mouseOverCell.end = this.rowDistributionList[row][column].end
    },
    handle_mouse_down(row, column, start, end) {
      this.selectByMark.row = false
      this.selectByMark.column = false
      this.selectedCell.row = row
      this.selectedCell.column = column
      this.selectedCell.start = start
      this.selectedCell.end = end

      this.selectedArea.top = row
      this.selectedArea.left = start
      this.selectedArea.bottom = row
      this.selectedArea.right = end

      this.mouseDownState = true
    },
    handle_mouse_down_mark(index, type) {
      if (type == 'column') {
        this.selectByMark.column = true
        this.selectByMark.row = false
      }
      else {
        this.selectByMark.row = true
        this.selectByMark.column = false
      }
      this.selectedMark.index = index
      this.selectedMark.type = type

      if (type == 'column') {
        this.selectedArea.top = 0
        this.selectedArea.bottom = this.rowHeightList.length - 1
        this.selectedArea.left = index
        this.selectedArea.right = index
      }
      else {
        this.selectedArea.top = index
        this.selectedArea.bottom = index
        this.selectedArea.left = 0
        this.selectedArea.right = this.columnWidthList.length - 1
      }

      this.mouseDownMarkState = true
    },
    handle_mouse_down_selected(event) {
      this.cal_mouse_over_cell(event.offsetX, event.offsetY)
      this.handle_mouse_down(this.mouseOverCell.row, this.mouseOverCell.column, this.mouseOverCell.start, this.mouseOverCell.end)
    },
    handle_mouse_move(event) {
      if (this.mouseDownMarkState) {
        this.cal_mouse_over_cell(event.offsetX, event.offsetY)
        if (this.selectedMark.type == 'column') {
          this.selectedArea.left = this.selectedMark.index < this.mouseOverCell.current ? this.selectedMark.index : this.mouseOverCell.current
          this.selectedArea.right = this.selectedMark.index > this.mouseOverCell.current ? this.selectedMark.index : this.mouseOverCell.current
        }
        else {
          this.selectedArea.top = this.selectedMark.index < this.mouseOverCell.row ? this.selectedMark.index : this.mouseOverCell.row
          this.selectedArea.bottom = this.selectedMark.index > this.mouseOverCell.row ? this.selectedMark.index : this.mouseOverCell.row
        }
      }
      else if (this.mouseDownState) {
        this.cal_mouse_over_cell(event.offsetX, event.offsetY)

        this.selectedArea.top = this.selectedCell.row < this.mouseOverCell.row ? this.selectedCell.row : this.mouseOverCell.row
        this.selectedArea.bottom = this.selectedCell.row > this.mouseOverCell.row ? this.selectedCell.row : this.mouseOverCell.row
        this.selectedArea.left = this.selectedCell.start < this.mouseOverCell.start ? this.selectedCell.start : this.mouseOverCell.start
        this.selectedArea.right = this.selectedCell.end > this.mouseOverCell.end ? this.selectedCell.end : this.mouseOverCell.end   
      }
      else {
        return  // ignore mousemoves when mouse is not down
      }
      
      
    },
    handle_mouse_over_mark(index, type) {
      if (this.mouseDownState || this.mouseDownMarkState)  return
      this.mouseOverMark.index = index
      this.mouseOverMark.type = type
    },
    handle_mouse_out_mark() {
      this.mouseOverMark = {index:null, type:null}
    },
    // handle_mouse_over(row, column) {
    //   this.mouseOverCell.row = row
    //   this.mouseOverCell.column = column
    //   // console.log("mouseover", row, column)
    // },
    handle_mouse_up (event) {
      this.mouseDownState = false
      this.mouseDownMarkState = false
      this.mouseOverCell = {row:null, column:null}
      this.selectedMark = {index:null, type:null}
    },
    handle_drag() {
      console.log("ininin")
    },
    handle_drag_start() {
      console.log('handle_drag_start')
    },
    handle_draging() {
      console.log('handler_draging')
    },
    handle_drag_end() {
      console.log('handler_drag_end')
    }
  },
  watch: {
      displayMode: function() {
      },
      // Remember to use "!this.widthChangeSignal" or "!this.heightChangeSignal" when changing width or height
      widthChangeSignal: function() {
        this.cal_range_list(this.columnWidthList, "width")
      },
      heightChangeSignal: function() {
        this.cal_range_list(this.rowHeightList, "height")
      }
  },
  beforeMount: function() {
    this.tabularDatasetList = sysDatasetObj.tabularDatasetList
    this.rowDistributionList = []
    this.columnWidthList = []
    this.widthRangeList = []
    this.rowHeightList = []
    this.heightRangeList = []

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

    var rindex
    for (rindex in this.tabularDatasetList) {
      var cindex
      var r = []
      for (cindex in this.tabularDatasetList[rindex]) {
        var item = this.tabularDatasetList[rindex][cindex]
        var range = {start:item.start, end:item.end}
        r.push(range)
      }
      this.rowDistributionList.push(r)
    }

    this.cal_range_list(this.columnWidthList, "width")
    this.cal_range_list(this.rowHeightList, "height")
  },
  mounted: function() {
    console.log('this.tabularDatasetList', this.tabularDatasetList)
    console.log('this.columnWidthList',this.columnWidthList)
    console.log("this.rowHeightList", this.rowHeightList)
    console.log("this.rowDistributionList", this.rowDistributionList)
    console.log("this.widthRangeList", this.widthRangeList)
    console.log("this.heightRangeList", this.heightRangeList)
  },
  computed: {
    ...mapState([
        'displayMode'
      ]),
    isMarkSelected() { 
      return (index, type) => { 
        if (type == "row") {
          if (index >= this.selectedArea.top && index <= this.selectedArea.bottom) {
            return true
          }
          else {
            return false
          }
        }
        else {
          if (index >= this.selectedArea.left && index <= this.selectedArea.right) {
            return true
          }
          else {
            return false
          }
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.table-view {
  height: 100%;
  width: 100%;
  text {
    font-family: Helvetica, Tahoma, Arial;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    user-select: none;
    cursor: cell;
  }
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
      cursor: pointer;
    }
    .table-mark-text {
      fill:black;
      font-size:105%;
      text-anchor: middle;
    }
    .selected-table-mark {
      fill: grey;
      fill-opacity: 30%;
      stroke: lightslategrey;
      stroke-width: 0.2px;
      cursor: cell;
    }
    .selected-table-mark-text {
      fill:steelblue;
      font-size:105%;
      text-anchor: middle;
    }
    .chosen-table-mark {
      fill: lightskyblue;
      fill-opacity: 30%;
      stroke: lightslategrey;
      stroke-width: 0.2px;
      cursor: cell;
    }
    .chosen-table-mark-text {
      fill:steelblue;
      font-size:105%;
      text-anchor: middle;
    }
    .hovered-table-mark {
      fill:steelblue;
      fill-opacity: 30%;
      stroke: lightslategrey;
      stroke-width: 0.2px;
      cursor:pointer;
    }
    .hovered-table-mark-text {
      fill:black;
      font-size:105%;
      text-anchor: middle;
      cursor: pointer;
    }
    .table-cell {
      fill: white;
      stroke: lightslategrey;
      stroke-width: 0.2px;
      cursor: cell;
    }
    .table-cell-text {
      text-anchor: start;
    }
    .selected-area {
      stroke: steelblue;
      fill: steelblue;
      fill-opacity: 10%;
      stroke-width: 2px;
      cursor: cell;
    }      
    .highlight-line {
      stroke: steelblue;
      stroke-width: 2px;
    }
  }
}
</style>
