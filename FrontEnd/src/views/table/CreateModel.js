export function get_column_header(headerIndex, colHeaderIndex, colHeader, headerRange, 
  rowDistributionList, dataValueList,headerDistribution, header2num, num2header ) {
  headerIndex = colHeaderIndex
  for (var i=0; i<=headerRange.bottom; i++) {
    var items = new Map
    // find the start index of column header in each row
    var s=headerRange.right+1, sindex
    for (sindex=0; sindex<rowDistributionList[i].length; sindex++) {
      if (s <= rowDistributionList[i][sindex].end && s >= rowDistributionList[i][sindex].start) break
    }
            
    for (var j=sindex, len=rowDistributionList[i].length; j<len; j++) {
      // var name = (dataValueList[i][j] == 'None') ? ' ' : dataValueList[i][j]
      var name = dataValueList[i][j]
      if (name == 'None') {
        if ((rowDistributionList[i][j].start==headerRange.right+1)) {
          name = ""
        }
        else{
          var aitem = Array.from(items)
          var lastHeader = aitem[aitem.length-1][0]
          if (i>0) {
            var lastParent = find_header_parent(lastHeader, rowDistributionList[i][j].start-1, rowDistributionList[i][j].start-1, i, colHeader, false)
            var curParent = find_header_parent(name, rowDistributionList[i][j].start, rowDistributionList[i][j].start, i, colHeader, false)
            if(lastParent != curParent) {
              name = ""
            }
            else {
              var lastRange = aitem[aitem.length-1][1].range.pop()
              lastRange.end += 1

              items.get(lastHeader).range.push(lastRange)
              continue
            }
          }
          else {
            var lastRange = aitem[aitem.length-1][1].range.pop()
            lastRange.end += 1

            items.get(lastHeader).range.push(lastRange)
            continue
          }
        }
      }
      var start = rowDistributionList[i][j].start, end = rowDistributionList[i][j].end
      var attributes
      
      if (!items.has(name)) {  // a new header
        headerDistribution.set(name, {"isRowHeader":false, "layer":i, "count":1})
        num2header.set(headerIndex, {"value":name, "times":0})
        header2num.set(name, [])

        attributes = new Object
        attributes.range = []
        attributes.cellNum = end - start + 1
        attributes.children = []
        attributes.parent = []
        attributes.isFullyConn = true
      }
      else {
        var tmp = headerDistribution.get(name)
        tmp.count += 1
        num2header.set(headerIndex, {"value":name, "times":tmp.count-1})
        headerDistribution.set(name, tmp) 
        attributes = items.get(name)
      }
      var tmpindex = header2num.get(name)
      tmpindex.push(headerIndex)
      header2num.set(name, tmpindex)

      attributes.range.push({"start":start, "end":end})
      if (i>0) {  // first layer doesn't have parents
        var parent = find_header_parent(name, start, end, i, colHeader, true)
        // if (attributes.parent.indexOf(parent) == -1) {
        //   attributes.parent.push(parent)
        // }
        attributes.parent.push({name:parent.name, ordinal:parent.ordinal})
      }
      items.set(name, attributes)
      headerIndex += 1
    }
    colHeader.push(items)
  }
  for (var i=0; i<colHeader.length; i++) {
    for (var item of colHeader[i].values()) {
      item.range = []
    }
  }
  cal_header_range(colHeader)
  console.log("colHeader", colHeader)
  console.log("headerDistribution", headerDistribution)
  console.log("header2num",header2num)
  console.log("num2header",num2header)
}

export function get_row_header(headerIndex, rowHeaderIndex, rowHeader, headerRange, rowHeightList,
  dataValueList,headerDistribution, header2num, num2header) {
  headerIndex = rowHeaderIndex
  for (var j=0; j<=headerRange.right; j++) {
    var items = new Map
    for (var i=headerRange.bottom+1; i<rowHeightList.length; i++) {
      var name = dataValueList[i][j]
      if (name == 'None') {
        if ((i==headerRange.bottom+1)) {
          name = " "
        }
        else{
          var aitem = Array.from(items)
          var lastHeader = aitem[aitem.length-1][0]
          if (j>0) {
            var lastParent = find_header_parent(lastHeader, i-1, i-1, j, rowHeader, false)
            var curParent = find_header_parent(name, i, i, j, rowHeader, false)
            if(lastParent != curParent) {
              name = " "
            }
            else {
              var lastRange = aitem[aitem.length-1][1].range.pop()
              lastRange.end += 1

              items.get(lastHeader).range.push(lastRange)
              continue
            }
          }
          else {
            var lastRange = aitem[aitem.length-1][1].range.pop()
            lastRange.end += 1

            items.get(lastHeader).range.push(lastRange)
            continue
          }
        }
      }
      var start = i, end = i
      var attributes

      if (!items.has(name)) {  // a new header
        headerDistribution.set(name, {"isRowHeader":true, "layer":j, "count":1})
        num2header.set(headerIndex, {"value":name, "times":0})
        header2num.set(name, [])

        attributes = new Object
        attributes.range = []
        attributes.cellNum = end - start + 1
        attributes.children = []
        attributes.parent = []
        attributes.isFullyConn = true
      }
      else {
        var tmp = headerDistribution.get(name)
        tmp.count += 1
        num2header.set(headerIndex, {"value":name, "times":tmp.count-1})
        headerDistribution.set(name, tmp) 
        attributes = items.get(name)
      }
      var tmpindex = header2num.get(name)
      tmpindex.push(headerIndex)
      header2num.set(name, tmpindex)

      attributes.range.push({"start":start, "end":end})
      if (j>0) {  // first layer doesn't have parents
        var parent = find_header_parent(name, start, end, j, rowHeader, true)
        // if (attributes.parent.indexOf(parent) == -1) {
        //   attributes.parent.push(parent)
        // }
        attributes.parent.push({name:parent.name, ordinal:parent.ordinal})
      }
      items.set(name, attributes)
      headerIndex += 1
    }
    rowHeader.push(items)
  }
  for (var i=0; i<rowHeader.length; i++) {
    for (var item of rowHeader[i].values()) {
      item.range = []
    }
  }
  cal_header_range(rowHeader)
  console.log("rowHeader", rowHeader)
  console.log("headerDistribution", headerDistribution)
  console.log("header2num",header2num)
  console.log("num2header",num2header)
}

