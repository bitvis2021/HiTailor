import { EncodingCompiler, FieldSelection } from './SchemaCompiler'
// Reconsitution temp2vega
// Target: decouple vis 
// select area (metadata/visData) -> templates -> template (vegaConfig) -> panel (tweaked config) -> vis
// recommand (templatename_str,metadata/visData) -> template (vegaConfig) -> panel

// vegaConfig -> tweakableConfig / invisibileConfig
// tweakableConfig -> templateCompiler (+invisibleConfig) -> vega-lite JSON

export let supportedTemplate = {
    NQor2Q_Simple_Line_Chart: "Line Chart",
    NQ_Strip_Plot: "Strip Plot",
    NQ_Box_Plot: "Box Plot",
    NQ_Ranged_Dot_Plot: "Ranged Dot Plot",
    ANQorNQ_Bar_Chart: "Bar Chart",
    ANQN_Stacked_Bar_Chart: "Stacked Bar Chart",
    ANQN_Multi_Series_Line_Chart: "Multi Series Line Chart",
    NNQ_grouped_bar_chart: "Grouped Bar Chart",
    Q2_Horizon_Graph: "Horizon Graph",
    Q2_Scatter_plot: "Scatterplot",
}

// factory model
export function GetTemplate(templateName_str, metaData_obj, visData_arr, direction) {

    let defaultVal;
    let defaultValX;
    let defaultValY;

    let picture = '';
    let vegaConfig = {};

    let selections_cell = EncodingCompiler.GetSelectionsFromMetaData(metaData_obj);

    // vertical
    let [visData_vertical, selections_vertical] = GetObjSelections(visData_arr, metaData_obj, 'vertical');

    // horizon
    let [visData_horizon, selections_horizon] = GetObjSelections(visData_arr, metaData_obj, 'horizon');

    let is_X = false;
    if (direction == undefined || direction == 'x' || direction == 'horizontal') {
        is_X = true;
        defaultVal = metaData_obj.x.headers[metaData_obj.x.headers.length - 1];
    }
    else {
        defaultVal = metaData_obj.y.headers[metaData_obj.y.headers.length - 1];
    }
    defaultValX = metaData_obj.x.headers[metaData_obj.x.headers.length - 1];
    defaultValY = metaData_obj.y.headers[metaData_obj.y.headers.length - 1];

    switch (templateName_str) {

        case supportedTemplate.Q2_Scatter_plot:
            // just reuse line chart            
            let point_template = GetTemplate(supportedTemplate.NQor2Q_Simple_Line_Chart, metaData_obj, visData_arr, direction);
            point_template.vegaConfig.mark = "point";
            point_template.name = templateName_str;
            point_template.img = './templates/scatterplot.png';
            console.log("new tmeola", point_template);
            return point_template;

        case supportedTemplate.NQor2Q_Simple_Line_Chart:
            let line_template;
            if (metaData_obj.x.range == 1 || metaData_obj.y.range == 1) {
                selections_cell = selections_cell;
                selections_cell.SetYSelections(['value']);
                picture = './templates/line chart.png'
                vegaConfig = {
                    mark: "line",
                    data: { values: visData_arr },
                    encoding: {
                        x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                        y: { field: "value", type: 'quantitative' },
                    }
                }
                line_template = new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
            }
            else {
                if (is_X) {
                    [visData_arr, selections_cell] = GetObjSelections(visData_arr, metaData_obj, 'x');
                    selections_cell.SetXSelections(selections_cell.GetYSelections());
                    picture = './templates/line chart.png'
                    vegaConfig = {
                        mark: "line",
                        data: { values: visData_arr },
                        encoding: {
                            x: { field: selections_cell.GetXSelections().at(0), type: "quantitative" },
                            y: { field: selections_cell.GetXSelections().at(1), type: 'quantitative' },
                        }
                    }
                }
                else {
                    [visData_arr, selections_cell] = GetObjSelections(visData_arr, metaData_obj, 'y');
                    selections_cell.SetYSelections(selections_cell.GetXSelections());
                    picture = './templates/line chart.png'
                    vegaConfig = {
                        mark: "line",
                        data: { values: visData_arr },
                        encoding: {
                            x: { field: selections_cell.GetYSelections().at(0), type: "quantitative" },
                            y: { field: selections_cell.GetXSelections().at(1), type: 'quantitative' },
                        }
                    }
                }

                line_template = new Q2Template(templateName_str, vegaConfig, selections_cell, picture);

            }
            return line_template;

        case supportedTemplate.ANQorNQ_Bar_Chart:
            console.log("bar char range", metaData_obj.x.range);
            if (metaData_obj.x.range == 1 || metaData_obj.y.range == 1) {
                selections_cell.AddYSelection("value");
                selections_cell.AddXSelection("value");
                picture = './templates/simple bar chart.png'
                vegaConfig = {
                    mark: "bar",
                    data: { values: visData_arr },
                    encoding: {
                        x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                        y: { field: "value", type: 'quantitative' },
                        color: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                    }
                }
                if (!is_X) {
                    [vegaConfig.encoding.x, vegaConfig.encoding.y] = [vegaConfig.encoding.y, vegaConfig.encoding.x];
                    selections_cell.xSelect.selections = [];
                    picture = './templates/simple bar chart y.png'
                }
                else {
                    selections_cell.ySelect.selections = [];
                }
                return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
            }
            else {
                selections_cell.AddXSelection("value");
                selections_cell.AddYSelection("value");
                vegaConfig = {
                    mark: "bar",
                    data: { values: visData_arr },
                    encoding: {
                        x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                        y: { aggregate: "sum", field: "value" }
                    }
                }
                if (is_X) {
                    picture = './templates/bar chart.png'
                }
                else {
                    [vegaConfig.encoding.x, vegaConfig.encoding.y] = [vegaConfig.encoding.y, vegaConfig.encoding.x];
                    picture = './templates/bar chart y.png'
                }
                return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
            }

        case supportedTemplate.NQ_Strip_Plot:
            selections_cell.AddYSelection("value");
            selections_cell.AddXSelection("value");
            if (is_X) {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "tick",
                    encoding: {
                        y: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                        x: { field: "value", type: "quantitative" }
                    }
                }
                picture = './templates/strip plot.png';
            }
            else {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "tick",
                    encoding: {
                        x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                        y: { field: "value", type: "quantitative" }
                    }
                }
                picture = './templates/strip plot y.png';
            }
            return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);

        case supportedTemplate.NQ_Box_Plot:
            selections_cell.AddYSelection("value");
            selections_cell.AddXSelection("value");
            vegaConfig = {
                data: { values: visData_arr },
                mark: {
                    "type": "boxplot",
                    "extent": "min-max"
                },
                encoding: {
                    x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                    y: { field: "value", type: "quantitative" },
                    color: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                }
            }
            if (is_X) {
                picture = './templates/box plot y.png';
            } else {
                [vegaConfig.encoding.x, vegaConfig.encoding.y] = [vegaConfig.encoding.y, vegaConfig.encoding.x];
                picture = './templates/box plot.png';
            }
            return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);

        case supportedTemplate.ANQN_Stacked_Bar_Chart:
            selections_cell.AddYSelection("value");
            selections_cell.AddXSelection("value");
            vegaConfig = {
                data: { values: visData_arr },
                mark: "bar",
                encoding: {
                    x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                    y: { field: "value", aggregate: "sum" },
                }
            }
            if (is_X) {
                picture = './templates/stacked bar chart.png';
                vegaConfig.encoding.color = { field: defaultValY.name, type: "nominal", sort: defaultValY.sort };
            } else {
                [vegaConfig.encoding.x, vegaConfig.encoding.y] = [vegaConfig.encoding.y, vegaConfig.encoding.x];
                vegaConfig.encoding.color = { field: defaultValX.name, type: "nominal", sort: defaultValX.sort };
                picture = './templates/stacked bar chart y.png';
            }
            return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);

        case supportedTemplate.ANQN_Multi_Series_Line_Chart:
            if (is_X) {
                selections_cell.AddYSelection("value");
                selections_cell.AddXSelection("value");
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "line",
                    encoding: {
                        x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                        y: { field: "value", type: "quantitative" },
                        color: { field: defaultValY.name, type: "nominal", sort: defaultValY.sort }
                    }
                }
                picture = './templates/multi line chart.png';
                return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
            }

        case supportedTemplate.NNQ_grouped_bar_chart:
            // TODO: there is still some bug after tweaking the panel - need to rebind the sort
            // resort the data
            // visData_arr.forEach(element => {
            //     for (const key in element) {
            //         if (Object.hasOwnProperty.call(element, key)) {
            //             const value = element[key];
            //             // split string
            //             let find = value.indexOf(" > ")
            //             if (find > -1) {
            //                 let newValue = value.substring(find);
            //                 element[key] = newValue;
            //             }
            //         }
            //     }
            // });
            vegaConfig = {
                data: { values: visData_arr },
                mark: "bar",
                encoding: {
                }
            }
            if (is_X) {
                let defaultX2 = metaData_obj.x.headers[0]
                vegaConfig.encoding.x = { field: defaultX2.name, type: "nominal", sort: defaultX2.sort };
                vegaConfig.encoding.y = { aggregate: "sum", field: "value" };
                vegaConfig.encoding.xOffset = { field: defaultValX.name, type: "nominal" };
                vegaConfig.encoding.color = { field: defaultValX.name, type: "nominal" };
                return new VegaTemplate(templateName_str, vegaConfig, selections_cell, './templates/group bar chart.png');
            }
            else {
                let defaultY2 = metaData_obj.y.headers[0]
                vegaConfig.encoding.x = { aggregate: "sum", field: "value" };
                vegaConfig.encoding.y = { field: defaultValY.name, type: "nominal", sort: defaultY2.sort };
                vegaConfig.encoding.yOffset = { field: defaultValY.name, type: "nominal" };
                vegaConfig.encoding.color = { field: defaultValY.name, type: "nominal" };
                return new VegaTemplate(templateName_str, vegaConfig, selections_cell, './templates/group bar chart y.png');
            }

        case supportedTemplate.NQ_Ranged_Dot_Plot:
        // TODO: add point support
            selections_cell.AddYSelection("value");
            selections_cell.AddXSelection("value");
            vegaConfig = {
                data: { values: visData_arr },
                mark: "line",
                encoding: {
                    x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                    y: { field: "value", type: "quantitative" },
                }
            }
            if (is_X) {
                picture = './templates/ranged dot plot y.png';
                vegaConfig.encoding.detail = { field: defaultValX.name, type: "nominal", sort: defaultValX.sort };
            } else {
                [vegaConfig.encoding.x, vegaConfig.encoding.y] = [vegaConfig.encoding.y, vegaConfig.encoding.x];
                vegaConfig.encoding.detail = { field: defaultValY.name, type: "nominal", sort: defaultValY.sort };
                picture = './templates/ranged dot plot.png';
            }
            return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);

        case supportedTemplate.Q2_Horizon_Graph:
            return new HorizonGraphTemplate(visData_horizon, selections_horizon, './templates/horizon graph.png');

        default:
            break;
    }
}

