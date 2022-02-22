import vegaEmbed from "vega-embed";

export function VisDatabase() {
    this.database = {};

}

VisDatabase.prototype.ClickHandler = function (id) {
    if (this.database[id].status == status.clear) {
        this.SelectCanvas(id);
    }
    else if (this.database[id].status == status.select) {
        this.CancelSelection(id);
    }
}

VisDatabase.prototype.MinimizeHandler = function (id) {
    // alert("minimize", id);
    console.log(this.GetCanvas(id));
    let canvas = this.GetCanvas(id);
    // canvas.removeAttribute("class")
    canvas.setAttribute("style", "visibility: hidden;");


    // max button
    let mButton_box = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // max button position
    mButton_box.setAttribute("transform", "scale(" + 0.02 + "," + 0.02 + ") translate(-60,-70)");
    mButton_box.setAttribute("id", id + '.mButton');
    let mButton = document.createElementNS("http://www.w3.org/2000/svg", "path");
    mButton.setAttribute("d", "M864 96a64 64 0 0 1 64 64v704a64 64 0 0 1-64 64H160a64 64 0 0 1-64-64V160a64 64 0 0 1 64-64h704zM256 544a32 32 0 0 0-31.776 28.256L224 576v192l0.224 3.744a32 32 0 0 0 28.032 28.032L256 800h192l3.744-0.224a32 32 0 0 0 28.032-28.032L480 768l-0.224-3.744a32 32 0 0 0-28.032-28.032L448 736h-114.784l131.936-131.872a32 32 0 0 0 2.656-42.24l-2.656-3.04a32 32 0 0 0-42.24-2.656l-3.04 2.656L288 690.72V576l-0.224-3.744A32 32 0 0 0 256 544zM768 224h-192l-3.744 0.224a32 32 0 0 0-28.032 28.032L544 256l0.224 3.744a32 32 0 0 0 28.032 28.032L576 288h114.72l-131.84 131.872a32 32 0 0 0-2.688 42.24l2.656 3.04a32 32 0 0 0 42.24 2.656l3.04-2.656L736 333.216V448l0.224 3.744a32 32 0 0 0 63.552 0L800 448V256l-0.224-3.744a32 32 0 0 0-28.032-28.032L768 224z")
    // mButton.setAttribute("style", 'visibility:visible');
    mButton_box.setAttribute("class", 'vis-picture-mButton');
    mButton_box.append(mButton);
    mButton_box.addEventListener("click", () => this.MaximizeHandler(id));
    mButton_box.setAttribute("fill", '#6a9af1');
    canvas.append(mButton_box);
    
}

VisDatabase.prototype.MaximizeHandler = function (id) {
    // alert("maximize", id);
    let canvas = this.GetCanvas(id);
    canvas.removeAttribute("style");
    let button = document.getElementById(id + '.mButton');
    console.log('maxButton', button);
    button.remove();
}


VisDatabase.prototype.SelectCanvas = function (id) {
    console.log("rerender", this.database[id]);

    this.database[id].status = status.select;
    let canvas = this.GetCanvas(id);

    // selection stroke
    let path = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    path.setAttribute("id", id + '.select');
    path.setAttribute("style", "fill:rgb(186, 219, 228,0.2);stroke:rgb(70,130,180);stroke-width:2px");
    path.setAttribute("width", this.database[id].width);
    path.setAttribute("height", this.database[id].height);

    // cancel button
    let button_box = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // button position
    button_box.setAttribute("transform", "translate(" + (this.database[id].width - 18) + "," + -8 + ")");
    button_box.setAttribute("id", id + '.button');
    button_box.setAttribute("class", 'vis-picture-button');
    button_box.addEventListener("click", () => (this.RemoveCanvas(id)));
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


    canvas.append(path);
    canvas.append(button_box);
    return canvas;

}

