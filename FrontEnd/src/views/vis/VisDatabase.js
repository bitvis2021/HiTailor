import vegaEmbed from "vega-embed";
import { GetTemplate } from "./TemplateCompiler";
// todo: 把vega lite 与data部分 decouple. 在gen config的时候才进行组装。
// 应该从这里获得selection


// export function VisDatabase(eventBus_obj) {
//     this.database = {};
//     this.bus = eventBus_obj;
// }


export let VisDatabase = (function () {
    let instance;
    let CreateSingleton = function (eventBus_obj) {
        this.database = {};
        this.bus = eventBus_obj;
        this.group = {};
        if (instance) {
            return instance;
        }
        return instance = this;
    }
    return CreateSingleton;
})();

VisDatabase.prototype.GetGroupID = function (id) {
    return this.database[id]['group_id'];
}
// input one member's id, then get other members
VisDatabase.prototype.GetGroupMembers = function (id) {
    if (this.database[id].hasOwnProperty('group_id')) {
        return this.group[this.database[id].group_id];
    }
    return [id];
}
VisDatabase.prototype.DeleteGroup = function (group_id) {
    for (let i = 0, len = this.group[group_id].length; i < len; i++) {
        let memberID = this.group[group_id][i];
        console.log('deleteing', memberID);
        this.RemoveCanvas(memberID);
    }

    // delete this.group[group_id];
}
VisDatabase.prototype.RemoveGroupMember = function (group_id, id) {
    if (!!this.group[group_id]) {
        this.group[group_id].splice(this.group[group_id].indexOf(id), 1);
        if (this.group[group_id].length == 0) {
            delete this.group[group_id];
        }
    }
}
VisDatabase.prototype.AddGroupMember = function (group_id, id) {
    if (group_id == undefined || this.group[group_id] == undefined) {
        console.log("undefine");
        group_id = this.GenID();
        this.group[group_id] = [];
    }
    this.database[id].group_id = group_id;
    this.group[group_id].push(id);
    return group_id;
}

VisDatabase.prototype.SelectHandler = function (id) {
    if (this.database.hasOwnProperty(id)) {
        // close other selection
        for (const key in this.database) {
            if (Object.hasOwnProperty.call(this.database, key)) {
                if (key != id) {
                    this.CancelSelection(key);
                }
            }
        }

        if (this.database[id].status == status.clear) {
            for (let i = 0; i < this.GetGroupMembers(id).length; i++) {
                const otherID = this.GetGroupMembers(id)[i];

                this.SelectCanvas(otherID);
            }

            this.bus.$emit("select-canvas", id);

            this.AddCloseButton(id);
        }
        else if (this.database[id].status == status.select) {
            // this.CancelSelection(id);

            for (let i = 0; i < this.GetGroupMembers(id).length; i++) {
                const otherID = this.GetGroupMembers(id)[i];

                this.CancelSelection(otherID);
            }
        }

    }
}

