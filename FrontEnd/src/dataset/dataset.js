export function Dataset () {
    this.tabularDataObjList = []
    this.selectedTabularDataObj = null
}

Dataset.prototype = {
    init: function() {
    },
    updateTabularDatasetList: function (processed_tabular_dataobj_list) {
        this.tabularDataObjList = processed_tabular_dataobj_list
        if (this.tabularDataObjList.length > 0) {
            this.selectedTabularDataObj = this.tabularDataObjList[0]
        }
        console.log('selectedTabularDataObj', this.selectedTabularDataObj)
    },
    updateSelectedTabularDataset: function (filename) {
        // set the selectedTabularDataObj
        var index = -1
        for (var i=0; i<this.tabularDataObjList.length; i++) {
            if (this.tabularDataObjList[i].filename == filename) {
                index = i
                break
            }
        }
        if (index != -1) {
            this.selectedTabularDataObj = this.tabularDataObjList[index]
            console.log('newselectedTabularDataObj', this.selectedTabularDataObj)
        }
    }
}