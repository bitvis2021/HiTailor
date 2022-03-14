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
    NQ_Parallel_Coordinate_Plot: "Parallel Coordinate Plot",
    NQ_Histogram_Scatterplot: "2D Histogram Scatterplot",
    NQ_Histogram_Heatmap: "2D Histogram Heatmap",
    NQ_PieChart: "Pie Chart",
    NQ_RadialPlot: "Radial Plot",
}

// factory model
export function GetTemplate(templateName_str, metaData_obj, visData_arr, direction) {
    let picture = '';
    let vegaConfig = {};

    let selections_cell = GetSelectionsFromMetaData(metaData_obj);

    // vertical
    let visData_vertical = GetObjData(visData_arr, metaData_obj, 'vertical');

    // horizon
    let visData_horizon = GetObjData(visData_arr, metaData_obj, 'horizon');

    let selections_vertical = GetObjectSelections(visData_vertical);
    let selections_horizon = GetObjectSelections(visData_horizon);

    let is_horizon = true;
    if (direction == 'y' || direction == 'vertical') {
        is_horizon = false;
    }

    switch (templateName_str) {
        case supportedTemplate.Q2_Scatter_plot:
            // just reuse line chart            
            let point_template = GetTemplate(supportedTemplate.NQor2Q_Simple_Line_Chart, metaData_obj, visData_arr, direction);
            point_template.vegaConfig.mark = "point";
            point_template.name = templateName_str;
            point_template.img = './templates/scatterplot.png';
            return point_template;

        case supportedTemplate.NQor2Q_Simple_Line_Chart:
            let line_template;

            // simple line chart
            if (metaData_obj.x.range == 1 || metaData_obj.y.range == 1) {
                picture = './templates/line chart.png'
                vegaConfig = {
                    mark: "line",
                    data: { values: visData_arr },
                    encoding: {
                        x: { field: selections_cell.GetXSelection(0), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                        y: { field: selections_cell.GetQSelection(0), type: 'quantitative' },
                    }
                }
                line_template = new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
            }
            else {
                if (is_horizon) {
                    picture = './templates/line chart.png'
                    vegaConfig = {
                        mark: "line",
                        data: { values: visData_horizon },
                        encoding: {
                            x: { field: selections_horizon.GetQSelection(0), type: "quantitative" },
                            y: { field: selections_horizon.GetQSelection(1), type: 'quantitative' },
                        }
                    }
                    line_template = new ObjTemplate(templateName_str, vegaConfig, selections_horizon, picture, true);
                }
                else {
                    picture = './templates/line chart.png'
                    vegaConfig = {
                        mark: "line",
                        data: { values: visData_vertical },
                        encoding: {
                            x: { field: selections_vertical.GetQSelection(0), type: "quantitative" },
                            y: { field: selections_vertical.GetQSelection(1), type: 'quantitative' },
                        }
                    }
                    line_template = new ObjTemplate(templateName_str, vegaConfig, selections_vertical, picture, false);
                }
            }
            return line_template;

        case supportedTemplate.ANQorNQ_Bar_Chart:
            // simple bar chart
            if (metaData_obj.x.range == 1 || metaData_obj.y.range == 1) {
                if (is_horizon) {
                    picture = './templates/simple bar chart.png'
                    vegaConfig = {
                        mark: "bar",
                        data: { values: visData_arr },
                        encoding: {
                            x: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                            y: { field: selections_cell.GetQSelection(0), type: 'quantitative' },
                            color: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                        }
                    }
                } else {
                    picture = './templates/simple bar chart y.png'
                    vegaConfig = {
                        mark: "bar",
                        data: { values: visData_arr },
                        encoding: {
                            x: { field: selections_cell.GetQSelection(0), type: 'quantitative' },
                            y: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                            color: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                        }
                    }
                }
                return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
            }
            // aggregate
            else {
                if (is_horizon) {
                    vegaConfig = {
                        mark: "bar",
                        data: { values: visData_arr },
                        encoding: {
                            x: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                            y: { aggregate: "sum", field: selections_cell.GetQSelection(0) }
                        }
                    }
                    picture = './templates/bar chart.png'
                }
                else {
                    vegaConfig = {
                        mark: "bar",
                        data: { values: visData_arr },
                        encoding: {
                            y: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                            x: { aggregate: "sum", field: selections_cell.GetQSelection(0) }
                        }
                    }
                    picture = './templates/bar chart y.png'
                }
                return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
            }
        case supportedTemplate.NQ_Strip_Plot:
            if (is_horizon) {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "tick",
                    encoding: {
                        y: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                        x: { field: selections_cell.GetQSelection(0), type: "quantitative" }
                    }
                }
                picture = './templates/strip plot.png';
            }
            else {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "tick",
                    encoding: {
                        x: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                        y: { field: selections_cell.GetQSelection(0), type: "quantitative" }
                    }
                }
                picture = './templates/strip plot y.png';
            }
            return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);

        case supportedTemplate.NQ_Box_Plot:
            if (is_horizon) {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: {
                        "type": "boxplot",
                        "extent": "min-max"
                    },
                    encoding: {
                        x: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                        y: { field: selections_cell.GetQSelection(0), type: "quantitative" },
                        color: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                    }
                }
                picture = './templates/box plot.png';
            } else {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: {
                        "type": "boxplot",
                        "extent": "min-max"
                    },
                    encoding: {
                        y: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                        x: { field: selections_cell.GetQSelection(0), type: "quantitative" },
                        color: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                    }
                }
                picture = './templates/box plot y.png';
            }
            return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
        case supportedTemplate.ANQN_Stacked_Bar_Chart:
            if (is_horizon) {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "bar",
                    encoding: {
                        x: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                        y: { field: selections_cell.GetQSelection(0), aggregate: "sum" },
                        color: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                    }
                }
                picture = './templates/stacked bar chart.png';
            } else {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "bar",
                    encoding: {
                        x: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                        y: { field: selections_cell.GetQSelection(0), aggregate: "sum" },
                        color: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                    }
                }
                picture = './templates/stacked bar chart y.png';
            }
            return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
        case supportedTemplate.ANQN_Multi_Series_Line_Chart:
            if (is_horizon) {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "line",
                    encoding: {
                        x: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                        y: { field: selections_cell.GetQSelection(0), type: "quantitative" },
                        color: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                    }
                }
                picture = './templates/multi line chart.png';
                return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
            }
            break;
        case supportedTemplate.NQ_Ranged_Dot_Plot:
            // TODO: add point support
            if (is_horizon) {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "line",
                    encoding: {
                        x: { field: selections_cell.GetXSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetXSelection(-1)) },
                        y: { field: selections_cell.GetQSelection(0), type: "quantitative" },
                    }
                }
                vegaConfig.encoding.detail = vegaConfig.encoding.x;
                picture = './templates/ranged dot plot y.png';
            } else {
                vegaConfig = {
                    data: { values: visData_arr },
                    mark: "line",
                    encoding: {
                        y: { field: selections_cell.GetYSelection(-1), type: "nominal", sort: selections_cell.GetSort(selections_cell.GetYSelection(-1)) },
                        x: { field: selections_cell.GetQSelection(0), type: "quantitative" },
                    }
                }
                vegaConfig.encoding.detail = vegaConfig.encoding.y;
                picture = './templates/ranged dot plot.png';
            }
            return new VegaTemplate(templateName_str, vegaConfig, selections_cell, picture);
        case supportedTemplate.Q2_Horizon_Graph:
            if (is_horizon) {
                return new HorizonGraphTemplate(visData_horizon, selections_horizon, './templates/horizon graph.png');
            }
            break;
        case supportedTemplate.NQ_Parallel_Coordinate_Plot:
            if (is_horizon) {
                return new ParallelCoordinatePlot(visData_vertical, selections_vertical, './templates/parallel coordinate plot.png', is_horizon);
            }
            else {
                return new ParallelCoordinatePlot(visData_horizon, selections_horizon, './templates/parallel coordinate plot y.png', is_horizon);
            }


        case supportedTemplate.NQ_Histogram_Heatmap:
            if (is_horizon) {
                return new HistogramHeatmap(visData_horizon, selections_horizon, metaData_obj, './templates/heat map.png', is_horizon);
            }
            else {
                return new HistogramHeatmap(visData_vertical, selections_vertical, metaData_obj, './templates/heat map.png', is_horizon);
            }
        case supportedTemplate.NQ_Histogram_Scatterplot:
            if (is_horizon) {
                return new HistogramScatterplot(visData_horizon, selections_horizon, metaData_obj, './templates/histogram scatterplot.png', is_horizon);
            }
            else {
                return new HistogramScatterplot(visData_vertical, selections_vertical, metaData_obj, './templates/histogram scatterplot.png', is_horizon);
            }
        case supportedTemplate.NQ_PieChart:
            if (is_horizon) {
                vegaConfig =
                {
                    "data": {
                        "values": visData_horizon
                    },
                    "mark": "arc",
                    "encoding": {
                        "theta": { "field": selections_horizon.GetQSelection(0), "type": "quantitative" },
                        "color": { "field": selections_horizon.GetXSelection(-1), "type": "nominal" }
                    }
                }
                return new ObjTemplate(supportedTemplate.NQ_PieChart, vegaConfig, selections_horizon, './templates/pie chart.png', true);
            }
            else {
                vegaConfig =
                {
                    "data": {
                        "values": visData_vertical
                    },
                    "mark": "arc",
                    "encoding": {
                        "theta": { "field": selections_vertical.GetQSelection(0), "type": "quantitative" },
                        "color": { "field": selections_vertical.GetYSelection(-1), "type": "nominal" }
                    }
                }
                return new ObjTemplate(supportedTemplate.NQ_PieChart, vegaConfig, selections_vertical, './templates/pie chart.png', false);

            }
        case supportedTemplate.NQ_RadialPlot:
            if (is_horizon) {
                vegaConfig =
                {
                    "data": {
                        "values": visData_horizon
                    },
                    "mark": "arc",
                    "encoding": {
                        "theta": { "field": selections_horizon.GetQSelection(0), "type": "quantitative", "stack": true },
                        "radius": {
                            "field": selections_horizon.GetQSelection(0),
                            "scale": { "type": "linear", "zero": true, "rangeMin": 20 }
                        },
                        "color": { "field": selections_horizon.GetXSelection(-1), "type": "nominal" }
                    }
                }
                return new ObjTemplate(supportedTemplate.NQ_RadialPlot, vegaConfig, selections_horizon, './templates/radial plot.png', true);
            }
            else {
                vegaConfig =
                {
                    "data": {
                        "values": visData_vertical
                    },
                    "mark": "arc",
                    "encoding": {
                        "theta": { "field": selections_vertical.GetQSelection(0), "type": "quantitative", "stack": true },
                        "radius": {
                            "field": selections_vertical.GetQSelection(0),
                            "scale": { "type": "linear", "zero": true, "rangeMin": 20 }
                        },
                        "color": { "field": selections_vertical.GetYSelection(-1), "type": "nominal" }
                    }
                }
                return new ObjTemplate(supportedTemplate.NQ_RadialPlot, vegaConfig, selections_vertical, './templates/radial plot.png', false);
            }

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

            templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Box_Plot, metaData_obj, visData_arr, 'y'), 'vertical')
        }
        else {
            templates.AddTemplate(GetTemplate(supportedTemplate.ANQorNQ_Bar_Chart, metaData_obj, visData_arr, 'y'), 'vertical')

            templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Box_Plot, metaData_obj, visData_arr, 'x'), 'horizon')
        }
    }
    if (metaData_obj.x.range >= 2 && metaData_obj.y.range >= 2) {
        let aggregateChart = [
            supportedTemplate.ANQorNQ_Bar_Chart,
            supportedTemplate.ANQN_Stacked_Bar_Chart,
            supportedTemplate.NQ_Ranged_Dot_Plot,
            supportedTemplate.NQ_Box_Plot,
            supportedTemplate.NQ_Strip_Plot,
            supportedTemplate.NQ_Parallel_Coordinate_Plot,
            supportedTemplate.ANQN_Multi_Series_Line_Chart,
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

        let Q2Chart = [
            supportedTemplate.NQor2Q_Simple_Line_Chart,
            supportedTemplate.NQ_PieChart,
            supportedTemplate.NQ_RadialPlot,
            supportedTemplate.Q2_Horizon_Graph,
            supportedTemplate.Q2_Scatter_plot,
            supportedTemplate.NQ_Histogram_Heatmap,
            supportedTemplate.NQ_Histogram_Scatterplot,
        ]

        Q2Chart.forEach(element => {
            templates.AddTemplate(GetTemplate(element, metaData_obj, visData_arr, 'x'), 'Using row data');
            templates.AddTemplate(GetTemplate(element, metaData_obj, visData_arr, 'y'), 'Using column data');

        });
    }

    return templates.GetTemplates();
}