VisDatabase.prototype.ReconfigAllCanvas = function (pre_x, pre_y, after_x, after_y) {
    console.log('rerendering..', pre_x, after_x, pre_y, after_y);

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

VisDatabase.prototype.RerenderCanvas = function (id, x, y, height, width) {
    // 1. get new metadata
    // 2. remove old canvas data
    this.database[id].x = x;
    this.database[id].y = y;
    this.database[id].height = height;
    this.database[id].width = width;

    if (this.GetCanvas(id) != null) {
        document.getElementById(id).remove();
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
    this.database[id].status = status.clear;
    document.getElementById(id + '.select').remove();
    document.getElementById(id + '.button').remove();
}

VisDatabase.prototype.GetCanvas = function (id) {
    return document.getElementById(id);
}

VisDatabase.prototype.RemoveCanvas = function (id) {
    if (this.GetCanvas(id) != null) {
        document.getElementById(id).remove();
    }
    delete this.database[id];
}

let status = {
    clear: 'clear',
    select: 'select'
}

function visMetaData(id, x, y, height, width, vegaConfig) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.vegaConfig = vegaConfig;
    this.status = status.clear;
}

// table id==table-view-svg
// vis generator==gen-chart
VisDatabase.prototype.GenFig = function (height_num, width_num, x_num, y_num, vegaConfig_obj) {
    // 1. set json
    // 2. append canvas
    // 3. add canvas object to database
    // 4. render

    let chartJson = JSON.parse(JSON.stringify(vegaConfig_obj));
    let canvas_id = this.GenID();

    // add to db
    let metaData = new visMetaData(canvas_id, x_num, y_num, height_num, width_num, chartJson);
    this.database[canvas_id] = metaData;

    this.RenderCanvas(canvas_id);
}

VisDatabase.prototype.RenderCanvas = function (id) {
    // 1. get meta data
    // 2. tweak meta data
    // 3. gen chart
    // 4. append

    let table = document.getElementsByClassName("table-view-svg")[0];
    let height = this.database[id].height - 1.1;
    let width = this.database[id].width - 1.1;
    let x = this.database[id].x + 0.5;
    let y = this.database[id].y + 0.5;

    let chartJson = JSON.parse(JSON.stringify(this.database[id].vegaConfig));
    chartJson.height = height - 0.3;
    chartJson.width = width - 0.3;

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
        canvas.addEventListener("click", () => (this.ClickHandler(id)));

        table.append(canvas);

        // get svg from #gen-chart
        vegaEmbed("#gen-chart", chartJson, {
            renderer: "svg",
            actions: false,
        }).then(() => {
            // get vis picture
            let pic =
                document.getElementById("gen-chart").childNodes[0].childNodes[0];

            // define offset
            pic.removeAttribute("transform");
            pic.setAttribute("transform", "translate(" + '-0.3' + "," + '-0.3' + ")");

            // pic.removeChild(pic.childNodes[0]);

            // append bacground first
            canvas.append(background);
            // then add vis picture
            canvas.append(pic);


            // hidden button
            let hButton_box = document.createElementNS("http://www.w3.org/2000/svg", "g");
            // hidden button position
            hButton_box.setAttribute("transform", "scale(" + 0.02 + "," + 0.02 + ") translate(-60,-70)");
            hButton_box.setAttribute("id", id + '.hButton');
            let hButton = document.createElementNS("http://www.w3.org/2000/svg", "path");
            hButton.setAttribute("d", "M864 96a64 64 0 0 1 64 64v704a64 64 0 0 1-64 64H160a64 64 0 0 1-64-64V160a64 64 0 0 1 64-64h704zM448 544H256l-3.744 0.224a32 32 0 0 0-28.032 28.032L224 576l0.224 3.744a32 32 0 0 0 28.032 28.032L256 608h114.72l-131.84 131.872a32 32 0 0 0-2.688 42.24l2.656 3.04a32 32 0 0 0 42.24 2.656l3.04-2.656L416 653.216V768l0.224 3.744a32 32 0 0 0 63.552 0L480 768v-192l-0.224-3.744a32 32 0 0 0-28.032-28.032L448 544z m128-320a32 32 0 0 0-31.776 28.256L544 256v192l0.224 3.744a32 32 0 0 0 28.032 28.032L576 480h192l3.744-0.224a32 32 0 0 0 28.032-28.032L800 448l-0.224-3.744a32 32 0 0 0-28.032-28.032L768 416h-114.784l131.936-131.872a32 32 0 0 0 2.656-42.24l-2.656-3.04a32 32 0 0 0-42.24-2.656l-3.04 2.656L608 370.72V256l-0.224-3.744A32 32 0 0 0 576 224z")
            hButton_box.setAttribute("class", 'vis-picture-hButton');
            hButton_box.append(hButton);
            hButton_box.addEventListener("click", () => this.MinimizeHandler(id));
            hButton_box.setAttribute("fill", '#6a9af1');
            canvas.append(hButton_box);

            document.getElementById("gen-chart").childNodes[0].remove();
        });
    }
}

// generate GUID
VisDatabase.prototype.GenID = function () {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}
