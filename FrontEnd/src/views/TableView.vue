<template>
  <div class="table-view">
    <div
      class="header-button-container"
      v-if="!isCurrFlat && !(headerFixedFlag.row && headerFixedFlag.column)"
    >
      <button
        class="button"
        id="row-header-button"
        plain
        size="small"
        @click="choose_header('row')"
      >
        row header
      </button>
      <button
        class="button"
        id="column-header-button"
        plain
        size="small"
        @click="choose_header('column')"
      >
        column header
      </button>
    </div>

    <div class="toolbar" v-if="isHeaderFixed">
      <el-row>
        <el-col :lg="20" :xl="16">
          <span class="toolbar-label">Transformation</span>
          <button
            v-if="isCurrFlat"
            type="primary"
            plain
            size="small"
            class="button"
            @click="transform_unfold()"
          >
            Unfold
          </button>
          <button
            type="primary"
            plain
            size="small"
            v-if="!isCurrFlat"
            class="button"
            @click="transform_fold()"
          >
            Fold
          </button>
          <button
            type="primary"
            plain
            size="small"
            v-if="!isCurrFlat"
            class="button"
            @click="transform_transpose()"
          >
            Transpose
          </button>
          <button
            type="primary"
            plain
            size="small"
            v-if="!isCurrFlat"
            class="button"
            @click="handle_transform_swap('FALL 2001', false)"
          >
            Swap
          </button>
          <button
            type="primary"
            plain
            size="small"
            v-if="!isCurrFlat"
            class="button"
            @click="handle_transform_2stacked_button()"
          >
            ToStacked
          </button>
          <!-- <button type="primary" plain size="small" 
            class="button"
            @click="handle_transform_2linear('HUMANITIES', 0)" > 
            ToLinear
          </button> -->
          <el-dropdown
            @command="handle_transform_2linear_dropdown"
            v-if="!isCurrFlat"
          >
            <div class="drop-down-button">
              <span class="el-dropdown-link">
                ToLinear<i class="el-icon-arrow-down el-icon--right"></i>
              </span>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="sum">Sum</el-dropdown-item>
              <el-dropdown-item command="avg">Average</el-dropdown-item>
              <el-dropdown-item command="max">Max</el-dropdown-item>
              <el-dropdown-item command="min">Min</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <!-- <button type="primary" plain size="small" 
            class="button"
            @click="transform_derive()" > 
            Derive
          </button> -->
          <!-- <button type="primary" plain size="small" v-if="!isCurrFlat"
            class="button"
            @click="transform_unnamed('SSH', colHeader, rowHeader, false)" > 
            test
          </button> -->

          <div class="recommend-element">
            <span class="toolbar-vertical-separator" />
            <span class="toolbar-label">Recommendation</span>
            <span class="toolbar-label" style="color: #3e87cc">Direction</span>
            <el-select
              v-model="directionSelectValue"
              multiple
              placeholder="Select"
              size="mini"
              style="width=155px"
            >
              <el-option key="row" label="row" value="row" />
              <el-option key="column" label="column" value="column" />
            </el-select>
            <span class="toolbar-label" style="color: #3e87cc">Priority</span>
          </div>
        </el-col>

        <el-col :lg="2" :xl="3" class="recommend-element">
          <div class="priority-slider">
            <!-- <el-slider v-model="prioritySliderValue" range show-stops :max="directionSelectValue.length==2 ? 5 : (directionSelectValue.length==0 ? 0 : 2)"></el-slider>  -->
            <el-slider
              v-model="prioritySliderValue"
              range
              show-stops
              :min="directionSelectValue.length == 0 ? 0 : 1"
              :max="
                directionSelectValue.length == 0
                  ? 0
                  : directionSelectValue.length == 2
                  ? 5
                  : 3
              "
            ></el-slider>
          </div>
        </el-col>

        <el-col :lg="2" :xl="2" class="recommend-element">
          <el-button
            id="recommend-apply-button"
            type="primary"
            icon="el-icon-check"
            size="mini"
            plain
            style="margin-top: 6px"
            circle
            @click="confirm_recommendation()"
          >
          </el-button>
          <el-button
            id="recommend-apply-button"
            type="danger"
            icon="el-icon-close"
            size="mini"
            plain
            style="margin-top: 6px"
            circle
            @click="cancel_recommendation()"
          >
          </el-button>
        </el-col>
      </el-row>
    </div>

    <div class="table-view-svg-container" @mousedown="handle_click_on_blank()">
      <svg
        class="table-view-svg"
        :height="markHeight + heightRangeList[heightRangeList.length - 1]"
        :width="markWidth + widthRangeList[widthRangeList.length - 1]"
        @mousemove="handle_mouse_move($event)"
        @mouseup.stop="handle_mouse_up()"
      >
        <rect
          x="0"
          y="0"
          :width="markWidth"
          :height="markHeight"
          class="table-mark"
        />

        <g v-if="isCurrFlat">
          <g v-for="(item, i) in flatAttrName" :key="item.index">
            <rect
              class="header-table-cell"
              :x="markWidth + widthRangeList[i]"
              :y="markHeight"
              :width="widthRangeList[i + 1] - widthRangeList[i]"
              :height="rowHeightList[0]"
            ></rect>
            <text
              class="table-cell-text"
              :x="markWidth + widthRangeList[i] + textPaddingX"
              :y="markHeight + textPaddingY"
            >
              {{ flatAttrName[i] }}
            </text>
          </g>
          <g
            v-for="(row, rowindex) in flatData"
            :key="row.index"
            :transform="
              'translate(' +
              markWidth +
              ',' +
              (heightRangeList[rowindex + 1] + markHeight) +
              ')'
            "
          >
            <g v-for="(column, columnindex) in row" :key="column.index">
              <rect
                class="table-cell"
                :x="widthRangeList[columnindex]"
                y="0"
                :width="
                  widthRangeList[columnindex + 1] - widthRangeList[columnindex]
                "
                :height="rowHeightList[rowindex + 1]"
              ></rect>
              <text
                v-if="flatData[rowindex][columnindex] != 'None'"
                class="table-cell-text"
                :x="widthRangeList[columnindex] + textPaddingX"
                :y="textPaddingY"
              >
                {{ flatData[rowindex][columnindex] }}
              </text>
            </g>
          </g>
        </g>

        <!-- cell before choosing header-->
        <g v-if="!isCurrFlat && !isHeaderFixed">
          <g
            v-for="(row, rowindex) in rowDistributionList"
            :key="row.index"
            :transform="
              'translate(' +
              markWidth +
              ',' +
              (heightRangeList[rowindex] + markHeight) +
              ')'
            "
          >
            <g v-for="(column, columnindex) in row" :key="column.index">
              <rect
                class="table-cell"
                :class="{
                  'header-table-cell':
                    (headerRange.bottom != null &&
                      rowindex <= headerRange.bottom) ||
                    (headerRange.right != null &&
                      rowDistributionList[rowindex][columnindex].end <=
                        headerRange.right),
                }"
                :x="
                  widthRangeList[
                    rowDistributionList[rowindex][columnindex].start
                  ]
                "
                y="0"
                :width="
                  widthRangeList[
                    rowDistributionList[rowindex][columnindex].end + 1
                  ] -
                  widthRangeList[
                    rowDistributionList[rowindex][columnindex].start
                  ]
                "
                :height="rowHeightList[rowindex]"
                @mousedown.stop="handle_mouse_down(rowindex, columnindex)"
              ></rect>
              <text
                v-if="dataValueList[rowindex][columnindex] != 'None'"
                class="table-cell-text"
                :x="
                  widthRangeList[
                    rowDistributionList[rowindex][columnindex].start
                  ] + textPaddingX
                "
                :y="textPaddingY"
                @mousedown.stop="handle_mouse_down(rowindex, columnindex)"
              >
                {{ dataValueList[rowindex][columnindex] }}
              </text>
            </g>
          </g>
        </g>

        <!-- cell after choosing header-->
        <g v-if="!isCurrFlat">
          <!-- column header-->
          <g v-if="headerFixedFlag.column">
            <g v-for="(item, i) in num2header" :key="'col-header-group-' + i">
              <g
                v-if="
                  !headerDistribution.get(item[1].value).isRowHeader &&
                  item[1].times < headerDistribution.get(item[1].value).count
                "
                :id="'column-header-' + i"
                :key="'column-header-' + i"
                @mousedown.stop="
                  before_header_interaction(
                    'column-header-' + i,
                    false,
                    item[1].value,
                    item[1].times,
                    headerDistribution.get(item[1].value).layer
                  )
                "
              >
                <rect
                  class="header-table-cell"
                  :key="'rect-' + i"
                  :x="
                    cal_column_header_position(item[1].value, item[1].times).x
                  "
                  :y="
                    cal_column_header_position(item[1].value, item[1].times).y
                  "
                  :width="
                    cal_column_header_position(item[1].value, item[1].times)
                      .width
                  "
                  :height="
                    cal_column_header_position(item[1].value, item[1].times)
                      .height
                  "
                ></rect>
                <text
                  class="table-cell-text"
                  :key="'text-' + i"
                  :x="
                    cal_column_header_position(item[1].value, item[1].times).x +
                    textPaddingX
                  "
                  :y="
                    cal_column_header_position(item[1].value, item[1].times).y +
                    textPaddingY
                  "
                >
                  {{ item[1].value }}
                </text>
              </g>
            </g>
          </g>
          <!-- row header-->
          <g v-if="headerFixedFlag.row">
            <g v-for="(item, i) in num2header" :key="item.index">
              <g
                v-if="
                  headerDistribution.get(item[1].value).isRowHeader &&
                  item[1].times < headerDistribution.get(item[1].value).count
                "
                :id="'row-header-' + i"
                @mousedown.stop="
                  before_header_interaction(
                    'row-header-' + i,
                    true,
                    item[1].value,
                    item[1].times,
                    headerDistribution.get(item[1].value).layer
                  )
                "
              >
                <rect
                  class="header-table-cell"
                  :x="cal_row_header_position(item[1].value, item[1].times).x"
                  :y="cal_row_header_position(item[1].value, item[1].times).y"
                  :width="
                    cal_row_header_position(item[1].value, item[1].times).width
                  "
                  :height="
                    cal_row_header_position(item[1].value, item[1].times).height
                  "
                ></rect>
                <text
                  class="table-cell-text"
                  :x="
                    cal_row_header_position(item[1].value, item[1].times).x +
                    textPaddingX
                  "
                  :y="
                    cal_row_header_position(item[1].value, item[1].times).y +
                    textPaddingY
                  "
                >
                  {{ item[1].value }}
                </text>
              </g>
            </g>
          </g>
          <!-- value cell -->
          <g v-if="isHeaderFixed">
            <!-- top-left corner -->
            <rect
              class="header-table-cell"
              :x="markWidth"
              :y="markHeight"
              :width="widthRangeList[headerRange.right + 1]"
              :height="heightRangeList[headerRange.bottom + 1]"
            ></rect>

            <g v-for="item in num2seq" :key="item.index">
              <rect
                class="table-cell"
                :x="
                  markWidth +
                  widthRangeList[cal_value_cell_position(item[1].seq).col]
                "
                :y="
                  markHeight +
                  heightRangeList[cal_value_cell_position(item[1].seq).row]
                "
                :width="
                  widthRangeList[cal_value_cell_position(item[1].seq).col + 1] -
                  widthRangeList[cal_value_cell_position(item[1].seq).col]
                "
                :height="
                  rowHeightList[cal_value_cell_position(item[1].seq).row]
                "
              ></rect>
              <text
                class="table-cell-text"
                :x="
                  markWidth +
                  widthRangeList[cal_value_cell_position(item[1].seq).col] +
                  textPaddingX
                "
                :y="
                  markHeight +
                  heightRangeList[cal_value_cell_position(item[1].seq).row] +
                  textPaddingY
                "
              >
                {{ item[1].value }}
              </text>
            </g>
          </g>
        </g>

        <!-- row mark -->
        <g v-for="(row, rowindex) in rowHeightList" :key="row.index">
          <!-- rowHeightList -->
          <rect
            :class="{
              'chosen-table-mark':
                selectByMark.row && isMarkSelected(rowindex, 'row'),
              'selected-table-mark':
                !selectByMark.row && isMarkSelected(rowindex, 'row'),
              'hovered-table-mark':
                (mouseOverMark.index == rowindex &&
                  mouseOverMark.type == 'row') ||
                (selectedMark.index == rowindex && selectedMark.type == 'row'),
            }"
            class="table-mark"
            x="0"
            :y="markHeightRangeList[rowindex] + markHeight"
            :width="markWidth"
            :height="
              markHeightRangeList[rowindex + 1] - markHeightRangeList[rowindex]
            "
            @mousedown.stop="handle_mouse_down_mark(rowindex, 'row')"
            @mouseover="handle_mouse_over_mark(rowindex, 'row')"
            @mouseout="handle_mouse_out_mark()"
          ></rect>
          <text
            :class="{
              'chosen-table-mark-text':
                selectByMark.row && isMarkSelected(rowindex, 'row'),
              'selected-table-mark-text':
                !selectByMark.row && isMarkSelected(rowindex, 'row'),
            }"
            class="table-mark-text"
            :x="markWidth / 2"
            :y="markHeightRangeList[rowindex] + markHeight + markTextPaddingY"
            @mousedown.stop="handle_mouse_down_mark(rowindex, 'row')"
            @mouseover="handle_mouse_over_mark(rowindex, 'row')"
            @mouseout="handle_mouse_out_mark()"
          >
            {{ rowindex + 1 }}
          </text>
          <!-- row mark transparent line -->
          <rect
            class="row-mark-transparent-line"
            x="0"
            :y="
              markHeightRangeList[rowindex + 1] +
              markHeight -
              markLinePadding / 2
            "
            :height="markLinePadding"
            :width="markWidth"
            @mousedown.stop="handle_mouse_down_mark_line(rowindex, 'row')"
          ></rect>
        </g>

        <!-- column mark -->
        <g v-for="(column, columnindex) in columnWidthList" :key="column.index">
          <rect
            :class="{
              'chosen-table-mark':
                selectByMark.column && isMarkSelected(columnindex, 'column'),
              'selected-table-mark':
                !selectByMark.column && isMarkSelected(columnindex, 'column'),
              'hovered-table-mark':
                (mouseOverMark.index == columnindex &&
                  mouseOverMark.type == 'column') ||
                (selectedMark.index == columnindex &&
                  selectedMark.type == 'column'),
            }"
            class="table-mark"
            :x="markWidthRangeList[columnindex] + markWidth"
            y="0"
            :width="
              markWidthRangeList[columnindex + 1] -
              markWidthRangeList[columnindex]
            "
            :height="markHeight"
            @mousedown.stop="handle_mouse_down_mark(columnindex, 'column')"
            @mouseover="handle_mouse_over_mark(columnindex, 'column')"
            @mouseout="handle_mouse_out_mark()"
          ></rect>
          <text
            :class="{
              'hovered-table-mark-text':
                (mouseOverMark.index == columnindex &&
                  mouseOverMark.type == 'column') ||
                (selectedMark.index == columnindex &&
                  selectedMark.type == 'column'),
              'selected-table-mark-text':
                !selectByMark.column && isMarkSelected(columnindex, 'column'),
              'chosen-table-mark-text':
                selectByMark.column && isMarkSelected(columnindex, 'column'),
            }"
            class="table-mark-text"
            :x="
              markWidthRangeList[columnindex] +
              markWidth +
              markColumnWidthList[columnindex] / 2
            "
            :y="markTextPaddingY"
            @mousedown.stop="handle_mouse_down_mark(columnindex, 'column')"
            @mouseover="handle_mouse_over_mark(columnindex, 'column')"
            @mouseout="handle_mouse_out_mark()"
          >
            {{ cal_column_mark(columnindex) }}
          </text>
          <!-- column mark transparent line -->
          <rect
            class="column-mark-transparent-line"
            :x="
              markWidthRangeList[columnindex + 1] +
              markWidth -
              markLinePadding / 2
            "
            y="0"
            :width="markLinePadding"
            :height="markHeight"
            @mousedown.stop="handle_mouse_down_mark_line(columnindex, 'column')"
          ></rect>
        </g>

        <!-- row mark highlight line -->
        <line
          class="highlight-line"
          v-if="selectedArea.top != null"
          :x1="markWidth"
          :x2="markWidth"
          :y1="heightRangeList[selectedArea.top] + markHeight"
          :y2="heightRangeList[selectedArea.bottom + 1] + markHeight"
        ></line>

        <!-- column mark highlight line -->
        <line
          class="highlight-line"
          v-if="selectedArea.top != null"
          :x1="widthRangeList[selectedArea.left] + markWidth"
          :x2="widthRangeList[selectedArea.right + 1] + markWidth"
          :y1="markHeight"
          :y2="markHeight"
        ></line>

        <g class="table-mark-long-line">
          <!-- column mark long line -->
          <line
            v-if="mouseDownMarkLineState && mouseDownMarkLine.type == 'column'"
            :x1="markWidth + markWidthRangeList[mouseDownMarkLine.index + 1]"
            :x2="markWidth + markWidthRangeList[mouseDownMarkLine.index + 1]"
            :y1="markHeight"
            :y2="
              markHeight + markHeightRangeList[markHeightRangeList.length - 1]
            "
          ></line>
          <!-- row mark long line -->
          <line
            v-if="mouseDownMarkLineState && mouseDownMarkLine.type == 'row'"
            :x1="markWidth"
            :x2="markWidth + markWidthRangeList[markWidthRangeList.length - 1]"
            :y1="markHeight + markHeightRangeList[mouseDownMarkLine.index + 1]"
            :y2="markHeight + markHeightRangeList[mouseDownMarkLine.index + 1]"
          ></line>
        </g>

        <g id="recommendation-area-container"></g>

        <g id="hover-helper-container" />

        <!-- transparent mask for choosing -->
        <rect
          v-if="!isCurrFlat && isHeaderFixed"
          id="transparent-mask-for-choosing"
          :x="markWidth + widthRangeList[headerRange.right + 1]"
          :y="markHeight + heightRangeList[headerRange.bottom + 1]"
          :width="
            widthRangeList[columnWidthList.length] -
            widthRangeList[headerRange.right + 1]
          "
          :height="
            heightRangeList[rowHeightList.length] -
            heightRangeList[headerRange.bottom + 1]
          "
          @mousedown.stop="handle_mouse_down_mask($event)"
        ></rect>

        <g id="vis-container" />

        <g v-if="!isCurrFlat">
          <!-- row header line -->
          <line
            :class="{ 'header-line': headerRange.right != null }"
            :x1="markWidth + widthRangeList[headerRange.right + 1]"
            :x2="markWidth + widthRangeList[headerRange.right + 1]"
            :y1="markHeight"
            :y2="markHeight + heightRangeList[heightRangeList.length - 1]"
          ></line>
          <!-- column header line -->
          <line
            :class="{ 'header-line': headerRange.bottom != null }"
            :x1="markWidth"
            :x2="markWidth + widthRangeList[widthRangeList.length - 1]"
            :y1="markHeight + heightRangeList[headerRange.bottom + 1]"
            :y2="markHeight + heightRangeList[headerRange.bottom + 1]"
          ></line>
        </g>

        <!-- selected area -->
        <rect
          v-if="selectedArea.top != null"
          class="selected-area"
          :x="markWidth + widthRangeList[selectedArea.left]"
          :y="markHeight + heightRangeList[selectedArea.top]"
          :width="
            widthRangeList[selectedArea.right + 1] -
            widthRangeList[selectedArea.left]
          "
          :height="
            heightRangeList[selectedArea.bottom + 1] -
            heightRangeList[selectedArea.top]
          "
          @mousedown.stop="handle_mouse_down_selected($event)"
        ></rect>
      </svg>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import {
  get_column_header,
  cal_header_range,
  get_row_header,
  get_cell_sequence,
} from "./table/CreateModel.js";
import {
  get_reference_node,
  cal_recommendation_by_one_reference,
  cal_recommendation_by_two_references,
} from "./table/GetRecommendation.js";
import {
  get_unit_data_for_transmission,
  get_data_for_transmission,
  get_pos_for_transmission,
  get_data_from_chosen,
} from "./table/GetSendingData.js";
import { reduce } from "vega-lite/build/src/encoding";

