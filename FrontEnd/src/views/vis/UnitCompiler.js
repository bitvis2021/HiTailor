
export function UnitCompiler() {

}

UnitCompiler.GetUnits = function (data_array, config) {
    let [max, min] = findMaxMin(data_array);

	// unitView => config => remap to each array => GetUnitDom
	data_array = remapValue(data_array, max, min,GetScaleFunction(config.scale));
	let lengthBaseLine = findLengthBaseLine(data_array);
	let size = lengthBaseLine * config.relativeSize/2; // size must exist
	let height=false;
  	let width=false;
	let yOffset=false;
	let xOffset=false;

	if (config.encodings.height) {
		height=true;		
	}

	if (config.encodings.width) {
		width=true;		
	}

	if (config.encodings.yOffset) {
		yOffset=true;		
	}

	if (config.encodings.xOffset) {
		xOffset=true;		
	}

    
	for (let i = 0; i < data_array.length; i++) {
		let generateConfig = {
			shape: config.shape,
			color: config.color, // need remap
			align:config.align,
			size: data_array[i].value * size,
			height:height,
			width:width,
			yOffset:yOffset,
			xOffset:xOffset,
			frameHeight:data_array[i].position.height,
			frameWidth:data_array[i].position.width,
			sizeBaseLine:lengthBaseLine
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

// Getting x∈[0,1] scale function will remap value to (0,1]
function GetScaleFunction(scaleType_str) {
	if (scaleType_str=="linear"||!!!scaleType_str) {
		return x => 0.8 * x + 0.2;
	}
	else if (scaleType_str=="log") {
		return x => Math.log(x+1)+(1-Math.log(2))
	}
	else if (scaleType_str=="sqrt") {
		return x => GetScaleFunction("linear")(Math.sqrt(x));
	}
	else if (scaleType_str=="pow") {
		return x => GetScaleFunction("linear")(x*x);
	}
}

function remapValue(data_array, max, min,scaleFunction_func) {
    let baseLine = max - min;

    let y = scaleFunction_func;

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
			shape: config.shape,
			color: config.color, // need remap
			align:config.align,
			size: data_array[i].value * size,
			height:height,
			width:width,
			yOffset:yOffset,
			xOffset:xOffset,
			frameHeight:data_array[i].position.height,
			frameWidth:data_array[i].position.width,
			sizeBaseLine:sizeBaseLine
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
		let height=dom.getAttribute("r");
		let width=dom.getAttribute("r");
		if (config_obj.align=="middle") {
		}
		else if (config_obj.align=="left") {
			dom.setAttribute("transform", "translate(-"+(config_obj.frameWidth/2-width)+",0)");
		}
		else if (config_obj.align=="top") {
			dom.setAttribute("transform", "translate(0,-"+(config_obj.frameHeight/2-height)+")");
		}
		else if (config_obj.align=="right") {
			dom.setAttribute("transform", "translate("+(config_obj.frameWidth/2-width)+",0)");
		}
		else if (config_obj.align=="bottom") {
			dom.setAttribute("transform", "translate(0,"+(config_obj.frameHeight/2-height)+")");
		}

    }
    else if (config_obj.shape = "square") {
        dom = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
        );
		if (config_obj.height) {
			dom.setAttribute("height", config_obj.size*2);
			dom.setAttribute("width", 0.7*config_obj.sizeBaseLine);
		}
		else if (config_obj.width) {			
			dom.setAttribute("height", 0.7*config_obj.sizeBaseLine);
			dom.setAttribute("width", config_obj.size*2);
		}
		console.log("config",config_obj)
		if (config_obj.width == config_obj.height) {
			dom.setAttribute("width", config_obj.size*2);
			dom.setAttribute("height", config_obj.size*2);
		}
		let height=dom.getAttribute("height");
		let width=dom.getAttribute("width");

		if (config_obj.align=="middle") {
			dom.setAttribute("transform", "translate(-"+width/2+",-"+height/2+")");
		}
		else if (config_obj.align=="left") {
			dom.setAttribute("transform", "translate(-"+config_obj.frameWidth/2+",-"+height/2+")");
		}
		else if (config_obj.align=="top") {
			dom.setAttribute("transform", "translate(-"+width/2+",-"+config_obj.frameHeight/2+")");
		}
		else if (config_obj.align=="right") {
			dom.setAttribute("transform", "translate("+(config_obj.frameWidth/2-width)+",-"+height/2+")");
		}
		else if (config_obj.align=="bottom") {
			dom.setAttribute("transform", "translate(-"+width/2+","+(config_obj.frameHeight/2-height)+")");
		}


    }
    dom.setAttribute("style", "fill:" + config_obj.color);

    let container = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
    );
    container.append(dom)
    return container;
}