function GetObjectSelections(visDataObj_arr) {
    let selections = new FieldSelection();
    let sort = {};
    for (let i = 0; i < visDataObj_arr.length; i++) {
        const element = visDataObj_arr[i];
        for (const key in visDataObj_arr[i]) {
            if (key.substring(0, 3) == 'row' || key.substring(0, 3) == 'col') {
                if (!sort[key]) {
                    sort[key] = [];
                }
                sort[key].push(element[key]);
            }
            if (i == visDataObj_arr.length - 1) {
                if (key.substring(0, 3) == 'row') {
                    selections.AddXSelection(key, sort[key]);
                }
                else if (key.substring(0, 3) == 'col') {
                    selections.AddYSelection(key, sort[key]);
                }
                else {
                    selections.AddQSelection(key);
                }
            }
        }
    }
    return selections;
}


function GetSelectionsFromMetaData(metaData_obj) {
    let ans = new FieldSelection();

    metaData_obj.x.headers.forEach(element => {
        ans.AddXSelection(element.name, element.sort);
    });
    metaData_obj.y.headers.forEach(element => {
        ans.AddYSelection(element.name, element.sort);
    });
    ans.AddQSelection('value');
    return ans;
}

function GetObjData(visData_arr, metaData_obj, direction_str) {
    // atom col: column header sort == x range
    let atom_col_key, atom_row_key;
    metaData_obj.x.headers.forEach(element => {
        if (element.sort.length == metaData_obj.x.range) {
            atom_row_key = element.name;
        }
    });
    metaData_obj.y.headers.forEach(element => {
        if (element.sort.length == metaData_obj.y.range) {
            atom_col_key = element.name;
        }
    });

    if (atom_col_key == undefined || atom_row_key == undefined) {
        return null;
    }
    let visDataObj_arr = []

    let atom_key = atom_col_key;
    let another_atom_key = atom_row_key;
    if (direction_str == 'horizon' || direction_str == 'x') {
        atom_key = atom_row_key;
        another_atom_key = atom_col_key;
    }

    let bracket = {};
    let sequence = [];

    // atom_key as a key. if atom_key is the first key, update the sequence number. and then push the number
    for (let i = 0; i < visData_arr.length; i++) {
        const element = visData_arr[i];

        let row_data_key = element[atom_key];
        if (bracket[row_data_key] == undefined) {
            sequence.push(row_data_key);
            bracket[row_data_key] = {};
        }

        bracket[row_data_key][element[another_atom_key]] = Number(element['value']);

        for (const key in element) {
            if (key.substring(0, 3) == atom_key.substring(0, 3) && Object.hasOwnProperty.call(element, key)) {
                bracket[row_data_key][key] = element[key];
            }
        }
    }
    for (let i = 0; i < sequence.length; i++) {
        const rowName = sequence[i];
        visDataObj_arr.push(bracket[rowName]);
    }

    return visDataObj_arr;
}

