// 
import axios from 'axios'
let server_address = 'http://127.0.0.1:14450'

export function getTabularDataset(tabularDataList, getTabularDataCallback) {
    let formData = {"tabularData": tabularDataList}
    axios({
        methods: 'get',
        url: server_address + '/tabulardata',
        params: formData,
        timeout: 5000
    })
    .then((res) => {
        let tabularDatasetList = res['data']['data']
        console.log('tabularDatasetList', tabularDatasetList)
        getTabularDataCallback(tabularDatasetList)
    })
}

export function getUploadData(name, uploadDataCallback) {
    axios({
        methods: 'get',
        url: server_address + '/uploadtabulardata',
        params: {"name": name},
        timeout: 5000
    })
    .then((res) => {
        let tabularDataList = res['data']['data']
        console.log('tabularDatasetList', tabularDataList)
        // console.log("resssss", res['data']['data'])
        uploadDataCallback(tabularDataList)
    })
}