export default {
  name: "TableView",
  props: {},
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

      selectedTabularData: null,
      rowDistributionList: [], // Record the start and end of each cell for each row
      dataValueList: [],

      columnWidthList: [],
      rowHeightList: [],
      markColumnWidthList: [],
      markRowHeightList: [],

      widthRangeList: [],
      heightRangeList: [],
      markWidthRangeList: [],
      markHeightRangeList: [],

      widthChangeSignal: true,
      heightChangeSignal: true,
      markWidthChangeSignal: true,
      markHeightChangeSignal: true,

      selectedCell: { cstart: null, cend: null, rstart: null, rend: null },
      selectedArea: { top: null, left: null, bottom: null, right: null },
      selectedMark: { index: null, type: null },
      selectedHeader: null,
      selectedAreaForHoverOffset: { top: null, left: null },

      mouseOverCell: {
        row: null,
        column: null,
        cstart: null,
        cend: null,
        ccurrent: null,
        rstart: null,
        rend: null,
        rcurrent: null,
      },
      mouseOverMark: { index: null, type: null },
      mouseDownMarkLine: { index: null, type: null },

      mouseDownState: false,
      mouseDownMaskState: false,
      mouseDownMarkState: false,
      mouseDownMarkLineState: false,

      selectByMark: { row: false, column: false },

      headerFixedFlag: { column: false, row: false },
      headerRange: { right: null, bottom: null },

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
      rowHeaderIndex: 100, // row headers' indexes starts from 100
      newHeaderIndex: 200, // new headers' indexes starts from 200

      isHeaderFixed: false,
      isCurrFlat: false,
      flatAttrName: null,
      flatData: null,

      hasTransposed: false,

      visRerenderPrePos: { x: 0, y: 0 },
      visRerenderAfterPos: { x: 0, y: 0 },

      isChoosingUnit: false,
      isRecommendState: false,

      recommendDataBoth: [[], [], [], [], []],
      recommendDataRow: [[], [], []],
      recommendDataCol: [[], [], []],
      prioritySliderValue: [0, 5],
      directionSelectValue: ["row", "column"],
    };
  },

  methods: {
    ...mapMutations(["UPDATE_DISPLAY_MODE"]),
    cal_range_list(list, listType) {
      var res = [0],
        i;
      for (i in list) {
        var tmp = 0;
        for (var j = 0; j <= i; j++) {
          tmp += list[j];
        }
        res.push(tmp);
      }
      if (listType == "width") {
        this.widthRangeList = res;
      } else if (listType == "height") {
        this.heightRangeList = res;
      } else if (listType == "mark width") {
        this.markWidthRangeList = res;
      } else {
        this.markHeightRangeList = res;
      }
    },
    cal_mouse_over_cell(x, y, headerFixed = true) {
      x = x - this.markWidth;
      y = y - this.markHeight;

      if (x < 0) x = 0;
      if (y < 0) y = 0;

      var rowindex,
        rowFlag = false,
        len;
      for (
        rowindex = 0, len = this.heightRangeList.length;
        rowindex < len;
        rowindex++
      ) {
        if (
          y >= this.heightRangeList[rowindex] &&
          y < this.heightRangeList[rowindex + 1]
        ) {
          rowFlag = true;
          break;
        }
      }
      if (!rowFlag && rowindex != 0) {
        rowindex -= 2;
      }
      this.mouseOverCell.rcurrent = rowindex;

      var columnindex,
        columnFlag = false;
      for (
        columnindex = 0, len = this.widthRangeList.length;
        columnindex < len;
        columnindex++
      ) {
        if (
          x >= this.widthRangeList[columnindex] &&
          x < this.widthRangeList[columnindex + 1]
        ) {
          columnFlag = true;
          break;
        }
      }
      if (!columnFlag) {
        columnindex -= 2;
      }
      this.mouseOverCell.ccurrent = columnindex;

      if (!headerFixed) {
        var row, column;
        row = rowindex;
        for (
          column = 0, len = this.rowDistributionList[rowindex].length;
          column < len;
          column++
        ) {
          if (
            columnindex >= this.rowDistributionList[rowindex][column].start &&
            columnindex <= this.rowDistributionList[rowindex][column].end
          ) {
            break;
          }
        }

        this.mouseOverCell.column = column;
        this.mouseOverCell.row = row;
        this.mouseOverCell.cstart = this.rowDistributionList[row][column].start;
        this.mouseOverCell.cend = this.rowDistributionList[row][column].end;
        this.mouseOverCell.rstart = row;
        this.mouseOverCell.rend = row;
      } else {
        // useless
        this.mouseOverCell.row = null;
        this.mouseOverCell.column = null;

        // 得根据seq或header range算
        if (
          rowindex > this.headerRange.bottom &&
          columnindex > this.headerRange.right
        ) {
          // value cell
          this.mouseOverCell.cstart = columnindex;
          this.mouseOverCell.cend = columnindex;
          this.mouseOverCell.rstart = rowindex;
          this.mouseOverCell.rend = rowindex;
        } else if (
          rowindex <= this.headerRange.bottom &&
          columnindex > this.headerRange.right
        ) {
          // column header todo
          this.mouseOverCell.cstart = 0;
          this.mouseOverCell.cend = 0;
          this.mouseOverCell.rstart = rowindex;
          this.mouseOverCell.rend = rowindex;
        } else if (
          rowindex > this.headerRange.bottom &&
          columnindex <= this.headerRange.right
        ) {
          // row header todo
          this.mouseOverCell.cstart = columnindex;
          this.mouseOverCell.cend = columnindex;
          this.mouseOverCell.rstart = 0;
          this.mouseOverCell.rend = 0;
        } else {
          this.mouseOverCell.cstart = 0;
          this.mouseOverCell.cend = this.headerRange.right;
          this.mouseOverCell.rstart = 0;
          this.mouseOverCell.rend = this.headerRange.bottom;
        }
      }
    },
    cal_column_mark(index) {
      var res = "";
      var first = parseInt(index / 26);
      if (first > 0) {
        res = String.fromCharCode(64 + first);
      }
      res += String.fromCharCode(65 + (index % 26));
      return res;
    },
    cal_column_number_with_mark(mark) {
      var res;
      if (mark.length == 1) {
        res = mark.charCodeAt() - 64;
      } else if (mark.length == 2) {
        res = (mark[0].charCodeAt() - 64) * 26 + (mark[1].charCodeAt() - 64);
      } else {
        console.log("cannot resolve column mark!");
        return;
      }
      return res;
    },

    handle_mouse_down(row, column) {
      this.selectByMark.row = false;
      this.selectByMark.column = false;

      this.selectedCell.cstart = this.rowDistributionList[row][column].start;
      this.selectedCell.cend = this.rowDistributionList[row][column].end;
      this.selectedCell.rstart = row;
      this.selectedCell.rend = row;

      this.selectedArea.top = row;
      this.selectedArea.left = this.rowDistributionList[row][column].start;
      this.selectedArea.bottom = row;
      this.selectedArea.right = this.rowDistributionList[row][column].end;

      this.mouseDownState = true;
    },
    handle_mouse_down_mark(index, type) {
      if (type == "column") {
        this.selectByMark.column = true;
        this.selectByMark.row = false;

        this.selectedArea.top = 0;
        this.selectedArea.bottom = this.rowHeightList.length - 1;
        this.selectedArea.left = index;
        this.selectedArea.right = index;
      } else {
        this.selectByMark.row = true;
        this.selectByMark.column = false;

        this.selectedArea.top = index;
        this.selectedArea.bottom = index;
        this.selectedArea.left = 0;
        this.selectedArea.right = this.columnWidthList.length - 1;
      }
      this.selectedMark.index = index;
      this.selectedMark.type = type;
      this.mouseDownMarkState = true;
    },
    handle_mouse_down_mark_line(index, type) {
      this.mouseDownMarkLine.index = index;
      this.mouseDownMarkLine.type = type;
      this.mouseDownMarkLineState = true;

      if (type == "column") {
        this.visRerenderPrePos.x =
          this.markWidth + this.markWidthRangeList[index + 1];
        this.visRerenderPrePos.y = 0;
      } else {
        this.visRerenderPrePos.x = 0;
        this.visRerenderPrePos.y =
          this.markHeight + this.markHeightRangeList[index + 1];
      }
    },
    handle_mouse_down_mask(event) {
      this.clear_selected_header();
      this.cal_mouse_over_cell(event.offsetX, event.offsetY);

      this.selectByMark.row = false;
      this.selectByMark.column = false;

      this.selectedCell.cstart = this.mouseOverCell.cstart;
      this.selectedCell.cend = this.mouseOverCell.cend;
      this.selectedCell.rstart = this.mouseOverCell.rstart;
      this.selectedCell.rend = this.mouseOverCell.rend;

      this.selectedArea.top = this.mouseOverCell.rstart;
      this.selectedArea.left = this.mouseOverCell.cstart;
      this.selectedArea.bottom = this.mouseOverCell.rend;
      this.selectedArea.right = this.mouseOverCell.cend;

      this.selectedAreaForHoverOffset.top = this.mouseOverCell.rstart;
      this.selectedAreaForHoverOffset.left = this.mouseOverCell.cstart;

      this.mouseDownState = true;
      this.mouseDownMaskState = true;

      this.clear_recommendation_area();
      this.$bus.$emit("select-cell");
    },
    handle_mouse_down_selected(event) {
      this.cal_mouse_over_cell(event.offsetX, event.offsetY);
      // this.handle_mouse_down(this.mouseOverCell.row, this.mouseOverCell.column)
      this.handle_mouse_down_mask(event);
    },
    handle_mouse_move(event) {
      if (this.mouseDownMarkLineState) {
        if (this.mouseDownMarkLine.type == "column") {
          var offset =
            event.offsetX -
            this.markWidth -
            this.markWidthRangeList[this.mouseDownMarkLine.index];
          if (offset < this.cellMin) offset = this.cellMin;
          this.markColumnWidthList[this.mouseDownMarkLine.index] = offset;
          this.markWidthChangeSignal = !this.markWidthChangeSignal;
        } else if (this.mouseDownMarkLine.type == "row") {
          var offset =
            event.offsetY -
            this.markHeight -
            this.markHeightRangeList[this.mouseDownMarkLine.index];
          if (offset < this.cellMin) offset = this.cellMin;
          this.markRowHeightList[this.mouseDownMarkLine.index] = offset;
          this.markHeightChangeSignal = !this.markHeightChangeSignal;
        }
      } else if (this.mouseDownMarkState) {
        this.cal_mouse_over_cell(event.offsetX, event.offsetY);
        if (this.selectedMark.type == "column") {
          this.selectedArea.left =
            this.selectedMark.index < this.mouseOverCell.ccurrent
              ? this.selectedMark.index
              : this.mouseOverCell.ccurrent;
          this.selectedArea.right =
            this.selectedMark.index > this.mouseOverCell.ccurrent
              ? this.selectedMark.index
              : this.mouseOverCell.ccurrent;
        } else {
          this.selectedArea.top =
            this.selectedMark.index < this.mouseOverCell.rcurrent
              ? this.selectedMark.index
              : this.mouseOverCell.rcurrent;
          this.selectedArea.bottom =
            this.selectedMark.index > this.mouseOverCell.rcurrent
              ? this.selectedMark.index
              : this.mouseOverCell.rcurrent;
        }
      } else if (this.mouseDownState) {
        this.cal_mouse_over_cell(event.offsetX, event.offsetY);

        this.selectedArea.top =
          this.selectedCell.rstart < this.mouseOverCell.rstart
            ? this.selectedCell.rstart
            : this.mouseOverCell.rstart;
        this.selectedArea.bottom =
          this.selectedCell.rend > this.mouseOverCell.rend
            ? this.selectedCell.rend
            : this.mouseOverCell.rend;
        this.selectedArea.left =
          this.selectedCell.cstart < this.mouseOverCell.cstart
            ? this.selectedCell.cstart
            : this.mouseOverCell.cstart;
        this.selectedArea.right =
          this.selectedCell.cend > this.mouseOverCell.cend
            ? this.selectedCell.cend
            : this.mouseOverCell.cend;
      } else return; // ignore other mousemoves when mouse is not down
    },
    handle_mouse_up() {
      this.mouseDownState = false;
      this.mouseDownMarkState = false;

      if (this.mouseDownMarkLineState) {
        if (this.mouseDownMarkLine.type == "column") {
          this.columnWidthList = this.markColumnWidthList;
          this.widthChangeSignal = !this.widthChangeSignal;

          this.visRerenderAfterPos.x =
            this.markWidth +
            this.markWidthRangeList[this.mouseDownMarkLine.index + 1];
          this.visRerenderAfterPos.y = 0;
        }
        if (this.mouseDownMarkLine.type == "row") {
          this.rowHeightList = this.markRowHeightList;
          this.heightChangeSignal = !this.heightChangeSignal;

          this.visRerenderAfterPos.x = 0;
          this.visRerenderAfterPos.y =
            this.markHeight +
            this.markHeightRangeList[this.mouseDownMarkLine.index + 1];
        }

        if (
          (this.mouseDownMarkLine.type == "column" &&
            this.visRerenderAfterPos.x != this.visRerenderPrePos.x) ||
          (this.mouseDownMarkLine.type == "row" &&
            this.visRerenderAfterPos.y != this.visRerenderPrePos.y)
        ) {
          this.$bus.$emit(
            "rerender-selectedData",
            this.visRerenderPrePos,
            this.visRerenderAfterPos
          );
          console.log(
            "rerender",
            this.visRerenderPrePos,
            this.visRerenderAfterPos
          );
        }

        this.mouseDownMarkLineState = false;
      }
      this.mouseOverCell = {
        row: null,
        column: null,
        cstart: null,
        cend: null,
        ccurrent: null,
        rstart: null,
        rend: null,
        rcurrent: null,
      };
      this.mouseDownMarkLine = { index: null, type: null };
      this.selectedMark = { index: null, type: null };

      if (this.mouseDownMaskState && this.isHeaderFixed) {
        if (
          this.selectedArea.top > this.headerRange.bottom &&
          this.selectedArea.left > this.headerRange.right
        ) {
          if (
            this.selectedArea.top == this.selectedArea.bottom &&
            this.selectedArea.left == this.selectedArea.right
          ) {
            // single unit recommend here
            this.isChoosingUnit = true;
            this.show_recommend_element(true);
            this.cal_recommendation_data(
              this.selectedArea.top - this.headerRange.bottom - 1,
              this.selectedArea.bottom - this.headerRange.bottom - 1,
              this.selectedArea.left - this.headerRange.right - 1,
              this.selectedArea.right - this.headerRange.right - 1
            );
          } else {
            this.isChoosingUnit = false;
            this.hide_recommend_element();
          }
          this.transmit_chosen_to_vis(
            this.selectedArea.top,
            this.selectedArea.bottom,
            this.selectedArea.left,
            this.selectedArea.right
          );
        }
        this.mouseDownMaskState = false;
      }
    },
    // handle_mouse_up_on_blank() {
    //   this.clear_selected_cell()
    // },
    handle_click_on_blank() {
      this.clear_selected_cell(true);
      this.hide_recommend_element();
    },
    handle_mouse_over_mark(index, type) {
      if (
        this.mouseDownState ||
        this.mouseDownMarkState ||
        this.mouseDownMarkLineState
      )
        return;
      this.mouseOverMark.index = index;
      this.mouseOverMark.type = type;
    },
    handle_mouse_out_mark() {
      this.mouseOverMark = { index: null, type: null };
    },

    choose_header(type) {
      if (type == "column") {
        this.headerRange.bottom = this.selectedArea.bottom;
        this.headerFixedFlag.column = true;
      } else {
        this.headerRange.right = this.selectedArea.right;
        this.headerFixedFlag.row = true;
      }
      if (this.headerFixedFlag.row && this.headerFixedFlag.column) {
        // both column and row headers are fixed, change valuecells to header sequences
        this.colHeader = [];
        get_column_header(
          this.headerIndex,
          this.colHeaderIndex,
          this.colHeader,
          this.headerRange,
          this.rowDistributionList,
          this.dataValueList,
          this.headerDistribution,
          this.header2num,
          this.num2header
        );

        this.rowHeader = [];
        get_row_header(
          this.headerIndex,
          this.rowHeaderIndex,
          this.rowHeader,
          this.headerRange,
          this.rowHeightList,
          this.dataValueList,
          this.headerDistribution,
          this.header2num,
          this.num2header
        );

        this.num2seq = new Map();
        this.seq2num = new Map();
        get_cell_sequence(
          this.headerRange,
          this.rowHeightList,
          this.columnWidthList,
          this.dataValueList,
          this.colHeader,
          this.rowHeader,
          this.num2seq,
          this.seq2num,
          this.valueIndex
        );

        this.valueIndex = this.num2seq.size;
        this.clear_selected_cell();
        this.$emit("changeHeaderFixed", true);
      }
    },
    send_change_height_signal() {
      this.rowHeightList = this.markRowHeightList;
      this.heightChangeSignal = !this.heightChangeSignal;
      this.markHeightChangeSignal = !this.markHeightChangeSignal;
    },
    send_change_width_signal() {
      this.columnWidthList = this.markColumnWidthList;
      this.widthChangeSignal = !this.widthChangeSignal;
      this.markWidthChangeSignal = !this.markWidthChangeSignal;
    },
    set_list_length(list, n, filling) {
      if (list.length >= n) {
        return list.splice(0, n);
      } else {
        return list.concat(new Array(n - list.length).fill(filling));
      }
    },

    clear_selected_cell(clearRecommend = false) {
      this.selectedCell = {
        cstart: null,
        cend: null,
        rstart: null,
        rend: null,
      };
      this.selectedArea = { top: null, left: null, bottom: null, right: null };
      this.selectedMark = { index: null, type: null };
      this.selectByMark = { row: false, column: false };

      // cancel recommend
      if (clearRecommend) {
        this.clear_recommendation_area();
      }
    },
    clear_selected_header() {
      // this.selectedHeader = null
      d3.select("#interaction-helper").remove();
      d3.select("#interaction-helper-line").remove();
    },
    clear_recommendation_area() {
      d3.selectAll(".recommend-helper-both").remove();
      d3.selectAll(".recommend-helper-row").remove();
      d3.selectAll(".recommend-helper-col").remove();
    },
    hide_recommendation_area() {
      d3.selectAll(".recommend-helper-both").style("visibility", "hidden");
      d3.selectAll(".recommend-helper-row").style("visibility", "hidden");
      d3.selectAll(".recommend-helper-col").style("visibility", "hidden");
    },
    hide_recommend_element() {
      d3.selectAll(".recommend-element").style("visibility", "hidden");
      d3.selectAll("#recommend-apply-button").style("visibility", "hidden");

      d3.selectAll(".hover-helper").remove();
      this.isRecommendState = false;
    },
    show_recommend_element(notShowButton = false) {
      this.directionSelectValue = ["row", "column"];
      d3.selectAll(".recommend-element").style("visibility", "visible");
      if (notShowButton) {
        d3.selectAll("#recommend-apply-button").style("visibility", "hidden");
      } else {
        d3.selectAll("#recommend-apply-button").style("visibility", "visible");
        this.isRecommendState = true;
      }
    },
    cancel_recommendation() {
      this.clear_selected_cell(true);
      this.hide_recommend_element();
    },
    confirm_recommendation() {
      if (!this.isChoosingUnit) {
        this.transmit_recommendation_to_vis();
      }
      this.hide_recommend_element();
      this.clear_selected_cell(true);
    },

    handle_transform_swap(name, isSwapUp) {
      var distributionInfo = this.headerDistribution.get(name);
      if (distributionInfo.isRowHeader) {
        this.transform_swap(name, this.rowHeader, isSwapUp, true);
      } else {
        this.transform_swap(name, this.colHeader, isSwapUp, false);
      }
    },
    // handle_transform_linear_or_stacked(name, times, type) {
    //   var distributionInfo = this.headerDistribution.get(name)
    //   var layer = distributionInfo.layer
    //   var isRow = distributionInfo.isRowHeader
    //   var header = isRow ? this.rowHeader: this.colHeader
    //   var headerInfo = header[layer].get(name)
    //   if (headerInfo.children[times].indexOf("")==-1 && headerInfo.children[times].indexOf(" ")==-1) // is stacked
    //     isRow ? this.transform_2linear(name, this.rowHeader, times, isRow, type) : this.transform_2linear(name, this.colHeader, times, isRow, type)
    //   else {  // is linear
    //     isRow ? this.transform_2stacked(name, this.rowHeader, times, isRow, type) : this.transform_2stacked(name, this.colHeader, times, isRow, type)
    //   }
    // },
    handle_transform_2stacked_button() {
      if (this.selectedHeader == null) return;
      var name = this.selectedHeader.name;
      // var times = this.selectedHeader.times
      var distributionInfo = this.headerDistribution.get(name);
      var layer = distributionInfo.layer;
      var isRow = distributionInfo.isRowHeader;
      var header = isRow ? this.rowHeader : this.colHeader;

      for (var [key, headerInfo] of header[layer]) {
        var ranges = headerInfo.range;
        for (var times = 0; times < ranges.length; times++) {
          if (isRow) {
            this.transform_2stacked(key, this.rowHeader, times, true);
            this.cal_range_list(this.markRowHeightList, "mark height");
            this.cal_range_list(this.rowHeightList, "height");
          } else {
            this.transform_2stacked(key, this.colHeader, times, false);
            this.cal_range_list(this.markColumnWidthList, "mark width");
            this.cal_range_list(this.columnWidthList, "width");
          }

          // recalculate value-cell position
          for (var item of this.num2seq) {
            this.cal_value_cell_position(item[1].seq);
          }
        }
      }
      this.clear_selected_header();
    },
    handle_transform_2linear_dropdown(command) {
      if (this.selectedHeader == null) return;
      var name = this.selectedHeader.name;
      var distributionInfo = this.headerDistribution.get(name);
      var layer = distributionInfo.layer;
      var isRow = distributionInfo.isRowHeader;
      var header = isRow ? this.rowHeader : this.colHeader;

      for (var [key, headerInfo] of header[layer]) {
        var ranges = headerInfo.range;
        for (var times = 0; times < ranges.length; times++) {
          if (
            headerInfo.children[times].indexOf("") == -1 &&
            headerInfo.children[times].indexOf(" ") == -1
          ) {
            // is stacked
            if (isRow) {
              this.transform_2linear(
                key,
                this.rowHeader,
                times,
                isRow,
                command
              );
              this.cal_range_list(this.markRowHeightList, "mark height");
              this.cal_range_list(this.rowHeightList, "height");
            } else {
              this.transform_2linear(
                key,
                this.colHeader,
                times,
                isRow,
                command
              );
              this.cal_range_list(this.markColumnWidthList, "mark width");
              this.cal_range_list(this.columnWidthList, "width");
            }

            // recalculate value-cell position
            for (var item of this.num2seq) {
              this.cal_value_cell_position(item[1].seq);
            }
          } else {
            // already linear todo change operator
            continue;
          }
        }
      }
      this.clear_selected_header();
    },

    transform_fold() {
      this.clear_selected_cell(true);
      this.$bus.$emit("change-header");
      this.isCurrFlat = true;
      if (this.flatData == null) {
        this.flatData = get_data_from_chosen(
          this.headerRange.bottom + 1,
          this.rowHeightList.length - 1,
          this.headerRange.right + 1,
          this.columnWidthList.length - 1,
          this.headerRange,
          this.valueDistribution,
          this.seq2num
        );
        if (this.flatAttrName == null) {
          this.flatAttrName = [];
          for (var i = 0; i < this.flatData[0].length; i++) {
            if (i == this.flatData[0].length - 1) {
              this.flatAttrName.push("value");
            } else {
              var name = "attr" + (i + 1);
              this.flatAttrName.push(name);
            }
          }
        }
      }
      this.markColumnWidthList = this.set_list_length(
        this.markColumnWidthList,
        this.flatAttrName.length,
        this.cellWidth
      );
      this.markRowHeightList = this.set_list_length(
        this.markRowHeightList,
        this.flatData.length + 1,
        this.cellHeight
      );
      this.send_change_height_signal();
      this.send_change_width_signal();
    },
    transform_unfold() {
      this.clear_selected_cell(true);
      this.$bus.$emit("change-header");
      this.isCurrFlat = false;
      if (!this.isHeaderFixed) {
        // todo: flat识别header结构!!!!!!!!!!!!!!!!!!!!!!!!!
      }

      var lastColLayer = JSON.parse(
        JSON.stringify(Array.from(this.colHeader[this.colHeader.length - 1]))
      );
      var lastColRange = JSON.parse(
        JSON.stringify(lastColLayer[lastColLayer.length - 1][1].range)
      );
      var col =
        this.headerRange.right +
        1 +
        lastColRange[lastColRange.length - 1].end +
        1;
      this.markColumnWidthList = this.set_list_length(
        this.markColumnWidthList,
        col,
        this.cellWidth
      );

      var lastRowLayer = JSON.parse(
        JSON.stringify(Array.from(this.rowHeader[this.rowHeader.length - 1]))
      );
      var lastRowRange = JSON.parse(
        JSON.stringify(lastRowLayer[lastRowLayer.length - 1][1].range)
      );
      var row =
        this.headerRange.bottom +
        1 +
        lastRowRange[lastRowRange.length - 1].end +
        1;
      this.markRowHeightList = this.set_list_length(
        this.markRowHeightList,
        row,
        this.cellHeight
      );

      this.send_change_height_signal();
      this.send_change_width_signal();
    },
    transform_transpose() {
      this.clear_selected_cell(true);
      this.$bus.$emit("change-header");
      this.hasTransposed = !this.hasTransposed;
      for (var i = 0; i < this.colHeader.length; i++) {
        for (var item of this.colHeader[i]) {
          var header = item[0];
          this.headerDistribution.get(header).isRowHeader = true;
        }
      }
      for (var i = 0; i < this.rowHeader.length; i++) {
        for (var item of this.rowHeader[i]) {
          var header = item[0];
          this.headerDistribution.get(header).isRowHeader = false;
        }
      }

      var tmp;
      tmp = this.colHeader;
      this.colHeader = this.rowHeader;
      this.rowHeader = tmp;

      tmp = this.headerRange.bottom;
      this.headerRange.bottom = this.headerRange.right;
      this.headerRange.right = tmp;

      var colLen = this.columnWidthList.length;
      var rowLen = this.rowHeightList.length;

      this.markColumnWidthList = this.set_list_length(
        this.markColumnWidthList,
        rowLen,
        this.cellWidth
      );
      this.markRowHeightList = this.set_list_length(
        this.markRowHeightList,
        colLen,
        this.cellHeight
      );
      this.send_change_height_signal();
      this.send_change_width_signal();
    },
    transform_swap(name, header, isSwapUp, isRow) {
      this.clear_selected_cell(true);
      this.$bus.$emit("change-header");
      var distributionInfo = this.headerDistribution.get(name);
      var currLayerNum = distributionInfo.layer;
      var upLayerNum, downLayerNum;

      if (isSwapUp && currLayerNum != 0) {
        upLayerNum = currLayerNum - 1;
        downLayerNum = currLayerNum;
      } else if (!isSwapUp && currLayerNum != header.length - 1) {
        upLayerNum = currLayerNum;
        downLayerNum = currLayerNum + 1;
      } else return;

      // check fully connected
      var reference = null,
        refernum = null;
      var differ = false;
      // if (upLayerNum!=0) {
      //   for (var item of header[upLayerNum-1].keys()) {
      //     if (reference == null) {
      //       reference = header[upLayerNum-1].get(item).children[0]
      //       refernum = header[upLayerNum-1].get(item).children.length
      //     }
      //     if (refernum != header[upLayerNum-1].get(item).children.length) {
      //       differ = true
      //       return  // not fully-conn, can't swap
      //     }
      //     for (var i=0; i<header[upLayerNum-1].get(item).children.length; i++) {
      //       if (JSON.stringify(reference) != JSON.stringify(header[upLayerNum-1].get(item).children[i])) {
      //         differ = true
      //         return  // not fully-conn, can't swap
      //       }
      //     }
      //   }
      // }
      // reference = null, refernum = null, differ = false
      for (var item of header[upLayerNum].keys()) {
        if (reference == null) {
          reference = header[upLayerNum].get(item).children[0];
          refernum = header[upLayerNum].get(item).children.length;
        }
        if (refernum != header[upLayerNum].get(item).children.length) {
          differ = true;
          return; // not fully-conn, can't swap
        }
        for (var i = 0; i < header[upLayerNum].get(item).children.length; i++) {
          if (
            JSON.stringify(reference) !=
            JSON.stringify(header[upLayerNum].get(item).children[i])
          ) {
            differ = true;
            return; // not fully-conn, can't swap
          }
        }
      }
      // if (differ) {
      //   return
      // }

      var new1st = Array.from(header[upLayerNum])[0][1].parent;
      var new2nd = Array.from(header[upLayerNum])[0][1].children[0];
      var new3rd = Array.from(header[downLayerNum])[0][1].parent;
      var new4th = Array.from(header[downLayerNum])[0][1].children[0];

      var new1stChildNum =
        upLayerNum - 1 < 0
          ? 1
          : Array.from(header[upLayerNum - 1])[0][1].children.length;
      // var new2ndChildNum = Array.from(header[upLayerNum])[0][1].children.length
      var new1stCount = upLayerNum - 1 < 0 ? 1 : header[upLayerNum - 1].size;
      var new2ndChildNum =
        upLayerNum - 1 < 0
          ? 1
          : Array.from(header[upLayerNum])[0][1].parent.length;
      var new3rdChildNum = new1stChildNum * new2nd.length * new1stCount;
      // var new3rdChildNum = Array.from(header[upLayerNum])[0][1].children[0].length

      var new2ndAsParent = [],
        new3rdAsChild = [],
        new3rdAsParent = [];
      for (var j = 0; j < new2ndChildNum; j++) {
        for (var i = 0; i < new2nd.length; i++) {
          new2ndAsParent.push({ name: new2nd[i], ordinal: j });
        }
      }

      for (var i = 0; i < new3rd.length; i++) {
        if (new3rd[i].ordinal == 0) {
          new3rdAsChild.push(new3rd[i].name);
        }
      }

      for (var j = 0; j < new3rdChildNum; j++) {
        for (var i = 0; i < new3rdAsChild.length; i++) {
          new3rdAsParent.push({ name: new3rdAsChild[i], ordinal: j });
        }
      }

      if (new1st.length != 0) {
        for (var item of header[upLayerNum - 1]) {
          item[1].children = new Array(new1stChildNum).fill(new2nd);
          header[upLayerNum - 1].set(item[0], item[1]);
        }
      }

      for (var item of header[upLayerNum]) {
        item[1].parent = new2ndAsParent;
        if (new4th != null) {
          item[1].children = new Array(new3rdChildNum).fill(new4th);
        } else {
          item[1].children = [];
        }
        header[upLayerNum].set(item[0], item[1]);
        var tmp = JSON.parse(
          JSON.stringify(this.headerDistribution.get(item[0]))
        );
        tmp.layer += 1;
        this.headerDistribution.set(item[0], tmp);
      }
      for (var item of header[downLayerNum]) {
        item[1].parent = new1st;
        item[1].children = new Array(new2ndChildNum).fill(new3rdAsChild);
        header[downLayerNum].set(item[0], item[1]);
        var tmp = JSON.parse(
          JSON.stringify(this.headerDistribution.get(item[0]))
        );
        tmp.layer -= 1;
        this.headerDistribution.set(item[0], tmp);
      }

      if (new4th != null && new4th.length != 0) {
        for (var item of header[downLayerNum + 1]) {
          item[1].parent = new3rdAsParent;
          header[downLayerNum + 1].set(item[0], item[1]);
        }
      }

      // swap position in header array
      header[upLayerNum] = header.splice(
        downLayerNum,
        1,
        header[upLayerNum]
      )[0];

      // re-calculate header numbers
      // up layer
      for (var item of header[upLayerNum]) {
        var i = this.header2num.get(item[0]).length;
        var targetlen = item[1].parent.length;
        if (i > targetlen) {
          // remove redundancy
          for (var j = targetlen; j < i - 1; j++) {
            var rmindex = this.header2num.get(item[0]).pop();
            this.num2header.delete(rmindex);
          }
        } else {
          // add new
          for (i; i < targetlen; i++) {
            this.num2header.set(this.newHeaderIndex, {
              value: item[0],
              times: i,
            });
            var tmpindex = JSON.parse(
              JSON.stringify(this.header2num.get(item[0]))
            );
            tmpindex.push(this.newHeaderIndex++);
            this.header2num.set(item[0], tmpindex);
          }
        }
        this.headerDistribution.get(item[0]).count =
          item[1].parent.length == 0 ? 1 : item[1].parent.length;
      }
      // down layer
      for (var item of header[downLayerNum]) {
        var i = this.header2num.get(item[0]).length;
        var targetlen = item[1].parent.length;
        if (i > targetlen) {
          // remove redundancy
          for (var j = targetlen; j < i; j++) {
            var rmindex = this.header2num.get(item[0]).pop();
            this.num2header.delete(rmindex);
          }
        } else {
          // add new
          for (i; i < targetlen; i++) {
            this.num2header.set(this.newHeaderIndex, {
              value: item[0],
              times: i,
            });
            var tmpindex = JSON.parse(
              JSON.stringify(this.header2num.get(item[0]))
            );
            tmpindex.push(this.newHeaderIndex++);
            this.header2num.set(item[0], tmpindex);
          }
        }
        this.headerDistribution.get(item[0]).count =
          item[1].parent.length == 0 ? 1 : item[1].parent.length;
      }
    },
    transform_2stacked(name, header, times, isRow) {
      this.clear_selected_cell(true);
      this.$bus.$emit("change-header");
      var distributionInfo = JSON.parse(
        JSON.stringify(this.headerDistribution.get(name))
      );
      var layer = distributionInfo.layer;
      var headerInfo = JSON.parse(JSON.stringify(header[layer].get(name)));
      if (headerInfo.children[times].length == 0) return; // no child
      if (
        headerInfo.children[times].indexOf("") == -1 &&
        headerInfo.children[times].indexOf(" ") == -1
      )
        return; // already stacked

      // delete child
      var movingChild = headerInfo.children[times].shift();
      headerInfo.cellNum -= 1;
      header[layer].set(name, headerInfo);

      // delete parent
      var cheaderInfo = JSON.parse(
        JSON.stringify(header[layer + 1].get(movingChild))
      );
      // var pindex = cheaderInfo.parent.indexOf(name)
      var pindex;
      for (var i = 0; i < cheaderInfo.parent.length; i++) {
        if (
          cheaderInfo.parent[i].name == name &&
          cheaderInfo.parent[i].ordinal == times
        ) {
          pindex = i;
          break;
        }
      }
      cheaderInfo.parent.splice(pindex, 1);
      var deleteRange = cheaderInfo.range.splice(pindex, 1);
      var deleteIndex = deleteRange[0].start;
      if (cheaderInfo.parent.length == 0) {
        header[layer + 1].delete(movingChild);
      } else {
        header[layer + 1].set(movingChild, cheaderInfo);
      }

      // modify 'ranges'
      for (var i = 0; i < header.length; i++) {
        for (var item of header[i]) {
          var info = item[1];
          var ranges = info.range;
          for (var r = 0; r < ranges.length; r++) {
            if (ranges[r].start > deleteIndex) {
              ranges[r].start -= 1;
            }
            if (ranges[r].end > deleteIndex) {
              ranges[r].end -= 1;
            }
            info.range = ranges;
            header[i].set(item[0], info);
          }
        }
      }

      //modify header2num/num2header/headerDistribution
      var t = JSON.parse(JSON.stringify(this.header2num.get(movingChild)));
      var tt = t.splice(pindex, 1);
      if (t.length == 0) {
        this.header2num.delete(movingChild);
      } else {
        this.header2num.set(movingChild, t);
      }
      this.num2header.delete(tt[0]);
      for (var i = pindex; i < t.length; i++) {
        var hinfo = JSON.parse(JSON.stringify(this.num2header.get(t[i])));
        hinfo.times -= 1;
        this.num2header.set(t[i], hinfo);
      }
      var hinfo = JSON.parse(
        JSON.stringify(this.headerDistribution.get(movingChild))
      );
      hinfo.count -= 1;
      if (hinfo.count == 0) {
        this.headerDistribution.delete(movingChild);
      } else {
        this.headerDistribution.set(movingChild, hinfo);
      }

      //modify num2seq/seq2num
      for (var item of this.seq2num) {
        if (
          item[0].has(name) &&
          item[0].has(movingChild) &&
          (headerInfo.parent.length == 0 ||
            (headerInfo.parent.length != 0 &&
              item[0].has(headerInfo.parent[times].name)))
        ) {
          this.num2seq.delete(item[1].num);
          this.seq2num.delete(item[0]);
        }
      }

      // modify heightList/widthList
      if (isRow) {
        this.markRowHeightList = this.set_list_length(
          this.markRowHeightList,
          this.markRowHeightList.length - 1,
          0
        );
        this.send_change_height_signal();
      } else {
        this.markColumnWidthList = this.set_list_length(
          this.markColumnWidthList,
          this.markColumnWidthList.length - 1,
          0
        );
        this.send_change_width_signal();
      }
    },
    transform_2linear(name, header, times, isRow, type) {
      this.clear_selected_cell(true);
      this.$bus.$emit("change-header");
      var distributionInfo = JSON.parse(
        JSON.stringify(this.headerDistribution.get(name))
      );
      var layer = distributionInfo.layer;
      var headerInfo = JSON.parse(JSON.stringify(header[layer].get(name)));
      if (headerInfo.children[times].length == 0) return; // no child
      if (
        headerInfo.children[times].indexOf("") != -1 ||
        headerInfo.children[times].indexOf(" ") != -1
      )
        return; // already linear

      // add child
      var newChild =
        (isRow && !this.hasTransposed) || (!isRow && this.hasTransposed)
          ? " "
          : "";
      headerInfo.children[times].unshift(newChild);
      header[layer].set(name, headerInfo);

      // add parent
      var addIndex = headerInfo.range[times].start; // add before the first child
      var addRange = { start: addIndex, end: addIndex };
      var cheaderInfo, pindex;
      if (header[layer + 1].has(newChild)) {
        cheaderInfo = JSON.parse(
          JSON.stringify(header[layer + 1].get(newChild))
        );
        for (pindex = 0; pindex < cheaderInfo.range.length; pindex++) {
          if (cheaderInfo.range[pindex].start > addIndex) {
            break;
          }
        }
        cheaderInfo.parent.splice(pindex, 0, { name: name, ordinal: times });
        cheaderInfo.range.splice(pindex, 0, addRange);
      } else {
        cheaderInfo = new Object();
        cheaderInfo.range = [addRange];
        cheaderInfo.cellNum = 1;
        cheaderInfo.children = [];
        cheaderInfo.parent = [{ name: name, ordinal: times }];
        cheaderInfo.isFullyConn = true;
      }
      header[layer + 1].set(newChild, cheaderInfo);

      //add values
      if (isRow) {
        for (
          var j = 0;
          j < this.columnWidthList.length - this.headerRange.right - 1;
          j++
        ) {
          var range = JSON.parse(
            JSON.stringify(header[layer].get(name).range[times])
          );

          // calculate seq
          var rangea = [range.start, j];
          var rangeb = [range.start + 1, j];
          var seta = this.valueDistribution.get(rangea.toString());
          var setb = this.valueDistribution.get(rangeb.toString());
          var seq = new Set([...seta].filter((x) => setb.has(x)));
          var arra = Array.from(seta);
          var arrseq = Array.from(seq);
          // find the different index
          var flag;
          for (var t = 0; t < arra.length; t++) {
            if (arrseq.indexOf(arra[t]) == -1) {
              flag = t;
              break;
            }
          }
          arrseq.splice(flag, 0, newChild);
          seq = new Set(arrseq);

          var res,
            tmpdata = [];
          var sum = 0,
            count = 0,
            avg,
            min,
            max;
          for (var i = range.start; i <= range.end; i++) {
            var curSeq = this.valueDistribution.get([i, j].toString());
            var v = this.seq2num.get(curSeq).value;
            tmpdata.push(v);
            sum += Number(v);
            count += 1;
          }
          sum = Number(sum).toFixed(1);
          avg = Number(sum / count).toFixed(1);
          max = Number(Math.max.apply(null, tmpdata));
          min = Number(Math.min.apply(null, tmpdata));

          switch (type) {
            case "sum":
              res = sum;
              break;
            case "avg":
              res = avg;
              break;
            case "max":
              res = max;
              break;
            case "min":
              res = min;
              break;
          }

          this.num2seq.set(this.valueIndex, { value: res, seq: seq });
          this.seq2num.set(seq, { value: res, num: this.valueIndex++ });
        }
      } else {
        for (
          var i = 0;
          i < this.rowHeightList.length - this.headerRange.bottom - 1;
          i++
        ) {
          var range = JSON.parse(
            JSON.stringify(header[layer].get(name).range[times])
          );

          // calculate seq
          var rangea = [i, range.start];
          var rangeb = [i, range.start + 1];
          var seta = this.valueDistribution.get(rangea.toString());
          var setb = this.valueDistribution.get(rangeb.toString());
          var seq = new Set([...seta].filter((x) => setb.has(x)));
          var arra = Array.from(seta);
          var arrseq = Array.from(seq);
          // find the different index
          var flag;
          for (var t = 0; t < arra.length; t++) {
            if (arrseq.indexOf(arra[t]) == -1) {
              flag = t;
              break;
            }
          }
          arrseq.splice(flag, 0, newChild);
          seq = new Set(arrseq);

          var res,
            tmpdata = [];
          var sum = 0,
            count = 0,
            avg,
            min,
            max;
          for (var j = range.start; j <= range.end; j++) {
            var curSeq = this.valueDistribution.get([i, j].toString());
            var v = this.seq2num.get(curSeq).value;
            tmpdata.push(v);
            sum += Number(v);
            count += 1;
          }
          sum = Number(sum).toFixed(1);
          avg = Number(sum / count).toFixed(1);
          max = Number(Math.max.apply(null, tmpdata));
          min = Number(Math.min.apply(null, tmpdata));

          switch (type) {
            case "sum":
              res = sum;
              break;
            case "avg":
              res = avg;
              break;
            case "max":
              res = max;
              break;
            case "min":
              res = min;
              break;
          }
          this.num2seq.set(this.valueIndex, { value: res, seq: seq });
          this.seq2num.set(seq, { value: res, num: this.valueIndex++ });
        }
      }

      // modify 'ranges' and 'cellNum'
      for (var i = 0; i < header.length; i++) {
        for (var item of header[i]) {
          var info = item[1];
          var ranges = info.range;
          for (var r = 0; r < ranges.length; r++) {
            if (ranges[r].start >= addIndex) {
              if (
                ranges[r].start == addIndex &&
                (i <= layer || item[0] == newChild)
              ) {
                // do nothing
              } else {
                ranges[r].start += 1;
              }
            }
            if (ranges[r].end >= addIndex) {
              if (ranges[r].end == addIndex && item[0] == newChild) {
                // do nothing
              } else {
                ranges[r].end += 1;
              }
            }
          }
          info.range = ranges;
          header[i].set(item[0], info);
        }
      }

      //modify header2num/num2header/headerDistribution
      if (this.headerDistribution.has(newChild)) {
        var hinfo = JSON.parse(
          JSON.stringify(this.headerDistribution.get(newChild))
        );
        var t = JSON.parse(JSON.stringify(this.header2num.get(newChild)));
        t.push(this.newHeaderIndex);
        this.header2num.set(newChild, t);
        var tt = { value: newChild, times: hinfo.count++ };
        this.num2header.set(this.newHeaderIndex++, tt);
        this.headerDistribution.set(newChild, hinfo);
      } else {
        this.header2num.set(newChild, [this.newHeaderIndex]);
        this.num2header.set(this.newHeaderIndex++, {
          value: newChild,
          times: 0,
        });
        this.headerDistribution.set(newChild, {
          isRowHeader: isRow,
          layer: layer + 1,
          count: 1,
        });
      }

      // modify heightList/widthList
      if (isRow) {
        this.markRowHeightList = this.set_list_length(
          this.markRowHeightList,
          this.markRowHeightList.length + 1,
          this.cellHeight
        );
        this.send_change_height_signal();
      } else {
        this.markColumnWidthList = this.set_list_length(
          this.markColumnWidthList,
          this.markColumnWidthList.length + 1,
          this.cellWidth
        );
        this.send_change_width_signal();
      }
    },
    transform_derive() {
      this.clear_selected_cell(true);
      this.$bus.$emit("change-header");
    },
    transform_unnamed(name, oriHeader, newHeader, isRow) {
      this.clear_selected_cell(true);
      this.$bus.$emit("change-header");
      var distributionInfo = this.headerDistribution.get(name);
      var currLayerNum = distributionInfo.layer;
      if (currLayerNum != oriHeader.length - 1 || currLayerNum == 0) return; // only support the last layer
      var upLayerNum = currLayerNum - 1;

      // check if it's able to transform
      var reference = null,
        refernum = null;
      for (var item of oriHeader[upLayerNum].keys()) {
        if (reference == null) {
          reference = oriHeader[upLayerNum].get(item).children[0];
          refernum = oriHeader[upLayerNum].get(item).children.length;
        }
        // if (refernum != oriHeader[upLayerNum].get(item).children.length) {
        //   return  // not fully-conn, can't change
        // }
        for (
          var i = 0;
          i < oriHeader[upLayerNum].get(item).children.length;
          i++
        ) {
          if (
            JSON.stringify(reference) !=
            JSON.stringify(oriHeader[upLayerNum].get(item).children[i])
          ) {
            return; // not fully-conn, can't change
          }
        }
      }

      var newChildren = Array.from(oriHeader[upLayerNum])[0][1].children[0];
      var newChildrenNum = newChildren.length;

      // get new parent list
      var newParent = [],
        ordList = new Map();
      for (var [key, value] of newHeader[0]) {
        this.get_new_parent_list(key, value, 0, newHeader, newParent, ordList);
      }

      // add children for newheader's pre last layer
      var newLayerNum = newHeader.length,
        childrenCount = 0;
      for (var [key, value] of newHeader[newLayerNum - 1]) {
        for (var i = 0; i < value.range.length; i++) {
          value.children.push(newChildren);
          value.cellNum = newChildrenNum;
          childrenCount += 1;
        }
      }

      // change header & headerDistribution
      var newLayer = new Map();
      for (var i = 0; i < newChildren.length; i++) {
        var name = newChildren[i];
        this.headerDistribution.set(name, {
          isRowHeader: !isRow,
          layer: newLayerNum,
          count: childrenCount,
        });
        var cobj = new Object();
        cobj["range"] = { start: null, end: null };
        cobj["cellNum"] = 1;
        cobj["children"] = [];
        cobj["parent"] = newParent;
        cobj["isFullyConn"] = true;
        newLayer.set(name, cobj);
      }
      newHeader.push(newLayer);

      // delete children of oriheader
      for (var [key, value] of oriHeader[currLayerNum - 1]) {
        value.children = [];
        value.cellNum = 1;
      }
      oriHeader.splice(currLayerNum, 1);

      console.log("origin", oriHeader);
      console.log("new", newHeader);

      // re-calculate header rect nums
      for (var [key, value] of newHeader[newHeader.length - 1]) {
        var i = this.header2num.get(key).length;
        var targetlen = this.headerDistribution.get(key).count;
        if (i > targetlen) {
          // remove redundancy
          for (var j = targetlen; j < i - 1; j++) {
            var rmindex = this.header2num.get(key).pop();
            this.num2header.delete(rmindex);
          }
        } else {
          // add new
          for (i; i < targetlen; i++) {
            this.num2header.set(this.newHeaderIndex, { value: key, times: i });
            var tmpindex = this.header2num.get(key);
            tmpindex.push(this.newHeaderIndex++);
          }
        }
      }

      // change header range & height/width list
      if (isRow) {
        var longer =
          [this.markColumnWidthList.length - (this.headerRange.right + 1)] *
            newChildrenNum +
          this.headerRange.right;
        var shorter =
          [this.markRowHeightList.length - (this.headerRange.bottom + 1)] /
            newChildrenNum +
          (this.headerRange.bottom + 2);
        this.markRowHeightList = this.set_list_length(
          this.markRowHeightList,
          shorter,
          this.cellHeight
        );
        this.markColumnWidthList = this.set_list_length(
          this.markColumnWidthList,
          longer,
          this.cellWidth
        );

        this.headerRange.bottom += 1;
        this.headerRange.right -= 1;
      } else {
        var shorter =
          [this.markColumnWidthList.length - (this.headerRange.right + 1)] /
            newChildrenNum +
          (this.headerRange.right + 2);
        var longer =
          [this.markRowHeightList.length - (this.headerRange.bottom + 1)] *
            newChildrenNum +
          this.headerRange.bottom;

        this.markRowHeightList = this.set_list_length(
          this.markRowHeightList,
          longer,
          this.cellHeight
        );
        this.markColumnWidthList = this.set_list_length(
          this.markColumnWidthList,
          shorter,
          this.cellWidth
        );
        this.headerRange.bottom -= 1;
        this.headerRange.right += 1;
      }
      this.send_change_height_signal();
      this.send_change_width_signal();
    },
    get_new_parent_list(key, value, layer, header, newParent, ordList) {
      var ordinal;
      if (ordList.has(key)) {
        ordinal = ordList.get(key);
        ordList.set(key, ordinal + 1);
      } else {
        ordinal = 0;
        ordList.set(key, 1);
      }
      if (layer == header.length - 1) {
        // last layer
        newParent.push({ name: key, ordinal: ordinal });
        return;
      }

      for (var i = 0; i < value.children[ordinal].length; i++) {
        var name = value.children[ordinal][i];
        this.get_new_parent_list(
          name,
          header[layer + 1].get(name),
          layer + 1,
          header,
          newParent,
          ordList
        );
      }
    },

    transmit_chosen_to_vis(top, bottom, left, right) {
      var [jsdata, metadata] = get_data_for_transmission(
        top,
        bottom,
        left,
        right,
        this.headerRange,
        this.valueDistribution,
        this.seq2num,
        this.rowHeader.length,
        this.colHeader.length,
        this.headerDistribution,
        this.colHeader,
        this.rowHeader
      );
      var pos = get_pos_for_transmission(
        top,
        bottom,
        left,
        right,
        this.markWidth,
        this.markHeight,
        this.widthRangeList,
        this.heightRangeList
      );
      this.$bus.$emit("visualize-selectedData", pos, jsdata, metadata);

      // // single unit, send recommendation too
      // if (top==bottom && left==right) {
      //   this.transmit_unit_recommendation_to_vis()
      //   // this.transmit_unit_recommendation_to_vis(pos, this.directionSelectValue)
      // }
    },
    transmit_recommendation_to_vis() {
      var dataArray = [],
        data;
      if (this.directionSelectValue.length == 2) {
        data = this.recommendDataBoth;
      } else if (this.directionSelectValue[0] == "row") {
        data = this.recommendDataRow;
      } else {
        data = this.recommendDataCol;
      }

      var min = this.prioritySliderValue[0],
        max = this.prioritySliderValue[1];
      if (min == 0) min = 1;

      for (var i = min - 1; i <= max - 1; i++) {
        for (var j = 0; j < data[i].length; j++) {
          // if (typeArray.indexOf(data[i][j].type) == -1) continue  // not in right direction
          var area = data[i][j];
          var top = area.top + this.headerRange.bottom + 1;
          var bottom = area.bottom + this.headerRange.bottom + 1;
          var left = area.left + this.headerRange.right + 1;
          var right = area.right + this.headerRange.right + 1;

          var [jsdata, metadata] = get_data_for_transmission(
            top,
            bottom,
            left,
            right,
            this.headerRange,
            this.valueDistribution,
            this.seq2num,
            this.rowHeader.length,
            this.colHeader.length,
            this.headerDistribution,
            this.colHeader,
            this.rowHeader
          );
          var pos = get_pos_for_transmission(
            top,
            bottom,
            left,
            right,
            this.markWidth,
            this.markHeight,
            this.widthRangeList,
            this.heightRangeList
          );
          var obj = {
            position: pos,
            visData: jsdata,
            metaData: metadata,
            priority: i + 1,
          };
          dataArray.push(obj);
        }
      }
      console.log("recommend-data-to-send", dataArray);
      this.$bus.$emit("visualize-recommendData", dataArray);
    },
    transmit_unit_recommendation_to_vis() {
      console.log("transmit unit recommendation!!!!!");
      var min = this.prioritySliderValue[0],
        max = this.prioritySliderValue[1];
      if (min == 0) min = 1;

      var data;
      if (this.directionSelectValue.length == 2) {
        data = this.recommendDataBoth;
      } else if (this.directionSelectValue[0] == "row") {
        data = this.recommendDataRow;
        max = max > 3 ? 3 : max;
      } else if (this.directionSelectValue[0] == "column") {
        data = this.recommendDataCol;
        max = max > 3 ? 3 : max;
      } else {
        return;
      }

      var selectedPos = get_pos_for_transmission(
        this.selectedArea.top,
        this.selectedArea.bottom,
        this.selectedArea.left,
        this.selectedArea.right,
        this.markWidth,
        this.markHeight,
        this.widthRangeList,
        this.heightRangeList
      );

      var vis = [];
      // add chosen value
      var value = get_unit_data_for_transmission(
        this.selectedArea.top - this.headerRange.bottom - 1,
        this.selectedArea.left - this.headerRange.right - 1,
        this.valueDistribution,
        this.seq2num
      );
      var pos = selectedPos;
      var obj = { position: pos, value: value, priority: 0 };
      vis.push(obj);
      console.log("obj", obj);
      for (var i = min - 1; i <= max - 1; i++) {
        for (var j = 0; j < data[i].length; j++) {
          var area = data[i][j];
          var value = get_unit_data_for_transmission(
            area.top,
            area.left,
            this.valueDistribution,
            this.seq2num
          );

          var top = area.top + this.headerRange.bottom + 1;
          var bottom = area.bottom + this.headerRange.bottom + 1;
          var left = area.left + this.headerRange.right + 1;
          var right = area.right + this.headerRange.right + 1;
          var pos = get_pos_for_transmission(
            top,
            bottom,
            left,
            right,
            this.markWidth,
            this.markHeight,
            this.widthRangeList,
            this.heightRangeList
          );

          var obj = { position: pos, value: value, priority: i + 1 };
          vis.push(obj);
        }
      }
      var visdata = JSON.stringify(vis);

      var meta = { x: { range: 1 }, y: { range: 1 } };
      var metadata = JSON.stringify(meta);

      this.$bus.$emit("visualize-selectedData", selectedPos, visdata, metadata);
    },
    // transmit_unit_recommendation_to_vis() {
    //   var dataArray = [], data
    //   if (this.directionSelectValue.length == 2) {
    //     data = this.recommendDataBoth
    //   }
    //   else if (this.directionSelectValue[0] == "row") {
    //     data = this.recommendDataRow
    //   }
    //   else {
    //     data = this.recommendDataCol
    //   }

    //   var min = this.prioritySliderValue[0], max = this.prioritySliderValue[1]
    //   if (min==0) min = 1

    //   for (var i=min-1; i<=max-1; i++) {
    //     for (var j=0; j<data[i].length; j++) {
    //       // if (typeArray.indexOf(data[i][j].type) == -1) continue  // not in right direction
    //       var area = data[i][j]
    //       var value = get_unit_data_for_transmission(area.top, area.left, this.valueDistribution, this.seq2num)

    //       var top = area.top+this.headerRange.bottom+1
    //       var bottom = area.bottom+this.headerRange.bottom+1
    //       var left = area.left+this.headerRange.right+1
    //       var right = area.right+this.headerRange.right+1
    //       var pos = get_pos_for_transmission(top, bottom, left, right,
    //         this.markWidth, this.markHeight, this.widthRangeList, this.heightRangeList)

    //       var obj = {position: pos, value: value, priority: i+1}
    //       dataArray.push(obj)
    //     }
    //   }

    //   console.log("unit-recommend-data-to-send", dataArray)
    //   this.$bus.$emit('visualize-recommendUnit', dataArray)
    // },
    cal_recommendation_data(top, bottom, left, right) {
      this.recommendDataBoth = [[], [], [], [], []];
      this.recommendDataRow = [[], [], []];
      this.recommendDataCol = [[], [], []];
      var colRefer = get_reference_node(
        this.colHeader,
        left,
        right,
        false,
        this.hasTransposed
      );
      var rowRefer = get_reference_node(
        this.rowHeader,
        top,
        bottom,
        true,
        this.hasTransposed
      );
      console.log("colRefer", colRefer);
      console.log("rowRefer", rowRefer);
      if (colRefer.length == 0 && rowRefer.length == 0) {
        console.log("can't recommend!");
        return;
      }

      var headerPriority = [
        { row: [], column: [] },
        { row: [], column: [] },
      ];

      // BOTH priority1(row:p0, col:p1) && priority2(row:p0, col:p2)
      // COL priority2(row:p0, col:p1) && priority3(row:p0, col:p2)
      // ROW priority1(row:p0, col:p1; row:p0, col:p2)
      if (colRefer.length != 0) {
        cal_recommendation_by_one_reference(
          colRefer,
          top,
          bottom,
          left,
          right,
          this.colHeader,
          false,
          headerPriority,
          this.recommendDataBoth,
          this.recommendDataRow,
          this.recommendDataCol,
          this.markWidth,
          this.markHeight,
          this.widthRangeList,
          this.heightRangeList,
          this.headerRange,
          this.prioritySliderValue,
          this.directionSelectValue
        );
      }

      // BOTH priority1(row:p1, col:p0) && priority2(row:p2, col:p0)
      // ROW priority2(row:p1, col:p0) && priority3(row:p2, col:p0)
      // COL priority1(row:p1, col:p0; row:p2, col:p0)
      if (rowRefer.length != 0) {
        cal_recommendation_by_one_reference(
          rowRefer,
          top,
          bottom,
          left,
          right,
          this.rowHeader,
          true,
          headerPriority,
          this.recommendDataBoth,
          this.recommendDataRow,
          this.recommendDataCol,
          this.markWidth,
          this.markHeight,
          this.widthRangeList,
          this.heightRangeList,
          this.headerRange,
          this.prioritySliderValue,
          this.directionSelectValue
        );
      }

      if (colRefer.length != 0 && rowRefer.length != 0) {
        // BOTH priority3(row:p1, col:p1)
        // ROW priority2
        // COL priority2
        cal_recommendation_by_two_references(
          headerPriority,
          0,
          0,
          3,
          2,
          2,
          this.recommendDataBoth,
          this.recommendDataRow,
          this.recommendDataCol,
          this.markWidth,
          this.markHeight,
          this.widthRangeList,
          this.heightRangeList,
          this.headerRange,
          this.prioritySliderValue,
          this.directionSelectValue
        );

        // BOTH priority4(row:p1, col:p2)
        // ROW priority2
        // COL priority3
        cal_recommendation_by_two_references(
          headerPriority,
          0,
          1,
          4,
          2,
          3,
          this.recommendDataBoth,
          this.recommendDataRow,
          this.recommendDataCol,
          this.markWidth,
          this.markHeight,
          this.widthRangeList,
          this.heightRangeList,
          this.headerRange,
          this.prioritySliderValue,
          this.directionSelectValue
        );

        // BOTH priority4(row:p2, col:p1)
        // ROW priority3
        // COL priority2
        cal_recommendation_by_two_references(
          headerPriority,
          1,
          0,
          4,
          3,
          2,
          this.recommendDataBoth,
          this.recommendDataRow,
          this.recommendDataCol,
          this.markWidth,
          this.markHeight,
          this.widthRangeList,
          this.heightRangeList,
          this.headerRange,
          this.prioritySliderValue,
          this.directionSelectValue
        );

        // BOTH priority5(row:p2, col:p2)
        // ROW priority3
        // COL priority3
        cal_recommendation_by_two_references(
          headerPriority,
          1,
          1,
          5,
          3,
          3,
          this.recommendDataBoth,
          this.recommendDataRow,
          this.recommendDataCol,
          this.markWidth,
          this.markHeight,
          this.widthRangeList,
          this.heightRangeList,
          this.headerRange,
          this.prioritySliderValue,
          this.directionSelectValue
        );
      }
      console.log("this.recommendDataBoth", this.recommendDataBoth[1]);
    },

    get_header_index(headers, headerlist) {
      var index;
      var resrange = { start: null, end: null };
      for (var i = 0; i < headers.length; i++) {
        var info = headerlist[i].get(headers[i]);
        if (i == 0) {
          // first layer
          resrange.start = info.range[0].start;
          resrange.end = info.range[0].end;
        } else {
          for (var j = 0; j < info.range.length; j++) {
            if (
              info.range[j].start >= resrange.start &&
              info.range[j].end <= resrange.end
            ) {
              resrange.start = info.range[j].start;
              resrange.end = info.range[j].end;
            }
          }
        }
      }

      if (resrange.start == resrange.end) {
        index = resrange.start;
      } else {
        console.log("find range error!");
        return;
      }
      return index;
    },
    handle_hover_field(name) {
      var type, index;
      var haveOffset = false;
      if (name.indexOf(">") != -1) {
        // names be like "2001 > summer"
        haveOffset = true;
        var headers = name.split(" > ");
        var isrow = this.headerDistribution.get(headers[0]).isRowHeader;
        if (isrow) {
          type = "row";
          index = this.get_header_index(headers, this.rowHeader);
          index += this.headerRange.bottom + 1;
        } else {
          type = "column";
          index = this.get_header_index(headers, this.colHeader);
          index += this.headerRange.right + 1;
        }
      } else {
        type = name.split(" ")[0];
        if (type == "row") {
          // names be like "row 1"
          index = Number(name.split(" ")[1]) - 1;
        } else if (type == "column") {
          // names be like "column A"
          index = this.cal_column_number_with_mark(name.split(" ")[1]) - 1;
        } else if (type == "value") {
          console.log("hover value!");
          return;
        } else {
          console.log("hover name error!");
          return;
        }
      }

      if (haveOffset) {
        // should consider offset
        if (!this.isRecommendState) {
          this.draw_hover_helper_area(type, index);
        } else {
          // should draw hover-helper for recommendation too
          var refer = isrow
            ? this.selectedAreaForHoverOffset.top
            : this.selectedAreaForHoverOffset.left;
          var offset = index - refer;
          this.handle_recommend_hover_field(offset, index, isrow);
        }
      } else {
        this.draw_hover_helper_area(type, index);
      }
    },
    handle_recommend_hover_field(offset, chosenindex, isRow) {
      // direction
      var data;
      if (this.directionSelectValue.length == 2) data = this.recommendDataBoth;
      else if (this.directionSelectValue[0] == "row")
        data = this.recommendDataRow;
      else if (this.directionSelectValue[0] == "column")
        data = this.recommendDataCol;
      else {
        console.log("recommend data error!");
        return;
      }

      // priority
      var min = this.prioritySliderValue[0],
        max = this.prioritySliderValue[1];

      var type = isRow ? "row" : "column";
      var indexArray = new Set();
      indexArray.add(chosenindex);
      this.draw_hover_helper_area(type, chosenindex);

      for (var i = min - 1; i <= max - 1; i++) {
        for (var j = 0; j < data[i].length; j++) {
          var area = data[i][j];
          var start = isRow ? area.top : area.left;
          var end = isRow ? area.bottom : area.right;
          var resindex = start + offset;
          if (resindex > end) resindex = end;

          resindex += isRow
            ? this.headerRange.bottom + 1
            : this.headerRange.right + 1;

          if (indexArray.has(resindex)) continue;
          else {
            indexArray.add(resindex);
            this.draw_hover_helper_area(type, resindex);
          }
        }
      }
    },
    draw_hover_helper_area(type, index) {
      var helper = d3
        .select("#hover-helper-container")
        .append("rect")
        .attr("class", "hover-helper")
        .style("fill", "#FFEC8B")
        .style("fill-opacity", "30%");

      if (type == "row") {
        helper
          .attr("x", this.markWidth)
          .attr("y", this.markHeight + this.heightRangeList[index])
          .attr("width", this.widthRangeList[this.widthRangeList.length - 1])
          .attr(
            "height",
            this.heightRangeList[index + 1] - this.heightRangeList[index]
          );
      } else {
        helper
          .attr("x", this.markWidth + this.widthRangeList[index])
          .attr("y", this.markHeight)
          .attr(
            "width",
            this.widthRangeList[index + 1] - this.widthRangeList[index]
          )
          .attr(
            "height",
            this.heightRangeList[this.heightRangeList.length - 1]
          );
      }
    },

    before_header_interaction(id, isRowHeader, name, times, layer) {
      if (this.selectedArea.top != null) {
        this.clear_selected_cell(true);
        this.hide_recommend_element();
        return;
      }

      let self = this;
      // delete other helpers
      d3.select("#interaction-helper").remove();
      d3.select("#interaction-helper-line").remove();

      this.selectedHeader = { name: name, times: times };
      // add a new helper
      var rect = d3.select("#" + id).select("rect");
      var text = d3.select("#" + id).select("text");
      var tablesvg = d3.select(".table-view-svg");
      var helper = tablesvg.append("g").attr("id", "interaction-helper");
      helper
        .append("rect")
        .attr("x", rect.attr("x"))
        .attr("y", rect.attr("y"))
        .attr("width", rect.attr("width"))
        .attr("height", rect.attr("height"))
        .style("fill", "DodgerBlue")
        .style("fill-opacity", "20%")
        .style("cursor", "move");
      helper
        .append("text")
        .attr("x", text.attr("x"))
        .attr("y", text.attr("y"))
        .text(text.text())
        .style("fill-opacity", "60%")
        .style("cursor", "move")
        .style("font-family", "Helvetica, Tahoma, Arial")
        .style("-moz-user-select", "none")
        .style("-webkit-user-select", "none")
        .style("-ms-user-selec", "none")
        .style("user-select", "none");
      var guideline = tablesvg
        .append("line")
        .attr("id", "interaction-helper-line")
        .style("stroke", "CornflowerBlue");

      // add drag event
      if (!isRowHeader) {
        const drag = d3
          .drag()
          .on("drag", function (d) {
            guideline.style("stroke-width", "2px");
            d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);

            if (d.y > 0 && d.x < 0 && layer == self.headerRange.bottom) {
              guideline
                .attr(
                  "x1",
                  self.markWidth +
                    self.widthRangeList[self.headerRange.right + 1]
                )
                .attr(
                  "x2",
                  self.markWidth +
                    self.widthRangeList[self.headerRange.right + 1]
                )
                .attr(
                  "y1",
                  self.markHeight +
                    self.heightRangeList[self.headerRange.bottom + 1]
                )
                .attr(
                  "y2",
                  self.markHeight +
                    self.heightRangeList[self.heightRangeList.length - 1]
                );
            } else {
              guideline
                .attr(
                  "x1",
                  self.markWidth +
                    self.widthRangeList[self.headerRange.right + 1]
                )
                .attr(
                  "x2",
                  self.markWidth +
                    self.widthRangeList[self.widthRangeList.length - 1]
                );
              if (d.dy < 0) {
                var guidelayer = layer - 1 < 0 ? 0 : layer - 1;
                guideline
                  .attr(
                    "y1",
                    self.markHeight + self.heightRangeList[guidelayer]
                  )
                  .attr(
                    "y2",
                    self.markHeight + self.heightRangeList[guidelayer]
                  );
              } else {
                var guidelayer =
                  layer + 1 > self.headerRange.bottom
                    ? self.headerRange.bottom
                    : layer + 1;
                guideline
                  .attr(
                    "y1",
                    self.markHeight + self.heightRangeList[guidelayer + 1]
                  )
                  .attr(
                    "y2",
                    self.markHeight + self.heightRangeList[guidelayer + 1]
                  );
              }
            }
          })
          .on("end", function (d) {
            if (d.y > 0 && d.x < 0 && layer == self.headerRange.bottom) {
              self.transform_unnamed(
                name,
                self.colHeader,
                self.rowHeader,
                false
              );
            } else {
              if (d.y > 0) {
                self.transform_swap(name, self.colHeader, false, false);
              } else if (d.y < 0) {
                self.transform_swap(name, self.colHeader, true, false);
              } else {
                // self.handle_transform_linear_or_stacked(name, times, 'avg')
              }
            }

            d3.select(this).remove();
            d3.select("#interaction-helper-line").remove();
          });
        helper.datum({ y: 0, dy: 0, x: 0, dx: 0 }).call(drag);
      } else {
        const drag = d3
          .drag()
          .on("drag", function (d) {
            guideline
              .style("stroke-width", "2px")
              .attr(
                "y1",
                self.markHeight +
                  self.heightRangeList[self.headerRange.bottom + 1]
              )
              .attr(
                "y2",
                self.markHeight +
                  self.heightRangeList[self.heightRangeList.length - 1]
              );
            d3.select(this).attr("transform", `translate(${d.x}, ${d.y})`);

            if (d.x > 0 && d.y < 0 && layer == self.headerRange.right) {
              guideline
                .attr(
                  "x1",
                  self.markWidth +
                    self.widthRangeList[self.headerRange.right + 1]
                )
                .attr(
                  "x2",
                  self.markWidth +
                    self.widthRangeList[self.widthRangeList.length - 1]
                )
                .attr(
                  "y1",
                  self.markHeight +
                    self.heightRangeList[self.headerRange.bottom + 1]
                )
                .attr(
                  "y2",
                  self.markHeight +
                    self.heightRangeList[self.headerRange.bottom + 1]
                );
            } else {
              if (d.dx < 0) {
                var guidelayer = layer - 1 < 0 ? 0 : layer - 1;
                guideline
                  .attr("x1", self.markWidth + self.widthRangeList[guidelayer])
                  .attr("x2", self.markWidth + self.widthRangeList[guidelayer]);
              } else {
                var guidelayer =
                  layer + 1 > self.headerRange.right
                    ? self.headerRange.right
                    : layer + 1;
                guideline
                  .attr(
                    "x1",
                    self.markWidth + self.widthRangeList[guidelayer + 1]
                  )
                  .attr(
                    "x2",
                    self.markWidth + self.widthRangeList[guidelayer + 1]
                  );
              }
            }
          })
          .on("end", function (d) {
            if (d.x > 0 && d.y < 0 && layer == self.headerRange.right) {
              self.transform_unnamed(
                name,
                self.rowHeader,
                self.colHeader,
                true
              );
            } else {
              if (d.x > 0) {
                self.transform_swap(name, self.rowHeader, false, true);
              } else if (d.x < 0) {
                self.transform_swap(name, self.rowHeader, true, true);
              } else {
                // self.handle_transform_linear_or_stacked(name, times, 'sum')
              }
            }
            d3.select(this).remove();
            d3.select("#interaction-helper-line").remove();
          });
        helper.datum({ x: 0, dx: 0, y: 0, dy: 0 }).call(drag);
      }
    },
  },

  watch: {
    displayMode: function () {},
    // Remember to use "!this.widthChangeSignal" or "!this.heightChangeSignal" when changing width or height
    widthChangeSignal: function () {
      this.cal_range_list(this.columnWidthList, "width");
    },
    heightChangeSignal: function () {
      this.cal_range_list(this.rowHeightList, "height");
    },
    markWidthChangeSignal: function () {
      this.cal_range_list(this.markColumnWidthList, "mark width");
    },
    markHeightChangeSignal: function () {
      this.cal_range_list(this.markRowHeightList, "mark height");
    },
    colHeader: function () {
      for (var i = 0; i < this.colHeader.length; i++) {
        for (var item of this.colHeader[i].values()) {
          item.range = [];
        }
      }
      cal_header_range(this.colHeader);
    },
    rowHeader: function () {
      for (var i = 0; i < this.rowHeader.length; i++) {
        for (var item of this.rowHeader[i].values()) {
          item.range = [];
        }
      }
      cal_header_range(this.rowHeader);
    },
    num2seq: {
      handler() {
        console.log(this.num2seq);
      },
      deep: true,
    },
    prioritySliderValue: {
      deep: true,
      handler: function (data) {
        this.hide_recommendation_area();
        var direct = this.directionSelectValue,
          min = data[0],
          max = data[1];
        var prefix = "#recommend-helper-",
          name;

        if (direct.length == 0) {
          return;
        } else if (direct.length == 2) {
          prefix += "both";
        } else {
          if (direct[0] == "row") prefix += "row";
          else if (direct[0] == "column") prefix += "col";
        }

        for (var i = min; i <= max; i++) {
          name = prefix + "-" + i;
          d3.selectAll(name).style("visibility", "visible");
        }

        if (
          this.selectedArea.top != null &&
          this.selectedArea.top == this.selectedArea.bottom &&
          this.selectedArea.left == this.selectedArea.right
        ) {
          this.transmit_unit_recommendation_to_vis();
        }
      },
    },
    directionSelectValue: {
      deep: true,
      handler: function (data) {
        this.hide_recommendation_area();
        var slider = this.prioritySliderValue;
        var min = slider[0],
          max = slider[1];
        var prefix = "#recommend-helper-",
          name;

        if (data.length == 0) {
          return;
        } else if (data.length == 2) {
          prefix += "both";
        } else {
          if (data[0] == "row") prefix += "row";
          else if (data[0] == "column") prefix += "col";
          max = max > 3 ? 3 : max;
        }

        for (var i = min; i <= max; i++) {
          name = prefix + "-" + i;
          d3.selectAll(name).style("visibility", "visible");
        }

        if (
          this.selectedArea.top != null &&
          this.selectedArea.top == this.selectedArea.bottom &&
          this.selectedArea.left == this.selectedArea.right
        ) {
          this.transmit_unit_recommendation_to_vis();
        }
      },
    },
  },

  beforeMount: function () {
    this.selectedTabularData = sysDatasetObj.selectedTabularDataObj["content"];
    console.log("selectedTabularData", this.selectedTabularData);
    this.headerDistribution = new Map();
    this.valueDistribution = new Map();
    this.num2header = new Map();
    this.header2num = new Map();

    // set column width to be the same
    var row = this.selectedTabularData[0];
    var item;
    for (item in row) {
      var lengthList = row[item].length,
        len;
      for (len in lengthList) {
        this.columnWidthList.push(this.cellWidth);
        this.markColumnWidthList.push(this.cellWidth);
      }
    }

    var rcount = this.selectedTabularData.length;
    for (var i = 0; i < rcount; i++) {
      this.rowHeightList.push(this.cellHeight);
      this.markRowHeightList.push(this.cellHeight);
    }

    var rindex;
    for (rindex in this.selectedTabularData) {
      var cindex;
      var r = [],
        rvalue = [];
      for (cindex in this.selectedTabularData[rindex]) {
        var item = this.selectedTabularData[rindex][cindex];
        var range = { start: item.start, end: item.end };
        r.push(range);
        rvalue.push(item.value);
      }
      this.rowDistributionList.push(r);
      this.dataValueList.push(rvalue);
    }

    // automatically fix header
    // range-right
    for (var i = 0; i < this.selectedTabularData[0].length; i++) {
      if (
        this.selectedTabularData[0][i].value != "None" &&
        this.selectedTabularData[0][i].value != "" &&
        this.selectedTabularData[0][i].value != " "
      ) {
        this.headerRange.right = this.selectedTabularData[0][i].start - 1;
        break;
      }
    }
    // range-bottom
    for (var i = 0; i < this.selectedTabularData.length; i++) {
      if (
        this.selectedTabularData[i][0].value != "None" &&
        this.selectedTabularData[i][0].value != "" &&
        this.selectedTabularData[i][0].value != " "
      ) {
        this.headerRange.bottom = i - 1;
        break;
      }
    }
    this.headerFixedFlag.row = true;
    this.headerFixedFlag.column = true;
    this.isHeaderFixed = true;

    this.colHeader = [];
    get_column_header(
      this.headerIndex,
      this.colHeaderIndex,
      this.colHeader,
      this.headerRange,
      this.rowDistributionList,
      this.dataValueList,
      this.headerDistribution,
      this.header2num,
      this.num2header
    );

    this.rowHeader = [];
    get_row_header(
      this.headerIndex,
      this.rowHeaderIndex,
      this.rowHeader,
      this.headerRange,
      this.rowHeightList,
      this.dataValueList,
      this.headerDistribution,
      this.header2num,
      this.num2header
    );

    this.num2seq = new Map();
    this.seq2num = new Map();
    get_cell_sequence(
      this.headerRange,
      this.rowHeightList,
      this.columnWidthList,
      this.dataValueList,
      this.colHeader,
      this.rowHeader,
      this.num2seq,
      this.seq2num,
      this.valueIndex
    );

    this.valueIndex = this.num2seq.size;
    this.clear_selected_cell();
    this.$emit("changeHeaderFixed", true);

    // this.selectedArea = {top:this.headerRange.bottom+1, left:this.headerRange.right+1, bottom:this.headerRange.bottom+1, right:this.headerRange.right+1}

    this.cal_range_list(this.columnWidthList, "width");
    this.cal_range_list(this.rowHeightList, "height");
    this.cal_range_list(this.markColumnWidthList, "mark width");
    this.cal_range_list(this.markRowHeightList, "mark height");
  },

  mounted: function () {
    this.hide_recommend_element();
    console.log("this.selectedTabularData", this.selectedTabularData);
    console.log("this.columnWidthList", this.columnWidthList);
    console.log("this.rowHeightList", this.rowHeightList);
    console.log("this.rowDistributionList", this.rowDistributionList);
    console.log("this.widthRangeList", this.widthRangeList);
    console.log("this.heightRangeList", this.heightRangeList);
    console.log("this.dataValueList", this.dataValueList);

    this.$bus.$on("apply-config", (data) => {
      if (data == null) console.log("apply-null");
      if (
        !(
          this.selectedArea.left == this.selectedArea.right &&
          this.selectedArea.top == this.selectedArea.bottom
        )
      ) {
        // this.transmit_recommendation_to_vis()
        console.log("not single unit");
        this.show_recommend_element();
        this.cal_recommendation_data(
          this.selectedArea.top - this.headerRange.bottom - 1,
          this.selectedArea.bottom - this.headerRange.bottom - 1,
          this.selectedArea.left - this.headerRange.right - 1,
          this.selectedArea.right - this.headerRange.right - 1
        );
        this.clear_selected_cell(false);
      } else {
        this.hide_recommend_element();
        this.clear_selected_cell(true);
      }
    });

    this.$bus.$on("select-canvas", () => {
      console.log("remove selections of tableview");
      this.clear_selected_cell(true);
    });

    this.$bus.$on("hover-field", (fieldname) => {
      this.handle_hover_field(fieldname);
    });

    this.$bus.$on("unhover-field", () => {
      d3.selectAll(".hover-helper").remove();
    });

    // visView remotely send value
    this.$bus.$on("transmit-prioritySliderValue", (data) => {
      this.prioritySliderValue = data;
    });
  },

  computed: {
    ...mapState(["displayMode"]),
    isMarkSelected() {
      return (index, type) => {
        if (this.selectedArea.top == null) return false;
        if (type == "row") {
          if (
            index >= this.selectedArea.top &&
            index <= this.selectedArea.bottom
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          if (
            index >= this.selectedArea.left &&
            index <= this.selectedArea.right
          ) {
            return true;
          } else {
            return false;
          }
        }
      };
    },
    cal_column_header_position() {
      return (value, times) => {
        var rindex = this.headerDistribution.get(value).layer;
        var start = this.colHeader[rindex].get(value).range[times].start;
        var end = this.colHeader[rindex].get(value).range[times].end;

        var curHeaderPos = { x: null, y: null, width: null, height: null };
        curHeaderPos.x =
          this.markWidth +
          this.widthRangeList[this.headerRange.right + 1 + start];
        curHeaderPos.y = this.markHeight + this.heightRangeList[rindex];
        curHeaderPos.width =
          this.widthRangeList[this.headerRange.right + 1 + end + 1] -
          this.widthRangeList[this.headerRange.right + 1 + start];
        curHeaderPos.height = this.rowHeightList[rindex];
        return curHeaderPos;
      };
    },
    cal_row_header_position() {
      return (value, times) => {
        var cindex = this.headerDistribution.get(value).layer;
        var start = this.rowHeader[cindex].get(value).range[times].start;
        var end = this.rowHeader[cindex].get(value).range[times].end;
        // var span = this.rowHeader[cindex].get(value).range[times].end - this.rowHeader[cindex].get(value).range[times].start + 1

        var curHeaderPos = { x: null, y: null, width: null, height: null };
        curHeaderPos.x = this.markWidth + this.widthRangeList[cindex];
        curHeaderPos.y =
          this.markHeight +
          this.heightRangeList[this.headerRange.bottom + 1 + start];
        curHeaderPos.width = this.columnWidthList[cindex];
        curHeaderPos.height =
          this.heightRangeList[this.headerRange.bottom + 1 + end + 1] -
          this.heightRangeList[this.headerRange.bottom + 1 + start];
        return curHeaderPos;
      };
    },
    cal_value_cell_position() {
      return (seq) => {
        var res = { row: null, col: null };
        var colIndex = { start: 0, end: Infinity },
          rowIndex = { start: 0, end: Infinity };
        // column index
        for (var i = 0; i < this.colHeader.length; i++) {
          for (var item of this.colHeader[i]) {
            var header = item[0];
            if (seq.has(header)) {
              var ranges = item[1].range;
              for (var j = 0; j < ranges.length; j++) {
                if (
                  ranges[j].start >= colIndex.start &&
                  ranges[j].end <= colIndex.end
                ) {
                  colIndex.start = ranges[j].start;
                  colIndex.end = ranges[j].end;
                  break;
                }
              }
              break;
            }
          }
        }
        if (colIndex.start == colIndex.end) {
          res.col = colIndex.start + this.headerRange.right + 1;
        }

        //row index
        for (var i = 0; i < this.rowHeader.length; i++) {
          for (var item of this.rowHeader[i]) {
            var header = item[0];
            if (seq.has(header)) {
              var ranges = item[1].range;
              for (var j = 0; j < ranges.length; j++) {
                if (
                  ranges[j].start >= rowIndex.start &&
                  ranges[j].end <= rowIndex.end
                ) {
                  rowIndex.start = ranges[j].start;
                  rowIndex.end = ranges[j].end;
                  break;
                }
              }
              break;
            }
          }
        }
        if (rowIndex.start == rowIndex.end) {
          res.row = rowIndex.start + this.headerRange.bottom + 1;
        }
        var key = [rowIndex.start, colIndex.start].toString();
        this.valueDistribution.set(key, seq);
        return res;
      };
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
@padding: 0.7rem;
@transform-button-container-height: 2.5rem;
@transform-button-height: 2rem;
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
  .header-button-container {
    text-align: center;
  }
  .toolbar {
    height: @transform-button-container-height;
    position: absolute;
    width: 100%;
    padding-left: @padding;
    background: white;
    align-items: center;
    border-bottom: 1px solid #cecece;
    // overflow: hidden;
    .el-row {
      height: 100%;
    }
    .el-col {
      text-align: left;
      height: 100%;
    }
    .toolbar-label {
      font-size: 100%;
      user-select: none;
      color: #8a8785;
      margin-right: @padding;
      height: @transform-button-height;
    }
    .button {
      font-size: 100%;
      background-color: transparent;
      color: #3e87cc;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      user-select: none;
      // margin-right:@padding;
      height: @transform-button-height;
      margin-top: 4.5px;
    }
    .button:hover {
      background-color: #e4e9eeb6;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      user-select: none;
      height: @transform-button-height;
    }
    .drop-down-button {
      font-size: 115%;
      font-family: Tahoma, Arial;
      color: #3e87cc;
      cursor: pointer;
      // margin-right:@padding;
      padding-left: 6px;
      padding-right: 6px;
    }
    .toolbar-vertical-separator {
      border-left: 1px solid #cecece;
      height: @transform-button-height;
      margin-right: 2 * @padding;
      margin-left: @padding;
      width: 4px;
      user-select: none;
    }
    .recommend-element {
      display: inline;
    }

    // direction select
    /deep/.el-input__suffix {
      transition: 0s;
    }
    /deep/.el-input.el-input--mini.el-input--suffix {
      width: 155px;
    }
    /deep/.el-select.el-select--mini {
      margin-right: 15px;
    }

    // priority slider
    .priority-slider {
      margin-left: @padding;
      margin-top: 2px;
      position: relative;
      width: 80%;
    }
    /deep/ .el-slider__bar {
      background: #6ba8e2;
    }
    /deep/.el-slider__button {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      transition: 0s;
    }
  }

  .table-view-svg-container {
    position: absolute;
    // height:100%;
    left: @padding;
    right: 0%;
    top: @transform-button-container-height + 1rem;
    bottom: 0%;
    overflow: auto;
    // margin-top:1%;
    // margin-left:1%;
    // margin-right:1%;
    .table-view-svg {
      position: absolute;
      top: 0%;
      left: 0%;
      .table-mark {
        fill: rgb(233, 233, 233);
        stroke: lightslategrey;
        stroke-width: 0.2px;
        cursor: cell;
      }
      .selected-table-mark {
        fill: rgb(213, 215, 218);
        cursor: cell;
      }
      .selected-table-mark-text {
        fill: steelblue;
        font-size: 105%;
        text-anchor: middle;
      }
      .chosen-table-mark {
        fill: rgb(204, 231, 243);
        cursor: cell;
      }
      .chosen-table-mark-text {
        fill: steelblue;
        font-size: 105%;
        text-anchor: middle;
      }
      .hovered-table-mark {
        fill: rgb(173, 199, 223);
        cursor: pointer;
      }
      .hovered-table-mark-text {
        cursor: pointer;
      }
      .column-mark-transparent-line {
        fill: white;
        fill-opacity: 0%;
        stroke: none;
        cursor: col-resize;
      }
      .row-mark-transparent-line {
        fill: white;
        fill-opacity: 0%;
        stroke: none;
        cursor: row-resize;
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
        stroke: rgb(43, 98, 134);
        stroke-width: 0.5px;
      }
      #transparent-mask-for-choosing {
        fill-opacity: 0%;
        stroke: none;
        cursor: cell;
      }
      .flip-list-move {
        transition: transform 1s;
      }
    }
  }
}
</style>