export function FieldSelection() {
    this.XSelections = [];
    this.YSelections = [];
    this.QSelections = [];
    this.bindings = {};
    /*
        {
            selectionName:{
                sequence:num,
                type:"", 
                sort:[],
            },
            selectionName2:{},
            ...
        }
    */
}

FieldSelection.prototype.AddXSelection = function (selectionName_str, nominalSort_arr) {
    this.XSelections.push(selectionName_str);
    this.bindings[selectionName_str] = {};
    this.bindings[selectionName_str].type = "nominal";
    this.bindings[selectionName_str].sort = nominalSort_arr;
    this.XSelections.sort();
}

FieldSelection.prototype.AddYSelection = function (selectionName_str, nominalSort_arr) {
    this.YSelections.push(selectionName_str);
    this.bindings[selectionName_str] = {};
    this.bindings[selectionName_str].type = "nominal";
    this.bindings[selectionName_str].sort = nominalSort_arr;
    this.YSelections.sort();
}

FieldSelection.prototype.AddQSelection = function (selectionName_str) {
    this.QSelections.push(selectionName_str);
    this.bindings[selectionName_str] = {};
    this.bindings[selectionName_str].type = "quantitative";
    this.QSelections.sort();
}

FieldSelection.prototype.GetXSelections = function () {
    return this.XSelections;
}

