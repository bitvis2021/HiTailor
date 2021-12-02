export function Dataset () {
    this.tabularDatasetList = []
}

Dataset.prototype = {
    init: function() {
    },
    updateTabularDatasetList: function(processed_tabular_datalist) {
        this.tabularDatasetList = processed_tabular_datalist
    }
}