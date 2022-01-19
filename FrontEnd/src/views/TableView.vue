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
      <rect x="0" y="0" :width=markWidth :height=markHeight class="table-mark">
      </rect>

      <!-- cell before choosing header-->
      <g v-if="!(headerFixedFlag.row && headerFixedFlag.column)">
        <g v-for="(row, rowindex) in rowDistributionList" :key="row.index"
          :transform="'translate(' + markWidth + ',' + (heightRangeList[rowindex] + markHeight) + ')'">
          <g v-for="(column, columnindex) in row" :key="column.index">
            <rect class="table-cell"
              :class="{'header-table-cell': (columnHeaderRange.bottom!=null && rowindex<=columnHeaderRange.bottom) || (rowHeaderRange.right!=null && rowDistributionList[rowindex][columnindex].end<=rowHeaderRange.right)}"
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
      </g>

      <!-- cell after choosing header-->
      <!-- column header-->
      <g v-if="headerFixedFlag.column">
        <g v-for="(item,index) in num2header" :key="item.index"
          v-if="!headerDistribution.get(item[1].value).isRowHeader">
          <!--
          <rect class="header-table-cell"
            :x="markWidth + widthRangeList[columnHeaderRange.left + colHeader[headerDistribution.get(item[1].value).layer].get(item[1].value).range[item[1].times].start]"
            :y="markHeight + heightRangeList[headerDistribution.get(item[1].value).layer]"
            :width="widthRangeList[colHeader[headerDistribution.get(item[1].value).layer].get(item[1].value).range[item[1].times].start + colHeader[headerDistribution.get(item[1].value).layer].get(item[1].value).cellNum] - widthRangeList[colHeader[headerDistribution.get(item[1].value).layer].get(item[1].value).range[item[1].times].start]"
            :height="heightRangeList[headerDistribution.get(item[1].value).layer+1] - heightRangeList[headerDistribution.get(item[1].value).layer]">
          </rect> -->
          <rect class="header-table-cell"
            :x="cal_column_header_position(item[1].value, item[1].times).x"
            :y="cal_column_header_position(item[1].value, item[1].times).y"
            :width="cal_column_header_position(item[1].value, item[1].times).width"
            :height="cal_column_header_position(item[1].value, item[1].times).height">
          </rect>
           
          <text class="table-cell-text"
            :x="cal_column_header_position(item[1].value, item[1].times).x + textPaddingX" 
            :y="cal_column_header_position(item[1].value, item[1].times).y + textPaddingY">
            {{item[1].value}}
          </text>
        </g>
      </g>
      <!-- row header-->
      <g v-if="headerFixedFlag.row">
        <g v-for="item in num2header" :key="item.index"
          v-if="headerDistribution.get(item[1].value).isRowHeader">
          <rect class="header-table-cell"
            :x="cal_row_header_position(item[1].value, item[1].times).x"
            :y="cal_row_header_position(item[1].value, item[1].times).y"
            :width="cal_row_header_position(item[1].value, item[1].times).width"
            :height="cal_row_header_position(item[1].value, item[1].times).height">
          </rect>
           
          <text class="table-cell-text"
            :x="cal_row_header_position(item[1].value, item[1].times).x + textPaddingX" 
            :y="cal_row_header_position(item[1].value, item[1].times).y + textPaddingY">
            {{item[1].value}}
          </text>
        </g>
      </g>
      <!-- value cell -->
      <g v-if="headerFixedFlag.row && headerFixedFlag.column">
        <g v-for="item in num2seq" :key="item.index">
          <rect class="table-cell"
            :x="markWidth + widthRangeList[cal_value_cell_position(item[1].seq).col]"
            :y="markHeight + heightRangeList[cal_value_cell_position(item[1].seq).row]"
            :width="widthRangeList[cal_value_cell_position(item[1].seq).col+1] - widthRangeList[cal_value_cell_position(item[1].seq).col]"
            :height="rowHeightList[cal_value_cell_position(item[1].seq).row]">
            
          </rect>
          <text class="table-cell-text"
            :x="markWidth + widthRangeList[cal_value_cell_position(item[1].seq).col] + textPaddingX"
            :y="markHeight + heightRangeList[cal_value_cell_position(item[1].seq).row] + textPaddingY">
            {{item[1].value}}
          </text>
        </g>
      </g>

      <!-- selected area -->
      <rect class="selected-area"
        :x="markWidth + widthRangeList[selectedArea.left]" 
        :y="markHeight + heightRangeList[selectedArea.top]" 
        :width="widthRangeList[selectedArea.right+1] - widthRangeList[selectedArea.left]"
        :height="heightRangeList[selectedArea.bottom+1] - heightRangeList[selectedArea.top]"
        @mousedown="handle_mouse_down_selected($event)"
        >
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
          :y="markHeightRangeList[rowindex] + markHeight" 
          :width="markWidth"
          :height="markHeightRangeList[rowindex+1] - markHeightRangeList[rowindex]"
          @mousedown="handle_mouse_down_mark(rowindex,'row')"
          @mouseover="handle_mouse_over_mark(rowindex,'row')"
          @mouseout="handle_mouse_out_mark()">
        </rect>
        <text 
          :class="{'chosen-table-mark-text': selectByMark.row && isMarkSelected(rowindex, 'row'), 
            'selected-table-mark-text': !selectByMark.row && isMarkSelected(rowindex, 'row')}"
          class="table-mark-text"
          :x="markWidth/2"
          :y="markHeightRangeList[rowindex] + markHeight + markTextPaddingY" 
          @mousedown="handle_mouse_down_mark(rowindex,'row')"
          @mouseover="handle_mouse_over_mark(rowindex,'row')"
          @mouseout="handle_mouse_out_mark()">
          {{rowindex + 1}}
        </text>
        <!-- row mark transparent line -->
        <rect v-for="(row, rowindex) in rowHeightList" :key="row.index"
          class='row-mark-line'
          x="0"
          :y="markHeightRangeList[rowindex+1] + markHeight - markLinePadding/2"
          :height="markLinePadding"
          :width="markWidth"
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
          :x="markWidthRangeList[columnindex] + markWidth"
          y="0" 
          :width="markWidthRangeList[columnindex+1] - markWidthRangeList[columnindex]"
          :height="markHeight"          
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
          :x="markWidthRangeList[columnindex] + markWidth + markColumnWidthList[columnindex]/2"
          :y="markTextPaddingY"
          @mousedown="handle_mouse_down_mark(columnindex, 'column')"
          @mouseover="handle_mouse_over_mark(columnindex, 'column')"
          @mouseout="handle_mouse_out_mark()">
          {{cal_column_mark(columnindex)}}
        </text>
        <!-- column mark transparent line -->
        <rect v-for="(column, columnindex) in markColumnWidthList" :key="column.index"
          class='column-mark-line'
          :x="markWidthRangeList[columnindex+1] + markWidth - markLinePadding/2"
          y="0"
          :width="markLinePadding"
          :height="markHeight"
          @mousedown="handle_mouse_down_mark_line(columnindex, 'column')">
        </rect>
      </g>

      <!-- row mark highlight line -->
      <line class="highlight-line"
        :x1="markWidth"
        :x2="markWidth"
        :y1="heightRangeList[selectedArea.top] + markHeight"
        :y2="heightRangeList[selectedArea.bottom+1] + markHeight">
      </line>

      <!-- column mark highlight line -->
      <line class="highlight-line"
        :x1="widthRangeList[selectedArea.left] + markWidth"
        :x2="widthRangeList[selectedArea.right+1] + markWidth"
        :y1="markHeight"
        :y2="markHeight">
      </line>

      <g class="table-mark-long-line">
        <!-- column mark long line -->
        <line v-if="mouseDownMarkLineState && mouseDownMarkLine.type == 'column'"
          :x1="markWidth + markWidthRangeList[mouseDownMarkLine.index+1]"
          :x2="markWidth + markWidthRangeList[mouseDownMarkLine.index+1]"
          :y1="markHeight"
          :y2="markHeight + markHeightRangeList[markHeightRangeList.length-1]">
        </line>
        <!-- row mark long line -->
        <line v-if="mouseDownMarkLineState && mouseDownMarkLine.type == 'row'"
          :x1="markWidth"
          :x2="markWidth + markWidthRangeList[markWidthRangeList.length-1]"
          :y1="markHeight + markHeightRangeList[mouseDownMarkLine.index+1]"
          :y2="markHeight + markHeightRangeList[mouseDownMarkLine.index+1]">
        </line>
      </g>

      <!-- row header line -->
      <line :class="{'header-line': rowHeaderRange.right!=null}"
        :x1="markWidth + widthRangeList[rowHeaderRange.right+1]"
        :x2="markWidth + widthRangeList[rowHeaderRange.right+1]"
        :y1="markHeight"
        :y2="markHeight + heightRangeList[heightRangeList.length-1]">
      </line>
      <!-- column header line -->
      <line :class="{'header-line': columnHeaderRange.bottom!=null}"
        :x1="markWidth"
        :x2="markWidth + widthRangeList[widthRangeList.length-1]"
        :y1="markHeight + heightRangeList[columnHeaderRange.bottom+1]"
        :y2="markHeight + heightRangeList[columnHeaderRange.bottom+1]">
      </line>

      

      

    </svg>
  </div>