export function find_header_parent(name, cstart, cend, rindex, src, addflag) {
  var parentLayer = src[rindex-1]
  var parent = {name:null, ordinal:null}
  var parentindex
  for (let [key, value] of parentLayer) {
    var ranges = value.range, findFlag = false
    for (var i=0, len=ranges.length; i<len; i++) {
      if (ranges[i].start <= cstart && ranges[i].end >= cend) {
        parent.name = key
        parent.ordinal = i
        parentindex = i
        findFlag = true
        break
      }
    }
    if (findFlag) break
  }
  if(addflag) {
    // if (src[rindex-1].get(parent).children.indexOf(name) == -1) {
    //   src[rindex-1].get(parent).children.push(name)
    // }
    if (src[rindex-1].get(parent.name).children.length < parentindex+1) { // first child of this parent 
      src[rindex-1].get(parent.name).children.push([name])
    }
    else if (src[rindex-1].get(parent.name).children.length == parentindex+1) {
      src[rindex-1].get(parent.name).children[parentindex].push(name)
    }
    else {
      console.log("find parent error!")
    }

  }
  return parent
}

export function cal_header_range(headerList) {
  var layerNum = headerList.length
  var distribution=[]
  for (var i=0; i<layerNum; i++) {
    distribution.push([])
  }

  for (var item of headerList[0]) {
    cal_cell_num(item[0], item[1], 0, distribution, headerList) 
  }
}

export function cal_cell_num(key, value, layer, distribution, headerList) {
  // “distribution” records all headers for each row in order
  var countindex
  if(distribution[layer].length == 0) {
    headerList[layer].get(key).range.push({"start":0, "end":null})
    countindex = 0
  }
  else {
    var lastHeaderName = distribution[layer][distribution[layer].length-1]
    var span = headerList[layer].get(lastHeaderName).cellNum
    var lastHeaderRange = headerList[layer].get(lastHeaderName).range
    var lastStart = lastHeaderRange[lastHeaderRange.length-1].start
    countindex = headerList[layer].get(key).range.length
    headerList[layer].get(key).range.push({"start": lastStart+span, "end": null}) // change header's start
  }
  distribution[layer].push(key)

  if (value.children.length == 0) {
    value.cellNum = 1
    value.range[value.range.length-1].end = value.range[value.range.length-1].start  // change header's end
    headerList[layer].set(key, value)
    return 1
  }
  else {
    value.cellNum = 0
    for (var i=0, len=value.children[countindex].length; i<len; i++) {
      var name = value.children[countindex][i]
      value.cellNum += cal_cell_num(name, headerList[layer+1].get(name), layer+1, distribution,headerList)
    }
    value.range[value.range.length-1].end = value.range[value.range.length-1].start + value.cellNum - 1 // change header's end
    headerList[layer].set(key, value)
    return value.cellNum
  }
}

export function get_cell_sequence(headerRange, rowHeightList, columnWidthList, dataValueList,
  colHeader, rowHeader, num2seq, seq2num, valueIndex) {
  for (var row=headerRange.bottom+1; row<rowHeightList.length; row++) {
    for (var col=headerRange.right+1; col<columnWidthList.length; col++) {
      var value = dataValueList[row][col]
      if (value == 'None') value = ''
      var seq = new Set
      //column header
      for (var i=0; i<colHeader.length; i++) { // find header in each row
        var find = false
        for (var item of colHeader[i]) { 
          var header = item[0]
          var range = item[1].range
          for (var r of range) {
            if ((r.start + headerRange.right+1) <= col && (r.end + headerRange.right+1) >= col) {
              seq.add(header)
              find = true
              break
            }
          }
          if (find)  break
        }
      }

      //row header
      for (var i=0; i<rowHeader.length; i++) { // find header in each column
        var find = false
        for (var item of rowHeader[i]) { 
          var header = item[0]
          var range = item[1].range
          for (var r of range) {
            if ((r.start + headerRange.bottom+1) <= row && (r.end + headerRange.bottom+1) >= row) {
              seq.add(header)
              find = true
              break
            }
          }
          if (find)  break
        }
      }

      num2seq.set(valueIndex, {"value":value, "seq":seq})
      seq2num.set(seq, {"value":value, "num":valueIndex})
      valueIndex += 1
    }
  }
  console.log("num2seq", num2seq)
}

