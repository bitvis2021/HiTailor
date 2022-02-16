
function EncodingCompiler(VegaEncoding_obj, ECSelections_obj) {
    // this.positionChannel={
    //     field
    // }
    this.vegaEncoding = VegaEncoding_obj;
    this.ECSelections = ECSelections_obj;
    this.sortBindings = Object.assign(this.ECSelections.xSelect.bindings, this.ECSelections.ySelect.bindings)
    let property = {
        xField: {
            name: 'field',
            type: 'select',
            selections: this.ECSelections.xSelect.selections.concat(['value']),
            value: ''
        },
        yField: {
            name: 'field',
            type: 'select',
            value: '',
            selections: this.ECSelections.ySelect.selections.concat(['value'])
        },
        allField: {
            name: 'field',
            type: 'group select',
            value: '',
            selections: { x: this.ECSelections.xSelect.selections, y: this.ECSelections.ySelect.selections, value: ['value'] },
        },
        aggregate: {
            name: 'aggregate',
            type: 'select',
            value: '',
            selections: ['count', 'sum', 'mean', 'stdev', 'median', 'min', 'max'],
        }
    }
    this.encodings = {
        // select / group select
        x: {
            field: property.xField,
            aggregate: property.aggregate,
        },
        xOffset: {
            field: property.xField,
            aggregate: property.aggregate
        },
        y: {
            field: property.yField,
            aggregate: property.aggregate
        },
        yOffset: {
            field: property.yField,
            aggregate: property.aggregate
        },
        color: {
            field: property.allField,
        },
        detail: {
            field: property.allField,
        },
    }

    this.addProperties = {};
    for (const key in this.encodings) {
        if (Object.hasOwnProperty.call(this.encodings, key)) {
            const element = this.encodings[key];
            this.addProperties[key] = [];
            for (const property in element) {
                this.addProperties[key].push(property);
            }
        }
    }

}

EncodingCompiler.prototype.GetSchema = function () {
    let ans = {}
    for (const key in this.vegaEncoding) {
        if (Object.hasOwnProperty.call(this.vegaEncoding, key)) {
            const encoding = this.vegaEncoding[key];
            let supportProperty = this.encodings[key];
            ans[key] = []
            for (const propertyName in encoding) {
                if (Object.hasOwnProperty.call(encoding, propertyName)) {
                    const propertyValue = encoding[propertyName];
                    if (supportProperty.hasOwnProperty(propertyName)) {
                        supportProperty[propertyName].value = propertyValue;
                        ans[key].push(supportProperty[propertyName])
                    }
                }
            }
            ans[key] = ans[key].reverse();
        }
    }
    return ans;
}

EncodingCompiler.prototype.GetVegaConfig = function (schema_obj) {
    console.log(this.vegaEncoding);
    for (const encodingName in schema_obj) {
        if (Object.hasOwnProperty.call(schema_obj, encodingName)) {
            // vega没的就加，vega有的就改
            if (this.vegaEncoding.hasOwnProperty(encodingName)) {
                for (let index = 0; index < schema_obj[encodingName].length; index++) {
                    const property = schema_obj[encodingName][index];
                    if (this.vegaEncoding[encodingName].hasOwnProperty(property.name)) {
                        this.vegaEncoding[encodingName][property.name] = property.value;

                        // special situation
                        if (property.name == 'field') {
                            if (property.value == 'value') {
                                this.vegaEncoding[encodingName].type = "quantitative";
                                this.vegaEncoding[encodingName].sort = undefined;
                            }
                            else {
                                this.vegaEncoding[encodingName].type = "nominal";
                                this.vegaEncoding[encodingName].sort = this.sortBindings[property.value];
                            }
                        }
                    }
                }
            }
            else {
                this.vegaEncoding[encodingName] = {};
            }
        }
    }
    return this.vegaEncoding;
}


EncodingCompiler.prototype.GetNewEncoding = function (encodingName) {
    if (this.encodings.hasOwnProperty(encodingName)) {
        let ans = [];
        ans.push(this.encodings[encodingName]['field'])
        return ans;
    }
    return undefined
}

EncodingCompiler.prototype.GetNewProperty = function (encodingName, propertyName) {
    if (this.encodings.hasOwnProperty(encodingName)) {
        return this.encodings[encodingName][propertyName];
    }
    return undefined
}

EncodingCompiler.prototype.GetProperties = function (schema_obj, encoding_str) {
    let ans = this.addProperties[encoding_str];
    for (let index = 0; index < schema_obj[encoding_str].length; index++) {
        const element = schema_obj[encoding_str][index];
        let find = ans.indexOf(element.name)
        if (find != -1) {
            ans.splice(find, 1);
        }
    }
    return ans;
}


EncodingCompiler.prototype.GetEncodings = function (schema_obj) {
    let ans = [];
    for (const key in this.encodings) {
        ans.push(key);
    }
    for (const key in schema_obj) {
        let find = ans.indexOf(key);
        if (find != -1) {
            ans.splice(find, 1);
        }
    }
    return ans;
}


EncodingCompiler.GetSelections = function (metaData_obj) {
    /*
        {
            xSelections:{
                selections:[],
                bindings:{key:[sort]}
            }
        }
    */

    let ans = {
        xSelect: {
            selections: [],
            bindings: {}
        },
        ySelect: {
            selections: [],
            bindings: {}
        }
    }

    metaData_obj.x.headers.forEach(element => {
        ans.xSelect.selections.push(element.name);
        ans.xSelect.bindings[element.name] = element.sort;
    });
    metaData_obj.y.headers.forEach(element => {
        ans.ySelect.selections.push(element.name);
        ans.ySelect.bindings[element.name] = element.sort;
    });
    return ans;
}

export { EncodingCompiler };

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