VisDatabase.prototype.MinimizeHandler = function (id) {
    // alert("minimize", id);
    let canvas = this.GetCanvas(id);
    // canvas.removeAttribute("class")
    canvas.setAttribute("style", "visibility: hidden;");


    let hinter = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    hinter.setAttribute("id", id + '.hinter');
    hinter.setAttribute("style", "fill:rgb(186, 219, 228,0.3);stroke:rgb(186, 219, 228);stroke-width:0px;visibility:visible");
    hinter.setAttribute("width", this.database[id].width);
    hinter.setAttribute("height", this.database[id].height);
    canvas.append(hinter);

    // max button
    let mButton_window = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // max button position
    mButton_window.setAttribute("transform", "scale(" + 0.02 + "," + 0.02 + ") translate(-60,-70)");
    let mButton = document.createElementNS("http://www.w3.org/2000/svg", "path");
    mButton.setAttribute("d", "M864 96a64 64 0 0 1 64 64v704a64 64 0 0 1-64 64H160a64 64 0 0 1-64-64V160a64 64 0 0 1 64-64h704zM256 544a32 32 0 0 0-31.776 28.256L224 576v192l0.224 3.744a32 32 0 0 0 28.032 28.032L256 800h192l3.744-0.224a32 32 0 0 0 28.032-28.032L480 768l-0.224-3.744a32 32 0 0 0-28.032-28.032L448 736h-114.784l131.936-131.872a32 32 0 0 0 2.656-42.24l-2.656-3.04a32 32 0 0 0-42.24-2.656l-3.04 2.656L288 690.72V576l-0.224-3.744A32 32 0 0 0 256 544zM768 224h-192l-3.744 0.224a32 32 0 0 0-28.032 28.032L544 256l0.224 3.744a32 32 0 0 0 28.032 28.032L576 288h114.72l-131.84 131.872a32 32 0 0 0-2.688 42.24l2.656 3.04a32 32 0 0 0 42.24 2.656l3.04-2.656L736 333.216V448l0.224 3.744a32 32 0 0 0 63.552 0L800 448V256l-0.224-3.744a32 32 0 0 0-28.032-28.032L768 224z")
    mButton_window.append(mButton);

    let mButton_box = document.createElementNS("http://www.w3.org/2000/svg", "g");

    mButton_box.addEventListener("click", (e) => { e.stopPropagation(); this.MaximizeHandler(id); });
    mButton_box.setAttribute("class", 'vis-picture-mButton');
    mButton_box.setAttribute("id", id + '.mButton');
    mButton_box.append(mButton_window);


    mButton_box.setAttribute("transform", "translate(" + (this.database[id].width - 20) + "," + 1 + ")");

    canvas.append(mButton_box);

    document.getElementById(id + '.hButton').setAttribute('style', "visibility: hidden;");
}

VisDatabase.prototype.MaximizeHandler = function (id) {
    // alert("maximize", id);
    let canvas = this.GetCanvas(id);
    canvas.removeAttribute("style");
    let button = document.getElementById(id + '.mButton');
    button.remove();

    let hinter = document.getElementById(id + '.hinter');
    hinter.remove();

    document.getElementById(id + '.hButton').removeAttribute('style');
}

VisDatabase.prototype.AddHiddenButton = function (id) {
    // hidden button
    let hButton_window = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // hidden button position
    hButton_window.setAttribute("transform", "scale(" + 0.02 + "," + 0.02 + ") translate(-60,-70)");
    let hButton = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hButton.setAttribute("d", "M864 96a64 64 0 0 1 64 64v704a64 64 0 0 1-64 64H160a64 64 0 0 1-64-64V160a64 64 0 0 1 64-64h704zM448 544H256l-3.744 0.224a32 32 0 0 0-28.032 28.032L224 576l0.224 3.744a32 32 0 0 0 28.032 28.032L256 608h114.72l-131.84 131.872a32 32 0 0 0-2.688 42.24l2.656 3.04a32 32 0 0 0 42.24 2.656l3.04-2.656L416 653.216V768l0.224 3.744a32 32 0 0 0 63.552 0L480 768v-192l-0.224-3.744a32 32 0 0 0-28.032-28.032L448 544z m128-320a32 32 0 0 0-31.776 28.256L544 256v192l0.224 3.744a32 32 0 0 0 28.032 28.032L576 480h192l3.744-0.224a32 32 0 0 0 28.032-28.032L800 448l-0.224-3.744a32 32 0 0 0-28.032-28.032L768 416h-114.784l131.936-131.872a32 32 0 0 0 2.656-42.24l-2.656-3.04a32 32 0 0 0-42.24-2.656l-3.04 2.656L608 370.72V256l-0.224-3.744A32 32 0 0 0 576 224z")
    hButton_window.append(hButton);
    hButton_window.setAttribute("fill", '#6a9af1');

    let hButton_box = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hButton_box.setAttribute("id", id + '.hButton');
    hButton_box.addEventListener("click", (e) => { e.stopPropagation(); this.MinimizeHandler(id); });
    hButton_box.setAttribute("class", 'vis-picture-hButton');
    hButton_box.append(hButton_window)

    hButton_box.setAttribute("transform", "translate(" + (this.database[id].width - 20) + "," + 1 + ")");

    if (this.GetCanvas(id) != null) {
        this.GetCanvas(id).append(hButton_box);
    }
}