FieldSelection.prototype.GetYSelections = function () {
    return this.YSelections;
}

FieldSelection.prototype.GetQSelections = function () {
    return this.QSelections;
}

FieldSelection.prototype.GetXSelection = function (at_num) {
    if (at_num > this.XSelections.length) {
        return this.XSelections.at(-1);
    }
    else if (at_num < -this.XSelections.length) {
        return this.XSelections.at(0);
    }
    return this.XSelections.at(at_num);
}

FieldSelection.prototype.GetSort = function (selectionName_str) {
    return this.bindings[selectionName_str].sort;
}

FieldSelection.prototype.GetType = function (selectionName_str) {
    return this.bindings[selectionName_str].type;
}


FieldSelection.prototype.GetYSelection = function (at_num) {
    if (at_num > this.YSelections.length) {
        return this.YSelections.at(-1);
    }
    else if (at_num < -this.YSelections.length) {
        return this.YSelections.at(0);
    }
    return this.YSelections.at(at_num);
}

FieldSelection.prototype.GetQSelection = function (at_num) {
    if (at_num >= this.QSelections.length) {
        return this.QSelections.at(-1);
    }
    else if (at_num <= -this.QSelections.length) {
        return this.QSelections.at(0);
    }
    return this.QSelections.at(at_num);
}

FieldSelection.prototype.CompileSelection = function (value_str, encoding_obj) {
    encoding_obj['type'] = this.GetType(value_str);
    encoding_obj['sort'] = this.GetSort(value_str);
    // type and sort support
}

FieldSelection.prototype.GetMappedValue = function (value_str, source_FieldSelection) {
    let find = source_FieldSelection.GetQSelections().indexOf(value_str);
    if (find != -1) {
        return this.GetQSelection(find);
    }
    find = source_FieldSelection.GetXSelections().indexOf(value_str);
    if (find != -1) {
        return this.GetXSelection(find);
    }
    find = source_FieldSelection.GetYSelections().indexOf(value_str);
    if (find != -1) {
        return this.GetYSelection(find);
    }
}


/* Templates */

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

// for cell data
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
    this.vegaConfig.config = { "axis": { "labels": false, "ticks": false, "title": null } };
    return this.vegaConfig;
}

// Real vega-lite data
VegaTemplate.prototype.GetVegaLite = function (height, width) {
    let vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));

    vegaLite.height = height;
    vegaLite.width = width;
    vegaLite.config = { "axis": { "labels": false, "ticks": false, "title": null }, "legend": { "disable": true } };

    if (vegaLite.encoding) {
        if (vegaLite.encoding.y && vegaLite.encoding.x) {
            vegaLite.encoding.y.title = null;
            vegaLite.encoding.x.title = null;
        }
    }

    // Add tool tips
    if (typeof vegaLite.mark == 'string') {
        let mark = { type: vegaLite.mark }
        vegaLite.mark = mark;
    }
    vegaLite.mark.tooltip = true;
    return vegaLite;
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

