<template>
    <div id = 'upload-dialog'>
      <div class = "content-container">
        <!-- <el-upload
            class="upload-demo"
            drag
            action="http://localhost:8080/"
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
        </el-upload> -->

        <el-upload
          class="upload-demo"
          drag
          action="http://127.0.0.1:14450/getupload"
          :show-file-list="false"
          :multiple="false"
          accept=".xlsx,.xls"
          name="file"
          :on-success="handleUploadSuccess" 
          >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
          <!-- <div class="el-upload__tip" slot="tip">Only xls/xlsx files</div> -->
        </el-upload>

            
      </div> 
    </div>
</template>

<script>
  import { mapState, mapMutations } from 'vuex'
  import { getUploadData } from "../../communication/communicator.js"
  import { parseTabularData } from "../../utils/tabularDataParser.js";

  export default {
    name: 'UploadDialog',
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
        // this.selectedTabularDataName = this.initTreeDataName
        // this.setCurrent("Console Sales.xlsx")
    },
    computed: {
        ...mapState([
        ])
    },
    methods: {
        // dataTableRowDBClick: function() {
        // },
        // dataTableRowClick: function(row) {
        //     let fileName = row.filename
        //     this.tempSelection = fileName
        //     //  update the selected tabular dataset
        //     this.setCurrent(fileName)
        // },
        closeUploadDialog: function() {
            this.$bus.$emit('close-upload-dialog')
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
        // getFile: function() {
        //     console.log('upload file ok')
        // },
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
        // getExistedFileNameArray: function() {
        //     // TODO
        //     let fileNameArray = []
        //     return fileNameArray
        // },
        // handlePreview: function(file) {
        // },
        handleUploadSuccess: function(res, file) {
          let self = this
          if (res != "upload ok") {
            console.log("upload error!")
            return
          }
          getUploadData(file.name, 
          function (processed_upload_data_str) {
            let processed_upload_data = parseTabularData(processed_upload_data_str)[0]
            console.log("processed_upload_data", processed_upload_data);
            sysDatasetObj.updateUploadData(processed_upload_data);
            self.$bus.$emit("update-selected-dataset")
            self.$bus.$emit("close-upload-dialog")
            // tabularDataDeferObj.resolve();
          })
        },
        // addDataCallback: function(resData) {
        // },
        // handleRemove: function() {
        // },
        // handleDelete: function(index, row) {
        //     this.tabularDataObjList.splice(index, 1)
        //     let dataObj = {
        //         username: row.username,
        //         filename: row.filename,
        //         depth: row.depth
        //     }
        //     this.selectedTabularDataName = null
        //     this.tempSelection = null
        // },
        // removeDataCallback: function(resData) {
        //     this.promptMessage(resData.type, resData.message)
        // },
        // setCurrent(fileName) {
        //     for (let i = 0; i < this.tabularDataObjList.length; i++) {
        //         let treeDataObj = this.tabularDataObjList[i]
        //         if (treeDataObj.filename === fileName) {
        //             let row = this.tabularDataObjList[i]
        //             this.$refs.treeDataTable.setCurrentRow(row);
                    
        //         }
        //     }
        // },
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
  #upload-dialog {
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
            height: 200px;
            .el-upload__text {
              font-size: 130%;
                line-height: 100px;
                width: 100%;
            }
        }
    }
  }
</style>
<style scoped lang="less">
  #upload-dialog {
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
