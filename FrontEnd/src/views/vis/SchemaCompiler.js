// 总感觉可以面向对象重构一波
function EncodingCompiler(VegaEncoding_obj, FieldSelections_obj) {
    // this.positionChannel={
    //     field
    // }
    this.vegaEncoding = VegaEncoding_obj;
    this.FieldSelections = FieldSelections_obj;
    function propertyConfig(selection_str) {
        if (selection_str == 'xField') return {
            name: 'field',
            type: 'group select',
            selections: { x: this.FieldSelections.GetXSelections(), quantitative: this.FieldSelections.GetQSelections() },
            value: ''
        }
        else if (selection_str == 'yField') return {
            name: 'field',
            type: 'group select',
            selections: { y: this.FieldSelections.GetYSelections(), quantitative: this.FieldSelections.GetQSelections() },
            value: ''
        }
        else if (selection_str == 'allField') return {
            name: 'field',
            type: 'group select',
            value: '',
            selections: { x: this.FieldSelections.GetXSelections(), y: this.FieldSelections.GetYSelections(), quantitative: this.FieldSelections.GetQSelections() },
        }
        else if (selection_str == 'aggregate') return {
            name: 'aggregate',
            type: 'select',
            value: '',
            selections: ['sum', 'mean', 'stdev', 'median', 'min', 'max', 'count'],
        }
        else if (selection_str == 'scale type') return {
            name: 'scale type',
            type: 'select',
            value: '',
            selections: ['linear', 'pow', 'sqrt', 'symlog', 'log'],
        }
    }
    // make it can use this.FieldSelections
    propertyConfig = propertyConfig.bind(this);

    this.supportedEncodings = {
        // select / group select
        x: {
            field: 'xField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        xOffset: {
            field: 'xField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        y: {
            field: 'yField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        yOffset: {
            field: 'yField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        color: {
            field: 'allField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        detail: {
            field: 'allField',
        },
        size: {
            field: 'allField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        opacity: {
            field: 'allField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        shape: {
            field: 'allField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        theta: {
            field: 'allField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        },
        radius: {
            field: 'allField',
            aggregate: 'aggregate',
            'scale type': 'scale type'
        }
    }

    for (const channel in this.supportedEncodings) {
        if (Object.hasOwnProperty.call(this.supportedEncodings, channel)) {
            this.supportedEncodings[channel] = this.supportedEncodings[channel];
            for (const property in this.supportedEncodings[channel]) {
                if (Object.hasOwnProperty.call(this.supportedEncodings[channel], property)) {
                    let propertyName = this.supportedEncodings[channel][property];
                    this.supportedEncodings[channel][property] = propertyConfig(propertyName);

                }
            }
        }
    }

    this.addProperties = {};
    for (const key in this.supportedEncodings) {
        if (Object.hasOwnProperty.call(this.supportedEncodings, key)) {
            const element = this.supportedEncodings[key];
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
        if (this.supportedEncodings.hasOwnProperty(key)) {

            if (Object.hasOwnProperty.call(this.vegaEncoding, key)) {
                const encoding = this.vegaEncoding[key];
                let supportProperty = this.supportedEncodings[key];
                ans[key] = [];
                for (const propertyName in encoding) {
                    if (Object.hasOwnProperty.call(encoding, propertyName)) {
                        const propertyValue = encoding[propertyName];
                        if (supportProperty.hasOwnProperty(propertyName)) {
                            supportProperty[propertyName].value = propertyValue;
                            ans[key].push(supportProperty[propertyName]);
                        }
                        else if (propertyName == 'scale' && propertyValue.hasOwnProperty("type")) {
                            supportProperty['scale type'].value = propertyValue.type;
                            ans[key].push(supportProperty['scale type']);
                        }
                    }
                }
                ans[key] = ans[key].reverse();
            }
        }
    }
    return ans;
}

EncodingCompiler.prototype.GetVegaConfig = function (schema_obj) {
    for (const encodingName in schema_obj) {
        if (Object.hasOwnProperty.call(schema_obj, encodingName)) {
            // vega没的就加，vega有的就改
            if (!this.vegaEncoding.hasOwnProperty(encodingName)) { this.vegaEncoding[encodingName] = {}; }

            for (let index = 0; index < schema_obj[encodingName].length; index++) {
                const property = schema_obj[encodingName][index];
                if (this.vegaEncoding[encodingName].hasOwnProperty(property.name)) {

                    this.vegaEncoding[encodingName][property.name] = property.value;

                    // use is number to judge
                    // special situation
                    if (property.name == 'field') {
                        this.FieldSelections.CompileSelection(property.value, this.vegaEncoding[encodingName]);
                    }
                }
                else {
                    // nested config
                    if (property.name == 'scale type') {
                        this.vegaEncoding[encodingName].scale = {};
                        this.vegaEncoding[encodingName].scale.type = property.value;
                    }
                    else {
                        this.vegaEncoding[encodingName][property.name] = property.value;
                    }
                }
            }

        }
    }
    return this.vegaEncoding;
}

EncodingCompiler.prototype.GetNewEncoding = function (encodingName) {
    this.vegaEncoding[encodingName] = { field: '' };
    if (this.supportedEncodings.hasOwnProperty(encodingName)) {
        let ans = [];
        ans.push(this.supportedEncodings[encodingName]['field'])
        return ans;
    }
    return undefined
}

EncodingCompiler.prototype.GetNewProperty = function (encodingName, propertyName) {
    if (this.supportedEncodings.hasOwnProperty(encodingName)) {
        return JSON.parse(JSON.stringify(this.supportedEncodings[encodingName][propertyName]));
    }
    this.vegaEncoding[encodingName][propertyName] = this.supportedEncodings[encodingName][propertyName].value;
    return undefined
}

EncodingCompiler.prototype.GetProperties = function (schema_obj, encoding_str) {
    let ans = [...this.addProperties[encoding_str]];
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
    for (const key in this.supportedEncodings) {
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

EncodingCompiler.prototype.DeletEncodingOnVega = function (encodingName_str) {
    if (this.vegaEncoding.hasOwnProperty(encodingName_str)) {
        delete this.vegaEncoding[encodingName_str];
    }
}

EncodingCompiler.prototype.DeletPropertyOnVega = function (encodingName_str, propertyName_str) {
    if (this.vegaEncoding.hasOwnProperty(encodingName_str)) {
        if (this.vegaEncoding[encodingName_str].hasOwnProperty(propertyName_str)) {
            delete this.vegaEncoding[encodingName_str][propertyName_str];
        }
        else if (propertyName_str == 'scale type') {
            delete this.vegaEncoding[encodingName_str]['scale']['type'];
        }
    }
}

export { EncodingCompiler };

// mark
export let markType = ['area', 'bar', 'boxplot', 'line', 'point', 'rule'];

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
    },
    switch: function (title_str, df_trueFalse) {
        return {
            "title": title_str,
            "type": "boolean",
            default: df_trueFalse
        }
    },
}

export let markConf = {
    arc: function (df_innerRadius, df_outerRadius) {
        this.properties = {};
        this.properties.innerRadius = new confTemplate.width('inner radius', 1, 100, 0);
        this.properties.outerRadius = new confTemplate.width('outer radius', 1, 100, 50);
    },
    area: function () {
        this.properties = {};
        this.properties.opacity = new confTemplate.opacity(0.5);
        this.properties.interpolate = new confTemplate.select("interpolate", ["basis", "cardinal", "catmull-rom", "linear", "monotone", "natural", "step", "step-after", "step-before"], "monotone");
        this.properties.color = new confTemplate.color();
    },
    bar: function () {
        this.properties = {};
        this.properties.opacity = new confTemplate.opacity(1);
    },
    boxplot: function (df_size, df_opacity, df_color, df_orient, df_extent) {
        this.properties = {};
        this.properties.size = new confTemplate.width('size', 10, 100, undefined);
        this.properties.opacity = new confTemplate.opacity(undefined);
        this.properties.color = new confTemplate.color();
    },
    line: function (df_strokeWidth, df_color, df_interpolate) {
        this.properties = {};
        this.properties.interpolate = new confTemplate.select("interpolate", ["basis", "cardinal", "catmull-rom", "linear", "monotone", "natural", "step", "step-after", "step-before"], df_interpolate);
        this.properties.strokeWidth = new confTemplate.width('stroke width', 1, 10, undefined);
        this.properties.opacity = new confTemplate.opacity(0.6);
        this.properties.stroke = new confTemplate.color(df_color);
    },
    point: function (df_size, df_shape) {
        this.properties = {};
        this.properties.size = new confTemplate.width('size', 1, 1000, 10);
        this.properties.strokeWidth = new confTemplate.width('stroke Width', 1, 100, 5);
        this.properties.filled = new confTemplate.switch('filled', true);
        this.properties.shape = new confTemplate.select("shape", ["circle", "square", "cross", "diamond", "triangle-up", "triangle-down", "triangle-right", "triangle-left", "stroke", "arrow", "arrow", "triangle"],);
    },
    tick: function () {
        this.properties = {};
        this.properties.thickness = new confTemplate.width('thickness', 1, 100, 2);
    },
    circle: function () {

    },
    rect: function () {

    }
}
