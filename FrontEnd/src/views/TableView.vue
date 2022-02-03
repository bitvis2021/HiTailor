<template>
  <div class="table-view">
    <div v-if="!(headerFixedFlag.row && headerFixedFlag.column)">
      <el-button class="button" id="row-header-button"
        @click="choose_header('row')" > 
        row header 
      </el-button>

      <el-button class="button" id="column-header-button"    
        @click="choose_header('column')" > 
        column header 
      </el-button>
    </div>

    <div v-if="headerFixedFlag.row && headerFixedFlag.column">
      <!-- <button  class="button"
       @click="to_trans_view()">
        transformation
      </button>
      <button  class="button"
        @click="to_vis_view()">
        visualization
      </button> -->
 
      <div v-if="isTransformView">
        <el-button type="primary" plain 
          class="button"
          @click="transform_transpose()" > 
          transpose
        </el-button>
        <el-button type="primary" plain 
          class="button"
          @click="transform_swap('FALL 2001', colHeader, false)" > 
          swap
        </el-button>
      </div>

      <div v-if="!isTransformView">
        <el-button type="primary" plain 
          class="button"
          @click="transmit_data_to_vis()" > 
          transmit data
        </el-button>
      </div>



    </div>

   

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
              :class="{'header-table-cell': (headerRange.bottom!=null && rowindex<=headerRange.bottom) || (headerRange.right!=null && rowDistributionList[rowindex][columnindex].end<=headerRange.right)}"
              :x="widthRangeList[rowDistributionList[rowindex][columnindex].start]"
              y="0" 
              :width="widthRangeList[rowDistributionList[rowindex][columnindex].end+1] - widthRangeList[rowDistributionList[rowindex][columnindex].start]"
              :height="rowHeightList[rowindex]"
              @mousedown="handle_mouse_down(rowindex, columnindex)">
            </rect>
            <text v-if="dataValueList[rowindex][columnindex] != 'None'"
              class="table-cell-text"
              :x="widthRangeList[rowDistributionList[rowindex][columnindex].start] + textPaddingX" :y="textPaddingY"
              @mousedown="handle_mouse_down(rowindex, columnindex)">
              {{dataValueList[rowindex][columnindex]}}
            </text>
          </g>
        </g>
      </g>

      <!-- cell after choosing header-->
      <!-- column header-->
      <g v-if="headerFixedFlag.column">
        <g v-for="item in num2header" :key="item.index"
          v-if="!headerDistribution.get(item[1].value).isRowHeader && item[1].times<headerDistribution.get(item[1].value).count">
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
          v-if="headerDistribution.get(item[1].value).isRowHeader && item[1].times<headerDistribution.get(item[1].value).count">
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
      <!-- transparent mask for choosing -->
      <rect v-if="headerFixedFlag.row && headerFixedFlag.column && !isTransformView"
        id="transparent-mask-for-choosing"
        :x="markWidth" 
        :y="markHeight"
        :width="widthRangeList[columnWidthList.length]"
        :height="heightRangeList[rowHeightList.length]"
        @mousedown="handle_mouse_down_mask($event)">
      </rect>
      

      
      <!-- row mark -->
      <g v-for="(row, rowindex) in rowHeightList" :key="row.index">  
        <!-- rowHeightList -->
        <rect 
          :class="{'chosen-table-mark': selectByMark.row && isMarkSelected(rowindex, 'row') && !isTransformView, 
            'selected-table-mark': !selectByMark.row && isMarkSelected(rowindex, 'row') && !isTransformView,
            'hovered-table-mark': (mouseOverMark.index==rowindex && mouseOverMark.type=='row') || (selectedMark.index==rowindex && selectedMark.type=='row')}"
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
          :class="{'chosen-table-mark-text': selectByMark.row && isMarkSelected(rowindex, 'row') && !isTransformView, 
            'selected-table-mark-text': !selectByMark.row && isMarkSelected(rowindex, 'row') && !isTransformView}"
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
          class='row-mark-transparent-line'
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
          :class="{'chosen-table-mark': selectByMark.column && isMarkSelected(columnindex, 'column') && !isTransformView, 
            'selected-table-mark': !selectByMark.column && isMarkSelected(columnindex, 'column') && !isTransformView,
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
            'selected-table-mark-text': !selectByMark.column && isMarkSelected(columnindex, 'column') && !isTransformView,
            'chosen-table-mark-text': selectByMark.column && isMarkSelected(columnindex, 'column') && !isTransformView}"
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
          class='column-mark-transparent-line'
          :x="markWidthRangeList[columnindex+1] + markWidth - markLinePadding/2"
          y="0"
          :width="markLinePadding"
          :height="markHeight"
          @mousedown="handle_mouse_down_mark_line(columnindex, 'column')">
        </rect>
      </g>

      <!-- row mark highlight line -->
      <line v-if="!isTransformView" class="highlight-line"
        :x1="markWidth"
        :x2="markWidth"
        :y1="heightRangeList[selectedArea.top] + markHeight"
        :y2="heightRangeList[selectedArea.bottom+1] + markHeight">
      </line>

      <!-- column mark highlight line -->
      <line v-if="!isTransformView" class="highlight-line"
        :x1="widthRangeList[selectedArea.left] + markWidth"
        :x2="widthRangeList[selectedArea.right+1] + markWidth"
        :y1="markHeight"
        :y2="markHeight">
      </line>

      <!-- selected area -->
      <rect v-if="!(headerFixedFlag.row && headerFixedFlag.column) || (headerFixedFlag.row && headerFixedFlag.column && !isTransformView)"
        class="selected-area"
        :x="markWidth + widthRangeList[selectedArea.left]" 
        :y="markHeight + heightRangeList[selectedArea.top]" 
        :width="widthRangeList[selectedArea.right+1] - widthRangeList[selectedArea.left]"
        :height="heightRangeList[selectedArea.bottom+1] - heightRangeList[selectedArea.top]"
        @mousedown="handle_mouse_down_selected($event)"
      >
      </rect>

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
      <line :class="{'header-line': headerRange.right!=null}"
        :x1="markWidth + widthRangeList[headerRange.right+1]"
        :x2="markWidth + widthRangeList[headerRange.right+1]"
        :y1="markHeight"
        :y2="markHeight + heightRangeList[heightRangeList.length-1]">
      </line>
      <!-- column header line -->
      <line :class="{'header-line': headerRange.bottom!=null}"
        :x1="markWidth"
        :x2="markWidth + widthRangeList[widthRangeList.length-1]"
        :y1="markHeight + heightRangeList[headerRange.bottom+1]"
        :y2="markHeight + heightRangeList[headerRange.bottom+1]">
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
    "isHeaderFixed": Boolean,
    "isTransformView": Boolean
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

      selectedCell: {cstart:null, cend:null, rstart:null, rend:null},
      selectedArea: {top:0, left:0, bottom:0, right:0},
      selectedMark: {index:null, type:null},

      mouseOverCell: {row:null, column:null, cstart:null, cend:null, ccurrent:null, rstart:null, rend:null, rcurrent:null},
      mouseOverMark: {index:null, type:null},
      mouseDownMarkLine: {index:null, type:null},

      mouseDownState: false,
      mouseDownMarkState: false,
      mouseDownMarkLineState: false,

      selectByMark: {row:false, column:false},

      headerFixedFlag: {column:false, row:false},
      headerRange: {right:null, bottom:null},

      colHeader: null,
      rowHeader: null,
      headerDistribution: null,
      valueDistribution: null,
      num2header: null,
      header2num: null,
      num2seq: null,
      seq2num: null,
      valueIndex: 0,
      headerIndex: 0,
      colHeaderIndex: 0, // column headers' indexes starts from 0
      rowHeaderIndex: 100,  // row headers' indexes starts from 100
      newHeaderIndex: 200, // new headers' indexes starts from 200

      colHeaderChangeSignal: true,
      rowHeaderChangeSignal: true,

      // isTransformView: false
      childIsTransformView: this.isTransformView
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
    cal_mouse_over_cell(x, y, headerFixed=false) {
      x = x - this.markWidth
      y = y - this.markHeight

      if (x < 0)  x = 0
      if (y < 0)  y = 0

      var rowindex, rowFlag=false, len
      for (rowindex=0, len=this.heightRangeList.length; rowindex<len; rowindex++) {
        if (y >= this.heightRangeList[rowindex] && y < this.heightRangeList[rowindex+1]) {
          rowFlag = true
          break
        }
      }
      if (!rowFlag && rowindex!=0) {
        rowindex -= 2
      }
      this.mouseOverCell.rcurrent = rowindex
      
      var columnindex, columnFlag=false
      for (columnindex=0, len=this.widthRangeList.length; columnindex<len; columnindex++) {
        if (x >= this.widthRangeList[columnindex] && x < this.widthRangeList[columnindex+1]) {
          columnFlag = true
          break
        }
      }
      if (!columnFlag) {
        columnindex -= 2
      }
      this.mouseOverCell.ccurrent = columnindex

      if (!headerFixed) {
        var row, column
        row = rowindex
        for (column=0, len=this.rowDistributionList[rowindex].length; column<len; column++) {
          if (columnindex >= this.rowDistributionList[rowindex][column].start && columnindex <= this.rowDistributionList[rowindex][column].end) {
            break
          }
        }

        this.mouseOverCell.column = column
        this.mouseOverCell.row = row
        this.mouseOverCell.cstart = this.rowDistributionList[row][column].start
        this.mouseOverCell.cend = this.rowDistributionList[row][column].end
        this.mouseOverCell.rstart = row
        this.mouseOverCell.rend = row
      }
      else {
        // useless
        this.mouseOverCell.row = null
        this.mouseOverCell.column = null

        // 得根据seq或header range算
        if (rowindex > this.headerRange.bottom && columnindex > this.headerRange.right) {   // value cell
          this.mouseOverCell.cstart = columnindex
          this.mouseOverCell.cend = columnindex
          this.mouseOverCell.rstart = rowindex
          this.mouseOverCell.rend = rowindex
        }
        else if (rowindex <= this.headerRange.bottom && columnindex > this.headerRange.right) {   // column header todo
          this.mouseOverCell.cstart = 0
          this.mouseOverCell.cend = 0
          this.mouseOverCell.rstart = rowindex
          this.mouseOverCell.rend = rowindex          
        }
        else if (rowindex > this.headerRange.bottom && columnindex <= this.headerRange.right) {   // row header todo
          this.mouseOverCell.cstart = columnindex
          this.mouseOverCell.cend = columnindex
          this.mouseOverCell.rstart = 0
          this.mouseOverCell.rend = 0
        }
        else {
          this.mouseOverCell.cstart = 0
          this.mouseOverCell.cend = this.headerRange.right
          this.mouseOverCell.rstart = 0
          this.mouseOverCell.rend = this.headerRange.bottom
        }
      }
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
          this.selectedArea.left = this.selectedMark.index < this.mouseOverCell.ccurrent ? this.selectedMark.index : this.mouseOverCell.ccurrent
          this.selectedArea.right = this.selectedMark.index > this.mouseOverCell.ccurrent ? this.selectedMark.index : this.mouseOverCell.ccurrent
        }
        else {
          this.selectedArea.top = this.selectedMark.index < this.mouseOverCell.rcurrent ? this.selectedMark.index : this.mouseOverCell.rcurrent
          this.selectedArea.bottom = this.selectedMark.index > this.mouseOverCell.rcurrent ? this.selectedMark.index : this.mouseOverCell.rcurrent
        }
      }
      else if (this.mouseDownState) {
        this.cal_mouse_over_cell(event.offsetX, event.offsetY)

        this.selectedArea.top = this.selectedCell.rstart < this.mouseOverCell.rstart ? this.selectedCell.rstart : this.mouseOverCell.rstart
        this.selectedArea.bottom = this.selectedCell.rend > this.mouseOverCell.rend ? this.selectedCell.rend : this.mouseOverCell.rend
        this.selectedArea.left = this.selectedCell.cstart < this.mouseOverCell.cstart ? this.selectedCell.cstart : this.mouseOverCell.cstart
        this.selectedArea.right = this.selectedCell.cend > this.mouseOverCell.cend ? this.selectedCell.cend : this.mouseOverCell.cend   
      }   
       else  return  // ignore other mousemoves when mouse is not down 
    },
    handle_mouse_down(row, column) {
      this.selectByMark.row = false
      this.selectByMark.column = false

      this.selectedCell.cstart = this.rowDistributionList[row][column].start
      this.selectedCell.cend = this.rowDistributionList[row][column].end
      this.selectedCell.rstart = row
      this.selectedCell.rend = row

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
      this.handle_mouse_down(this.mouseOverCell.row, this.mouseOverCell.column)
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
      this.mouseOverCell =  {row:null, column:null, cstart:null, cend:null, ccurrent:null, rstart:null, rend:null, rcurrent:null}
      this.mouseDownMarkLine = {index:null, type:null}
      this.selectedMark = {index:null, type:null}
    },

    handle_mouse_down_mask(event) {
      this.cal_mouse_over_cell(event.offsetX, event.offsetY)

      this.selectByMark.row = false
      this.selectByMark.column = false

      this.selectedCell.cstart = this.mouseOverCell.cstart
      this.selectedCell.cend = this.mouseOverCell.cend
      this.selectedCell.rstart = this.mouseOverCell.rstart
      this.selectedCell.rend = this.mouseOverCell.rend

      this.selectedArea.top = this.mouseOverCell.rstart
      this.selectedArea.left = this.mouseOverCell.cstart
      this.selectedArea.bottom = this.mouseOverCell.rend
      this.selectedArea.right = this.mouseOverCell.cend

      this.mouseDownState = true
    },


    choose_header(type) {
      if (type == 'column') {
        this.headerRange.bottom = this.selectedArea.bottom
        this.headerFixedFlag.column = true
      }
      else {
        this.headerRange.right = this.selectedArea.right
        this.headerFixedFlag.row = true
      }
      if (this.headerFixedFlag.row && this.headerFixedFlag.column) {    // both column and row headers are fixed, change valuecells to header sequences
        this.colHeader = []
        get_column_header(this.headerIndex, this.colHeaderIndex, this.colHeader, this.headerRange, 
          this.rowDistributionList, this.dataValueList,this.headerDistribution, this.header2num, this.num2header )
        
        this.rowHeader = []
        get_row_header(this.headerIndex, this.rowHeaderIndex, this.rowHeader, this.headerRange, this.rowHeightList,
          this.dataValueList,this.headerDistribution, this.header2num, this.num2header)
        
        this.num2seq = new Map
        this.seq2num = new Map
        get_cell_sequence(this.headerRange, this.rowHeightList, this.columnWidthList, this.dataValueList,
          this.colHeader, this.rowHeader, this.num2seq, this.seq2num, this.valueIndex)
        
        this.$emit("changeHeaderFixed", true)
      }
    },  
    // to_trans_view() {
    //   this.selectedCell = {cstart:null, cend:null, rstart:null, rend:null}
    //   this.selectedArea = {top:0, left:0, bottom:0, right:0}
    //   this.selectedMark = {index:null, type:null}
    //   this.selectByMark = {row:false, column:false}

    //   this.isTransformView = true
    // }, 
    transform_transpose() {
      for (var i=0; i<this.colHeader.length; i++) {
        for (var item of this.colHeader[i]) {
          var header = item[0]
          this.headerDistribution.get(header).isRowHeader = true
        }
      }
      for (var i=0; i<this.rowHeader.length; i++) {
        for (var item of this.rowHeader[i]) {
          var header = item[0]
          this.headerDistribution.get(header).isRowHeader = false
        }
      }

      var tmp
      tmp = this.colHeader
      this.colHeader = this.rowHeader
      this.rowHeader = tmp

      tmp = this.headerRange.bottom
      this.headerRange.bottom = this.headerRange.right
      this.headerRange.right = tmp


      if (this.columnWidthList.length > this.rowHeightList.length) {
        tmp = this.columnWidthList.length
        this.markColumnWidthList.length = this.rowHeightList.length

        for (var i=this.rowHeightList.length; i<tmp; i++) {
          this.markRowHeightList.push(this.cellHeight)
        }
      }      
      else if (this.columnWidthList.length < this.rowHeightList.length) {
        tmp = this.rowHeightList.length
        this.markRowHeightList.length = this.columnWidthList.length

        for (var i=this.columnWidthList.length; i<tmp; i++) {
          this.markColumnWidthList.push(this.cellWidth)
        }
      }
      this.columnWidthList = this.markColumnWidthList
      this.rowHeightList = this.markRowHeightList
      this.widthChangeSignal = !this.widthChangeSignal
      this.markWidthChangeSignal = !this.markWidthChangeSignal
      this.heightChangeSignal = !this.heightChangeSignal
      this.markHeightChangeSignal= !this.markHeightChangeSignal
    },
    transform_swap(name, header, isSwapUp) {
      var distributionInfo = this.headerDistribution.get(name)
      var currLayerNum = distributionInfo.layer
      var upLayerNum, downLayerNum
      if (isSwapUp && currLayerNum!=0) {
        upLayerNum = currLayerNum - 1
        downLayerNum = currLayerNum
      }
      else if(!isSwapUp && currLayerNum!=header.length-1) {
        upLayerNum = currLayerNum
        downLayerNum = currLayerNum + 1
      }
      else return

      var new1st = Array.from(header[upLayerNum])[0][1].parent
      var new2nd = Array.from(header[upLayerNum])[0][1].children
      var new3rd = Array.from(header[downLayerNum])[0][1].parent
      var new4th = Array.from(header[downLayerNum])[0][1].children

      for (var item of header[upLayerNum]) {
        item[1].parent = new2nd
        item[1].children = new4th
        header[upLayerNum].set(item[0], item[1])
        var tmp = this.headerDistribution.get(item[0])
        tmp.layer += 1
        this.headerDistribution.set(item[0], tmp)
      }
      for (var item of header[downLayerNum]) {
        item[1].parent = new1st
        item[1].children = new3rd
        header[downLayerNum].set(item[0], item[1])
        var tmp = this.headerDistribution.get(item[0])
        tmp.layer -= 1
        this.headerDistribution.set(item[0], tmp)
      }
      if (new1st.length != 0) {
        for (var item of header[upLayerNum-1]) {
          item[1].children = new2nd
          header[upLayerNum-1].set(item[0], item[1])
        }
      }
      if (new4th.length != 0) {
        for (var item of header[downLayerNum+1]) {
          item[1].parent = new3rd
          header[downLayerNum+1].set(item[0], item[1])
        }
      }

      // swap position in header array
      header[upLayerNum] = header.splice(downLayerNum, 1,  header[upLayerNum])[0]
      // this.rowHeaderChangeSignal = !this.rowHeaderChangeSignal
      // this.colHeaderChangeSignal = !this.colHeaderChangeSignal

      // re-calculate header numbers
      for (var item of header[upLayerNum]) {
        var i
        for (i=this.headerDistribution.get(item[0]).count; i<item[1].parent.length; i++) {
          this.num2header.set(this.newHeaderIndex, {"value":item[0], "times":i})
          var tmpindex = this.header2num.get(item[0])
          tmpindex.push(this.newHeaderIndex++)
          this.header2num.set(item[0], tmpindex)
        }
        this.headerDistribution.get(item[0]).count = item[1].parent.length==0 ? 1 : item[1].parent.length
      }
      for (var item of header[downLayerNum]) {
        var i
        for (i=this.headerDistribution.get(item[0]).count; i<item[1].parent.length; i++) {
          this.num2header.set(this.newHeaderIndex, {"value":item[0], "times":i})
          var tmpindex = this.header2num.get(item[0])
          tmpindex.push(this.newHeaderIndex++)
          this.header2num.set(item[0], tmpindex)
        }
        this.headerDistribution.get(item[0]).count = item[1].parent.length==0 ? 1 : item[1].parent.length
      }

    },
    // to_vis_view() {
    //   this.isTransformView = false
    // },
    transmit_data_to_vis() {
      var data = this.get_data_from_chosen(this.selectedArea.top, this.selectedArea.bottom, this.selectedArea.left, this.selectedArea.right)
      var jsdata = this.gen_json_from_data(data)
      var field = {}
      for (var j=0; j<data[0].length; j++) {
        if (j == data[0].length-1) {
          field["value"] = "quantitative"
        }
        else {
          var name = "attr" + (j+1)
          field[name] = "nominal"
        }
      }
      // console.log(field)

      var x = this.markWidth + this.widthRangeList[this.selectedArea.left]
      var y = this.markHeight + this.heightRangeList[this.selectedArea.top]
      var width = this.widthRangeList[this.selectedArea.right+1] - this.widthRangeList[this.selectedArea.left]
      var height= this.heightRangeList[this.selectedArea.bottom+1] - this.heightRangeList[this.selectedArea.top]
      var pos = {"x":x, "y":y, "width":width, "height":height}

      this.$bus.$emit('visualize-selectedData', pos, jsdata, field)
    },
    get_data_from_chosen(top, bottom, left, right) {
      var res=[]
      for (var i=top; i<=bottom; i++) {
        for (var j=left; j<=right; j++) {
          var pos = [i, j].toString()
          var seq = this.valueDistribution.get(pos)
          var value = this.seq2num.get(seq).value
          seq.add(value)
          res.push(Array.from(seq))
        }
      }
      // console.log(res)
      return res
    },
    gen_json_from_data(data) {
      var res=[]
      for (var i=0; i<data.length; i++) {
        var obj={}
        for (var j=0; j<data[i].length; j++) {
          if (j == data[i].length-1) {
            obj["value"] = data[i][j]
          }
          else {
            var name = "attr" + (j+1)
            obj[name] = data[i][j]
          }
        }
        res.push(obj)
      }
      var js = JSON.stringify(res)
    
      return js
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
      },
      colHeaderChangeSignal: function() {
        for (var i=0; i<this.colHeader.length; i++) {
          for (var item of this.colHeader[i].values()) {
            item.range = []
          }
        }
        cal_header_range(this.colHeader)
      },
      rowHeader: function() {
        for (var i=0; i<this.rowHeader.length; i++) {
          for (var item of this.rowHeader[i].values()) {
            item.range = []
          }
        }
        cal_header_range(this.rowHeader)
      },
      rowHeaderChangeSignal: function() {
        for (var i=0; i<this.rowHeader.length; i++) {
          for (var item of this.rowHeader[i].values()) {
            item.range = []
          }
        }
        cal_header_range(this.rowHeader)
      },
      isTransformView: function() {
        this.selectedCell = {cstart:null, cend:null, rstart:null, rend:null}
        this.selectedArea = {top:0, left:0, bottom:0, right:0}
        this.selectedMark = {index:null, type:null}
        this.selectByMark = {row:false, column:false}
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
    this.headerDistribution = new Map
    this.valueDistribution = new Map
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
        curHeaderPos.x = this.markWidth + this.widthRangeList[this.headerRange.right+1 + start]
        curHeaderPos.y = this.markHeight + this.heightRangeList[rindex]
        curHeaderPos.width = this.widthRangeList[this.headerRange.right+1+start+span] - this.widthRangeList[this.headerRange.right+1+start]       
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
        curHeaderPos.y = this.markHeight + this.heightRangeList[this.headerRange.bottom+1 + start]
        curHeaderPos.width = this.columnWidthList[cindex]       
        curHeaderPos.height = this.heightRangeList[this.headerRange.bottom+1+start+span] - this.heightRangeList[this.headerRange.bottom+1+start]
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
          res.col = colIndex.start + this.headerRange.right+1
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
          res.row = rowIndex.start + this.headerRange.bottom+1
        }        
        var key=[res.row, res.col].toString()
        this.valueDistribution.set(key, seq)
        return res
      }
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
.table-view {
  position: absolute;
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
  }
  .button {
    margin-top: 1%;

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
    .column-mark-transparent-line {
      fill:white;
      fill-opacity: 0%;
      stroke:none;
      cursor:col-resize;
    }
    .row-mark-transparent-line {
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
    #transparent-mask-for-choosing {
      fill-opacity: 0%;
      stroke: none;
      cursor: cell;
    }
  }
}
</style>
