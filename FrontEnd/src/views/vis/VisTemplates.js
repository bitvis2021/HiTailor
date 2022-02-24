import { EncodingCompiler } from './SchemaCompiler'
// Reconsitution temp2vega
// Target: decouple vis 

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
    let encoding = {};
    if (direction == undefined || direction == 'x' || direction == 'horizontal') {
        encoding.x = { field: "value", type: "quantitative" };
        encoding.y = { field: defaultNominal_str, type: "nominal", sort: sort_arr };
    }
    else {
        encoding.y = { field: "value", type: "quantitative" };
        encoding.x = { field: defaultNominal_str, type: "nominal", sort: sort_arr };
    }

    switch (templateName_str) {
        case NQ_Simple_Bar_Chart:

            break;

        default:
            break;
    }
}

export function GetTemplates(metaData_obj, visData_arr) {
    // two forms of visData
    let templates = new Templates;
    let defaultX = metaData_obj.x.headers[metaData_obj.x.headers.length - 1];

    let selections_cell = EncodingCompiler.GetSelections(metaData_obj);
    // - [A-N-Q bar chart](https://www.notion.so/A-N-Q-bar-chart-1746d78908fd46988ae9266d91f7e114)
    let vegaConfig = {
        mark: "bar",
        data: { values: visData_arr },
        encoding: {
            x: { field: defaultX.name, type: "nominal", sort: defaultX.sort },
            y: { aggregate: "sum", field: "value" }
        }
    }

    templates.AddTemplate(new VegaTemplate(supportedTemplate.ANQ_Bar_Chart, vegaConfig, selections_cell, './templates/bar chart.png'));

    return templates.GetTemplates();
}

export function VegaTemplate(tempName_str, vegaConfig_obj, selections_obj, previewPic_str) {
    this.name = tempName_str;
    this.vegaConfig = vegaConfig_obj;
    this.img = previewPic_str;
    this.selections = selections_obj;
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
VegaTemplate.prototype.GetVegaConfig = function () {
    this.vegaConfig.encoding = EncodingCompiler.PreprocessEncoding(this.vegaConfig.encoding);
    return this.vegaConfig;
}
VegaTemplate.prototype.GetSelections = function () {
    return this.selections;
}
