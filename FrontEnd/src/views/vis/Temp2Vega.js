import { SchemaCompiler } from './SchemaCompiler'
export function VegaTemplate(tempName_str, mark_str, encodingVega_obj, fields_obj, data_arr, previewPic_str) {
    this.name = tempName_str
    this.img = previewPic_str
    this.mark = mark_str
    this.fields_obj = fields_obj
    this.data = data_arr
    this.encoding = this.PreprocessEncoding(encodingVega_obj)
    this.SchemaCompiler = new SchemaCompiler
}

VegaTemplate.prototype.GetVegaConf = function () {
    return {
        data: { values: this.data },
        mark: this.mark,
        encoding: this.encoding
    }
}
VegaTemplate.prototype.PreprocessEncoding = function (encoding_obj) {
    encoding_obj = JSON.parse(JSON.stringify(encoding_obj))
    // encoding_obj.x.scale = { zero: false };
    encoding_obj.x.axis = { labels: false, ticks: false, title: null };
    // encoding_obj.y.scale = { zero: false };
    encoding_obj.y.axis = { labels: false, ticks: false, title: null };
    if (encoding_obj.color != undefined) {
        encoding_obj.color.legend = null;
    }
    return encoding_obj
}

// 调用SchemaCompiler中的函数，生成对应的Schema
VegaTemplate.prototype.GetSchema = function () {
    return this.SchemaCompiler.GetEncodingSchema(this.encoding, this.fields_obj)
}

function GetHeaders(channel_obj) {
    let ans = []
    console.log(channel_obj)
    for (let index = 0; index < channel_obj.headers.length; index++) {
        const field = channel_obj.headers[index];
        ans.push(field.name)
    }
    return ans
}