VisDatabase.prototype.AddCloseButton = function (id) {
    // cancel button
    let button_box = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // button position
    button_box.setAttribute("transform", "translate(" + (this.database[id].x - 5) + "," + (this.database[id].y - 5) + ")");
    button_box.setAttribute("id", id + '.button');
    button_box.setAttribute("class", 'vis-picture-button');


    button_box.addEventListener("click", () => {
        if (this.GetGroupMembers(id).length > 1) {
            this.bus.$emit("remove-groupCanvas", this.database[id].group_id);
            this.RemoveGroupMember(this.database[id].group_id, id);
        }
        this.RemoveCanvas(id);
    });
    let button_border = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    button_border.setAttribute("fill", 'white');
    button_border.setAttribute("r", '12');
    button_border.setAttribute("cx", '12');
    button_border.setAttribute("cy", '12');
    button_border.setAttribute("stroke", 'rgb(221,223,229)');
    button_border.setAttribute("stroke-width", '1');
    // button
    let button = document.createElementNS("http://www.w3.org/2000/svg", "path");
    button.setAttribute("d", "M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M17,15.59L15.59,17L12,13.41L8.41,17L7,15.59 L10.59,12L7,8.41L8.41,7L12,10.59L15.59,7L17,8.41L13.41,12L17,15.59z")
    button_box.append(button_border);
    button_box.append(button);

    this.GetTable().append(button_box);
}

VisDatabase.prototype.SelectCanvas = function (id) {

    if (!!this.database[id]) {

        this.database[id].status = status.select;
        let canvas = this.GetCanvas(id);

        // selection stroke
        let path = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        path.setAttribute("id", id + '.select');
        path.setAttribute("style", "fill:rgb(186, 219, 228,0.2);stroke:rgb(70,130,180);stroke-width:2px");
        path.setAttribute("width", this.database[id].width);
        path.setAttribute("height", this.database[id].height);

        canvas.append(path);

        return canvas;
    }
}

VisDatabase.prototype.ReconfigAllCanvas = function (pre_x, pre_y, after_x, after_y) {

    // move col
    if (pre_y == 0 && after_y == 0) {
        for (const id in this.database) {
            if (Object.hasOwnProperty.call(this.database, id)) {
                const metaData = this.database[id];
                // move right
                let offset = after_x - pre_x;
                if (pre_x <= metaData.x) {
                    this.RepositionCanvas(id, metaData.x + offset, metaData.y)
                }
                else if (pre_x > metaData.x && pre_x <= metaData.x + metaData.width) {
                    this.RerenderCanvas(id, metaData.x, metaData.y, metaData.height, metaData.width + offset);
                }
            }
        }
    }
    // move row
    else {
        for (const id in this.database) {
            if (Object.hasOwnProperty.call(this.database, id)) {
                const metaData = this.database[id];
                // move right
                let offset = after_y - pre_y;
                if (pre_y <= metaData.y) {
                    this.RepositionCanvas(id, metaData.x, metaData.y + offset)
                }
                else if (pre_y > metaData.y && pre_y <= metaData.y + metaData.height) {
                    this.RerenderCanvas(id, metaData.x, metaData.y, metaData.height + offset, metaData.width);
                }
            }
        }
    }
}

VisDatabase.prototype.RerenderCanvas = function (id, x, y, height, width, newDom_dom) {
    // 1. get new metadata
    // 2. remove old canvas data
    if (x != undefined) {
        this.database[id].x = x;
        this.database[id].y = y;
        this.database[id].height = height;
        this.database[id].width = width;
    }

    if (this.database[id].type == "unit" && !!newDom_dom) {
        this.database[id].dom = newDom_dom;
    }

    if (this.GetCanvas(id) != null) {
        document.getElementById(id).remove();
    }
    if (!!document.getElementById(id + ".button")) {
        document.getElementById(id + ".button").remove();
    }

    this.RenderCanvas(id);
}

VisDatabase.prototype.RepositionCanvas = function (id, x, y) {
    this.database[id].x = x;
    this.database[id].y = y;

    let new_x = this.database[id].x + 0.5;
    let new_y = this.database[id].y + 0.5;
    let canvas = this.GetCanvas(id);
    canvas.removeAttribute("transform");
    canvas.setAttribute("transform", "translate(" + new_x + "," + new_y + ")");
}