export function GetTemplates(metaData_obj, visData_arr) {
    // two forms of visData
    let templates = new Templates;

    if (metaData_obj.x.range == 1 || metaData_obj.y.range == 1) {
        if (metaData_obj.y.range == 1) {
            templates.AddTemplate(GetTemplate(supportedTemplate.ANQorNQ_Bar_Chart, metaData_obj, visData_arr, 'x'), 'horizon')
            templates.AddTemplate(GetTemplate(supportedTemplate.NQor2Q_Simple_Line_Chart, metaData_obj, visData_arr, 'x'), 'horizon')
            templates.AddTemplate(GetTemplate(supportedTemplate.Q2_Horizon_Graph, metaData_obj, visData_arr, 'x'), 'horizon')
        }
        else {
            templates.AddTemplate(GetTemplate(supportedTemplate.ANQorNQ_Bar_Chart, metaData_obj, visData_arr, 'y'), 'vertical')
        }
    }
    if (metaData_obj.x.range >= 2 && metaData_obj.y.range >= 2) {
        let aggregateChart = [
            supportedTemplate.NQ_Strip_Plot,
            supportedTemplate.NQ_Box_Plot,
            supportedTemplate.NQ_Ranged_Dot_Plot,
            supportedTemplate.ANQN_Multi_Series_Line_Chart,
            supportedTemplate.ANQorNQ_Bar_Chart,
            supportedTemplate.ANQN_Stacked_Bar_Chart,
            supportedTemplate.ANQN_Multi_Series_Line_Chart
        ]
        for (let i = 0; i < aggregateChart.length; i++) {
            const chartName = aggregateChart[i];
            templates.AddTemplate(GetTemplate(chartName, metaData_obj, visData_arr, 'x'))
            templates.AddTemplate(GetTemplate(chartName, metaData_obj, visData_arr, 'y'), 'vertical')
        }

        // @@N-N-Q grouped bar chart
        if (GetHeaders(metaData_obj.x).length > 1) {
            templates.AddTemplate(GetTemplate(supportedTemplate.NNQ_grouped_bar_chart, metaData_obj, visData_arr, 'x'));
        }
        if (GetHeaders(metaData_obj.y).length > 1) {
            // Y direction
            templates.AddTemplate(GetTemplate(supportedTemplate.NNQ_grouped_bar_chart, metaData_obj, visData_arr, 'y'), 'vertical');
        }

        templates.AddTemplate(GetTemplate(supportedTemplate.Q2_Horizon_Graph, metaData_obj, visData_arr, 'x'), 'horizon');

        templates.AddTemplate(GetTemplate(supportedTemplate.NQor2Q_Simple_Line_Chart, metaData_obj, visData_arr, 'x'), 'using row data');
        templates.AddTemplate(GetTemplate(supportedTemplate.NQor2Q_Simple_Line_Chart, metaData_obj, visData_arr, 'y'), 'using column data');

        templates.AddTemplate(GetTemplate(supportedTemplate.Q2_Scatter_plot, metaData_obj, visData_arr, 'x'), 'using row data');
        templates.AddTemplate(GetTemplate(supportedTemplate.Q2_Scatter_plot, metaData_obj, visData_arr, 'y'), 'using column data');

    }

    return templates.GetTemplates();
}

