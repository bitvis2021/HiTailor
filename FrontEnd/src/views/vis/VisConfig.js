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
    width: function (title_str,min_nb,max_nb,df_width) {
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
        this.properties.innerRadius = new confTemplate.width('inner radius',1,100,df_innerRadius);
        this.properties.outerRadius = new confTemplate.width('outer radius',1,100,df_outerRadius);
    },
    area: function (df_color, df_opacity) {
        this.properties = {};
        this.properties.color = new confTemplate.color(df_color);
        this.properties.opacity = new confTemplate.opacity(df_opacity);
    },
    bar: function (df_align,df_width) {
        this.properties = {};
        this.properties.align = new confTemplate.select_radius("align",["left", "right", "center"],df_align);
        this.properties.width = new confTemplate.width('width',1,100,df_width);
    }
}

