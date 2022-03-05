
export function UnitCompiler() {

}

UnitCompiler.GetUnits = function (data_array) {

}

function findMaxMin(data_array) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < data_array.length; i++) {
        const element = data_array[i];
        if (Number(element.value) < min) {
            min = element.value;
        }
        if (Number(element.value) > max) {
            max = element.value;
        }
    }
    return [max, min];
}

function remapValue(data_array, max, min) {
    let baseLine = max - min;
    for (let i = 0; i < data_array.length; i++) {
        const element = data_array[i];
        let value = Number(element.value) - min;
        data_array[i].value = value / baseLine;
    }
}

function findLengthBaseLine(data_array) {
    let min = Infinity;
    for (let i = 0; i < data_array.length; i++) {
        const element = data_array[i];
        if (Number(element.width) < min) {
            min = element.width;
        }
        else if (Number(element.height) > min) {
            min = element.height;
        }
    }
    return min;
}

/*
// scale: "linear",
// align:
config={
    shape: "circle / square",
    color: "",
    size: number,
}
*/
UnitCompiler.GetUnitDom = function (config_obj) {
    let dom;
    if (config_obj.shape == 'circle') {
        dom = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );
        dom.setAttribute("r", config_obj.size);
    }
    else if (config_obj.shape = "square") {
        dom = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );
    }
    dom.setAttribute("style", "fill:" + config_obj.color);

    let container = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );
    container.append(dom)
    return container;
}