// return [obj_visData, ECSelections]
function GetObjSelections(visData_arr, metaData_obj, direction_str) {
    let objs = {}
    let is_vertical = true;

    // direction means the direction of each strip
    if (direction_str == 'horizon' || direction_str == 'x') {
        is_vertical = false;
    }
    for (const key in visData_arr[0]) {
        if (Object.hasOwnProperty.call(visData_arr[0], key)) {
            objs[key] = {};
        }
    }

    for (let i = 0; i < visData_arr.length; i++) {
        const cell = visData_arr[i];
        for (const key in cell) {
            if (Object.hasOwnProperty.call(cell, key)) {
                const rowName = cell[key];
                if (objs[key][rowName] != undefined) {
                    objs[key][rowName].push(Number(cell['value']));
                }
                else {
                    objs[key][rowName] = [];
                    objs[key][rowName].push(Number(cell['value']));
                }
            }
        }
    }
    let selections = {};
    let selections_name = [];
    for (const key in objs) {
        if (is_vertical && key.substring(0, 3) == 'row') {
            for (const selection in objs[key]) {
                if (Object.hasOwnProperty.call(objs[key], selection)) {
                    const arr = objs[key][selection];
                    if (arr.length != metaData_obj.y.range) {
                        break;
                    }
                    selections[selection] = arr;
                    selections_name.push(selection.split('.').pop());
                }
            }
        }
        else if (!is_vertical && key.substring(0, 3) == 'col') {
            for (const selection in objs[key]) {
                if (Object.hasOwnProperty.call(objs[key], selection)) {
                    const arr = objs[key][selection];
                    if (arr.length != metaData_obj.x.range) {
                        break;
                    }
                    selections[selection] = arr;
                    selections_name.push(selection.split('.').pop());
                }
            }
        }
    }

    let obj_visData = []
    let ECSelections = new FieldSelection();

    if (is_vertical) {
        // select the biggest header
        let header = metaData_obj.y.headers[metaData_obj.y.headers.length - 1];
        ECSelections.SetXSelections(selections_name);
        ECSelections.SetYSelections([header.name]);

        for (let i = 0; i < metaData_obj.y.range; i++) {
            let cell = {};
            for (const key in selections) {
                let processed_key = key.split('.').pop()
                cell[processed_key] = selections[key][i];
                cell[header.name] = header.sort[i];
            }
            obj_visData.push(cell);
        }
    }
    else {
        let header = metaData_obj.x.headers[metaData_obj.x.headers.length - 1];
        ECSelections.SetYSelections(selections_name);
        ECSelections.SetXSelections([header.name]);

        for (let i = 0; i < metaData_obj.x.range; i++) {
            let cell = {};
            for (const key in selections) {
                let processed_key = key.split('.').pop()
                cell[processed_key] = selections[key][i];
                cell[header.name] = header.sort[i];
            }
            obj_visData.push(cell);
        }
    }


    return [obj_visData, ECSelections];
}


