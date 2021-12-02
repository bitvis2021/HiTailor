<template>
    <div id = 'data-dialog'>
        <div class = "content-container">
            <el-upload
              class="upload-demo"
              drag
              action="http://127.0.0.1:14452/"
              :http-request="getFile"
              :auto-upload="true"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-upload="onBeforeUpload"
              :on-success="handleUploadSuccess"
              :file-list="fileList"
              :show-file-list="false"
              multiple
              v-if="!disableUpload">
              <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
            </el-upload>
            <span class = "inner-label">Your Dateset:</span>
            <el-table 
                ref="treeDataTable"
                highlight-current-row
                :default-sort = "{prop: 'date', order: 'descending'}"
                @row-dblclick="dataTableRowDBClick"
                @row-click="dataTableRowClick"
                :data="treeDataArray"
                max-height="170"
                border
                stripe
                style="width: 100%">
                <el-table-column
                  property="filename"
                  label="FileName"
                  sortable
                  >
                </el-table-column>
                <el-table-column
                  property="nodenum"
                  label="NodeNum"
                  sortable
                  >
                </el-table-column>
                <el-table-column
                  property="depth"
                  label="Depth"
                  sortable
                  show-overflow-tooltip>
                </el-table-column>
                <el-table-column
                  align="center">
                  <template slot="header" slot-scope="scope">
                    Delete
                  </template>
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      :disabled="scope.row.username !== userInfoName"
                      @click="handleDelete(scope.$index, scope.row)">
                        <span class="icon iconfont icon-iconfontshanchu"></span>
                    </el-button>
                  </template>
                </el-table-column>
            </el-table>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDataDialog">Cancel</el-button>
          <el-button type="primary" @click="confirmSelection">OK</el-button>
        </div>
    </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import { getTreeDataInfo } from '@/data-processing/get_tree_data_info.js'
  import { processTabularData } from '@/communication/sendData.js'

  export default {
    name: 'DataDialog',
    components: {},
    data() {
      return {
       search: ' ',
       fileList: [],
       selectedTabularDataName: null,
       tempSelection: null,
       treeDataArray: sysDatasetObj.getTreeDatasetArray()
      } 
    },
    watch: {
    },
    props: {
      initTreeDataName: {
        type: String
      }
    },
    created: function () {
    },
    beforeMount: function() {
    },
    mounted: function() {
        this.search = ""
        this.selectedTabularDataName = this.initTreeDataName
        this.setCurrent()
    },
    computed: {
        ...mapState([
          'userInfoName'
        ])
    },
    methods: {
        dataTableRowDBClick: function() {
        },
        dataTableRowClick: function(row) {
            let fileName = row.filename
            this.tempSelection = fileName
            //  设置当前选中的层次结构数据名称
            this.setCurrent(fileName)
        },
        closeDataDialog: function() {
            this.$emit('closeDataDialog')
        },
        confirmSelection: function() {
            let self = this
            //  更新外部选择的层次结构数据
            if (this.tempSelection != null) {
                let selectionExisted = (this.treeDataArray.map(function(e) { return e.filename; })
                        .indexOf(this.tempSelection) !== -1)
                if (selectionExisted) {
                    this.selectedTabularDataName = this.tempSelection
                    this.updateSelectedTreeDatasetName(this.selectedTabularDataName)
                    this.tempSelection = null
                    self.$cookies.set('selected-data-name', this.selectedTabularDataName)
                }
            }
            this.$emit('closeDataDialog')
        },
        getFile: function() {
            console.log('upload file ok')
        },
        onBeforeUpload: function(file) {
            let self = this
            const isJSON = file.type === 'application/json';
            const isLt2M = file.size / 1024 / 1024 < 2;
            let fileNameArray = this.getFileNameArray()
            let notExisted = (fileNameArray.indexOf(file.name) === -1)
            if (!isJSON) {
              this.$message.error('The uploaded file must be JSON format!');
              return
            }
            if (!isLt2M) {
              this.$message.error('The file size can not exceed 2MB!');
              return
            }
            if (!notExisted) {
              this.$message.error('The file name is existed!');   
              return 
            }
            var reader = new FileReader();
            reader.readAsText(file, 'utf-8');
            reader.onload = function(e) {
                let treeJsonObj = JSON.parse(this.result)
                let username = self.userInfoName
                let filename = file.name
                let treeInfoObj = getTreeDataInfo(treeJsonObj, username, filename)
                self.treeDataArray.push(treeInfoObj)
                if (self.userInfoName !== 'Login') {
                    console.log('treeInfoObj', treeInfoObj)
                    // 如果用户名不是'Login
                    // addTreeDataset(treeInfoObj, self.addDataCallback)
                }
            }
            return (isJSON && isLt2M && notExisted);
        },
        getFileNameArray: function() {
            let fileNameArray = []
            for (let i = 0;i < this.treeDataArray.length;i++) {
                fileNameArray.push(this.treeDataArray[i].filename)
            }
            return fileNameArray
        },
        handlePreview: function(file) {
        },
        handleUploadSuccess: function(res, file) {
            console.log('upload success!')
        },
        addDataCallback: function(resData) {
            this.promptMessage(resData.type, resData.message)
        },
        handleRemove: function() {
        },
        handleDelete: function(index, row) {
            this.treeDataArray.splice(index, 1)
            let dataObj = {
                username: row.username,
                filename: row.filename,
                depth: row.depth
            }
            this.selectedTabularDataName = null
            this.tempSelection = null
            // removeTreeDataset(dataObj, this.removeDataCallback)
        },
        removeDataCallback: function(resData) {
            this.promptMessage(resData.type, resData.message)
        },
        setCurrent(fileName) {
            //  根据selectedDataset的属性值得到选择的数据集所处的位置
            for (let i = 0; i < this.treeDataArray.length; i++) {
                let treeDataObj = this.treeDataArray[i]
                if (treeDataObj.fileName === fileName) {
                    let row = this.treeDataArray[i]
                    this.$refs.treeDataTable.setCurrentRow(row);
                }
            }
        },
        //  传递选择的项目
        updateSelectedTreeDatasetName: function (selectedFileName) {
            this.$emit('updateSelectedTreeDatasetName', selectedFileName)
        },
        promptMessage: function(type, message) {
            this.$message({
              type: type,
              message: message
            })
        }
    }
  }
</script>
<style lang="less">
  #data-dialog {
    .el-table td, .el-table th {
        padding: 1px 0 !important;
    }
    .el-button--mini, .el-button--mini.is-round {
        padding: 3px 5px;
    }
    .el-upload {
        width: 100%;
        .el-upload-dragger {
            width: 100%;
            height: 100px;
            .el-upload__text {
                line-height: 100px;
                width: 100%;
            }
        }
    }
  }
</style>
<style scoped lang="less">
  #data-dialog {
      .inner-label {
        margin-top: 10px;
        margin-bottom: 10px;
        font-size: 1.2rem;
      }
      .content-container {
        margin-top: 10px;
        margin-bottom: 10px;
        text-align: left;
      }
      .dialog-footer {
        text-align: right;
        .el-button {
          padding: 6px 10px;
          border-radius: 0px;
        }
      }
  }
</style>
