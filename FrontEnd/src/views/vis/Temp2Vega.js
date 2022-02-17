import { EncodingCompiler } from './SchemaCompiler'
export function VegaTemplate(tempName_str, mark_str, encodingVega_obj, data_arr, ECSelections_obj, previewPic_str) {
    this.name = tempName_str
    this.img = previewPic_str
    this.mark = mark_str
    this.data = data_arr
    this.encoding = EncodingCompiler.PreprocessEncoding(encodingVega_obj)
    this.ECSelections = ECSelections_obj
}

VegaTemplate.prototype.GetECSelections = function () {
    return this.ECSelections;
}

VegaTemplate.prototype.GetVegaConf = function () {
    return {
        data: { values: this.data },
        mark: this.mark,
        encoding: this.encoding
    }
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

function Templates() {
    this.templates = {}
}
Templates.prototype.AddTemplate = function (template, direction) {
    if (direction == undefined) {
        direction = 'horizontal'
    }

    if (this.templates[template.name] == undefined) {
        this.templates[template.name] = {}
    }
    this.templates[template.name][direction] = template
}

Templates.prototype.GetTemplates = function () {
    let ans = [];
    for (const key in this.templates) {
        if (Object.hasOwnProperty.call(this.templates, key)) {
            const directions = this.templates[key];
            let templateDirection = [];
            for (const dkey in directions) {
                if (Object.hasOwnProperty.call(directions, dkey)) {
                    let template = directions[dkey];
                    template.direction = dkey;
                    templateDirection.push(template);
                }
            }
            ans.push(templateDirection);
        }
    }
    return ans;
}


// 输入元数据，返回VegaTemplate对象数组
export function GetTemplates(regionMetaData, data) {
    let templates = new Templates;

    if (regionMetaData != undefined && data != undefined) {

        let vegaEncoding = {}
        let selections = EncodingCompiler.GetSelections(regionMetaData);
        let defaultX = regionMetaData.x.headers[regionMetaData.x.headers.length - 1];
        let defaultY = regionMetaData.y.headers[regionMetaData.y.headers.length - 1];

        if (regionMetaData.x.range == 1 || regionMetaData.y.range == 1) {
            if (regionMetaData.x.range == 1) {
                vegaEncoding = {
                    x: { field: "value", type: "quantitative" },
                    y: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
                    detail: { field: defaultY.name, type: "nominal" },
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
            templates.AddTemplate(new VegaTemplate("N-Q Simple Line Chart", 'line', vegaEncoding, data, selections, './templates/line chart.png'));
            // - [N-Q simple bar chart](https://www.notion.so/N-Q-simple-bar-chart-19e8f37a7b9741e6a9bbb9a861d1e724)
            templates.AddTemplate(new VegaTemplate("N-Q Simple Bar Chart", 'bar', vegaEncoding, data, selections, './templates/bar chart.png'));

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
            // - [N-Q Ranged Dot Plot example](https://www.notion.so/N-Q-range-chart-example-7f4e860724f24590b325453d2e88f6d4)
            templates.AddTemplate(new VegaTemplate("N-Q Ranged Dot Plot", 'line', vegaEncoding, data, selections, './templates/ranged dot plot.png'));
            delete vegaEncoding['detail'];

            // - [N-Q boxplot example](https://www.notion.so/N-Q-boxplot-example-01bfa0004d1e4b758d64d40559a49474)
            templates.AddTemplate(new VegaTemplate("N-Q Box Plot", {
                "type": "boxplot",
                "extent": "min-max"
            }, vegaEncoding, data, selections, './templates/box plot.png'));

            // @@N-N-Q grouped bar chart 
            if (GetHeaders(regionMetaData.x).length > 1) {
                let defaultX2 = regionMetaData.x.headers[regionMetaData.x.headers.length - 2]
                vegaEncoding.xOffset = { field: defaultX.name, type: "nominal" };
                vegaEncoding.color = { field: defaultX.name, type: "nominal" };
                vegaEncoding.x = { field: defaultX2.name, type: "nominal", sort: defaultX2.sort };
                vegaEncoding.y = { field: "value", type: "quantitative" };
                templates.AddTemplate(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncoding, data, selections, './templates/bar chart.png'));
            }
            else if (GetHeaders(regionMetaData.y).length > 1) {
                // Y direction
                let defaultY2 = regionMetaData.y.headers[regionMetaData.y.headers.length - 2]
                vegaEncoding.yOffset = { field: defaultY.name, type: "nominal" };
                vegaEncoding.color = { field: defaultY.name, type: "nominal" };
                vegaEncoding.y = { field: defaultY.name, type: "nominal", sort: defaultY2.sort };
                vegaEncoding.x = { field: "value", type: "quantitative" };
                templates.AddTemplate(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncoding, data, selections));
            }
        }


        if (regionMetaData.x.range >= 2 && regionMetaData.y.range >= 2) {

            vegaEncoding = {
                x: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                y: { field: "value", type: "quantitative" }
            }

            // @NQ strip plot 
            templates.AddTemplate(new VegaTemplate("N-Q Strip Plot", 'tick', vegaEncoding, data, selections, './templates/strip plot.png'));

            // @N-Q boxplot example 
            vegaEncoding.color = { field: defaultX.name, type: "nominal" };
            templates.AddTemplate(new VegaTemplate("N-Q Box Plot", {
                "type": "boxplot",
                "extent": "min-max"
            }, vegaEncoding, data, selections, './templates/box plot.png'));
            delete vegaEncoding['color'];

            // @N-Q Ranged Dot Plot example 
            vegaEncoding.detail = vegaEncoding.x;
            templates.AddTemplate(new VegaTemplate("N-Q Ranged Dot Plot", 'line', vegaEncoding, data, selections, './templates/ranged dot plot.png'
            ));
            delete vegaEncoding['detail'];

            // - [A-N-Q aggregated line chart](https://www.notion.so/A-N-Q-aggregated-line-chart-e4f55cc964704719bee6c87244ebd7c8)
            vegaEncoding.y = { aggregate: "mean", field: "value" };
            templates.AddTemplate(new VegaTemplate("A-N-Q Line Chart", 'line', vegaEncoding, data, selections, './templates/line chart.png'));

            // - [A-N-Q bar chart](https://www.notion.so/A-N-Q-bar-chart-1746d78908fd46988ae9266d91f7e114)
            vegaEncoding.y = { aggregate: "sum", field: "value" };
            templates.AddTemplate(new VegaTemplate("A-N-Q Bar Chart", 'bar', vegaEncoding, data, selections, './templates/bar chart.png'));

            // @A-N-Q-N stacked bar chart 
            vegaEncoding.color = { field: defaultY.name, type: "nominal" };
            templates.AddTemplate(new VegaTemplate("A-N-Q-N Stacked Bar Chart", 'bar', vegaEncoding, data, selections, './templates/stacked bar chart.png'));

            // @N-Q-N Multi Series Line Chart
            vegaEncoding.y = { field: "value", type: "quantitative" }
            templates.AddTemplate(new VegaTemplate("A-N-Q-N Multi Series Line Chart", 'line', vegaEncoding, data, selections, './templates/multi line chart.png'));

            // @@N-N-Q grouped bar chart 
            if (GetHeaders(regionMetaData.x).length > 1) {
                let defaultX2 = regionMetaData.x.headers[regionMetaData.x.headers.length - 2]
                vegaEncoding.xOffset = { field: defaultX.name, type: "nominal" };
                vegaEncoding.color = { field: defaultX.name, type: "nominal" };
                vegaEncoding.x = { field: defaultX2.name, type: "nominal", sort: defaultX2.sort };
                vegaEncoding.y = { aggregate: "sum", field: "value" };
                templates.AddTemplate(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncoding, data, selections, './templates/group bar chart.png'), 'horizontal');
            }
            if (GetHeaders(regionMetaData.y).length > 1) {
                // Y direction
                let defaultY2 = regionMetaData.y.headers[regionMetaData.y.headers.length - 2]
                vegaEncoding.yOffset = { field: defaultY.name, type: "nominal" };
                vegaEncoding.color = { field: defaultY.name, type: "nominal" };
                vegaEncoding.y = { field: defaultY.name, type: "nominal", sort: defaultY2.sort };
                vegaEncoding.x = { aggregate: "sum", field: "value" };
                templates.AddTemplate(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncoding, data, selections, './templates/group bar chart y.png'), 'vertical');
            }
        }

    }
    return templates.GetTemplates();
}