// 输入元数据，返回VegaTemplate对象数组
export function GetTemplates(regionMetaData, data) {
    let templates = [];

    if (regionMetaData != undefined && data != undefined) {
        console.log('region',regionMetaData)
        console.log('regionX',regionMetaData["x"])
        console.log('regionY',regionMetaData["y"])
        
        let vegaEncoding = {}
        let selections = {
            x: { field: GetHeaders(regionMetaData.x).concat(['value']) },
            xOffset: { field: GetHeaders(regionMetaData.x).concat(['value']) },
            y: { field: GetHeaders(regionMetaData.y).concat(['value']) },
            yOffset: { field: GetHeaders(regionMetaData.y).concat(['value']) },
            color: { field: GetHeaders(regionMetaData.x).concat(GetHeaders(regionMetaData.y)) },
            detail: { field: GetHeaders(regionMetaData.x).concat(GetHeaders(regionMetaData.y)) }
        };
        let defaultX = regionMetaData.x.headers[regionMetaData.x.headers.length - 1];
        let defaultY = regionMetaData.y.headers[regionMetaData.y.headers.length - 1];

        if (regionMetaData.x.range == 1 || regionMetaData.y.range == 1) {
            if (regionMetaData.x.range == 1) {
                vegaEncoding = {
                    x: { field: "value", type: "quantitative" },
                    y: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
                    detail: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
                }
            }
            else if (regionMetaData.y.range == 1) {
                vegaEncoding = {
                    x: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                    y: { field: "value", type: "quantitative" },
                    detail: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                }
            }


            // - [N-Q simple line chart](https://www.notion.so/N-Q-simple-line-chart-f4dc62567fd648278288403f3966209b)
            templates.push(new VegaTemplate("N-Q Simple Line Chart", 'line', vegaEncoding, selections, data));
            // - [N-Q simple bar chart](https://www.notion.so/N-Q-simple-bar-chart-19e8f37a7b9741e6a9bbb9a861d1e724)
            templates.push(new VegaTemplate("N-Q Simple Bar Chart", 'bar', vegaEncoding, selections, data));

            if (regionMetaData.y.range == 1) {
                vegaEncoding = {
                    x: { field: "value", type: "quantitative" },
                    y: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
                    detail: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
                }
            }
            else if (regionMetaData.x.range == 1) {
                vegaEncoding = {
                    x: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                    y: { field: "value", type: "quantitative" },
                    detail: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                }
            }
            // - [N-Q range chart example](https://www.notion.so/N-Q-range-chart-example-7f4e860724f24590b325453d2e88f6d4)
            templates.push(new VegaTemplate("N-Q Range Chart", 'line', vegaEncoding, selections, data));
            delete vegaEncoding['detail'];

            // - [N-Q boxplot example](https://www.notion.so/N-Q-boxplot-example-01bfa0004d1e4b758d64d40559a49474)
            templates.push(new VegaTemplate("N-Q Box Plot", {
                "type": "boxplot",
                "extent": "min-max"
            }, vegaEncoding, selections, data));

            // @@N-N-Q grouped bar chart 
            if (GetHeaders(regionMetaData.x).length > 1) {
                let defaultX2 = regionMetaData.x.headers[regionMetaData.x.headers.length - 2]
                vegaEncoding.xOffset = { field: defaultX.name, type: "nominal" };
                vegaEncoding.color = { field: defaultX.name, type: "nominal" };
                vegaEncoding.x = { field: defaultX2.name, type: "nominal", sort: defaultX2.sort };
                vegaEncoding.y = { field: "value", type: "quantitative" };
                templates.push(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncoding, selections, data));
            }
            else if (GetHeaders(regionMetaData.y).length > 1) {
                // Y direction
                let defaultY2 = regionMetaData.y.headers[regionMetaData.y.headers.length - 2]
                vegaEncoding.yOffset = { field: defaultY.name, type: "nominal" };
                vegaEncoding.color = { field: defaultY.name, type: "nominal" };
                vegaEncoding.y = { field: defaultY.name, type: "nominal", sort: defaultY2.sort };
                vegaEncoding.x = { field: "value", type: "quantitative" };
                templates.push(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncoding, selections, data));
            }
        }


        if (regionMetaData.x.range >= 2 && regionMetaData.y.range >= 2) {

            vegaEncoding = {
                x: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                y: { field: "value", type: "quantitative" }
            }

            // @NQ strip plot 
            templates.push(new VegaTemplate("N-Q Strip chart", 'tick', vegaEncoding, selections, data));

            // @N-Q boxplot example 
            vegaEncoding.color = { field: defaultX.name, type: "nominal" };
            templates.push(new VegaTemplate("N-Q Box Plot", {
                "type": "boxplot",
                "extent": "min-max"
            }, vegaEncoding, selections, data));
            delete vegaEncoding['color'];

            // @N-Q range chart example 
            vegaEncoding.detail = vegaEncoding.x;
            templates.push(new VegaTemplate("N-Q Range Chart", 'line', vegaEncoding, selections, data));
            delete vegaEncoding['detail'];

            // - [A-N-Q aggregated line chart](https://www.notion.so/A-N-Q-aggregated-line-chart-e4f55cc964704719bee6c87244ebd7c8)
            vegaEncoding.y = { aggregate: "mean", field: "value" };
            templates.push(new VegaTemplate("A-N-Q Line Chart", 'line', vegaEncoding, selections, data));

            // - [A-N-Q bar chart](https://www.notion.so/A-N-Q-bar-chart-1746d78908fd46988ae9266d91f7e114)
            vegaEncoding.y = { aggregate: "sum", field: "value" };
            templates.push(new VegaTemplate("A-N-Q Bar Chart", 'bar', vegaEncoding, selections, data));

            // @A-N-Q-N stacked bar chart 
            vegaEncoding.color = { field: defaultY.name, type: "nominal" };
            templates.push(new VegaTemplate("A-N-Q-N Stacked Bar Chart", 'bar', vegaEncoding, selections, data));

            // @N-Q-N Multi Series Line Chart
            vegaEncoding.y = { field: "value", type: "quantitative" }
            templates.push(new VegaTemplate("A-N-Q-N Multi Series Line Chart", 'line', vegaEncoding, selections, data));

            // @@N-N-Q grouped bar chart 
            if (GetHeaders(regionMetaData.x).length > 1) {
                let defaultX2 = regionMetaData.x.headers[regionMetaData.x.headers.length - 2]
                vegaEncoding.xOffset = { field: defaultX.name, type: "nominal" };
                vegaEncoding.color = { field: defaultX.name, type: "nominal" };
                vegaEncoding.x = { field: defaultX2.name, type: "nominal", sort: defaultX2.sort };
                vegaEncoding.y = { aggregate: "sum", field: "value" };
                templates.push(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncoding, selections, data));
            }
            else if (GetHeaders(regionMetaData.y).length > 1) {
                // Y direction
                let defaultY2 = regionMetaData.y.headers[regionMetaData.y.headers.length - 2]
                vegaEncoding.yOffset = { field: defaultY.name, type: "nominal" };
                vegaEncoding.color = { field: defaultY.name, type: "nominal" };
                vegaEncoding.y = { field: defaultY.name, type: "nominal", sort: defaultY2.sort };
                vegaEncoding.x = { aggregate: "sum", field: "value" };
                templates.push(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncoding, selections, data));
            }
        }

    }
    return templates;
}

// 供测试使用
export let regionTemplateExample = {
    "x": {
        "range": 1,
        "headers": [
            {
                "name": "x0",
                "sort": ["x00", "x01"]
            },
            {
                "name": "x1",
                "sort": ["x10", "x11", "x12", "x13"]
            }
        ]
    },
    "y": {
        "range": 10,
        "headers": [
            {
                "name": "y0",
                "sort": ["y00", "y01"]
            },
            {
                "name": "y1",
                "sort": ["y10", "y11", "y12", "y13"]
            }
        ]
    }
}