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

        let vegaEncodingX = {}
        let vegaEncodingY = {}
        let selections = EncodingCompiler.GetSelectionsFromMetaData(regionMetaData);
        let defaultX = regionMetaData.x.headers[regionMetaData.x.headers.length - 1];
        let defaultY = regionMetaData.y.headers[regionMetaData.y.headers.length - 1];

        if (regionMetaData.x.range == 1 || regionMetaData.y.range == 1) {
            if (regionMetaData.x.range == 1) {
                vegaEncodingX = {
                    x: { field: "value", type: "quantitative" },
                    y: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
                    detail: { field: defaultY.name, type: "nominal" },
                }
            }
            else if (regionMetaData.y.range == 1) {
                vegaEncodingX = {
                    x: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                    y: { field: "value", type: "quantitative" },
                    detail: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                }
            }


            // - [N-Q simple line chart](https://www.notion.so/N-Q-simple-line-chart-f4dc62567fd648278288403f3966209b)
            templates.AddTemplate(new VegaTemplate("N-Q Simple Line Chart", 'line', vegaEncodingX, data, selections, './templates/line chart.png'));
            // - [N-Q simple bar chart](https://www.notion.so/N-Q-simple-bar-chart-19e8f37a7b9741e6a9bbb9a861d1e724)
            templates.AddTemplate(new VegaTemplate("N-Q Simple Bar Chart", 'bar', vegaEncodingX, data, selections, './templates/bar chart.png'));

            if (regionMetaData.y.range == 1) {
                vegaEncodingX = {
                    x: { field: "value", type: "quantitative" },
                    y: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
                    detail: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
                }
            }
            else if (regionMetaData.x.range == 1) {
                vegaEncodingX = {
                    x: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                    y: { field: "value", type: "quantitative" },
                    detail: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                }
            }
        }


        if (regionMetaData.x.range >= 2 && regionMetaData.y.range >= 2) {

            vegaEncodingX = {
                x: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
                y: { field: "value", type: "quantitative" }
            }

            vegaEncodingY = {
                x: { field: "value", type: "quantitative" },
                y: { field: defaultY.name, type: "nominal", sort: defaultY.sort },
            }

            // @NQ strip plot 
            templates.AddTemplate(new VegaTemplate("N-Q Strip Plot", 'tick', vegaEncodingY, data, selections, './templates/strip plot.png'));
            templates.AddTemplate(new VegaTemplate("N-Q Strip Plot", 'tick', vegaEncodingX, data, selections, './templates/strip plot y.png'), 'vertical');

            // @N-Q boxplot example 
            vegaEncodingX.color = { field: defaultX.name, type: "nominal" };
            templates.AddTemplate(new VegaTemplate("N-Q Box Plot", {
                "type": "boxplot",
                "extent": "min-max"
            }, vegaEncodingX, data, selections, './templates/box plot y.png'), 'vertical');
            vegaEncodingY.color = { field: defaultY.name, type: "nominal" };
            templates.AddTemplate(new VegaTemplate("N-Q Box Plot", {
                "type": "boxplot",
                "extent": "min-max"
            }, vegaEncodingY, data, selections, './templates/box plot.png'));
            delete vegaEncodingX['color'];
            delete vegaEncodingY['color'];

            // @N-Q Ranged Dot Plot example 
            vegaEncodingX.detail = vegaEncodingX.x;
            vegaEncodingY.detail = vegaEncodingY.y;
            templates.AddTemplate(new VegaTemplate("N-Q Ranged Dot Plot", 'line', vegaEncodingY, data, selections, './templates/ranged dot plot.png'
            ));
            templates.AddTemplate(new VegaTemplate("N-Q Ranged Dot Plot", 'line', vegaEncodingX, data, selections, './templates/ranged dot plot y.png'
            ), 'vertical');
            delete vegaEncodingX['detail'];
            delete vegaEncodingY['detail'];

            // - [A-N-Q aggregated line chart](https://www.notion.so/A-N-Q-aggregated-line-chart-e4f55cc964704719bee6c87244ebd7c8)
            vegaEncodingX.y = { aggregate: "mean", field: "value" };
            templates.AddTemplate(new VegaTemplate("A-N-Q Line Chart", 'line', vegaEncodingX, data, selections, './templates/line chart.png'));
            vegaEncodingY.x = { aggregate: "mean", field: "value" };
            templates.AddTemplate(new VegaTemplate("A-N-Q Line Chart", 'line', vegaEncodingY, data, selections, './templates/line chart y.png'), 'vertical');

            // - [A-N-Q bar chart](https://www.notion.so/A-N-Q-bar-chart-1746d78908fd46988ae9266d91f7e114)
            vegaEncodingX.y = { aggregate: "sum", field: "value" };
            templates.AddTemplate(new VegaTemplate("A-N-Q Bar Chart", 'bar', vegaEncodingX, data, selections, './templates/bar chart.png'));
            vegaEncodingY.x = { aggregate: "sum", field: "value" };
            templates.AddTemplate(new VegaTemplate("A-N-Q Bar Chart", 'bar', vegaEncodingY, data, selections, './templates/bar chart y.png'), 'vertical');

            // @A-N-Q-N stacked bar chart 
            vegaEncodingX.color = { field: defaultY.name, type: "nominal" };
            templates.AddTemplate(new VegaTemplate("A-N-Q-N Stacked Bar Chart", 'bar', vegaEncodingX, data, selections, './templates/stacked bar chart.png'));
            vegaEncodingY.color = { field: defaultX.name, type: "nominal" };
            templates.AddTemplate(new VegaTemplate("A-N-Q-N Stacked Bar Chart", 'bar', vegaEncodingY, data, selections, './templates/stacked bar chart y.png'), 'vertical');

            // @N-Q-N Multi Series Line Chart
            vegaEncodingX.y = { field: "value", type: "quantitative" }
            templates.AddTemplate(new VegaTemplate("A-N-Q-N Multi Series Line Chart", 'line', vegaEncodingX, data, selections, './templates/multi line chart.png'));
            vegaEncodingY.x = { field: "value", type: "quantitative" }
            templates.AddTemplate(new VegaTemplate("A-N-Q-N Multi Series Line Chart", 'line', vegaEncodingY, data, selections, './templates/multi line chart y.png'), 'vertical');

            // @@N-N-Q grouped bar chart 
            if (GetHeaders(regionMetaData.x).length > 1) {
                let defaultX2 = regionMetaData.x.headers[regionMetaData.x.headers.length - 2]
                vegaEncodingX.xOffset = { field: defaultX.name, type: "nominal" };
                vegaEncodingX.color = { field: defaultX.name, type: "nominal" };
                vegaEncodingX.x = { field: defaultX2.name, type: "nominal", sort: defaultX2.sort };
                vegaEncodingX.y = { aggregate: "sum", field: "value" };
                templates.AddTemplate(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncodingX, data, selections, './templates/group bar chart.png'), 'horizontal');
            }
            if (GetHeaders(regionMetaData.y).length > 1) {
                // Y direction
                let defaultY2 = regionMetaData.y.headers[regionMetaData.y.headers.length - 2]
                vegaEncodingX.yOffset = { field: defaultY.name, type: "nominal" };
                vegaEncodingX.color = { field: defaultY.name, type: "nominal" };
                vegaEncodingX.y = { field: defaultY.name, type: "nominal", sort: defaultY2.sort };
                vegaEncodingX.x = { aggregate: "sum", field: "value" };
                templates.AddTemplate(new VegaTemplate("N-N-Q grouped bar chart", 'bar', vegaEncodingX, data, selections, './templates/group bar chart y.png'), 'vertical');
            }
        }

    }
    return templates.GetTemplates();
}