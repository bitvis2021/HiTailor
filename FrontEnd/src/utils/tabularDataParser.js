export function parseTabularData (processed_tabular_datalist_str) {
    processed_tabular_datalist_str = processed_tabular_datalist_str.replace(/"/g, '?')
    // console.log('processed_tabular_datalist_str', processed_tabular_datalist_str)
    processed_tabular_datalist_str = processed_tabular_datalist_str.replace(/'/g, '"')
    let processed_tabular_datalist = JSON.parse(
      processed_tabular_datalist_str
    )
    let processed_tabular_dataobj_list = []
    for (let i = 0;i < processed_tabular_datalist.length;i++) {
      let processed_tabular_dataobj = processed_tabular_datalist[i]
      processed_tabular_dataobj['content'] = processed_tabular_dataobj['content'].replace(/[?=]/g, '"')
      console.log('processed_tabular_datalist_str', processed_tabular_dataobj['content'])
      processed_tabular_dataobj['content'] = JSON.parse(processed_tabular_dataobj['content'])
      processed_tabular_dataobj_list.push(processed_tabular_dataobj)
    }
    return processed_tabular_dataobj_list
}
