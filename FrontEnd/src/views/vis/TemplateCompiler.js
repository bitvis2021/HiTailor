import { EncodingCompiler } from './SchemaCompiler'
// Reconsitution temp2vega
// Target: decouple vis 
// select area (metadata/visData) -> templates -> template (vegaConfig) -> panel (tweaked config) -> vis
// recommand (templatename_str,metadata/visData) -> template (vegaConfig) -> panel

// vegaConfig -> tweakableConfig / invisibileConfig
// tweakableConfig -> templateCompiler (+invisibleConfig) -> vega-lite JSON

export let supportedTemplate = {
    NQ_Simple_Bar_Chart: "Simple Bar Chart",
    NQ_Simple_Line_Chart: "Simple Line Chart",
    NQ_Strip_Plot: "Strip Plot",
    NQ_Box_Plot: "Box Plot",
    NQ_Ranged_Dot_Plot: "Ranged Dot Plot",
    ANQ_Line_Chart: "Line Chart",
    ANQ_Bar_Chart: "Bar Chart",
    ANQN_Stacked_Bar_Chart: "Stacked Bar Chart",
    ANQN_Multi_Series_Line_Chart: "Multi Series Line Chart",
    NNQ_grouped_bar_chart: "Grouped Bar Chart",
    Q2_Horizon_Graph: "Horizon Graph",
}

export function GetTemplate(templateName_str, metaData_obj, visData_arr, direction) {
    let vegaConfig;
    let selections;
    let picture;

    let defaultVal = {};
    let selections_cell = selections_cell = EncodingCompiler.GetSelectionsFromMetaData(metaData_obj);
    selections_cell.ySelect.selections.push('value');
    selections_cell.xSelect.selections.push('value');


    // let selections_obj, visData_obj

    // vertical
    let [visData_vertical, selections_vertical] = GetObjSelections(visData_arr, metaData_obj, 'vertical');
    let vVisdefualtValX = selections_vertical.xSelect.selections[0];
    let vVisdefualtValY = selections_vertical.xSelect.selections[1];

    // horizon
    let [visData_horizon, selections_horizon] = GetObjSelections(visData_arr, metaData_obj, 'horizon');
    let hVisdefualtValX = selections_horizon.xSelect.selections[0];
    let hVisdefualtValY = selections_horizon.xSelect.selections[1];

    let is_X = false;
    if (direction == undefined || direction == 'x' || direction == 'horizontal') {
        is_X = true;
        defaultVal = metaData_obj.x.headers[metaData_obj.x.headers.length - 1];
    }
    else {
        defaultVal = metaData_obj.y.headers[metaData_obj.y.headers.length - 1];
    }

    switch (templateName_str) {
        case supportedTemplate.NQ_Simple_Bar_Chart:
            selections = selections_cell;
            picture = './templates/simple bar chart.png'
            vegaConfig = {
                mark: "bar",
                data: { values: visData_arr },
                encoding: {
                    x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                    color: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                    y: { field: "value", type: 'quantitative' }
                }
            }
            if (!is_X) {
                [vegaConfig.encoding.x, vegaConfig.encoding.y] = [vegaConfig.encoding.y, vegaConfig.encoding.x];
                selections.xSelect.selections = [];
                picture = './templates/simple bar chart y.png'
            }
            else {
                selections.ySelect.selections = [];
            }
            break;
        // - [A-N-Q bar chart](https://www.notion.so/A-N-Q-bar-chart-1746d78908fd46988ae9266d91f7e114)
        case supportedTemplate.ANQ_Bar_Chart:
            selections = selections_cell;
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
            break;
        case supportedTemplate.Q2_Horizon_Graph:
            if (is_X) {
                return new HorizonGraphTemplate(visData_horizon, selections_horizon, './templates/horizon graph.png', is_X);
            }

        case supportedTemplate.NQ_Simple_Line_Chart:
            selections = selections_horizon;
            picture = './templates/line chart.png';
            vegaConfig = {
                mark: "line",
                data: { values: visData_horizon },
                encoding: {
                    x: { field: hVisdefualtValX, type: "quantitative" },
                    y: { field: hVisdefualtValY, type: "quantitative" }
                }
            }
        default:
            break;
    }

    if (vegaConfig != undefined) {
        return new VegaTemplate(templateName_str, vegaConfig, selections, picture);
    }
}