VisDatabase.prototype.RemoveAllCanvas = function () {
    for (const key in this.database) {
        if (Object.hasOwnProperty.call(this.database, key)) {
            this.RemoveCanvas(key);
        }
    }
}

VisDatabase.prototype.CancelSelection = function (id) {
    if (!!this.database[id]) {
        this.database[id].status = status.clear;
        if (!!document.getElementById(id + '.select')) {
            document.getElementById(id + '.select').remove();
        }
        if (!!document.getElementById(id + '.button')) {
            document.getElementById(id + '.button').remove();
        }
    }
}

VisDatabase.prototype.CancelAllSelections = function () {
    for (const id in this.database) {
        if (Object.hasOwnProperty.call(this.database, id)) {
            this.database[id].status = status.clear;
            if (!!document.getElementById(id + '.select')) {
                document.getElementById(id + '.select').remove();
            }
            if (!!document.getElementById(id + '.button')) {
                document.getElementById(id + '.button').remove();
            }
        }
    }
}

VisDatabase.prototype.GetCanvas = function (id) {
    return document.getElementById(id);
}

VisDatabase.prototype.RemoveCanvas = function (id) {
    if (!!document.getElementById(id)) {
        document.getElementById(id).remove();
    }
    let button = document.getElementById(id + ".button");
    if (!!button) {
        button.remove();
    }

    // this.RemoveGroupMember(this.GetGroupID(id), id);
    delete this.database[id];
}

let status = {
    clear: 'clear',
    select: 'select'
}

function visMetaData(id, x, y, height, width, vegaTemplate, visData_obj, metaData_obj) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.vegaTemplate = vegaTemplate;
    this.visData = visData_obj
    this.metaData = metaData_obj
    this.status = status.clear;
}

// restore context

VisDatabase.prototype.SetVegaConfig = function (id, vegaConfig) {
    // 之前在这里的时候赋值不成功
    this.database[id].vegaTemplate.CompileTweakedConfig(vegaConfig);
}

VisDatabase.prototype.GetVegaLite = function (id, height, width) {
    return this.database[id].vegaTemplate.GetVegaLite(height, width);
}

VisDatabase.prototype.SetTemplate = function (id, template) {
    return this.database[id].vegaTemplate = template;
}

VisDatabase.prototype.GetTemplate = function (id) {
    return this.database[id].vegaTemplate;
}

// table id==table-view-svg
// vis generator==gen-chart

VisDatabase.prototype.GenFig = function (height_num, width_num, x_num, y_num, template_obj, visData_obj, metaData_obj) {
    // 1. set json
    // 2. append canvas
    // 3. add canvas object to database
    // 4. render

    let canvas_id = this.GenID();

    // add to db
    let metaData = new visMetaData(canvas_id, x_num, y_num, height_num, width_num, template_obj, visData_obj, metaData_obj);
    this.database[canvas_id] = metaData;
    this.database[canvas_id].type = 'vega';
    this.RenderCanvas(canvas_id);
    return canvas_id;
}

VisDatabase.prototype.GenUnit = function (height_num, width_num, x_num, y_num, dom_obj, data) {

    let canvas_id = this.GenID();
    let metaData = new visMetaData(canvas_id, x_num, y_num, height_num, width_num, null, data, null);
    this.database[canvas_id] = metaData;
    this.database[canvas_id].type = 'unit';

    this.database[canvas_id].dom = dom_obj;

    this.RenderCanvas(canvas_id);

    return canvas_id;
}

VisDatabase.prototype.GenRecommendFigs = function (recommendData_array, currentTemplate_obj, currentID) {
    // 1. set json
    // 2. append canvas
    // 3. add canvas object to database
    // 4. render

    // generate group
    let group_id = this.GenID();
    this.group[group_id] = [];

    this.AddGroupMember(group_id, currentID);

    let currentTemplate = currentTemplate_obj;

    for (let i = 0, len = recommendData_array.length; i < len; i++) {
        let element = recommendData_array.at(i);
        let position = element.position;
        let visData = JSON.parse(element.visData);
        let metaData = JSON.parse(element.metaData);
        let id = this.GenFig(
            position.height,
            position.width,
            position.x,
            position.y,
            GetTemplate(currentTemplate.name, metaData, visData),
            visData,
            metaData
        );
        this.AddGroupMember(group_id, id);

    }
    return group_id;
}

