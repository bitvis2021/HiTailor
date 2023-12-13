export function get_reference_node(header, start, end, isRow, hasTransposed) {     
    var res = []
    // var linearName = isRow && !hasTransposed || !isRow && hasTransposed ? ("&-row-"+()) : ("&-col-"+())
    var findFlag = false
    for (var i=0; i<header.length; i++) {
        for (var [key, value] of header[i]) {
            var goNextLayer = false
            var ranges = value.range, children = value.children
            for (var j=0; j<ranges.length; j++) {
                if (start == ranges[j].start && end == ranges[j].end) {   // choose a single node(including linear)
                    var tmp = {name: key, times: j, layer: i, hasLinear: false, isLinear: false}
                    if (start == end && i != header.length-1) {
                        goNextLayer = true
                        break
                    }  
                    if (children.length!=0 && children[j][0][0]=="&") {
                        tmp.hasLinear = true 
                        tmp.isLinear = true
                    //     // especially
                    //     if (children[j].length == 1) {
                    //          
                    //         tmp.name = children[j][0]
                    //         tmp.times = 0
                    //         tmp.layer = i+1
                    //         tmp.hasLinear = false
                    //         tmp.isLinear = false
                    //     }
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
                            if (children.length!=0 && children[j][0][0]=="&") {
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
                                if (children.length!=0 && children[j][0][0]=="&") {
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
                            if (children.length!=0 && children[j][0][0]=="&") {
                                tmp.hasLinear = true
                                tmp.isLinear = true
                            }
                            res.push(tmp)
                            break
                        }
                    }
                    else if (start > ranges[j].start) {
                        if (end == ranges[j].end) {
                            if (children.length!=0 && children[j][0][0]=="&"
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

export function cal_recommendation_by_one_reference(rowPriority, colPriority, refer, top, bottom, left, right, header, isRow, headerPriority, 
    recommendDataBoth, recommendDataRow, recommendDataCol, 
    markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree=false) {


    if (isRow) {
        if (isSubtree) {
            rowPriority.subtree[0].push({start:top, end:bottom})
        }
        else {
            rowPriority.name[0].push({start:top, end:bottom})
        }
    }
    else {
        if (isSubtree) {
            colPriority.subtree[0].push({start:left, end:right})
        }
        else {
            colPriority.name[0].push({start:left, end:right})
        }
    }
    
    var layer = refer[0].layer
    var hasLinear = refer[0].hasLinear
    var isLinear = refer[0].isLinear
    if (refer.length == 1) { // single reference
        var refername = refer[0].name
        var refertimes = refer[0].times

        var referParent, referParentRange
        if (layer!=0 && isSubtree) {
            referParent = header[layer].get(refername).parent[refertimes] // {name:xx, ordinal:xx}
            var pName = referParent.name, pOrd = referParent.ordinal
            referParentRange = header[layer-1].get(pName).range[pOrd]
        }
        
        for (var [key, value] of header[layer]) {
            var ranges = value.range
            var priority = 0
            // two types of priority methods: same name
            if (!isSubtree)  priority = key==refername ? 1 : 2
            
            for (var i=0; i<ranges.length; i++) {
                if (key==refername && i == refertimes) continue // don't recommend itself

                if (isSubtree) {    // two types of priority methods: same subtree
                    if (layer == 0) priority = 1    // first layer all same subtree
                    else if (refername[0] == "&") { // choose the & node
                        priority = 2
                    }
                    else {
                        if (ranges[i].start >= referParentRange.start && ranges[i].end <= referParentRange.end) {
                            if (key[0] == "&") {
                                priority = 2
                            }
                            else {
                                priority = 1
                            }   
                        }
                        else {
                            priority = 2
                        }
                    }
                }

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
                    
                    //for little bugs
                    if (pos.top > pos.bottom)   continue
                    
                    var tmp = {start:pos.top, end:pos.bottom}
                    headerPriority[priority-1].row.push(tmp)
                    
                    // recommendDataBoth[priority-1].push(pos)
                    // recommendDataRow[priority].push(pos)

                    if (isSubtree)
                        rowPriority.subtree[priority].push(tmp)
                    else
                        rowPriority.name[priority].push(tmp)
                    // recommendDataCol[0].push(pos)
                    // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "both", priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
                    // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "row", priority+1, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
                    // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "col", 1, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
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
                    //for little bugs
                    if (pos.left > pos.right)   continue

                    var tmp = {start:pos.left, end:pos.right}
                    headerPriority[priority-1].column.push(tmp)

                    // recommendDataBoth[priority-1].push(pos)
                    // recommendDataCol[priority].push(pos)

                    if (isSubtree)
                        colPriority.subtree[priority].push(tmp)
                    else
                        colPriority.name[priority].push(tmp)
                    // recommendDataRow[0].push(pos)
                    // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "both", priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
                    // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "col", priority+1, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
                    // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "row", 1, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
                }
            }
        }
    }
    else if (!isSubtree) { // multiple references (same subtree don't have multiple references)
        var resRanges = []
        var priority = 1
        for (var i=0; i<refer.length; i++) {
            var name = refer[i].name
            var ranges = JSON.parse(JSON.stringify(header[layer].get(name).range))
            var find
            if (i != 0) {
                find = new Array(resRanges.length).fill(false)
            }
            for (var j=0; j<ranges.length; j++) {
                if (j == refer[i].times)    continue    // don't recommend itself
                if (i == 0) {
                    resRanges.push(ranges[j])
                }
                else {
                    for (var k=0; k<resRanges.length; k++) {
                        if (resRanges[k].end+1 == ranges[j].start) {
                            resRanges[k].end = ranges[j].end
                            find[k] = true
                            break
                        }
                    }
                }
            }
            if (i != 0 && find.indexOf(false)!=-1) {
                for (var j=0; j<find.length; j++) {
                    if(find[j] == false) {
                        resRanges.splice(j, 1)
                        find.splice(j, 1)
                        j -= 1
                    }
                }
            }
        }
        
        for (var i=0; i<resRanges.length; i++) {
            var pos = {top:null, bottom:null, right:null, left:null}
            if (isRow) {
                pos.top = resRanges[i].start
                pos.bottom = resRanges[i].end
                pos.left = left
                pos.right = right

                var tmp = {start:pos.top, end:pos.bottom}
                headerPriority[priority-1].row.push(tmp)
                
                // recommendDataBoth[priority-1].push(pos)
                // recommendDataRow[priority].push(pos)

                rowPriority.name[priority].push(tmp)
                // recommendDataCol[0].push(pos)
                // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "both", priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue)
                // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "row", priority+1, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue)
                // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "col", 1, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue)
            }
            else {
                pos.top = top
                pos.bottom = bottom
                pos.left = resRanges[i].start
                pos.right = resRanges[i].end

                var tmp = {start:pos.left, end:pos.right}
                headerPriority[priority-1].column.push(tmp)
                
                // recommendDataBoth[priority-1].push(pos)
                // recommendDataCol[priority].push(pos)

                colPriority.name[priority].push(tmp)
                // recommendDataRow[0].push(pos)
                // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "both", priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue)
                // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "col", priority+1, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue)
                // draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "row", 1, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue)
            }
        }
    }
}

export function cal_recommendation_by_two_references(headerPriority, rpri, cpri, priorityb, priorityr, priorityc, 
    recommendDataBoth, recommendDataRow, recommendDataCol, 
    markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree=false) {

    // for (var i=0; i<headerPriority[rpri].row.length; i++) {
    //   for (var j=0; j<headerPriority[cpri].column.length; j++) {
    //     var pos = {top:null, bottom:null, right:null, left:null}
    //     pos.top = headerPriority[rpri].row[i].start
    //     pos.bottom = headerPriority[rpri].row[i].end
    //     pos.left = headerPriority[cpri].column[j].start
    //     pos.right = headerPriority[cpri].column[j].end

    //     recommendDataBoth[priorityb-1].push(pos)
    //     recommendDataRow[priorityr-1].push(pos)
    //     recommendDataCol[priorityc-1].push(pos)
    //     draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "both", priorityb, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
    //     draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "row", priorityr, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
    //     draw_recommendation_area(pos.top, pos.bottom, pos.left, pos.right, "col", priorityc, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree)
    //   }
    // }
}

function draw_recommendation_area(top, bottom, left, right, type, priority, markWidth, markHeight, widthRangeList, heightRangeList, headerRange, prioritySliderValue, directionSelectValue, isSubtree=false) {
//     var color
//     if (type == "both") {
//         switch(priority) {  // choose color by priority
//             case 1:
//                 color = "#08519c"
//                 break
//             case 2:
//                 color = "#428dc6"
//                 break
//             case 3:
//                 color = "#6bafd6"
//                 break
//             case 4:
//                 color = "#9ebee1"
//                 break
//             case 5:
//                 color = "#deebf7"
//                 break
//         }
//     }
//     else {
//         switch(priority) {  // choose color by priority
//             case 1:
//                 color = "#08519c"
//                 break
//             case 2:
//                 color = "#6bafd6"
//                 break
//             case 3:
//                 color = "#deebf7"
//                 break
//         }

//     }
    
//     var prefix = "recommend-helper-"
//     if (isSubtree) prefix += "tree-"

//     var area = d3.select("#recommendation-area-container")
//     area.append("rect").attr("class", prefix+type).attr("id", prefix+type+"-"+priority).datum({priority:priority, type:type, isSubtree:isSubtree})
//         .attr("x", markWidth + widthRangeList[left+headerRange.right+1])
//         .attr("y", markHeight + heightRangeList[top+headerRange.bottom+1])
//         .attr("width", widthRangeList[right+1+headerRange.right+1] - widthRangeList[left+headerRange.right+1])
//         .attr("height", heightRangeList[bottom+1+headerRange.bottom+1] - heightRangeList[top+headerRange.bottom+1])
//         .style("stroke", "grey")
//         .style("stroke-width", "0.3px")
//         .style("fill", color)
//         .style("fill-opacity", "40%")
//         .style("visibility", function(d) { 
//             if (d.isSubtree)  return "hidden"
//             else if (d.priority >= prioritySliderValue[0] && d.priority <= prioritySliderValue[1]) {
//                 if (type=="both"&&directionSelectValue.includes("row")&&directionSelectValue.includes("column") 
//                     || type=="row"&&directionSelectValue.includes("row")&&!directionSelectValue.includes("column") 
//                     || type=="col"&&!directionSelectValue.includes("row")&&directionSelectValue.includes("column"))
//                     return "visible"
//                 else {
//                     return "hidden" 
//                 }
//             }      
//             else {
//                 return "hidden" 
//             }
//         });
}