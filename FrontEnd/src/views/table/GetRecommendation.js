export function get_reference_node(header, start, end, isRow, hasTransposed) {     
    var res = []
    var linearName = isRow && !hasTransposed || !isRow && hasTransposed ? " " : ""
    var findFlag = false
    for (var i=0; i<header.length; i++) {
        for (var [key, value] of header[i]) {
        var goNextLayer = false
        var ranges = value.range, children = value.children
        for (var j=0; j<ranges.length; j++) {
            if (start == ranges[j].start && end == ranges[j].end) {   // choose a single node(including linear)
            var tmp = {name: key, times: j, layer: i, hasLinear: false, isLinear: false}
            if (children.length!=0 && children[j].indexOf(linearName)!=-1) {
                tmp.hasLinear = true 
                tmp.isLinear = true
                // especially
                if (children[j].length == 1) {
                tmp.name = children[j][0]
                tmp.times = 0
                tmp.layer = i+1
                tmp.hasLinear = false
                tmp.isLinear = false
                }
            }
            res.push(tmp)
            findFlag = true
            break
            }
            else {
            if (start == ranges[j].start) {
                if (end < ranges[j].end) {
                goNextLayer = true
                break
                }
                else {
                var tmp = {name: key, times: j, layer: i, hasLinear: false, isLinear:false}
                if (children.length!=0 && children[j].indexOf(linearName)!=-1) {
                    tmp.hasLinear = true
                    tmp.isLinear = true
                }
                res.push(tmp)
                break
                }
            }
            else if (start < ranges[j].start) {
                if (end == ranges[j].end) {
                if (res.length != 0) {
                    var tmp = {name: key, times: j, layer: i, hasLinear: false, isLinear:false}
                    if (children.length!=0 && children[j].indexOf(linearName)!=-1) {
                    tmp.hasLinear = true
                    tmp.isLinear = true
                    }
                    res.push(tmp)
                    findFlag = true
                    break
                }
                }
                else if (end < ranges[j].end){
                if (end < ranges[j].start) {
                    continue
                }
                else {
                    if (i != header.length-1) { // not last layer
                    res = []
                    findFlag = true
                    break
                    }
                }
                }
                else {
                var tmp = {name: key, times: j, layer: i, hasLinear: false, isLinear:false}
                if (children.length!=0 && children[j].indexOf(linearName)!=-1) {
                    tmp.hasLinear = true
                    tmp.isLinear = true
                }
                res.push(tmp)
                break
                }
            }
            else if (start > ranges[j].start) {
                if (end == ranges[j].end) {
                if (children.length!=0 && children[j].indexOf(linearName)!=-1 
                && start == ranges[j].start+1) {    // choose a single node(not including linear)
                    var tmp = {name: key, times: j, layer: i, hasLinear: false, isLinear:true}
                    res.push(tmp)
                    findFlag = true
                    break
                }
                else {
                    goNextLayer = true
                    break
                }
                }
                else if (end < ranges[j].end){
                goNextLayer = true
                break
                }
                else {
                if (start > ranges[j].end) {
                    continue
                }
                else {
                    if (i != header.length-1) { // not last layer
                    res = []
                    findFlag = true
                    break
                    }
                }
                }
            }
            }
        }
        if (findFlag) break
        if (goNextLayer) break
        }
        if (findFlag) break
    }

    return res
}

export function cal_recommendation_by_one_reference(refer, top, bottom, left, right, header, isRow, res, recommendData, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue) {
    var layer = refer[0].layer
    var hasLinear = refer[0].hasLinear
    var isLinear = refer[0].isLinear
    if (refer.length == 1) { // single reference
        var refername = refer[0].name
        var refertimes = refer[0].times
        for (var [key, value] of header[layer]) {
            var ranges = value.range
            var priority = key==refername ? 1 : 2
            for (var i=0; i<ranges.length; i++) {
                if (key==refername && i == refertimes) continue // don't recommend itself
                var pos = {top:null, bottom:null, right:null, left:null}
                if (isRow) {
                    if (isLinear && !hasLinear) {
                        pos.top = ranges[i].start + 1
                    }
                    else {
                        pos.top = ranges[i].start
                    }
                    pos.bottom = ranges[i].end
                    pos.left = left
                    pos.right = right

                    var tmp = {pos: pos, priority: priority}
                    res[priority-1].row.push(tmp)
                    recommendData[priority-1].push(pos)
                    draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue)
                }
                else {
                    pos.top = top
                    pos.bottom = bottom
                    if (isLinear && !hasLinear) {
                        pos.left = ranges[i].start + 1
                    }
                    else {
                        pos.left = ranges[i].start
                    }
                    pos.right = ranges[i].end
                    var tmp = {pos: pos, priority: priority}
                    res[priority-1].column.push(tmp)
                    recommendData[priority-1].push(pos)
                    draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue)
                }
            }
        }
    }
    else { // multiple references
        if (layer == 0) return  // don't recommend when first layer
        // todo!!!!!!!!!!!!!!!!!
    }
}

export function cal_recommendation_by_two_references(prilist, rpri, cpri, priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue) {
    var res = []
    for (var i=0; i<prilist[rpri].row.length; i++) {
      for (var j=0; j<prilist[cpri].column.length; j++) {
        var pos = {top:null, bottom:null, right:null, left:null}
        pos.top = prilist[rpri].row[i].pos.top
        pos.bottom = prilist[rpri].row[i].pos.bottom
        pos.left = prilist[cpri].column[j].pos.left
        pos.right = prilist[cpri].column[j].pos.right

        res.push(pos)
        draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue)
      }
    }
    return res
}

function draw_recommendation_area(top, bottom, left, right, priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue) {
    var color
    switch(priority) {  // choose color by priority
      case 1:
        color = "#08519c"
        break
      case 2:
        color = "#428dc6"
        break
      case 3:
        color = "#6bafd6"
        break
      case 4:
        color = "#9ebee1"
        break
      case 5:
        color = "#deebf7"
        break
    }
    var area = d3.select("#recommendation-area-container")
    area.append("rect").attr("class", "recommend-helper").attr("id", "recommend-helper-"+priority).datum(priority)
        .attr("x", markWidth + widthRangeList[left+headerRange.right+1])
        .attr("y", markHeight + heightRangeList[top+headerRange.bottom+1])
        .attr("width", widthRangeList[right+1+headerRange.right+1] - widthRangeList[left+headerRange.right+1])
        .attr("height", heightRangeList[bottom+1+headerRange.bottom+1] - heightRangeList[top+headerRange.bottom+1])
        .style("stroke", "grey")
        .style("stroke-width", "0.3px")
        .style("fill", color)
        .style("fill-opacity", "40%")
        .style("visibility", function(d) { 
          if (d >= prioritySliderValue[0] && d <= prioritySliderValue[1])       
            return "visible"
          else {
            return "hidden" 
          }
        });
}