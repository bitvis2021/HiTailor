// Reconsitution temp2vega
// Target: decouple vis 

export let supportedTemplate = {
    NQ_Simple_Bar_Chart: "N-Q Simple Bar Chart",
    NQ_Simple_Line_Chart: "N-Q Simple Line Chart",
    NQ_Strip_Plot: "N-Q Strip Plot",
    NQ_Box_Plot: "N-Q Box Plot",
    NQ_Ranged_Dot_Plot: "NQ Ranged Dot Plot",
    ANQ_Line_Chart: "ANQ Line Chart",
    ANQ_Bar_Chart: "ANQ_Bar_Chart",
    ANQN_Stacked_Bar_Chart: "ANQN Stacked Bar Chart",
    ANQN_Multi_Series_Line_Chart: "ANQN Multi Series Line Chart",
    NNQ_grouped_bar_chart: "NNQ grouped bar chart",
}

export function GetTemplate(templateName_str, defaultNominal_str, sort_arr, direction) {
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


export function VegaTemplate(tempName_str, vegaConfig_obj, previewPic_str) {
    this.name = tempName_str;
    this.vegaConfig = vegaConfig_obj;
    this.img = previewPic_str;
}

