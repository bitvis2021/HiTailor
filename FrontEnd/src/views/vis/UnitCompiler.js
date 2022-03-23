
export function UnitCompiler() {

}
/*
data array:
{
	value
	position
}
*/
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

			color: color(data_array[i].polarValue),
			size: size(data_array[i].mappedValue),
			height: height(data_array[i].mappedValue),
			width: width(data_array[i].mappedValue),

			xOffset: xOffset(data_array[i].value),
			yOffset: yOffset(data_array[i].value),

			opacity: opacity(data_array[i].mappedValue),

			frameHeight: data_array[i].position.height,
			frameWidth: data_array[i].position.width,
			value: data_array[i].value
		}
		data_array[i].dom = this.GetUnitDom(generateConfig);
	}
	return data_array;
}
function reverseColor(color_hex) {
	color_hex = '0x' + color_hex.replace(/#/g, '');
	let str = '000000' + (0xFFFFFF - color_hex).toString(16);
	return '#' + str.substring(str.length - 6, str.length);
}
export function getColorFunction(color_hex) {
	// https://observablehq.com/@d3/sequential-scales
	let colorFunc
	colorFunc = d3.interpolateRgbBasis([reverseColor(color_hex), "white", color_hex]);
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
	let polarMap = false;
	if (min < 0) {
		polarMap = true;
	}

	let y = scaleFunction_func;

	for (let i = 0; i < data_array.length; i++) {
		const element = data_array[i];
		let x = (Number(element.value) - min) / baseLine;
		data_array[i].mappedValue = y(x);
		data_array[i].polarValue = y(x);
		if (polarMap = true) {
			if (element.value > 0) {
				let x = (Number(element.value)) / max;
				data_array[i].polarValue = y(x) * 0.5 + 0.5;
			}
			else {
				let x = -(Number(element.value)) / min;
				data_array[i].polarValue = y(x) * 0.5;
			}
		}
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
			dom.removeAttribute("points");
			dom.setAttribute("points", "0," + (- config_obj.height) + " 0," + config_obj.height + " " + config_obj.width * sq32 * 2 + ",0");
			dom.setAttribute("transform", "translate(" + (config_obj.xOffset - config_obj.frameWidth / 2) + "," + (-config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "top") {
			dom.removeAttribute("points");
			dom.setAttribute("points", "0," + config_obj.height * sq32 * 2 + " " + -config_obj.width * sq32 + ",0" + " " + config_obj.width * sq32 + ",0");
			dom.setAttribute("transform", "translate(" + config_obj.xOffset + "," + (-config_obj.yOffset - config_obj.frameHeight / 2) + ")");
		}
		else if (config_obj.align == "right") {
			dom.removeAttribute("points");
			dom.setAttribute("points", "0,0 " + config_obj.width * sq32 * 2 + "," + (- config_obj.height) + " " + config_obj.width * sq32 * 2 + "," + config_obj.height);
			dom.setAttribute("transform", "translate(" + (config_obj.xOffset + config_obj.frameWidth / 2 - config_obj.width * sq32 * 2) + "," + (-config_obj.yOffset) + ")");
		}
		else if (config_obj.align == "bottom") {
			dom.removeAttribute("points");
			dom.setAttribute("points", "0," + -config_obj.height * sq32 * 2 + " " + -config_obj.width * sq32 + ",0" + " " + config_obj.width * sq32 + ",0");
			dom.setAttribute("transform", "translate(" + config_obj.xOffset + "," + (-config_obj.yOffset + config_obj.frameHeight / 2) + ")");
		}

	}

	dom.setAttribute("style", "fill:" + config_obj.color);
	dom.setAttribute("opacity", config_obj.opacity);

	// vg-tooltip-element
	dom.addEventListener("mousemove", (event) => {

		document.getElementById("unit-tooltip-element").childNodes[0].childNodes[0].childNodes[1].textContent = config_obj.value;
		document.getElementById("unit-tooltip-element").setAttribute("class", "vg-tooltip visible light-theme");
		document.getElementById("unit-tooltip-element").setAttribute("style", "top:" + (event.clientY + 10) + "px;" + "left:" + (event.clientX + 10) + "px;");
	})
	dom.addEventListener("mouseout", () => {
		document.getElementById("unit-tooltip-element").removeAttribute("class");
		document.getElementById("unit-tooltip-element").setAttribute("class", "vg-tooltip");
	})

	let container = document.createElementNS(
		"http://www.w3.org/2000/svg",
		"g"
	);
	container.append(dom)
	return container;
}
