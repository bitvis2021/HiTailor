let positionChannel = ['field', 'aggregate']
function SchemaCompiler() {

    this.supportedProperties = {
        x: positionChannel,
        y: positionChannel
    }
}

// input: vega,selections; output: form array
SchemaCompiler.prototype.GetEncodingSchema = function (vegaEncoding_obj, selections_obj) {
    let schema = [];

    let getSelection = (selection, encodingName, propertyName) => {
        if (selection[encodingName] == undefined) {
            return undefined
        }
        else {
           return selection[encodingName][propertyName]
        }
    }

    for (const encodingName in vegaEncoding_obj) {
        let schemaEncoding = {};
        schemaEncoding.name = encodingName;
        schemaEncoding.properties = [];
        if (Object.hasOwnProperty.call(vegaEncoding_obj, encodingName)) {
            const vegaEncoding = vegaEncoding_obj[encodingName];
            for (const propertyName in vegaEncoding) {
                let supportedProperty = this.GetProperty(propertyName, getSelection(selections_obj, encodingName, propertyName))
                if (supportedProperty != undefined) {
                    schemaEncoding.properties.push(supportedProperty)
                }
            }
        }
        schema.push(schemaEncoding);
    }
    return schema
}

// input: property name
SchemaCompiler.prototype.GetProperty = function (name_str, addtionInfo_obj) {
    let propertySchema = {};
    propertySchema.name = name_str
    // type: select+addtionInfo, radio+addtionInfo, slider, color
    switch (name_str) {
        case 'field':
            propertySchema.type = 'select';
            propertySchema.selections = addtionInfo_obj
            break;
        case 'aggregate':
            propertySchema.type = 'select';
            propertySchema.selections = ['count', 'sum', 'mean', 'stdev', 'median', 'min', 'max'];
            break;
        default:
            propertySchema = undefined;
            break;
    }
    return propertySchema;
}

export { SchemaCompiler };

// mark
export let markType = ['area', 'arc', 'bar', 'boxplot', 'line', 'point', 'rule'];

export let confTemplate = {
    color: function (df_color) {
        return {
            title: "color",
            type: "string",
            format: "color",
            default: df_color,
        }
    },
    opacity: function (df_opacity) {
        return {
            title: "opacity",
            type: "number",
            "ui:widget": "ElSlider",
            default: df_opacity,
            multipleOf: 0.01,
            minimum: 0,
            maximum: 1,
        }
    },
    width: function (title_str, min_nb, max_nb, df_width) {
        return {
            title: title_str,
            type: "number",
            "ui:widget": "ElSlider",
            default: df_width,
            // multipleOf: 1,
            minimum: min_nb,
            maximum: max_nb,
        }
    },
    select: function (title_str, selections_arr, df_selection) {
        return {
            "title": title_str,
            "type": "string",
            "ui:widget": "SelectWidget",
            "enum": selections_arr,
            "enumNames": selections_arr,
            default: df_selection
        }
    },
    select_radius: function (title_str, selections_arr, df_selection) {
        return {
            "title": title_str,
            "type": "string",
            "ui:widget": "RadioWidget",
            "enum": selections_arr,
            "enumNames": selections_arr,
            default: df_selection
        }
    }
}

export let markConf = {
    arc: function (df_innerRadius, df_outerRadius) {
        this.properties = {};
        this.properties.innerRadius = new confTemplate.width('inner radius', 1, 100, df_innerRadius);
        this.properties.outerRadius = new confTemplate.width('outer radius', 1, 100, df_outerRadius);
    },
    area: function (df_color, df_opacity) {
        this.properties = {};
        this.properties.opacity = new confTemplate.opacity(df_opacity);
        this.properties.color = new confTemplate.color(df_color);
    },
    bar: function (df_align, df_width) {
        this.properties = {};
        this.properties.width = new confTemplate.width('width', 1, 100, df_width);
        this.properties.align = new confTemplate.select_radius("align", ["left", "center", "right"], df_align);
    },
    boxplot: function (df_size, df_opacity, df_color, df_orient, df_extent) {
        this.properties = {};
        this.properties.size = new confTemplate.width('width', 1, 100, df_size);
        this.properties.opacity = new confTemplate.opacity(df_opacity);
        this.properties.color = new confTemplate.color(df_color);
        this.properties.orient = new confTemplate.select_radius("orient", ["horizontal", "vertical"], df_orient);
    },
    line: function (df_strokeWidth, df_color, df_interpolate) {
        this.properties = {};
        this.properties.interpolate = new confTemplate.select("interpolate", ["basis", "cardinal", "catmull-rom", "linear", "monotone", "natural", "step", "step-after", "step-before"], df_interpolate);
        this.properties.strokeWidth = new confTemplate.width('stroke width', 1, 100, df_strokeWidth);
        this.properties.stroke = new confTemplate.color(df_color);
    },
    point: function (df_size, df_shape) {
        this.properties = {};
        this.properties.size = new confTemplate.width('point size', 1, 100, df_size);
        this.properties.shape = new confTemplate.select("shape", ["circle", "square", "cross", "diamond", "triangle-up", "triangle-down", "triangle-right", "triangle-left", "stroke", "arrow", "arrow", "triangle"], df_shape);
    },
    line: function (df_strokeWidth, df_color) {
        this.properties = {};
        this.properties.strokeWidth = new confTemplate.width('stroke width', 1, 100, df_strokeWidth);
        // this.properties.strokeDash = new confTemplate.select("strokeDash",["basis", "cardinal","catmull-rom","linear","monotone","natural","step","step-after","step-before"],df_interpolate);
        this.properties.color = new confTemplate.color(df_color);
    },
}
