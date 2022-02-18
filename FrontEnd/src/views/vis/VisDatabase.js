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

VisDatabase.prototype.SelectCanvas = function (id) {
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
    //button
    let button = document.createElementNS("http://www.w3.org/2000/svg", "path");
    button.setAttribute("d", "M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M17,15.59L15.59,17L12,13.41L8.41,17L7,15.59 L10.59,12L7,8.41L8.41,7L12,10.59L15.59,7L17,8.41L13.41,12L17,15.59z")
    button_box.append(button_border);
    button_box.append(button);

    canvas.append(path);
    canvas.append(button_box)
    return canvas;

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
    document.getElementById(id).remove();
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
    // 4. append json

    let height = height_num - 1.1;
    let width = width_num - 1.1;
    let x = x_num + 0.5;
    let y = y_num + 0.5;

    let chartJson = JSON.parse(JSON.stringify(vegaConfig_obj));
    chartJson.height = height - 0.3;
    chartJson.width = width - 0.3;

    let table = document.getElementsByClassName("table-view-svg")[0];

    let canvas_id = this.GenID();

    // add to db
    let metaData = new visMetaData(canvas_id, x, y, height, width, vegaConfig_obj);
    this.database[canvas_id] = metaData;

    let canvas = document.createElementNS("http://www.w3.org/2000/svg", "g");
    let background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    if (canvas) {
        canvas.setAttribute("id", canvas_id);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        canvas.setAttribute("transform", "translate(" + x + "," + y + ")");

        // add back ground
        background.setAttribute("style", "fill:rgb(255,255,255)");
        background.setAttribute("width", width);
        background.setAttribute("height", height);

        // click event
        canvas.addEventListener("click", () => (this.ClickHandler(canvas_id)));

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