export function GetTemplates(metaData_obj, visData_arr) {
    // two forms of visData
    let templates = new Templates;

    if (metaData_obj.x.range == 1 || metaData_obj.y.range == 1) {
        if (metaData_obj.y.range == 1) {
            templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Simple_Bar_Chart, metaData_obj, visData_arr, 'x'), 'horizon')
        }
        else {
            templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Simple_Bar_Chart, metaData_obj, visData_arr, 'y'), 'vertical')
            // templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Simple_Line_Chart, metaData_obj, visData_arr, 'x'))
            // templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Simple_Line_Chart, metaData_obj, visData_arr, 'y'), 'vertical')
        }
    }
    if (metaData_obj.x.range >= 2 && metaData_obj.y.range >= 2) {
        let aggregateChart = [
            supportedTemplate.NQ_Strip_Plot,
            supportedTemplate.NQ_Box_Plot,
            supportedTemplate.NQ_Ranged_Dot_Plot,
            supportedTemplate.ANQN_Multi_Series_Line_Chart,
            supportedTemplate.ANQ_Line_Chart,
            supportedTemplate.ANQ_Bar_Chart,
            supportedTemplate.ANQN_Stacked_Bar_Chart,
            supportedTemplate.ANQN_Multi_Series_Line_Chart,
            supportedTemplate.NQ_Simple_Line_Chart
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

    }

    return templates.GetTemplates();
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

// return [obj_visData, ECSelections]
function GetObjSelections(visData_arr, metaData_arr, direction_str) {
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
                    objs[key][rowName].push(cell['value']);
                }
                else {
                    objs[key][rowName] = [];
                    objs[key][rowName].push(cell['value']);
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
                    if (arr.length != metaData_arr.y.range) {
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
                    if (arr.length != metaData_arr.x.range) {
                        break;
                    }
                    selections[selection] = arr;
                    selections_name.push(selection.split('.').pop());
                }
            }
        }
    }

    let obj_visData = []
    if (is_vertical) {
        // select the biggest header
        let header = metaData_arr.y.headers[metaData_arr.y.headers.length - 1];
        selections_name.push(header.name);

        for (let i = 0; i < metaData_arr.y.range; i++) {
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
        let header = metaData_arr.x.headers[metaData_arr.x.headers.length - 1];
        selections_name.push(header.name);

        for (let i = 0; i < metaData_arr.x.range; i++) {
            let cell = {};
            for (const key in selections) {
                let processed_key = key.split('.').pop()
                cell[processed_key] = selections[key][i];
                cell[header.name] = header.sort[i];
            }
            obj_visData.push(cell);
        }
    }

    let ECSelections = {
        xSelect: {
            selections: selections_name,
            bindings: {},
        },
        ySelect: {
            selections: selections_name,
            bindings: {},
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
    let ySelect_str = selections_obj.xSelect.selections[0];
    let xSelect_str = selections_obj.xSelect.selections.find(element => element.substring(0, 3) == 'row');
    this.name = supportedTemplate.Q2_Horizon_Graph,
        this.vegaConfig = {
            data: { values: visData_arr },
            layer: [
                {
                    mark: { type: "area", orient: "vertical", clip: true, interpolate: "monotone", opacity: 0.6 },
                    encoding: {
                        x: { field: xSelect_str, type: "nominal", scale: { zero: false, nice: false }, axis: { labels: false, ticks: false, title: null } },
                        y: { field: ySelect_str, type: "quantitative", scale: { zero: false, nice: false }, axis: { labels: false, ticks: false, title: null } },
                    }
                },
                {
                    transform: [{ calculate: "datum['" + ySelect_str + "'] - 100", as: "ny" }],
                    mark: { type: "area", orient: "vertical", clip: true, interpolate: "monotone", opacity: 0.6 },
                    encoding: {
                        x: { field: xSelect_str, type: "nominal", scale: { zero: false, nice: false }, axis: { labels: false, ticks: false, title: null } },
                        y: { field: "ny", type: "quantitative", axis: { labels: false, ticks: false, title: null } },
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

    if (this.vegaConfig.layer[0].encoding.y.scale) {
        this.vegaConfig.layer[0].encoding.y.scale.domain = [0, 100];
    }
    else {
        this.vegaConfig.layer[0].encoding.y.scale = { domain: [0, 100] };
    }

    this.vegaConfig.layer[1] = JSON.parse(JSON.stringify(vegaConfig_obj));
    let ySelect = this.vegaConfig.layer[0].encoding.y.field;
    this.vegaConfig.layer[1].transform = [{ calculate: "datum['" + ySelect + "'] - 100", as: "ny" }]
    this.vegaConfig.layer[1].encoding.y = { field: "ny", type: "quantitative", axis: { labels: false, ticks: false, title: null } };

    return this.vegaConfig;
}

HorizonGraphTemplate.prototype.GetSelections = function () {
    return this.selections;
}