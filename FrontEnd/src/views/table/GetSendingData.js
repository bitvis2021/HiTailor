export function get_unit_data_for_transmission(x, y, valueDistribution, seq2num) {
    var pos = [x, y].toString()
    var seq = valueDistribution.get(pos)
    var value = seq2num.get(seq).value    
    return value
}
export function get_data_for_transmission(top, bottom, left, right, headerRange, valueDistribution, seq2num, rlength, clength, headerDistribution, colHeader, rowHeader) {
    var data = get_data_from_chosen(top, bottom, left, right, headerRange, valueDistribution, seq2num)
    var metadata = gen_metadata_from_chosen(top, bottom, left, right, colHeader, rowHeader, headerRange)
    var chgdata = change_data_form(data, rlength, clength, headerDistribution)
    var jsdata = gen_json_from_data(data, chgdata, headerDistribution)

    return [jsdata, metadata]
}

export function get_pos_for_transmission(top, bottom, left, right, markWidth, markHeight, widthRangeList, heightRangeList) {
    var x = markWidth + widthRangeList[left]
    var y = markHeight + heightRangeList[top]
    var width = widthRangeList[right+1] - widthRangeList[left]
    var height= heightRangeList[bottom+1] - heightRangeList[top]
    var pos = {"x":x, "y":y, "width":width, "height":height}

    return pos
}

export function get_data_from_chosen(top, bottom, left, right, headerRange, valueDistribution, seq2num) {
    var res=[]
    for (var i=top; i<=bottom; i++) {
        for (var j=left; j<=right; j++) {
            var pos = [i-headerRange.bottom-1, j-headerRange.right-1].toString()
            var seq = valueDistribution.get(pos)
            var value = seq2num.get(seq).value
            var arrseq = Array.from(seq)
            arrseq.push(value)
            res.push(arrseq)        
        }
    }
    return res
}

function change_data_form(origindata, rlength, clength, headerDistribution) {
    var data = JSON.parse(JSON.stringify(origindata))
    var rh = new Array(rlength).fill("")
    var ch = new Array(clength).fill("")

    for (var i=0; i<data.length; i++) {      
        if (i == 0) {
        // cal prefix position when it's the first line
        for (var k=0; k<data[i].length-1; k++) {
            var info = headerDistribution.get(data[i][k])
            if (info.isRowHeader) {
            rh[info.layer] = k
            }
            else {
            ch[info.layer] = k
            }
        }
        }
        // add prefix
        var prefix = ""
        for (var k=0; k<ch.length; k++) {
            // column
            data[i][ch[k]] = prefix + data[i][ch[k]]
            prefix = (data[i][ch[k]] + " > ")
        }
        
        prefix = ""
        for (var k=0; k<rh.length; k++) {
            // row
            data[i][rh[k]] = prefix + data[i][rh[k]]
            prefix = (data[i][rh[k]] + " > ")
        }          
    }
    return data
}

function gen_json_from_data(data, chgdata, headerDistribution) {
    var res=[]
    for (var i=0; i<data.length; i++) {
        var obj={}
        for (var j=0; j<data[i].length; j++) {
        if (j == data[i].length-1) {
            obj["value"] = chgdata[i][j]
        }
        else {
            var info = headerDistribution.get(data[i][j])
            var name
            if (info.isRowHeader) {
            name = "column "
            name += cal_column_mark(info.layer)
            }
            else {
            name = "row " + (info.layer+1)
            }
            obj[name] = chgdata[i][j]
        }
        }
        res.push(obj)
    }
    var js = JSON.stringify(res)

    return js
}

function gen_metadata_from_chosen(top, bottom, left, right, colHeader, rowHeader, headerRange) {
    var res = {"x":null, "y":null}
    var xobj = {"range": 0, "headers":[]}
    var yobj = {"range": 0, "headers":[]}

    xobj.range = right - left + 1
    yobj.range = bottom - top + 1

    // col headers
    var totalPre = []
    for (var i=0; i<colHeader.length; i++) {
        var hobj = new Object
        hobj["name"] = "row " + (i+1)
        hobj["sort"] = []
        var currPre = []
        for (var j=left-headerRange.right-1; j<=right-headerRange.right-1;) {
        for (var item of colHeader[i]) {
            var find = false
            var ranges = item[1].range
            for (var k=0; k<ranges.length; k++) {
            if (j <= ranges[k].end && j >= ranges[k].start) {
                find = true
                var pre = {"start": ranges[k].start, "end":ranges[k].end}
                currPre.push(pre)
                break
            }
            }
            if (find) {
            var nname = ""
            for (var q=0; q<totalPre.length; q++) {
                if (j <= totalPre[q].end && j >= totalPre[q].start) {
                nname += xobj.headers[i-1].sort[q] + " > "
                break
                }
            }
            nname += item[0]
            hobj.sort.push(nname)
            j = ranges[k].end + 1
            break
            }
        }          
        }
        totalPre = currPre
        xobj.headers.push(hobj)
    }

    // row headers
    totalPre = []
    for (var i=0; i<rowHeader.length; i++) {
        var hobj = new Object
        hobj["name"] = "column " + cal_column_mark(i)
        hobj["sort"] = []
        var currPre = []
        for (var j=top-headerRange.bottom-1; j<=bottom-headerRange.bottom-1;) {
        for (var item of rowHeader[i]) {
            var find = false
            var ranges = item[1].range
            for (var k=0; k<ranges.length; k++) {
            if (j <= ranges[k].end && j >= ranges[k].start) {
                find = true
                var pre = {"start": ranges[k].start, "end":ranges[k].end}
                currPre.push(pre)
                break
            }
            }
            if (find) {
            var nname = ""
            for (var q=0; q<totalPre.length; q++) {
                if (j <= totalPre[q].end && j >= totalPre[q].start) {
                nname += yobj.headers[i-1].sort[q] + " > "
                break
                }
            }
            nname += item[0]
            hobj.sort.push(nname)
            j = ranges[k].end + 1
            break
            }
        }          
        }
        totalPre = currPre
        yobj.headers.push(hobj)
    }

    res.x = xobj
    res.y = yobj

    var js = JSON.stringify(res)
    return js
}

function cal_column_mark(index) {
    var res = ""
    var first = parseInt(index / 26)
    if(first > 0) {
      res = String.fromCharCode(64+first)
    }
    res += String.fromCharCode(65+(index % 26))
    return res
}