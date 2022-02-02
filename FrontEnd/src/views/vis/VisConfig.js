export let markType = ['area', 'arc', 'bar', 'boxplot', 'line', 'point', 'rule'];
export let encodingType = ['x', 'y', 'x2', 'y2', 'xOffset', 'yOffset', 'color'];

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

export let encodingConfig = {
    positionChannel: function (fields_arr, df_field) {
        this.properties = {};
        this.properties.field = new confTemplate.select('field', fields_arr, df_field);
        this.properties.aggregate = new confTemplate.select('aggregate', ['count', 'sum', 'mean', 'stdev', 'median', 'min', 'max']);
        this.properties.scaleType = new confTemplate.select('scale type', ['linear', 'pow', 'sqrt', 'symlog', 'log']);
        this.properties.scalDomain = new confTemplate.width('scale domain'); // 需要自己定义一个双滑杆组件
    }
}

export let displayEncoding = {
    title: "addEncoding",
    type: "object",
    properties: {
        x: {
            title: "x",
            type: "boolean",
            default: true,
        },
        x2: {
            title: "x2",
            type: "boolean",
        },
        y: {
            title: "y",
            type: "boolean",
            default: true,
        },
        y2: {
            title: "y2",
            type: "boolean",
        },
        color: {
            title: "color",
            type: "boolean",
        },
        shape: {
            title: "shape",
            type: "boolean",
        },
    },
}

export let encodingSchema = {
    type: "object",
    definitions: {
        positionChannel: {
            properties: {
                field: {
                    title: "field",
                    type: "string",
                },
                type: { type: "string" },
                aggregate: {
                    title: "aggregate",
                    type: "string",
                },
                scale: {
                    type: "object",
                    properties: {
                        type: {
                            title: "scale type",
                            type: "string",
                        },
                        // domain: {
                        //     title: "scale domain",
                        //     type: "array",
                        //     items: {
                        //         type: "number",
                        //     },
                        // },
                    },
                },
            },
        },
    },
    properties: {
        encoding: {
            type: "object",
            properties: {
                x: {
                    title: "X",
                    type: "object",
                    $ref: "#/definitions/positionChannel",
                },
                y: {
                    title: "Y",
                    type: "object",
                    $ref: "#/definitions/positionChannel",
                },
                color: {
                    title: "Color",
                    type: "object",
                    properties: {
                        field: {
                            title: "field",
                            type: "string",
                        },
                        type: { type: "string" },
                    },
                    legend: {
                        type: "boolean",
                    },
                },

                shape: {
                    title: "Shape",
                    type: "object",
                    properties: {
                        field: {
                            title: "field",
                            type: "string",
                        },
                        type: { type: "string" },
                    },
                    legend: {
                        type: "boolean",
                    },
                },
            },
        },
    },
}