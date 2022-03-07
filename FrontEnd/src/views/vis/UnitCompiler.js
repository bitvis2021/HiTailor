
export function UnitCompiler() {

}

UnitCompiler.GetUnits = function (data_array, config) {
	let [max, min] = findMaxMin(data_array);

	// unitView => config => remap to each array => GetUnitDom
	data_array = remapValue(data_array, max, min, GetScaleFunction(config.scale));

	let BaseLine = findLengthBaseLine(data_array);
	let lengthBaseLine = BaseLine * config.relativeSize / 2; // size must exist
	let height = (value) => BaseLine * 0.3;
	let width = (value) => BaseLine * 0.3;
	let size = (value) => lengthBaseLine * 0.8;
	let yOffset = (value) => 0;
	let xOffset = (value) => 0;

	let opacity = (value) => 1;

	let color = (value) => config.color;

	let mapLength = (value) => value * lengthBaseLine;
	if (config.encodings.size) {
		size = mapLength;
		height = mapLength;
		width = mapLength;
	}
	if (config.encodings.height) {
		height = mapLength;
	}
	if (config.encodings.width) {
		width = mapLength;
	}

	if (config.encodings.xOffset) {
		xOffset = (originValue) => originValue / (max - min) * lengthBaseLine;
	}
	if (config.encodings.yOffset) {
		yOffset = (originValue) => originValue / (max - min) * 0.5 * lengthBaseLine;
	}


	if (config.encodings.color) {
		color = getColorFunction(color());
	}

	if (config.encodings.opacity) {
		opacity = (value) => value;
	}

	for (let i = 0; i < data_array.length; i++) {
		let generateConfig = {
			shape: config.shape,
			align: config.align,

			color: color(data_array[i].value),
			size: size(data_array[i].value),
			height: height(data_array[i].value),
			width: width(data_array[i].value),

			xOffset: xOffset(data_array[i].originValue),
			yOffset: yOffset(data_array[i].originValue),

			opacity: opacity(data_array[i].value),

			frameHeight: data_array[i].position.height,
			frameWidth: data_array[i].position.width,
		}
		console.log(d3.interpolateTurbo(data_array[i].value));
		data_array[i].dom = this.GetUnitDom(generateConfig);
	}
	return data_array;
}

function getColorFunction(color_hex) {
	let colorFunc
	let rgb = hexToRgb(color_hex);
	if (!rgb || (rgb.b == rgb.g && rgb.b == rgb.r)) {
		return d3.interpolateGreys;
	}
	if (rgb.b > rgb.r && rgb.b > rgb.g) {
		colorFunc = d3.interpolateTurbo;
	}
	else if (rgb.r > rgb.b && rgb.r > rgb.g) {
		colorFunc = d3.interpolateWarm;
	}
	else if (rgb.g > rgb.r && rgb.g > rgb.b) {
		colorFunc = d3.interpolateGreens;
	}
	return colorFunc;
}


function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
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
	if (scaleType_str == "linear" || !scaleType_str) {
		return x => 0.8 * x + 0.2;
	}
	else if (scaleType_str == "log") {
		return x => Math.log(x + 1) + (1 - Math.log(2))
	}
	else if (scaleType_str == "sqrt") {
		return x => GetScaleFunction("linear")(Math.sqrt(x));
	}
	else if (scaleType_str == "pow") {
		return x => GetScaleFunction("linear")(x * x);
	}
}

function remapValue(data_array, max, min, scaleFunction_func) {
	let baseLine = max - min;

	let y = scaleFunction_func;

	for (let i = 0; i < data_array.length; i++) {
		const element = data_array[i];
		let x = (Number(element.value) - min) / baseLine;
		console.log("remap val:", y(x), "origin:", x, "baseline:", baseLine);
		data_array[i].originValue = Number(element.value);
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
}
*/
UnitCompiler.GetUnitDom = function (config_obj) {
	let dom;

	// set length channel
	if (config_obj.shape == 'circle') {
		dom = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"circle"
		);
		dom.setAttribute("r", config_obj.size);
		let height = config_obj.size;
		let width = config_obj.size;
		if (config_obj.align == "middle") {
			dom.setAttribute("transform", "translate(" + config_obj.xOffset + "," + (-config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "left") {
			dom.setAttribute("transform", "translate(" + (config_obj.xOffset - config_obj.frameWidth / 2 + config_obj.size) + "," + (-config_obj.yOffset) + ")");

		}
		else if (config_obj.align == "top") {
			dom.setAttribute("transform", "translate(" + config_obj.xOffset + "," + (-config_obj.frameHeight / 2 + config_obj.size - config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "right") {
			dom.setAttribute("transform", "translate(" + (config_obj.frameWidth / 2 - width + config_obj.xOffset) + "," + config_obj.yOffset + ")");
		}
		else if (config_obj.align == "bottom") {
			dom.setAttribute("transform", "translate(" + config_obj.xOffset + "," + (config_obj.frameHeight / 2 - height + config_obj.yOffset) + ")");
		}

	}
	else if (config_obj.shape == "square") {
		dom = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"rect"
		);

		dom.setAttribute("height", config_obj.height * 2);
		dom.setAttribute("width", config_obj.width * 2);

		let height = dom.getAttribute("height");
		let width = dom.getAttribute("width");

		if (config_obj.align == "middle") {
			dom.setAttribute("transform", "translate(" + (config_obj.xOffset - width / 2) + "," + (-height / 2 - config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "left") {
			dom.setAttribute("transform", "translate(" + (config_obj.xOffset - config_obj.frameWidth / 2) + "," + (-height / 2 + config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "top") {
			dom.setAttribute("transform", "translate(" + (-config_obj.xOffset - width / 2) + "," + (-config_obj.frameHeight / 2 + config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "right") {
			dom.setAttribute("transform", "translate(" + (config_obj.frameWidth / 2 - width - config_obj.xOffset) + "," + (-height / 2 + config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "bottom") {
			dom.setAttribute("transform", "translate(" + (-config_obj.xOffset - width / 2) + "," + (config_obj.frameHeight / 2 - height - config_obj.yOffset) + ")");
		}

	}
	else if (config_obj.shape == "triangle") {
		dom = document.createElementNS(
			"http://www.w3.org/2000/svg",
			"polygon"
		);
		let sq32 = Math.sqrt(3) / 2
		dom.setAttribute("points", "0," + (-sq32 * config_obj.height) + " " + (-sq32 * config_obj.width) + "," + sq32 * config_obj.height + " " + (sq32 * config_obj.width) + "," + sq32 * config_obj.height)
		if (config_obj.align == "middle") {
			dom.setAttribute("transform", "translate(" + config_obj.xOffset + "," + (-config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "left") {

		}
		else if (config_obj.align == "top") {

		}
		else if (config_obj.align == "right") {

		}
		else if (config_obj.align == "bottom") {

		}

	}



	dom.setAttribute("style", "fill:" + config_obj.color);
	dom.setAttribute("opacity", config_obj.opacity);
	let container = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"g"
	);
	container.append(dom)
	return container;
}
