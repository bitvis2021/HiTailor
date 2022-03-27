// 
import axios from 'axios'
// let server_address = 'http://127.0.0.1:14450'
let server_address = 'http://irinka.cn:14450'
// let server_address = 'http://123.57.216.53/hitailor'

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