VisDatabase.prototype.RegisterBus = function (bus_vmObj) {
    this.bus = bus_vmObj;
}

VisDatabase.prototype.ObjectData = function () {
    // Get Object data
}

VisDatabase.prototype.GetTable = function () {
    return document.getElementById("vis-container");
}

VisDatabase.prototype.RenderCanvas = function (id) {
    // 1. get meta data
    // 2. tweak meta data
    // 3. gen chart
    // 4. append

    // let table = document.getElementsByClassName("table-view-svg")[0];
    let table = this.GetTable();
    let height = this.database[id].height - 1.1;
    let width = this.database[id].width - 1.1;
    let x = this.database[id].x + 0.5;
    let y = this.database[id].y + 0.5;

    if (this.database[id].type == "unit") {
        let canvas = document.createElementNS("http://www.w3.org/2000/svg", "g");
        canvas.setAttribute("id", id);
        canvas.setAttribute("transform", "translate(" + x + "," + y + ")");
        canvas.setAttribute("class", "vis-picture");

        let vis = document.createElementNS("http://www.w3.org/2000/svg", "g");
        vis.setAttribute("style", "fill:rgb(255,255,255)");
        vis.setAttribute("width", width);
        vis.setAttribute("height", height);

        // add back ground
        let background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        background.setAttribute("style", "fill:rgb(255,255,255)");
        background.setAttribute("width", width);
        background.setAttribute("height", height);

        // click event
        canvas.addEventListener("click", () => (this.SelectHandler(id)));
        canvas.append(background);

        let clipRef = document.createElementNS("http://www.w3.org/2000/svg", "defs");

        let clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
        clipRef.append(clip);
        clip.setAttribute("id", id + "clip");
        // add back ground
        let clip_path = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        clip_path.setAttribute("width", width);
        clip_path.setAttribute("height", height);

        clip.append(clip_path);
        canvas.append(clipRef);

        this.database[id].dom.setAttribute("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        vis.append(this.database[id].dom);
        vis.setAttribute("clip-path", "url(#" + id + "clip" + ")");

        canvas.append(vis);
        table.append(canvas);
        this.AddHiddenButton(id);
    }
    else {
        let chartJson = JSON.parse(JSON.stringify(this.GetVegaLite(id, height - 0.3, width - 0.3)));
        console.log("rendering", chartJson);

        let canvas = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        if (canvas) {
            canvas.setAttribute("id", id);
            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);
            canvas.setAttribute("transform", "translate(" + x + "," + y + ")");
            canvas.setAttribute("class", "vis-picture");

            // add back ground
            background.setAttribute("style", "fill:rgb(255,255,255)");
            background.setAttribute("width", width);
            background.setAttribute("height", height);

            // click event
            canvas.addEventListener("click", () => (this.SelectHandler(id)));

            table.append(canvas);

            // get svg from #gen-chart
            let tempSvgFragament_Id = "gen-" + id;

            if (document.getElementById(tempSvgFragament_Id) == undefined) {
                let svgFragment = document.createElement("div");
                svgFragment.setAttribute("id", tempSvgFragament_Id);
                document.getElementById("gen-chart").appendChild(svgFragment);
            } // it never release

            vegaEmbed("#" + tempSvgFragament_Id, chartJson, {
                renderer: "svg",
                actions: false,
            }).then(() => {
                // get vis picture
                let pic =
                    document.getElementById(tempSvgFragament_Id).childNodes[0].childNodes[0];

                // define offset
                pic.removeAttribute("transform");
                pic.setAttribute("transform", "translate(" + '-0.3' + "," + '-0.3' + ")");

                // pic.removeChild(pic.childNodes[0]);

                // append bacground first
                canvas.append(background);
                // then add vis picture
                canvas.append(pic);

                let defs = document.getElementById(tempSvgFragament_Id).childNodes[0].childNodes[0];
                canvas.append(defs);


                this.AddHiddenButton(id);
            });
        }
    }
}

// generate GUID
VisDatabase.prototype.GenID = function () {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
