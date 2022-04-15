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
          :before-upload="onBeforeUpload"
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
        closeUploadDialog: function() {
            this.$bus.$emit('close-upload-dialog')
        },
        onBeforeUpload: function(file) {
          let self = this
          console.log('file', file)
          const isXLS = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          const isLt2M = file.size / 1024 / 1024 < 2;
          if (!isXLS) {
            this.$message.error('The uploaded file must be XLS/XLSX format!');
            return false
          }
          if (!isLt2M) {
            this.$message.error('The file size can not exceed 2MB!');
            return false
          }
          return true;
        },
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
          })
        },
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
