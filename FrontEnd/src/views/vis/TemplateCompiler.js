import { EncodingCompiler } from './SchemaCompiler'
// Reconsitution temp2vega
// Target: decouple vis 
// select area (metadata/visData) -> templates -> template (vegaConfig) -> panel (tweaked config) -> vis
// recommand (templatename_str,metadata/visData) -> template (vegaConfig) -> panel

// vegaConfig -> tweakableConfig / invisibileConfig
// tweakableConfig -> templateCompiler (+invisibleConfig) -> vega-lite JSON

export let supportedTemplate = {
    NQ_Simple_Bar_Chart: "N-Q Simple Bar Chart",
    NQ_Simple_Line_Chart: "N-Q Simple Line Chart",
    NQ_Strip_Plot: "N-Q Strip Plot",
    NQ_Box_Plot: "N-Q Box Plot",
    NQ_Ranged_Dot_Plot: "NQ Ranged Dot Plot",
    ANQ_Line_Chart: "A-N-Q Line Chart",
    ANQ_Bar_Chart: "A-N-Q Bar Chart",
    ANQN_Stacked_Bar_Chart: "A-N-Q-N Stacked Bar Chart",
    ANQN_Multi_Series_Line_Chart: "A-N-Q-N Multi Series Line Chart",
    NNQ_grouped_bar_chart: "N-N-Q grouped bar chart",
}

export function GetTemplate(templateName_str, metaData_obj, visData_arr, direction) {
    let vegaConfig;
    let selections;
    let picture;

    let defaultVal = {};
    let selections_cell = selections_cell = EncodingCompiler.GetSelections(metaData_obj);

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

            break;
        // - [A-N-Q bar chart](https://www.notion.so/A-N-Q-bar-chart-1746d78908fd46988ae9266d91f7e114)
        case supportedTemplate.ANQ_Bar_Chart:
            selections = selections_cell;
            picture = './templates/bar chart.png'
            vegaConfig = {
                mark: "bar",
                data: { values: visData_arr },
                encoding: {
                    x: { field: defaultVal.name, type: "nominal", sort: defaultVal.sort },
                    y: { aggregate: "sum", field: "value" }
                }
            }
            if (!is_X) {
                [vegaConfig.encoding.x, vegaConfig.encoding.y] = [vegaConfig.encoding.y, vegaConfig.encoding.x];
                picture = './templates/bar chart y.png'
            }
            break;

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
        if (metaData_obj.x.range == 1) {
            templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Simple_Bar_Chart, metaData_obj, visData_arr, 'x'))
            templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Simple_Line_Chart, metaData_obj, visData_arr, 'x'))
        }
        else {
            templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Simple_Bar_Chart, metaData_obj, visData_arr, 'y'), 'vertical')
            templates.AddTemplate(GetTemplate(supportedTemplate.NQ_Simple_Line_Chart, metaData_obj, visData_arr, 'y'), 'vertical')
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