function Templates() {
    this.templates = {}
}
Templates.prototype.AddTemplate = function (template, direction) {
    if (template != undefined) {
        if (direction == undefined) {
            direction = 'horizontal'
        }

        if (this.templates[template.name] == undefined) {
            this.templates[template.name] = {}
        }
        this.templates[template.name][direction] = template
    }
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


export function VegaTemplate(tempName_str, vegaConfig_obj, selections_obj, previewPic_str) {
    this.name = tempName_str;
    this.vegaConfig = vegaConfig_obj;
    if (this.vegaConfig == undefined) {
        this.vegaConfig = {
            mark: "bar",
            encoding: {
                x: {},
                y: {},
            }
        }
    }
    this.img = previewPic_str;
    this.selections = selections_obj;
}

// User visible config
VegaTemplate.prototype.GetVegaConfig = function () {
    this.vegaConfig.encoding = EncodingCompiler.PreprocessEncoding(this.vegaConfig.encoding);
    return this.vegaConfig;
}

// Real vega-lite data
VegaTemplate.prototype.GetVegaLite = function () {
    this.vegaConfig.encoding = EncodingCompiler.PreprocessEncoding(this.vegaConfig.encoding);
    return this.vegaConfig;
}

// Input tweaked config from panel, and then process it turing it into true vega-lite json.
// Actually, after rewritting this function, it is a compiler.
VegaTemplate.prototype.CompileTweakedConfig = function (vegaConfig_obj) {
    this.vegaConfig = vegaConfig_obj;
    return this.vegaConfig;
}

VegaTemplate.prototype.GetSelections = function () {
    return this.selections;
}

// override get vegalite function
function Q2Template(tempName_str, vegaConfig_obj, selections_obj, previewPic_str) {
    VegaTemplate.call(this, tempName_str, vegaConfig_obj, selections_obj, previewPic_str);

}
Q2Template.prototype = new VegaTemplate();
Q2Template.prototype.GetVegaLite = function () {
    this.vegaConfig.encoding.x.type = "quantitative";
    this.vegaConfig.encoding.y.type = "quantitative";
    return this.vegaConfig;
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

function HorizonGraphTemplate(visData_arr, selections_obj, previewPic_str) {
    let ySelect_str = selections_obj.GetYSelections().at(0);
    let xSelect_str = selections_obj.GetXSelections().at(0);

    this.name = supportedTemplate.Q2_Horizon_Graph;

    this.GetOffset = function (ySelect_str) {
        // find max value in this selection
        let max = -Infinity;
        let min = 0;
        visData_arr.forEach(element => {
            if (element[ySelect_str] > max) {
                max = element[ySelect_str];
            }
            if (element[ySelect_str] < min) {
                min = element[ySelect_str];
            }
        });

        let Offset1 = min;
        let Offset2 = max * 2 / 3 - min;

        return [Offset1, Offset2];
    }

    let [Offset1, Offset2] = this.GetOffset(ySelect_str);

    this.vegaConfig = {
        data: { values: visData_arr },
        layer: [
            {
                transform: [{ calculate: "datum['" + ySelect_str + "'] - " + Offset1.toString(), as: ySelect_str }],
                mark: { type: "area", orient: "vertical", clip: true, interpolate: "monotone", opacity: 0.6 },
                encoding: {
                    y: { field: ySelect_str, type: "quantitative", scale: { zero: false, nice: false, domain: [0, Offset2] }, axis: { labels: false, ticks: false, title: null } },
                    x: { field: xSelect_str, type: "nominal", scale: { zero: false, nice: false }, axis: { labels: false, ticks: false, title: null } },
                }
            },
            {
                transform: [{ calculate: "datum['" + ySelect_str + "'] - " + Offset2, as: "ny" }],
                mark: { type: "area", orient: "vertical", clip: true, interpolate: "monotone", opacity: 0.6 },
                encoding: {
                    y: { field: "ny", type: "quantitative", scale: { zero: false, nice: false, domain: [0, Offset2] } },
                    x: { field: xSelect_str, type: "nominal", scale: { zero: false, nice: false }, axis: { labels: false, ticks: false, title: null } },
                }
            }
        ]
    }
    this.img = previewPic_str;
    this.selections = selections_obj;
}
// User visible config
HorizonGraphTemplate.prototype.GetVegaConfig = function () {
    let exposedVega = this.vegaConfig.layer[0];
    return exposedVega;
}

// Real vega-lite data
HorizonGraphTemplate.prototype.GetVegaLite = function (heigh, width) {
    return this.vegaConfig;
}

// Input tweaked config from panel, and then process it turing it into true vega-lite json.
// Actually, after rewritting this function, it is a compiler.
HorizonGraphTemplate.prototype.CompileTweakedConfig = function (vegaConfig_obj) {
    this.vegaConfig.layer[0] = vegaConfig_obj;
    this.vegaConfig.layer[0].mark.clip = true;
    this.vegaConfig.layer[0].encoding.y.type = "quantitative";

    let ySelect = this.vegaConfig.layer[0].encoding.y.field;

    let [Offset1, Offset2] = this.GetOffset(ySelect);

    if (this.vegaConfig.layer[0].encoding.y.scale) {
        this.vegaConfig.layer[0].encoding.y.scale.domain = [0, Offset2];
    }
    else {
        this.vegaConfig.layer[0].encoding.y.scale = { domain: [0, Offset2] };
    }
    this.vegaConfig.layer[0].transform = [{ calculate: "datum['" + ySelect + "'] - " + Offset1.toString(), as: ySelect }]

    this.vegaConfig.layer[1] = JSON.parse(JSON.stringify(vegaConfig_obj));
    this.vegaConfig.layer[1].transform = [{ calculate: "datum['" + ySelect + "'] - " + Offset2, as: "ny" }]
    this.vegaConfig.layer[1].encoding.y = { field: "ny", type: "quantitative", axis: { labels: false, ticks: false, title: null } };

    return this.vegaConfig;
}

HorizonGraphTemplate.prototype.GetSelections = function () {
    return this.selections;
}