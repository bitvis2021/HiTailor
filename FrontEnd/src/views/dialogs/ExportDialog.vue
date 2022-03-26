<template>
 	<el-row :gutter="24" class="export-panel">
        <el-col :offset="2" :span="20">
          <el-card shadow="hover">
            <div size='mini' class='grid-content' type='text' @click='save_as_png'>
              <span><i class='icon iconfont icon-png download-icon' slot='suffix'></i></span>
              &nbsp;
              <span class="grid-content-title">Export as PNG</span>
              <br />
              <br />
              <span class="grid-content-main">
                PNG is a bitmap image format which made up of a fixed number of pixels. They have a fixed resolution and cannot be scaled. 
              </span>
            </div>
          </el-card>
        </el-col>

        <el-col :offset="2" :span="20">
          <el-card shadow="hover">
            <div size='mini' class='grid-content' type='text' @click='save_as_svg'>
              <span><i class='icon iconfont icon-svg download-icon' slot='suffix'></i></span>
              &nbsp;
              <span class="grid-content-title">Export as SVG</span>
              <br />
              <br />
              <span class="grid-content-main">
                SVG is a vector image format which uses geometric forms to represent differet parts as discrete objects and are infinitely scalable. 
              </span>
            </div>
          </el-card>
        </el-col>
        <!-- <el-col :offset="2" :span="20">
          <el-card shadow="hover">
            <div size='mini' class='grid-content' type='text' @click='save_as_json'>
              <span><i class='icon iconfont icon-format1 download-icon' slot='suffix'></i></span>
              &nbsp;
              <span class="grid-content-title">Export as JSON</span>
              <br />
              <br />
              <span class="grid-content-main">
                JSON is a lightweight data-interchange format. This serves as the visualization template. 
              </span>
            </div>
          </el-card>
        </el-col> -->
    </el-row> 
</template>

<script>
  import saveSvgAsPng from 'save-svg-as-png'
  import d3_save_svg from 'd3-save-svg'