VegaTemplate.prototype.ReuseTemplate = function (newMetaData_obj, newVisData_obj) {
    let new_vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));
    new_vegaLite.data.values = newVisData_obj;
    let new_selections = GetSelectionsFromMetaData(newMetaData_obj);

    for (const channel in new_vegaLite.encoding) {
        if (Object.hasOwnProperty.call(new_vegaLite.encoding, channel)) {
            new_vegaLite.encoding[channel].field = new_selections.GetMappedValue(new_vegaLite.encoding[channel].field, this.GetSelections());
        }
    }
    return new VegaTemplate(this.name, new_vegaLite, new_selections, this.picture);
}

// override get vegalite function
function ObjTemplate(tempName_str, vegaConfig_obj, selections_obj, previewPic_str, is_horizon) {
    this.is_horizon = !!is_horizon;
    VegaTemplate.call(this, tempName_str, vegaConfig_obj, selections_obj, previewPic_str);
}
ObjTemplate.prototype = new VegaTemplate();
ObjTemplate.prototype.GetVegaLite = function (height, width) {
    let vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));
    vegaLite.config = { "axis": { "labels": false, "ticks": false, "titleOpacity": "0.5", "titlePadding": -10, "titleFontSize": 8 }, "legend": { "disable": true } };
    vegaLite.height = height;
    vegaLite.width = width;
    // Add tool tips
    if (typeof vegaLite.mark == 'string') {
        let mark = { type: vegaLite.mark }
        vegaLite.mark = mark;
    }
    vegaLite.mark.tooltip = true;

    return vegaLite;
}

ObjTemplate.prototype.ReuseTemplate = function (newMetaData_obj, newVisData_obj) {
    let new_vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));
    let new_data
    if (this.is_horizon) {
        new_data = GetObjData(newVisData_obj, newMetaData_obj, 'horizon');
    }
    else {
        new_data = GetObjData(newVisData_obj, newMetaData_obj, 'vertical');
    }
    let new_selections = GetObjectSelections(new_data);
    new_vegaLite.data.values = new_data;

    for (const channel in new_vegaLite.encoding) {
        if (Object.hasOwnProperty.call(new_vegaLite.encoding, channel)) {
            new_vegaLite.encoding[channel].field = new_selections.GetMappedValue(new_vegaLite.encoding[channel].field, this.GetSelections());
        }
    }
    return new ObjTemplate(this.name, new_vegaLite, new_selections, this.picture, this.is_horizon);
}

function GetHeaders(channel_obj) {
    let ans = []
    for (let index = 0; index < channel_obj.headers.length; index++) {
        const field = channel_obj.headers[index];
        ans.push(field.name)
    }
    return ans
}
// todo add reuse support
function HistogramScatterplot(visData_arr, selections_obj, metaData_obj, previewPic_str, is_horizon, vegaConfig_obj) {
    this.selections = selections_obj;
    let defaultVal1 = selections_obj.GetQSelections().at(0);
    let defaultVal2 = selections_obj.GetQSelections().at(1);
    let binsX_nu = metaData_obj.x.range;
    let binsY_nu = metaData_obj.y.range;
    if (!vegaConfig_obj) {
        this.vegaConfig = {
            "mark": "circle",
            data: {
                values: visData_arr
            },
            "transform": [
                {
                    "filter": {
                        "and": [
                            { "field": defaultVal1, "valid": true },
                            { "field": defaultVal2, "valid": true }
                        ]
                    }
                }
            ],
            "encoding": {
                "x": {
                    "field": defaultVal1,
                    "bin": { "maxbins": binsX_nu },
                    "type": "quantitative"
                },
                "y": {
                    "field": defaultVal2,
                    "bin": { "maxbins": binsY_nu },
                    "type": "quantitative"
                },
                "size": {
                    "aggregate": "count",
                    "type": "quantitative",
                    legend: false
                }
            },
        }
    }
    else {
        this.vegaConfig = vegaConfig_obj;
        this.vegaConfig.data.values = visData_arr;
    }
    ObjTemplate.call(this, supportedTemplate.NQ_Histogram_Scatterplot, this.vegaConfig, selections_obj, previewPic_str, is_horizon);
}
HistogramScatterplot.prototype = new VegaTemplate();
HistogramScatterplot.prototype.GetVegaConfig = function () {
    return {
        mark: 'circle',
        encoding: {
            x: this.vegaConfig.encoding.x,
            y: this.vegaConfig.encoding.y
        }
    }
}
HistogramScatterplot.prototype.GetVegaLite = function (height, width) {
    let vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));
    vegaLite.config = { "axis": { "labels": true, "ticks": true, "labelPadding": -20, "titleOpacity": "0.5", "titlePadding": -10, "titleFontSize": 8 }, "legend": { "disable": true } };
    vegaLite.height = height;
    vegaLite.width = width;
    if (typeof vegaLite.mark == 'string') {
        let mark = { type: vegaLite.mark }
        vegaLite.mark = mark;
    }
    vegaLite.mark.tooltip = true;


    return vegaLite;
}

