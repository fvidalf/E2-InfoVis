
import { createSunburst, getSunburstHierarchy } from "./visualizations/sunburst.js";
import { createHeatmap, getSquares } from "./visualizations/heatmap.js";
import { createBubbles, getBubblesHierarchy } from "./visualizations/bubbles.js";

const DATA_PATH = "/filtered_vgsales.csv";

/*
const SVG2 = d3.select("#vis-2").append("svg");
const SVG3 = d3.select("#vis-3").append("svg");

const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 1000;

SVG2.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG3.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);

*/



// Constantes de tamaños
const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };

d3.csv(DATA_PATH).then(function(data) {

  // Sunburst
  let sunburstRoot= getSunburstHierarchy(data);
  createSunburst(sunburstRoot)

  // Heatmap
  let squares = getSquares(data);
  createHeatmap(squares);

  // Bubbles
  let defaultMarket = 'Global';
  let bubblesRoot = getBubblesHierarchy(data, defaultMarket)
  createBubbles(bubblesRoot, 25);

  let slider = d3.select('#numBubbles');
  slider.on('input', function() {
    createBubbles(bubblesRoot, this.value);
  });

}).catch(function(error) {
  console.log(error);
});