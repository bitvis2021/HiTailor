<template>
  <div class="table-view">
    <button class="button" id="row-header-button"
      @click="choose_header('row')" > 
      row header 
    </button>

    <button id="column-header-button"
      class="button" 
      @click="choose_header('column')" > 
      column header 
    </button>
    
    <svg class="table-view-svg"
      @mouseup="handle_mouse_up()"
      @mousemove="handle_mouse_move($event)">
      <rect x="0" y="0" :width=cellWidth :height=cellHeight class="table-mark">
      </rect>
      
      <!-- row mark -->
      <g v-for="(row, rowindex) in rowHeightList" :key="row.index"> 
        <rect 
          :class="{'chosen-table-mark': selectByMark.row && isMarkSelected(rowindex, 'row'), 
            'selected-table-mark': !selectByMark.row && isMarkSelected(rowindex, 'row'),
            'hovered-table-mark': (mouseOverMark.index==rowindex && mouseOverMark.type=='row') || (selectedMark.index==rowindex && selectedMark.type=='row'),
            'hovered-row-mark-line': ((mouseDownMarkLine.index==rowindex || mouseDownMarkLine.index==rowindex-1) && mouseDownMarkLine.type=='row')}"
          class="table-mark"
          x="0"
          :y="markHeightRangeList[rowindex] + cellHeight" 
          :width="cellWidth"
          :height="markHeightRangeList[rowindex+1] - markHeightRangeList[rowindex]"
          @mousedown="handle_mouse_down_mark(rowindex,'row')"
          @mouseover="handle_mouse_over_mark(rowindex,'row')"
          @mouseout="handle_mouse_out_mark()">
        </rect>
        <text 
          :class="{'chosen-table-mark-text': selectByMark.row && isMarkSelected(rowindex, 'row'), 
            'selected-table-mark-text': !selectByMark.row && isMarkSelected(rowindex, 'row')}"
          class="table-mark-text"
          :x="cellWidth/2"
          :y="markHeightRangeList[rowindex] + cellHeight + markTextPaddingY" 
          @mousedown="handle_mouse_down_mark(rowindex,'row')"
          @mouseover="handle_mouse_over_mark(rowindex,'row')"
          @mouseout="handle_mouse_out_mark()">
          {{rowindex + 1}}
        </text>
        <!-- row mark line -->
        <rect v-for="(row, rowindex) in rowHeightList" :key="row.index"
          class='row-mark-line'
          x="0"
          :y="markHeightRangeList[rowindex+1] + cellHeight - markLinePadding/2"
          :height="markLinePadding"
          :width="cellWidth"
          @mousedown="handle_mouse_down_mark_line(rowindex, 'row')">
        </rect>
      </g>
      
      <!-- column mark -->
      <g v-for="(column, columnindex) in columnWidthList" :key="column.index"> 
        <rect 
          :class="{'chosen-table-mark': selectByMark.column && isMarkSelected(columnindex, 'column'), 
            'selected-table-mark': !selectByMark.column && isMarkSelected(columnindex, 'column'),
            'hovered-table-mark': (mouseOverMark.index==columnindex && mouseOverMark.type=='column') || (selectedMark.index==columnindex && selectedMark.type=='column')}"
          class="table-mark"
          :x="markWidthRangeList[columnindex] + cellWidth"
          y="0" 
          :width="markWidthRangeList[columnindex+1] - markWidthRangeList[columnindex]"
          :height="cellHeight"          
          @mousedown="handle_mouse_down_mark(columnindex, 'column')"
          @mouseover="handle_mouse_over_mark(columnindex, 'column')"
          @mouseout="handle_mouse_out_mark()">
          {{cal_column_mark(columnindex)}}
        </rect>
        <text 
          :class="{'hovered-table-mark-text': (mouseOverMark.index==columnindex && mouseOverMark.type=='column') || (selectedMark.index==columnindex && selectedMark.type=='column'), 
            'selected-table-mark-text': !selectByMark.column && isMarkSelected(columnindex, 'column'),
            'chosen-table-mark-text': selectByMark.column && isMarkSelected(columnindex, 'column')}"
          class="table-mark-text"
          :x="markWidthRangeList[columnindex] + cellWidth + markColumnWidthList[columnindex]/2"
          :y="markTextPaddingY"
          @mousedown="handle_mouse_down_mark(columnindex, 'column')"
          @mouseover="handle_mouse_over_mark(columnindex, 'column')"
          @mouseout="handle_mouse_out_mark()">
          {{cal_column_mark(columnindex)}}
        </text>
        <!-- column mark line -->
        <rect v-for="(column, columnindex) in markColumnWidthList" :key="column.index"
          class='column-mark-line'
          :x="markWidthRangeList[columnindex+1] + cellWidth - markLinePadding/2"
          y="0"
          :width="markLinePadding"
          :height="cellHeight"
          @mousedown="handle_mouse_down_mark_line(columnindex, 'column')">
        </rect>
      </g>

      <!-- cell -->
      <g v-for="(row, rowindex) in rowDistributionList" :key="row.index"
        :transform="'translate(' + cellWidth + ',' + (heightRangeList[rowindex] + cellHeight) + ')'">
        <g v-for="(column, columnindex) in row" :key="column.index">
          <rect class="table-cell"
            :class="{'header-table-cell': (columnHeaderBottom!=null && rowindex<=columnHeaderBottom) || (rowHeaderRight!=null && rowDistributionList[rowindex][columnindex].end<=rowHeaderRight)}"
            :x="widthRangeList[rowDistributionList[rowindex][columnindex].start]"
            y="0" 
            :width="widthRangeList[rowDistributionList[rowindex][columnindex].end+1] - widthRangeList[rowDistributionList[rowindex][columnindex].start]"
            :height="rowHeightList[rowindex]"
            @mousedown="handle_mouse_down(rowindex, columnindex)"
            >
          </rect>
          <text v-if="dataValueList[rowindex][columnindex] != 'None'"
            class="table-cell-text"
            :x="widthRangeList[rowDistributionList[rowindex][columnindex].start] + textPaddingX" :y="textPaddingY"
            @mousedown="handle_mouse_down(rowindex, columnindex)"
            >
              {{dataValueList[rowindex][columnindex]}}
          </text>
        </g>
      </g>

      <!-- selected area -->
      <rect class="selected-area"
        :x="cellWidth + widthRangeList[selectedArea.left]" 
        :y="cellHeight + heightRangeList[selectedArea.top]" 
        :width="widthRangeList[selectedArea.right+1] - widthRangeList[selectedArea.left]"
        :height="heightRangeList[selectedArea.bottom+1] - heightRangeList[selectedArea.top]"
        @mousedown="handle_mouse_down_selected($event)"
        >
      </rect>

      <!-- row mark highlight line -->
      <line class="highlight-line"
        :x1="cellWidth"
        :x2="cellWidth"
        :y1="heightRangeList[selectedArea.top] + cellHeight"
        :y2="heightRangeList[selectedArea.bottom+1] + cellHeight">
      </line>

      <!-- column mark highlight line -->
      <line class="highlight-line"
        :x1="widthRangeList[selectedArea.left] + cellWidth"
        :x2="widthRangeList[selectedArea.right+1] + cellWidth"
        :y1="cellHeight"
        :y2="cellHeight">
      </line>

      <!-- row header line -->
      <line :class="{'header-line': rowHeaderRight!=null}"
        :x1="cellWidth + widthRangeList[rowHeaderRight+1]"
        :x2="cellWidth + widthRangeList[rowHeaderRight+1]"
        :y1="cellHeight"
        :y2="cellHeight + heightRangeList[heightRangeList.length-1]">
      </line>

      <!-- column header line -->
      <line :class="{'header-line': columnHeaderBottom!=null}"
        :x1="cellWidth"
        :x2="cellWidth + widthRangeList[widthRangeList.length-1]"
        :y1="cellHeight + heightRangeList[columnHeaderBottom+1]"
        :y2="cellHeight + heightRangeList[columnHeaderBottom+1]">
      </line>

      <g class="table-mark-long-line">
        <!-- column mark long line -->
        <g v-if="mouseDownMarkLineState && mouseDownMarkLine.type == 'column'">
          <line
            :x1="cellWidth + markWidthRangeList[mouseDownMarkLine.index]"
            :x2="cellWidth + markWidthRangeList[mouseDownMarkLine.index]"
            :y1="cellHeight"
            :y2="cellHeight + markHeightRangeList[markHeightRangeList.length-1]">
          </line>
          <line
            :x1="cellWidth + markWidthRangeList[mouseDownMarkLine.index+1]"
            :x2="cellWidth + markWidthRangeList[mouseDownMarkLine.index+1]"
            :y1="cellHeight"
            :y2="cellHeight + markHeightRangeList[markHeightRangeList.length-1]">
          </line>
        </g>

        <!-- row mark long line -->
        <g v-if="mouseDownMarkLineState && mouseDownMarkLine.type == 'row'">
          <line
            :x1="cellWidth"
            :x2="cellWidth + markWidthRangeList[markWidthRangeList.length-1]"
            :y1="cellHeight + markHeightRangeList[mouseDownMarkLine.index]"
            :y2="cellHeight + markHeightRangeList[mouseDownMarkLine.index]">
          </line>
          <line
            :x1="cellWidth"
            :x2="cellWidth + markWidthRangeList[markWidthRangeList.length-1]"
            :y1="cellHeight + markHeightRangeList[mouseDownMarkLine.index+1]"
            :y2="cellHeight + markHeightRangeList[mouseDownMarkLine.index+1]">
          </line>
        </g>
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
      markLinePadding: 8,
      cellMin: 15,

      tabularDatasetList: null,
      rowDistributionList: null,  // Record the start and end of each cell for each row
      dataValueList: null,

      columnWidthList: null,
      rowHeightList: null,
      markColumnWidthList: null,
      markRowHeightList: null,

      widthRangeList: null, 
      heightRangeList: null,
      markWidthRangeList: null,
      markHeightRangeList: null,

      widthChangeSignal: true,
      heightChangeSignal: true,
      markWidthChangeSignal: true,
      markHeightChangeSignal: true,

      selectedCell: {row:0, column:0, start:null, end:null},
      selectedArea: {top:0, left:0, bottom:0, right:0},
      selectedMark: {index:null, type:null},

      mouseOverCell: {row:null, column:null, start:null, end:null, current:null},
      mouseOverMark: {index:null, type:null},
      mouseDownMarkLine: {index:null, type:null},

      mouseDownState: false,
      mouseDownMarkState: false,
      mouseDownMarkLineState: false,

      selectByMark: {row:false, column:false},

      rowHeaderRight: null,
      columnHeaderBottom: null
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
      else if (listType == "height"){
        this.heightRangeList = res
      }
      else if (listType == "mark width") {
        this.markWidthRangeList = res
      }
      else {
        this.markHeightRangeList = res
      }
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
    // get_substring(text, rowindex, columnindex, rowLength) {
    //   var textLength = this.get_text_width(text)
    //   var cellLength = this.widthRangeList[this.rowDistributionList[rowindex][columnindex].end+1] - this.widthRangeList[this.rowDistributionList[rowindex][columnindex].start] - this.textPaddingX
    //   if (textLength < cellLength) { 
    //     return text
    //   }
    //   else if ( columnindex+1 < rowLength && this.dataValueList[rowindex][columnindex+1]=='None')   // the cell after it is none
    //   {
    //     cellLength += this.widthRangeList[this.rowDistributionList[rowindex][columnindex+1].end+1] - this.widthRangeList[this.rowDistributionList[rowindex][columnindex+1].start] - this.textPaddingX
    //     if (textLength < cellLength) {
    //       return text
    //     }
    //     else {
    //       var textNum = this.cal_text_num(text, cellLength)
    //       return text.substring(0, textNum)
    //     }
    //   }
    //   else {
    //     var textNum = this.cal_text_num(text, cellLength)
    //     return text.substring(0, textNum)
    //   }
    // },
    // get_text_width(t) {  
    //   var text = document.createElement("span")
    //   document.body.appendChild(text)
    //   text.style.fontFamily = "Helvetica, Tahoma, Arial";
    //   text.style.fontSize = "100%";
    //   text.style.height = 'auto';
    //   text.style.width = 'auto';
    //   text.style.position = 'absolute';
    //   text.style.whiteSpace = 'no-wrap';
    //   text.innerHTML = t
    //   var res = Math.ceil(text.clientWidth)
    //   document.body.removeChild(text)
    //   return res
    // },
    // cal_text_num(text, clen) {
    //   for (var i=0; i<text.length; i++) {
    //     var tlen = this.get_text_width(text.substring(0,i+1))
    //     if (tlen >= clen) {
    //       // console.log("text,clen,i,tlen", text, tlen, clen,i)
    //       return i
    //     }
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
    handle_mouse_move(event) {
      if (this.mouseDownMarkLineState) {
        if (this.mouseDownMarkLine.type == "column") {
          var offset = event.offsetX - this.cellWidth - this.markWidthRangeList[this.mouseDownMarkLine.index]
          if (offset < this.cellMin) offset = this.cellMin
          this.markColumnWidthList[this.mouseDownMarkLine.index] = offset
          this.markWidthChangeSignal = !this.markWidthChangeSignal
          // console.log(this.markColumnWidthList[this.mouseDownMarkLine])
        }
        else if (this.mouseDownMarkLine.type == "row") {
          var offset = event.offsetY - this.cellHeight - this.markHeightRangeList[this.mouseDownMarkLine.index]
          if (offset < this.cellMin) offset = this.cellMin
          this.markRowHeightList[this.mouseDownMarkLine.index] = offset
          this.markHeightChangeSignal = !this.markHeightChangeSignal
          // console.log(this.markRowHeightList[this.mouseDownMarkLine.index])
        }
      }
      else if (this.mouseDownMarkState) {
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
      // else {
      //   if (event.offsetX <= this.cellWidth && event.offsetY > this.cellHeight) {
      //     this.handle_mouse_over_mark(event.offsetY - this.cellHeight, "row")
      //   }
      //   else if (event.offsetY <= this.cellHeight && event.offsetX > this.cellWidth) {
      //     this.handle_mouse_over_mark(event.offsetX - this.cellWidth, "column")
      //   }
       
      // }     
       else  return  // ignore other mousemoves when mouse is not down 
    },
    // handle_mouse_over_mark(offset, type) {
    //   this.mouseOverMark.type = type
    //   this.mouseDownMarkLine.type = type
    //   if (type == "row") {
    //     var row
    //     for (row=0; row<this.heightRangeList.length; row++) {
    //       // choose the mark
    //       if (offset >= (this.heightRangeList[row] + this.markLinePadding) && offset < (this.heightRangeList[row+1] - this.markLinePadding)) {
    //         this.mouseOverMark.index = row
    //         this.mouseDownMarkLine = {index:null, type:null}
    //         break
    //       }
    //       // choose the mark line
    //       else if (offset >= (this.heightRangeList[row+1] - this.markLinePadding) && offset < (this.heightRangeList[row+1] + this.markLinePadding)) {
    //         this.mouseDownMarkLine.index = row
    //         this.mouseOverMark = {index:null, type:null}
    //         break
    //       }
    //     }
    //   }
    //   else {
    //     var columnindex
    //     for (columnindex=0; columnindex<this.widthRangeList.length; columnindex++) {
    //       if (offset >= (this.widthRangeList[columnindex] + this.markLinePadding) && offset < (this.widthRangeList[columnindex+1] - this.markLinePadding)) {
    //         this.mouseOverMark.index = columnindex
    //         this.mouseDownMarkLine = {index:null, type:null}
    //         break
    //       }
    //       else if (offset >= (this.widthRangeList[columnindex+1] - this.markLinePadding) && offset < (this.widthRangeList[columnindex+1] + this.markLinePadding)) {
    //         this.mouseDownMarkLine.index = columnindex
    //         this.mouseOverMark = {index:null, type:null}
    //         break
    //       }
    //     }
    //   }
    // },
    handle_mouse_down(row, column) {
      this.selectByMark.row = false
      this.selectByMark.column = false
      this.selectedCell.row = row
      this.selectedCell.column = column
      this.selectedCell.start = this.rowDistributionList[row][column].start
      this.selectedCell.end = this.rowDistributionList[row][column].end

      this.selectedArea.top = row
      this.selectedArea.left = this.rowDistributionList[row][column].start
      this.selectedArea.bottom = row
      this.selectedArea.right = this.rowDistributionList[row][column].end

      this.mouseDownState = true
    },
    handle_mouse_down_mark(index, type) {
      if (type == 'column') {
        this.selectByMark.column = true
        this.selectByMark.row = false

        this.selectedArea.top = 0
        this.selectedArea.bottom = this.rowHeightList.length - 1
        this.selectedArea.left = index
        this.selectedArea.right = index
      }
      else {
        this.selectByMark.row = true
        this.selectByMark.column = false

        this.selectedArea.top = index
        this.selectedArea.bottom = index
        this.selectedArea.left = 0
        this.selectedArea.right = this.columnWidthList.length - 1
      }
      this.selectedMark.index = index
      this.selectedMark.type = type
      this.mouseDownMarkState = true

    },
    handle_mouse_down_mark_line(index, type) {
      this.mouseDownMarkLine.index = index
      this.mouseDownMarkLine.type = type
      this.mouseDownMarkLineState = true
    },
    handle_mouse_down_selected(event) {
      this.cal_mouse_over_cell(event.offsetX, event.offsetY)
      this.handle_mouse_down(this.mouseOverCell.row, this.mouseOverCell.column, this.mouseOverCell.start, this.mouseOverCell.end)
    },
    handle_mouse_over_mark(index, type) {
      if (this.mouseDownState || this.mouseDownMarkState || this.mouseDownMarkLineState)  return
      this.mouseOverMark.index = index
      this.mouseOverMark.type = type
      console.log(index, type)
    },
    // handle_mouse_over_mark_line(index, type) {
    //   this.mouseDownMarkLine.index = index
    //   this.mouseDownMarkLine.type = type
    // },
    handle_mouse_out_mark() {
      this.mouseOverMark = {index:null, type:null}
    },
    // handle_mouse_over(row, column) {
    //   this.mouseOverCell.row = row
    //   this.mouseOverCell.column = column
    //   // console.log("mouseover", row, column)
    // },
    handle_mouse_up () {
      this.mouseDownState = false
      this.mouseDownMarkState = false

      if (this.mouseDownMarkLineState) {
        if (this.mouseDownMarkLine.type == "column") {
          this.columnWidthList = this.markColumnWidthList
          this.widthChangeSignal = !this.widthChangeSignal
        }
        if (this.mouseDownMarkLine.type == "row") {
          this.rowHeightList = this.markRowHeightList
          this.heightChangeSignal = !this.heightChangeSignal
        }
        this.mouseDownMarkLineState = false
      }
      this.mouseOverCell = {row:null, column:null}
      this.mouseDownMarkLine = {index:null, type:null}
      this.selectedMark = {index:null, type:null}
    },
    choose_header(type) {
      if (type == 'column') {
        this.columnHeaderBottom = this.selectedArea.bottom
      }
      else {
        this.rowHeaderRight = this.selectedArea.right
      }
      this.fix_header_cell_structure(type)
    },
    fix_header_cell_structure(type) {
      if (type == 'column') {
        for (var r=0; r<=this.columnHeaderBottom; r++) {
          for (var c=1; c<this.rowDistributionList[r]; c++) {
            var ci = this.cal_column_index(r, c)
            if (this.dataValueList[r][ci] == 'None') {
              this.rowDistributionList[r][ci-1].end = this.rowDistributionList[r][ci].end
              this.rowDistributionList[r].splice(ci, 1)
              this.dataValueList[r].splice(ci, 1)
            }
          }
        }
      }
      else {
        for (var r=0; r<this.rowDistributionList.length; r++) {
          for (var c=1; c<=this.rowHeaderRight; c++) {
            var ci = this.cal_column_index(r, c)
            if (this.dataValueList[r][ci] == 'None') {
              this.rowDistributionList[r][ci-1].end = this.rowDistributionList[r][ci].end
              this.rowDistributionList[r].splice(ci, 1)
              this.dataValueList[r].splice(ci, 1)
            }
          }
        }  
      }
    },
    cal_column_index(r, c) {
      for (var i=0; i<this.rowDistributionList[r].length; i++) {
        if (c >= this.rowDistributionList[r][i].start && c <= this.rowDistributionList[r][i].end) {
          return i
        }
      }
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
      },
      markWidthChangeSignal: function() {
        this.cal_range_list(this.markColumnWidthList, "mark width")
      },
      markHeightChangeSignal: function() {
        this.cal_range_list(this.markRowHeightList, "mark height")
      },

  },
  beforeMount: function() {
    this.tabularDatasetList = sysDatasetObj.tabularDatasetList
    this.rowDistributionList = []
    this.columnWidthList = []
    this.widthRangeList = []
    this.rowHeightList = []
    this.heightRangeList = []
    this.markColumnWidthList = []
    this.markWidthRangeList = []
    this.markRowHeightList = []
    this.markHeightRangeList = []
    this.dataValueList = []

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
        this.markColumnWidthList.push(this.cellWidth)
      }
    }
  
    var rcount = this.tabularDatasetList.length
    for (var i=0; i<rcount; i++) {
      this.rowHeightList.push(this.cellHeight)
      this.markRowHeightList.push(this.cellHeight)
    }

    var rindex
    for (rindex in this.tabularDatasetList) {
      var cindex
      var r = [], rvalue = []
      for (cindex in this.tabularDatasetList[rindex]) {
        var item = this.tabularDatasetList[rindex][cindex]
        var range = {start:item.start, end:item.end}
        r.push(range)
        rvalue.push(item.value)
      }
      this.rowDistributionList.push(r)
      this.dataValueList.push(rvalue)
    }

    this.cal_range_list(this.columnWidthList, "width")
    this.cal_range_list(this.rowHeightList, "height")
    this.cal_range_list(this.markColumnWidthList, "mark width")
    this.cal_range_list(this.markRowHeightList, "mark height")
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
    },
    // fix_header_cell_structure() {
    //   return (type) => {
    //     if (type == 'column') {
    //       // this.columnHeaderBottom
    //     }
    //     else {
    //       console.log("iniin")
    //       for (var r=0; r<this.rowDistributionList.length; r++) {
    //         for (var c=1; c<=this.rowHeaderRight; c++) {
    //           if (this.dataValueList[r][c] == 'None') {
    //             this.rowDistributionList[r][c-1].end = this.rowDistributionList[r][c].end
    //             this.rowDistributionList[r].splice(c, 1)
    //             console.log("distribution", r, this.rowDistributionList[r])
    //             this.dataValueList[r].splice(c, 1)
    //           }
    //         }
    //       }
    //     }
    //   }
    // },
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
  #row-header-button {
    margin-top: 1%;
  }
  #column-header-button {
    margin-top: 1%;
    margin-left: 1%;
  }
  .table-view-svg {
    height: 100%;
    width: 100%;
    margin-left: 1%;
    margin-top: 1%;
    .table-mark {
      fill: rgb(233,233,233);
      stroke: lightslategrey;
      stroke-width: 0.2px;
      cursor: cell;
    }
    .selected-table-mark {
      fill: grey;
      fill-opacity: 30%;
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
      cursor:pointer;
    }
    .hovered-table-mark-text {
      cursor:pointer;
    }
    .column-mark-line {
      fill:white;
      fill-opacity: 0%;
      stroke:none;
      cursor:col-resize;
    }
    .row-mark-line {
      fill:white;
      fill-opacity: 0%;
      stroke:none;
      cursor:row-resize;
    }
    .table-mark-long-line {
      stroke: black;
      stroke-width: 0.2px;
    }
    .table-cell {
      fill: white;
      stroke: lightslategrey;
      stroke-width: 0.2px;
      cursor: cell;
    }
    .header-table-cell {
      fill: lightgrey;
      fill-opacity: 15%;
      stroke: lightslategrey;
      stroke-width: 0.2px;
      cursor: cell;
    }
    .table-cell-text {
      text-anchor: start;
    }
    .table-mark-text {
      font-size: 105%;
      text-anchor: middle;
    }
    .selected-area {
      stroke: steelblue;
      fill: steelblue;
      fill-opacity: 10%;
      stroke-width: 1.5px;
      cursor: cell;
    }      
    .highlight-line {
      stroke: steelblue;
      stroke-width: 1.5px;
    }
    .header-line {
      stroke: grey;
      stroke-width: 1px;
    }
  }
}
</style>