// todo: debug
HistogramScatterplot.prototype.CompileTweakedConfig = function (vegaConfig_obj) {
    this.vegaConfig.encoding.x = vegaConfig_obj.encoding.x;
    this.vegaConfig.encoding.y = vegaConfig_obj.encoding.y;

    this.vegaConfig.transform[0].filter.and[0].field = vegaConfig_obj.encoding.x.field;
    this.vegaConfig.transform[0].filter.and[1].field = vegaConfig_obj.encoding.y.field;

    return this.vegaConfig;
}

HistogramScatterplot.prototype.ReuseTemplate = function (newMetaData_obj, newVisData_obj) {
    let new_vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));
    let new_visData;
    if (this.is_horizon) {
        new_visData = GetObjData(newVisData_obj, newMetaData_obj, 'horizon');
    } else {
        new_visData = GetObjData(newVisData_obj, newMetaData_obj, 'vertical');
    }
    let new_selections = GetObjectSelections(new_visData);
    for (const channel in new_vegaLite.encoding) {
        if (Object.hasOwnProperty.call(new_vegaLite.encoding, channel)) {
            new_vegaLite.encoding[channel].field = new_selections.GetMappedValue(new_vegaLite.encoding[channel].field, this.GetSelections());
        }
    }
    new_vegaLite.transform[0].filter.and[0].field = new_vegaLite.encoding.x.field;
    new_vegaLite.transform[0].filter.and[1].field = new_vegaLite.encoding.y.field;

    return new HistogramHeatmap(new_visData, new_selections, newMetaData_obj, this.img, this.is_horizon, new_vegaLite);
}

HistogramHeatmap.prototype = new VegaTemplate();
HistogramHeatmap.prototype.CompileTweakedConfig = function (vegaConfig_obj) {
    this.vegaConfig.encoding.x = vegaConfig_obj.encoding.x;
    this.vegaConfig.encoding.y = vegaConfig_obj.encoding.y;

    this.vegaConfig.transform[0].filter.and[0].field = vegaConfig_obj.encoding.x.field;
    this.vegaConfig.transform[0].filter.and[1].field = vegaConfig_obj.encoding.y.field;
    return this.vegaConfig;
}

HistogramHeatmap.prototype.GetVegaConfig = function () {
    return {
        mark: 'rect',
        encoding: {
            x: this.vegaConfig.encoding.x,
            y: this.vegaConfig.encoding.y
        }
    }
}
HistogramHeatmap.prototype.ReuseTemplate = function (newMetaData_obj, newVisData_obj) {
    let new_vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));
    let new_visData;
    if (this.is_horizon) {
        new_visData = GetObjData(newVisData_obj, newMetaData_obj, 'horizon');
    } else {
        new_visData = GetObjData(newVisData_obj, newMetaData_obj, 'vertical');
    }
    let new_selections = GetObjectSelections(new_visData);
    for (const channel in new_vegaLite.encoding) {
        if (Object.hasOwnProperty.call(new_vegaLite.encoding, channel)) {
            new_vegaLite.encoding[channel].field = new_selections.GetMappedValue(new_vegaLite.encoding[channel].field, this.GetSelections());
        }
    }
    new_vegaLite.transform[0].filter.and[0].field = new_vegaLite.encoding.x.field;
    new_vegaLite.transform[0].filter.and[1].field = new_vegaLite.encoding.y.field;
    return new HistogramHeatmap(new_visData, new_selections, newMetaData_obj, this.img, this.is_horizon, new_vegaLite);
}

HistogramHeatmap.prototype.GetVegaLite = function (height, width) {
    let vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));
    vegaLite.config = { "axis": { "labels": true, "ticks": true, "labelPadding": -20, "titleOpacity": "0.5", "titlePadding": -10, "titleFontSize": 8 }, "legend": { "disable": true } };
    vegaLite.height = height;
    vegaLite.width = width;
    if (typeof vegaLite.mark == 'string') {
        let mark = { type: vegaLite.mark }
        vegaLite.mark = mark;
    }
    vegaLite.mark.tooltip = true;


    return vegaLite;
}

