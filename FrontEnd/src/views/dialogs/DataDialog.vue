<template>
    <div id = 'dataset-dialog'>
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
                multiple>
                <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
            </el-upload>
            <span class = "inner-label">Your Dateset:</span>
            <el-table 
                ref="treeDataTable"
                highlight-current-row
                :default-sort = "{prop: 'date', order: 'descending'}"
                @row-dblclick="dataTableRowDBClick"
                @row-click="dataTableRowClick"
                :data="tabularDataObjList"
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
                  property="row"
                  label="Row"
                  sortable
                  >
                </el-table-column>
                <el-table-column
                  property="column"
                  label="Column"
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
                      @click="handleDelete(scope.$index, scope.row)">
                        <i class="el-icon-delete"></i>
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

  export default {
    name: 'DataDialog',
    components: {},
    data() {
      return {
       search: ' ',
       fileList: [],
       selectedTabularDataName: null,
       tempSelection: null,
       tabularDataObjList: sysDatasetObj.tabularDataObjList
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
        ])
    },
    methods: {
        dataTableRowDBClick: function() {
        },
        dataTableRowClick: function(row) {
            let fileName = row.filename
            this.tempSelection = fileName
            //  update the selected tabular dataset
            this.setCurrent(fileName)
        },
        closeDataDialog: function() {
            this.$bus.$emit('close-data-dialog')
        },
        confirmSelection: function() {
            // let self = this

            //  confirm the selected tabular dataset
            if (this.tempSelection != null) {
              // console.log("this.tempSelection", this.tempSelection)
              //   let selectionExisted = (this.treeDataArray.map(function(e) { return e.filename; })
              //     .indexOf(this.tempSelection) !== -1)
              //   console.log("selectionExisted", selectionExisted)
              //   if (selectionExisted) {
              //       this.selectedTabularDataName = this.tempSelection
              //       this.updateSelectedTabularDatasetName(this.selectedTabularDataName)
              //       this.tempSelection = null
              //       self.$cookies.set('selected-data-name', this.selectedTabularDataName)
              //   }
              this.selectedTabularDataName = this.tempSelection
              this.updateSelectedTabularDatasetName(this.selectedTabularDataName)
              this.tempSelection = null
              // this.$cookies.set('selected-data-name', this.selectedTabularDataName)
            }
            this.$bus.$emit('close-data-dialog')
        },
        getFile: function() {
            console.log('upload file ok')
        },
        onBeforeUpload: function(file) {
            let self = this
            console.log('file', file)
            const isJSON = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const isLt2M = file.size / 1024 / 1024 < 2;
            let fileNameArray = this.getExistedFileNameArray()
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
            reader.onload = function(evt) {
               let fileString = evt.target.result // content
               console.log('fileString', fileString)
            }
            return (isJSON && isLt2M && notExisted);
        },
        getExistedFileNameArray: function() {
            // TODO
            let fileNameArray = []
            return fileNameArray
        },
        handlePreview: function(file) {
        },
        handleUploadSuccess: function(res, file) {
        },
        addDataCallback: function(resData) {
        },
        handleRemove: function() {
        },
        handleDelete: function(index, row) {
            this.tabularDataObjList.splice(index, 1)
            let dataObj = {
                username: row.username,
                filename: row.filename,
                depth: row.depth
            }
            this.selectedTabularDataName = null
            this.tempSelection = null
        },
        removeDataCallback: function(resData) {
            this.promptMessage(resData.type, resData.message)
        },
        setCurrent(fileName) {
            for (let i = 0; i < this.tabularDataObjList.length; i++) {
                let treeDataObj = this.tabularDataObjList[i]
                if (treeDataObj.fileName === fileName) {
                    let row = this.tabularDataObjList[i]
                    this.$refs.treeDataTable.setCurrentRow(row);
                }
            }
        },
        updateSelectedTabularDatasetName: function (selectedFileName) {
            sysDatasetObj.updateSelectedTabularDataset(selectedFileName)
            this.$bus.$emit("update-selected-dataset")
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
  #dataset-dialog {
    .el-dialog__body {
      padding: 5px 20px !important;
    }
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
  #dataset-dialog {
    padding-bottom: 5px;
    .inner-label {
      margin-top: 10px;
      margin-bottom: 10px;
      font-size: 1.2rem;
    }
    .content-container {
      margin-bottom: 10px;
      text-align: left;
      position: relative;
      height: 230px;
      top: 0px;
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
