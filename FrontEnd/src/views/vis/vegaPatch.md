# Patch

In order to make vega-lite functions properly, I modified its dependency vega. I write this document to record the modified part for future maintainance's convenience.

At `node_modules/vega-scenegraph/src/SVGRenderer.js` modify function `initialize()`. Modify `this._svg = domChild(el, 0, 'svg', svgns);` to  `this._svg = domChild(el, 0, 'g', svgns);` to enable vegaEmbed can mount visualization result on svg directly.

At `node_modules/vega-scenegraph/src/Handler.js` modify function `handleTooltip()`. Comment `resolveItem()` to make hover pop out for line charts works consistently.