//   import SimplifyDsl from '@/data-processing/simplify_dsl'
  import { mapMutations, mapState } from 'vuex'
  export default {
	name: 'ExportDialog',
	components: {

	},
	data() {
		return {
			// appName: 'gotree'
		}
	},
	created: function () {
	
	},
	mounted: function() {

	},
	computed: {
		...mapState([
		//   'layoutParas',
		//   'selectedDataset',
		//   'focusedTreeObjArray'
		])
	},
	methods: {
		//	保存为png的图片
		save_as_png: function() {
	        let imageName = this.getDownloadFileName()
	        // WARNING: 如果TreeCanvas里的treeCanvasSvgId改了，这里也要改
	        // let treeCanvasSvgId = 'tree-dsl-svg-canvas'
	        // let treeCanvasId = 'tree-dsl-canvas'
	        // let treeSvg = d3.select(document.getElementById(treeCanvasSvgId))
	        // let treeCanvasG = treeSvg.select('#' + treeCanvasId)
			// console.log(svg)
			
	        // // 暂时去除辅助线
	        // treeCanvasG.selectAll('.mark-line').attr('display', 'none')

	        // // 暂时去除最外围的方框，去除了好像不好看，注释掉了
	        // // treeCanvasG.selectAll('.canvas-region-outer').attr('display', 'none')
	        // // 暂时去除resize的circle
	        // treeCanvasG.select('.tree-g').selectAll('.resize-circle-g').attr('display', 'none')


			// d3.select("#table-view-svg-container").append("div").attr("id", "table-view-svg-copy")
			// $('svg#table-view-svg').clone().appendTo($("div#table-view-svg-copy"));

			// let svg = d3.select('#table-view-svg-copy').select("#table-view-svg")
			// console.log("svg", svg.node())

			// let svg = d3.select('#table-view-svg')
			// d3.selectAll('.table-mark').attr('display', 'none')
			// d3.selectAll('.table-mark-text').attr('display', 'none')
			// svg.selectAll('.row-mark-transparent-line').attr('display', 'none')
			// svg.selectAll('.column-mark-transparent-line').attr('display', 'none')
			// svg.select('#transparent-mask-for-choosing').remove()
			// svg.select('#vis-container').remove()
			// svg.select('#hover-helper-container').remove()
			// svg.select('#recommendation-area-container').remove()

			let ssvg = document.getElementById("table-view-svg")
			console.log(ssvg)

			saveSvgAsPng.saveSvgAsPng(ssvg, imageName)
			// .then(function () {
	        // //   svg.selectAll('.table-mark').attr('display', null)
	        // //   svg.selectAll('.table-mark-text').attr('display', null)
	        // })

			// setTimeout(function() {
			// 	$('div#table-view-svg-copy').remove();
			// }, 1000)

			// svg.selectAll('.table-mark').attr('display', 'none')
			// svg.selectAll('.table-mark-text').attr('display', 'none')
	        
			// saveSvgAsPng.saveSvgAsPng(svg.node(), imageName).then(function () {
	        //   svg.selectAll('.table-mark').attr('display', null)
	        //   svg.selectAll('.table-mark-text').attr('display', null)
	        // })
	    },
	    //	保存为svg的图片
		save_as_svg: function() {
			var config = {
			    filename: this.getDownloadFileName()
			}

			d3.select("#table-view-svg-container").append("div").attr("id", "table-view-svg-copy")
			$('svg#table-view-svg').clone().appendTo($("div#table-view-svg-copy"));

			let svg = d3.select('#table-view-svg-copy').select("#table-view-svg")
			svg.selectAll('.table-mark').attr('display', 'none')
			svg.selectAll('.table-mark-text').attr('display', 'none')
			d3_save_svg.save(svg.node(), config);
			setTimeout(function() {
				$('div#table-view-svg-copy').remove();
			}, 1000)

			// $('#tree-dsl-svg-canvas-copy #index-0-g').remove();
			// let treeRenderResults = d3.select('#tree-dsl-svg-canvas').select('#index-0-g').node()
			// d3.select('#tree-dsl-svg-canvas-copy').append(treeRenderResults)
			// d3.select('#tree-dsl-svg-canvas-copy').node()
			// console.log('#index-0-g', d3.select('#tree-dsl-svg-canvas').select('#index-0-g').node())
			// console.log('tree-dsl-svg-canvas', d3.select('#tree-dsl-svg-canvas').node())
			// d3_save_svg.save(d3.select('#tree-dsl-svg-canvas').select('#index-0-g').node(), config);
		},
		// save_as_json: function() {
	    //     let layoutParas = sysDatasetObj.getLayoutParas()
	    //     let treeDSLContentObj = layoutParas.treeDSLContentObj
	    //     for (let item in treeDSLContentObj) {
	    //     	let dslObj = treeDSLContentObj[item]
		// 		// console.log('????', dslObj.Layout.X.Root.Padding)
		// 		// console.log('!!!', treeDSLContentObj)
	    //     	let simplifyDSLObj = SimplifyDsl(dslObj)
	    //     	let fileName = 'GoTree-template-' + item + '.json'
	    //     	download(simplifyDSLObj, fileName, 'text/json');
	    //     }
	    //     function download(content, fileName, contentType) {
	    //         let contentStr = JSON.stringify(content)
	    //         var a = document.createElement("a");
	    //         var file = new Blob([contentStr], {type: contentType});
	    //         a.href = URL.createObjectURL(file);
	    //         a.download = fileName;
	    //         a.click();
	    //     }
	    // },
	    getDownloadFileName: function() {
	    	// let currentTreeDSLName = this.getCurrentDSLName()
	    	let datasetName = sysDatasetObj.selectedTabularDataObj["filename"].replace('.xlsx', '')
	    	return 'HiTailor-' + datasetName
	    },
	    // getCurrentDSLName: function() {
		// 	let currentTreeDSLArray = []
		// 	let layoutParas = sysDatasetObj.getLayoutParas()
		// 	let focusedTreeObjArray = this.focusedTreeObjArray
		// 	let treeIndexWithDSL = layoutParas.treeIndexWithDSL
		// 	for(let item in treeIndexWithDSL) {
		// 		//   确保是当前选中的节点
		// 		if (focusedTreeObjArray.indexOf(item) !== -1) {
		// 			let dslName = treeIndexWithDSL[item]
		// 			if (currentTreeDSLArray.indexOf(dslName) === -1) {
		// 	            currentTreeDSLArray.push(dslName)
		// 	        }
		// 		}
		// 	}
		// 	let currentTreeDSLName = ''
		// 	// 更新当前选择的DSL数组
		// 	this.currentTreeDSLArray = currentTreeDSLArray
		// 	for (let i = 0; i < currentTreeDSLArray.length; i++) {
		// 		currentTreeDSLName = currentTreeDSLName + '-' + currentTreeDSLArray[i]
		// 	}
		// 	console.log('currentTreeDSLName', currentTreeDSLName)
		// 	return currentTreeDSLName
		// }
	}
  }
</script>

<style lang="less">
	.el-col.el-col-20 {
		margin-top: 10px;
		margin-bottom: 10px;
		cursor: pointer;
	}
</style>