function HistogramHeatmap(visData_arr, selections_obj, metaData_obj, previewPic_str, is_horizon, vegaConfig_obj) {
    let defaultVal1 = selections_obj.GetQSelections().at(0);
    let defaultVal2 = selections_obj.GetQSelections().at(1);
    let binsX_nu = metaData_obj.x.range;
    let binsY_nu = metaData_obj.y.range;
    this.selections = selections_obj;
    if (!vegaConfig_obj) {

        this.vegaConfig = {
            "mark": "rect",
            data: {
                values: visData_arr
            },
            "transform": [
                {
                    "filter": {
                        "and": [
                            { "field": defaultVal1, "valid": true },
                            { "field": defaultVal2, "valid": true }
                        ]
                    }
                }
            ],
            "encoding": {
                "x": {
                    "field": defaultVal1,
                    "bin": { "maxbins": binsX_nu },
                    "type": "quantitative"
                },
                "y": {
                    "field": defaultVal2,
                    "bin": { "maxbins": binsY_nu },
                    "type": "quantitative"
                },
                "color": {
                    "aggregate": "count",
                    "type": "quantitative",
                    legend: false
                }
            },
            "config": {
                "view": {
                    "stroke": "transparent"
                }
            }
        }
    } else {
        this.vegaConfig = vegaConfig_obj;
        this.vegaConfig.data.values = visData_arr;
    }
    ObjTemplate.call(this, supportedTemplate.NQ_Histogram_Heatmap, this.vegaConfig, selections_obj, previewPic_str, is_horizon);
}
// no selection
// TODO vega config to parallel plot
function ParallelCoordinatePlot(visData_arr, selections_obj, previewPic_str, is_horizon, vegaConfig_obj) {
    this.selections_cell = selections_obj;
    this.visData_arr = visData_arr;
    this.is_horizon = is_horizon;
    // this.col_row_selection = selections_obj.GetXSelections();
    // this.obj_selection = selections_objj.GetQSelection();
    if (!vegaConfig_obj) {
        if (is_horizon) {
            this.vegaConfig = {
                mark: { type: "line", opacity: 0.3 },
                encoding: {

                    color: { type: "nominal", field: selections_obj.GetYSelection(-1), legend: null, sort: selections_obj.GetSort(selections_obj.GetYSelection(-1)) }
                }
            }
        }
        else {
            this.vegaConfig = {
                mark: { type: "line", opacity: 0.3 },
                encoding: {

                    color: { type: "nominal", field: selections_obj.GetXSelection(-1), legend: null, sort: selections_obj.GetSort(selections_obj.GetXSelection(-1)) }
                }
            }
        }
    }
    else {
        this.vegaConfig = vegaConfig_obj;
    }
    VegaTemplate.call(this, supportedTemplate.NQ_Parallel_Coordinate_Plot, this.vegaConfig, selections_obj, previewPic_str);
}
ParallelCoordinatePlot.prototype = new VegaTemplate();
ParallelCoordinatePlot.prototype.GetVegaLite = function (height, width) {
    let mark = this.vegaConfig.mark;
    if (typeof mark == "string") {
        mark = { type: mark }
    }
    mark.tooltip = true;

    if (this.is_horizon)
        return {
            height: height,
            width: width,
            "data": { "values": this.visData_arr },
            "transform": [
                { "window": [{ "op": "count", "as": "index" }] },
                {
                    "fold": this.GetSelections().GetQSelections()
                },
                {
                    "joinaggregate": [
                        { "op": "min", "field": this.GetSelections().GetQSelection(0), "as": "min" }, // aggregate field
                        { "op": "max", "field": this.GetSelections().GetQSelection(0), "as": "max" }
                    ],
                    "groupby": ["key"]
                },
                {
                    "calculate": "(datum.value - datum.min) / (datum.max-datum.min)",
                    "as": "norm_val"
                },
            ],
            "layer": [
                {
                    mark: mark,
                    "encoding": {
                        color: this.vegaConfig.encoding.color,
                        "detail": { "type": "nominal", "field": "index" },
                        "x": {
                            "type": "nominal",
                            "field": "key", //y
                            "sort": this.GetSelections().GetQSelections()
                        },
                        "y": { "type": "quantitative", "field": "norm_val", "axis": null }
                    }
                },
                {
                    "mark": { "type": "rule", "color": "#ccc" },
                    "encoding": {
                        "detail": { "aggregate": "count" },
                        "x": {
                            "field": "key",
                            "sort": this.GetSelections().GetQSelections()
                        }
                    }
                }
            ],
            "config": { "axis": { "labels": false, "ticks": false, "title": null } }

        }

    else
        return {
            height: height,
            width: width,
            "data": { "values": this.visData_arr },
            "transform": [
                { "window": [{ "op": "count", "as": "index" }] },
                {
                    "fold": this.GetSelections().GetQSelections()
                },
                {
                    "joinaggregate": [
                        { "op": "min", "field": this.GetSelections().GetQSelection(0), "as": "min" }, // aggregate field
                        { "op": "max", "field": this.GetSelections().GetQSelection(0), "as": "max" }
                    ],
                    "groupby": ["key"]
                },
                {
                    "calculate": "(datum.value - datum.min) / (datum.max-datum.min)",
                    "as": "norm_val"
                },
            ],
            "layer": [
                {
                    mark: mark,
                    "encoding": {
                        color: this.vegaConfig.encoding.color,
                        "detail": { "type": "nominal", "field": "index" },
                        "y": {
                            "type": "nominal",
                            "field": "key", //y
                            "sort": this.GetSelections().GetQSelections()
                        },
                        "x": { "type": "quantitative", "field": "norm_val", "axis": null }
                    }
                },
                {
                    "mark": { "type": "rule", "color": "#ccc" },
                    "encoding": {
                        "detail": { "aggregate": "count" },
                        "y": {
                            "field": "key",
                            "sort": this.GetSelections().GetQSelections()
                        }
                    }
                }
            ],
            "config": { "axis": { "labels": false, "ticks": false, "title": null } }
        }

}
ParallelCoordinatePlot.prototype.CompileTweakedConfig = function (vegaConfig_obj) {
    this.vegaConfig = vegaConfig_obj;
    return this.GetVegaLite(300, 300);
}
ParallelCoordinatePlot.prototype.ReuseTemplate = function (newMetaData_obj, newVisData_obj) {
    let new_vega = JSON.parse(JSON.stringify(this.vegaConfig));
    let new_data;

    // For this template, the data is in the opposit direction
    if (this.is_horizon) {
        new_data = GetObjData(newVisData_obj, newMetaData_obj, 'vertical');
    }
    else {
        new_data = GetObjData(newVisData_obj, newMetaData_obj, 'horizon');
    }
    let new_selections = GetObjectSelections(new_data);
    for (const channel in new_vega.encoding) {
        if (Object.hasOwnProperty.call(new_vega.encoding, channel)) {
            new_vega.encoding[channel].field = new_selections.GetMappedValue(new_vega.encoding[channel].field, this.GetSelections());
        }
    }
    return new ParallelCoordinatePlot(new_data, new_selections, this.picture, this.is_horizon, new_vega);
}

