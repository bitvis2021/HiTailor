
export function UnitCompiler() {

}

UnitCompiler.GetUnits = function (data_array, config) {
    let [max, min] = findMaxMin(data_array);
    data_array = remapValue(data_array, max, min);

    let sizeBaseLine = findLengthBaseLine(data_array);
    let size = sizeBaseLine * config.relativeSize/2;

    console.log("remapped size", size);

    for (let i = 0; i < data_array.length; i++) {
        let generateConfig = {
            shape: config.shape,
            color: config.color, // need remap
            size: data_array[i].value * size
        }

        data_array[i].dom = this.GetUnitDom(generateConfig);
    }
    return data_array;
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

    let y = function (x) {
        return 0.8 * x + 0.2;
    }

    for (let i = 0; i < data_array.length; i++) {
        const element = data_array[i];
        let x = (Number(element.value) - min) / baseLine;
        console.log("remap val:", y(x), "origin:", x, "baseline:", baseLine);
        data_array[i].value = y(x);
    }
    return data_array;
}

function findLengthBaseLine(data_array) {
    let min = Infinity;
    for (let i = 0; i < data_array.length; i++) {
        const element = data_array[i].position;
        if (Number(element.width) < min) {
            min = element.width;
        }
        if (Number(element.height) < min) {
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