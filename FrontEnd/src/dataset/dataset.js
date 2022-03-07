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
        // TODO
        // set the selectedTabularDataObj
    }
}