function HorizonGraphTemplate(visData_arr, selections_obj, previewPic_str, vegaConfig_obj) {
    this.name = supportedTemplate.Q2_Horizon_Graph;
    let ySelect_str = selections_obj.GetQSelection(0);
    let xSelect_str = selections_obj.GetXSelection(-1);
    this.visData_arr = visData_arr;
    this.img = previewPic_str;
    this.selections = selections_obj;

    this.visData_arr.push(visData_arr.at(-1));
    this.visData_arr.push(visData_arr.at(-1));
    if (!!vegaConfig_obj) {
        this.vegaConfig = vegaConfig_obj;
    }
    else {
        this.vegaConfig = {
            data: { values: visData_arr },
            mark: { type: "area", orient: "vertical", clip: true, interpolate: "monotone", opacity: 0.3, tooltip: true },
            encoding: {
                y: { field: ySelect_str, type: "quantitative" },
                x: { field: xSelect_str, type: "nominal", sort: this.selections.GetSort(xSelect_str) },
            }
        }
    }
}
HorizonGraphTemplate.prototype.GetMax = function (ySelect_str) {
    let max = -Infinity;
    for (let i = 0; i < this.visData_arr.length; i++) {
        const element = this.visData_arr[i];
        if (Number(element[ySelect_str]) > max) {
            max = Number(element[ySelect_str]);
        }
    }
    return max;
}
// User visible config
HorizonGraphTemplate.prototype.GetVegaConfig = function () {
    return this.vegaConfig;
}

// Real vega-lite data
HorizonGraphTemplate.prototype.GetVegaLite = function (height, width) {
    // layer max limit: 4 layers
    // best: 2 layer
    // domain is the height 
    let layer = [];
    let domainHeight = Number(height) / 2;
    let ySelect = this.vegaConfig.encoding.y.field;
    let max = this.GetMax(ySelect);
    while (max / domainHeight >= 4) {
        domainHeight *= 2;
    }

    for (let i = max / domainHeight; i >= 1; i--) {
        let layerContent = JSON.parse(JSON.stringify({ mark: this.vegaConfig.mark, encoding: this.vegaConfig.encoding }));
        let offset = i * domainHeight;
        layerContent.transform = [{ calculate: "datum['" + ySelect + "'] -" + offset, as: ySelect }];
        if (!layerContent.encoding.y.scale) {
            layerContent.encoding.y.scale = {};
        }
        layerContent.encoding.y.scale.domain = [0, domainHeight]
        layer.push(layerContent);
    }
    layer.push(JSON.parse(JSON.stringify({ mark: this.vegaConfig.mark, encoding: this.vegaConfig.encoding })));
    return {
        data: { values: this.visData_arr },
        layer: layer,
        height: height,
        width: width,
        config: { axis: { labels: false, ticks: false, title: null } }
    };
}

// Input tweaked config from panel, and then process it turing it into true vega-lite json.
// Actually, after rewritting this function, it is a compiler.
HorizonGraphTemplate.prototype.CompileTweakedConfig = function (vegaConfig_obj) {
    this.vegaConfig = vegaConfig_obj;
    this.vegaConfig.mark.tooltip = true;
    this.vegaConfig.mark.clip = true;
    return this.GetVegaLite(200, 300);
}
HorizonGraphTemplate.prototype.ReuseTemplate = function (newMetaData_obj, newVisData_obj) {
    let new_vegaLite = JSON.parse(JSON.stringify(this.vegaConfig));
    let new_data = GetObjData(newVisData_obj, newMetaData_obj, 'horizon');
    let new_selections = GetObjectSelections(new_data);
    new_vegaLite.data.values = new_data;
    for (const channel in new_vegaLite.encoding) {
        if (Object.hasOwnProperty.call(new_vegaLite.encoding, channel)) {
            new_vegaLite.encoding[channel].field = new_selections.GetMappedValue(new_vegaLite.encoding[channel].field, this.GetSelections());
        }
    }
    return new HorizonGraphTemplate(new_data, new_selections, this.img, new_vegaLite);
}
HorizonGraphTemplate.prototype.GetSelections = function () {
    return this.selections;
}