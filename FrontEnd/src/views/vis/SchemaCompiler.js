// 总感觉可以面向对象重构一波
function EncodingCompiler(VegaEncoding_obj, ECSelections_obj) {
    // this.positionChannel={
    //     field
    // }
    this.vegaEncoding = VegaEncoding_obj;
    this.ECSelections = ECSelections_obj;
    this.sortBindings = Object.assign(this.ECSelections.xSelect.bindings, this.ECSelections.ySelect.bindings)
    function propertyConfig(selection_str) {
        if (selection_str == 'xField') return {
            name: 'field',
            type: 'select',
            // selections: this.ECSelections.xSelect.selections.concat(['value']),
            selections: this.ECSelections.xSelect.selections,
            value: ''
        }
        else if (selection_str == 'yField') return {
            name: 'field',
            type: 'select',
            value: '',
            selections: this.ECSelections.ySelect.selections
            // selections: this.ECSelections.ySelect.selections.concat(['value'])
        }
        else if (selection_str == 'allField') return {
            name: 'field',
            type: 'group select',
            value: '',
            selections: { x: this.ECSelections.xSelect.selections, y: this.ECSelections.ySelect.selections },
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
    // make it can use this.ECSelections
    propertyConfig = propertyConfig.bind(this);

    this.encodings = {
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
            field: 'xField',
            'scale type': 'scale type'
        }
    }

    for (const channel in this.encodings) {
        if (Object.hasOwnProperty.call(this.encodings, channel)) {
            this.encodings[channel] = this.encodings[channel];
            for (const property in this.encodings[channel]) {
                if (Object.hasOwnProperty.call(this.encodings[channel], property)) {
                    let propertyName = this.encodings[channel][property];
                    this.encodings[channel][property] = propertyConfig(propertyName);

                }
            }
        }
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
        if (this.encodings.hasOwnProperty(key)) {

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
                        if (property.value == 'value') {
                            this.vegaEncoding[encodingName].type = "quantitative";
                            this.vegaEncoding[encodingName].sort = undefined;
                        }
                        else {
                            if (this.sortBindings != undefined && this.sortBindings.hasOwnProperty(property.value)) {
                                this.vegaEncoding[encodingName].sort = this.sortBindings[property.value];
                                this.vegaEncoding[encodingName].type = "nominal";
                            }
                        }
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
    if (this.encodings.hasOwnProperty(encodingName)) {
        let ans = [];
        ans.push(this.encodings[encodingName]['field'])
        return ans;
    }
    return undefined
}

EncodingCompiler.prototype.GetNewProperty = function (encodingName, propertyName) {
    if (this.encodings.hasOwnProperty(encodingName)) {
        return JSON.parse(JSON.stringify(this.encodings[encodingName][propertyName]));
    }
    this.vegaEncoding[encodingName][propertyName] = this.encodings[encodingName][propertyName].value;
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

export function FieldSelection() {
    this.xSelect = {
        selections: [],
        bindings: {}
    };
    this.ySelect = {
        selections: [],
        bindings: {}
    }
}

FieldSelection.prototype.SetXSelections = function (selection_arr, bindings_obj) {
    this.xSelect.selections = selection_arr;
    if (bindings_obj == undefined) {
        this.xSelect.bindings = {};
    }
    else {
        this.xSelect.bindings = bindings_obj;
    }
}

FieldSelection.prototype.AddXSelection = function (selectionName_str) {
    this.xSelect.selections.push(selectionName_str);
}

FieldSelection.prototype.AddYSelection = function (selectionName_str) {
    this.ySelect.selections.push(selectionName_str);
}

FieldSelection.prototype.SetYSelections = function (selection_arr, bindings_obj) {
    this.ySelect.selections = selection_arr;
    if (bindings_obj == undefined) {
        this.ySelect.bindings = {};
    }
    else {
        this.ySelect.bindings = bindings_obj;
    }
}

FieldSelection.prototype.GetXSelections = function () {
    return this.xSelect.selections;
}


FieldSelection.prototype.GetYSelections = function () {
    return this.ySelect.selections;
}

EncodingCompiler.GetSelectionsFromMetaData = function (metaData_obj) {

    let ans = new FieldSelection();

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
    }
}

export let markConf = {
    arc: function (df_innerRadius, df_outerRadius) {
        this.properties = {};
        this.properties.innerRadius = new confTemplate.width('inner radius', 1, 100, 0);
        this.properties.outerRadius = new confTemplate.width('outer radius', 1, 100, 50);
    },
    area: function () {
        this.properties = {};
        this.properties.opacity = new confTemplate.opacity(0.6);
        this.properties.interpolate = new confTemplate.select("interpolate", ["basis", "cardinal", "catmull-rom", "linear", "monotone", "natural", "step", "step-after", "step-before"], "monotone");
        this.properties.color = new confTemplate.color();
    },
    bar: function () {
        this.properties = {};
        this.properties.opacity = new confTemplate.opacity(0.6);
        this.properties.width = new confTemplate.width('width', 1, 100, undefined);
        // this.properties.baseline = new confTemplate.select_radius("base line", ["alphabetic", "top", "middle", "bottom"], "alphabetic");
        // this.properties.align = new confTemplate.select_radius("align", ["left", "center", "right"], df_align);
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
        this.properties.size = new confTemplate.width('point size', 1, 100, df_size);
        this.properties.shape = new confTemplate.select("shape", ["circle", "square", "cross", "diamond", "triangle-up", "triangle-down", "triangle-right", "triangle-left", "stroke", "arrow", "arrow", "triangle"], df_shape);
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