</template>

<script>
    import { mapState, mapMutations } from 'vuex';
    import { get_column_header, cal_header_range, get_row_header, get_cell_sequence} from '@/transformation/CreateModel.js'

export default {
  name: 'TableView',
  props: {
  },
  data() {
    return {
      cellWidth: 70,
      cellHeight: 30,
      markWidth: 40,
      markHeight: 30,
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

      headerFixedFlag: {column:false, row:false},
      rowHeaderRange: {top:null, right:null},
      columnHeaderRange: {left:null, bottom:null},

      colHeader: null,
      rowHeader: null,
      headerDistribution: null,
      num2header: null,
      header2num: null,
      num2seq: null,
      seq2num: null,
      valueIndex: 0,
      headerIndex: 0,
      colHeaderIndex: 0, // column headers' indexes starts from 0
      rowHeaderIndex: 100,  // row headers' indexes starts from 100
      newHeaderIndex: 200, // new headers' indexes starts from 200
      // colHeaderStart: null,

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
    cal_mouse_over_cell(x, y) {
      x = x - this.markWidth
      y = y - this.markHeight

      if (x < 0)  x = 0
      if (y < 0)  y = 0

      var row, rowFlag=false, len
      for (row=0, len=this.heightRangeList.length; row<len; row++) {
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
      for (columnindex=0, len=this.widthRangeList.length; columnindex<len; columnindex++) {
        if (x >= this.widthRangeList[columnindex] && x < this.widthRangeList[columnindex+1]) {
          columnFlag = true
          break
        }
      }
      if (!columnFlag) {
        columnindex -= 2
      }
      this.mouseOverCell.current = columnindex
      for (column=0, len=this.rowDistributionList[row].length; column<len; column++) {
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
          var offset = event.offsetX - this.markWidth - this.markWidthRangeList[this.mouseDownMarkLine.index]
          if (offset < this.cellMin) offset = this.cellMin
          this.markColumnWidthList[this.mouseDownMarkLine.index] = offset
          this.markWidthChangeSignal = !this.markWidthChangeSignal
        }
        else if (this.mouseDownMarkLine.type == "row") {
          var offset = event.offsetY - this.markHeight - this.markHeightRangeList[this.mouseDownMarkLine.index]
          if (offset < this.cellMin) offset = this.cellMin
          this.markRowHeightList[this.mouseDownMarkLine.index] = offset
          this.markHeightChangeSignal = !this.markHeightChangeSignal
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
       else  return  // ignore other mousemoves when mouse is not down 
    },
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
    },
    handle_mouse_out_mark() {
      this.mouseOverMark = {index:null, type:null}
    },
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
        this.columnHeaderRange.bottom = this.selectedArea.bottom
        this.columnHeaderRange.left = (this.rowHeaderRange.right!=null) ? (this.rowHeaderRange.right+1) : this.selectedArea.left
        this.headerFixedFlag.column = true
      }
      else {
        this.rowHeaderRange.right = this.selectedArea.right
        this.rowHeaderRange.top = (this.columnHeaderRange.bottom!=null) ? (this.columnHeaderRange.bottom+1) : this.selectedArea.top
        this.headerFixedFlag.row = true
      }
      // this.modify_header_cell_structure(type)
      if (this.headerFixedFlag.row && this.headerFixedFlag.column) {    // both column and row headers are fixed, change valuecells to header sequences
        this.colHeader = []
        get_column_header(this.headerIndex, this.colHeaderIndex, this.colHeader, this.columnHeaderRange, this.rowHeaderRange, 
          this.rowDistributionList, this.dataValueList,this.headerDistribution, this.header2num, this.num2header )
        
        this.rowHeader = []
        get_row_header(this.headerIndex, this.rowHeaderIndex, this.rowHeader, this.columnHeaderRange, this.rowHeaderRange, this.rowHeightList,
          this.dataValueList,this.headerDistribution, this.header2num, this.num2header)
        
        this.num2seq = new Map
        this.seq2num = new Map
        get_cell_sequence(this.columnHeaderRange, this.rowHeaderRange, this.rowHeightList, this.columnWidthList, this.dataValueList,
          this.colHeader, this.rowHeader, this.num2seq, this.seq2num, this.valueIndex)
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
      colHeader: function() {
        for (var i=0; i<this.colHeader.length; i++) {
          for (var item of this.colHeader[i].values()) {
            item.range = []
          }
        }
        cal_header_range(this.colHeader)
      }
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
    this.headerDistribution = new Map
    this.num2header = new Map
    this.header2num = new Map


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
    cal_column_header_position() {
      return (value, times) => {    
        var rindex = this.headerDistribution.get(value).layer
        var start = this.colHeader[rindex].get(value).range[times].start
        var span = this.colHeader[rindex].get(value).cellNum

        var curHeaderPos = {x:null, y:null, width:null, height:null}
        curHeaderPos.x = this.markWidth + this.widthRangeList[this.rowHeaderRange.right+1 + start]
        curHeaderPos.y = this.markHeight + this.heightRangeList[rindex]
        curHeaderPos.width = this.widthRangeList[start+span] - this.widthRangeList[start]
        curHeaderPos.height = this.rowHeightList[rindex]
        return curHeaderPos
      }
    },
    cal_row_header_position() {
      return (value, times) => {    
        var cindex = this.headerDistribution.get(value).layer
        var start = this.rowHeader[cindex].get(value).range[times].start
        var span = this.rowHeader[cindex].get(value).cellNum

        var curHeaderPos = {x:null, y:null, width:null, height:null}
        curHeaderPos.x = this.markWidth + this.widthRangeList[cindex]
        curHeaderPos.y = this.markHeight + this.heightRangeList[this.columnHeaderRange.bottom+1 + start]
        curHeaderPos.width = this.widthRangeList[cindex+1] - this.widthRangeList[cindex]
        curHeaderPos.height = this.heightRangeList[start+span] - this.heightRangeList[start]
        return curHeaderPos
      }
    },
    cal_value_cell_position() {
      return (seq) => {
        var res = {row:null, col:null}
        var colIndex = {start:0, end:Infinity}, rowIndex = {start:0, end:Infinity}
        // column index
        for (var i=0; i<this.colHeader.length; i++) {
          for (var item of this.colHeader[i]) {
            var header = item[0]
            if (seq.has(header)) {
              var ranges = item[1].range
              for (var j=0; j<ranges.length; j++) {
                if (ranges[j].start >= colIndex.start && ranges[j].end <= colIndex.end) {
                  colIndex.start = ranges[j].start
                  colIndex.end = ranges[j].end
                  break
                }
              }
              break
            }
          }
        }
        if (colIndex.start == colIndex.end) {
          res.col = colIndex.start + this.rowHeaderRange.right+1
        }

        //row index
        for (var i=0; i<this.rowHeader.length; i++) {
          for (var item of this.rowHeader[i]) {
            var header = item[0]
            if (seq.has(header)) {
              var ranges = item[1].range
              for (var j=0; j<ranges.length; j++) {
                if (ranges[j].start >= rowIndex.start && ranges[j].end <= rowIndex.end) {
                  rowIndex.start = ranges[j].start
                  rowIndex.end = ranges[j].end
                  break
                }
              }
              break
            }
          }
        }
        if (rowIndex.start == rowIndex.end) {
          res.row = rowIndex.start + this.columnHeaderRange.bottom+1
        }        
        
        return res
      }
    },
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
      fill: rgb(213, 215, 218);
      cursor: cell;
    }
    .selected-table-mark-text {
      fill:steelblue;
      font-size:105%;
      text-anchor: middle;
    }
    .chosen-table-mark {
      fill: rgb(204, 231, 243);
      cursor: cell;
    }
    .chosen-table-mark-text {
      fill:steelblue;
      font-size:105%;
      text-anchor: middle;
    }
    .hovered-table-mark {
      fill:rgb(173, 199, 223);
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
      stroke-width: 0.4px;
    }
    .table-cell {
      fill: white;
      stroke: lightslategrey;
      stroke-width: 0.2px;
      cursor: cell;
    }
    .header-table-cell {
      fill: rgb(245, 248, 250);
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
      fill: rgb(186, 219, 228);
      fill-opacity: 20%;
      stroke-width: 1.5px;
      cursor: cell;
    }      
    .highlight-line {
      stroke: steelblue;
      stroke-width: 1.5px;
    }
    .header-line {
      stroke:rgb(43, 98, 134);
      stroke-width: 0.5px;
    }
  }
}
</style>
