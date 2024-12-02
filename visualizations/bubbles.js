const MARGIN = { top: 25, right: 25, bottom: 25, left: 25 };

// El código de esta visualización está basado en el ejemplo de Ken Snyder,
// disponible en https://codepen.io/kendsnyder/pen/vPmQbY
function getBubblesHierarchy(data, market) {
  let children = [];
  data.forEach(function(d) {
    let value = 0;
    switch (market) {
      case 'NA':
        value = +d.NA_Sales;
        break;
      case 'EU':
        value = +d.EU_Sales;
        break;
      case 'JP':
        value = +d.JP_Sales;
        break;
      case 'Other':
        value = +d.Other_Sales;
        break;
      case 'Global':
        value = +d.Global_Sales;
        break;
    }
    children.push({name: d.Name, platform: d.Platform, value: value});
  });
  return {children: children};
}

function createBubbles(data, numBubbles) {
  let dataCopy = JSON.parse(JSON.stringify(data));
  dataCopy['children'] = dataCopy["children"].slice(0, numBubbles);

  let maxValue = Math.max(...dataCopy.children.map(d => d.value));
  let minValue = Math.min(...dataCopy.children.map(d => d.value));
  let colorScale = d3.scaleLog()
    .domain([minValue, maxValue])
    .range(["#ff0000", "#0000ff"]);

  let diameter = 600;
  let bubble = d3.pack()
    .size([diameter, diameter])
    .padding(0);

  d3.select('#vis-3').html("");

  const SVG3 = d3.select('#vis-3')
    .append("g")
    .style("display", "flex")
    .append("svg")
    .attr('viewBox','0 0 ' + (diameter + MARGIN.right + MARGIN.left) + ' ' + (diameter + MARGIN.top + MARGIN.bottom))
    .attr('width', diameter + MARGIN.right + MARGIN.left)
    .attr('height', diameter + MARGIN.top + MARGIN.bottom)
    .attr('class', 'chart-svg');

  let root = d3.hierarchy(dataCopy)
    .sum(function(d) { return d.value; });

  bubble(root);

  let minRadius = d3.min(root.children, d => d.r);
  let maxRadius = d3.max(root.children, d => d.r);
  let fontSizeScale = d3.scaleLinear()
    .domain([minRadius, maxRadius])
    .range([0.3 * minRadius, 0.3 * maxRadius]);

  let tooltip = d3.select("body")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", "fit-content")
    .style("overflow-wrap", "break-word")
    .style("text-wrap", "wrap");

  let nodes = SVG3.selectAll('.node')
    .data(root.children)
    .join(
      enter => {
        const g_node = enter
          .append('g')
          .attr('class', 'node')

        g_node
          .attr('transform', function(d) { return 'translate(' + d.x + ' ' + d.y + ')'; })
          .append("circle")
          .attr("r", function(d) { return d.r; })
          .style("fill", d => colorScale(d.data.value));

        g_node.append("text")
          .attr("class", "label")
          .attr("dy", "0.2em")
          .style("text-anchor", "middle")
          .style('font-family', 'Roboto')
          .style('font-size', d => fontSizeScale(d.r))
          .text(d => truncate(d.data.name))
          .style("fill", "#ffffff")
          .style('pointer-events', 'none');

        g_node.append("text")
          .attr("class", "value")
          .attr("dy", "1.3em")
          .style("text-anchor", "middle")
          .style('font-family', 'Roboto')
          .style('font-weight', '100')
          .style('font-size', d => fontSizeScale(d.r))
          .text(d => d.data.value)
          .style("fill", "#ffffff")
          .style('pointer-events', 'none');

        g_node
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave);
    }
    );
  function mouseover(event, d) {
    tooltip
      .style("opacity", 1);
    d3.select(this)
      .select('circle')
      .style("stroke", "black")
      .style("stroke-width", 3)
  }

  function mousemove(event, d) {
    tooltip
      .html(d.data.name + "<br>" + "(" + d.data.platform + ")" + "<br>" + d.data.value)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY + 10) + "px");
  }

  function mouseleave(event, d) {
    tooltip
      .style("opacity", 0);
    d3.select(this)
      .select('circle')
      .style("stroke", "none")
  }

  function truncate(label) {
    const max = 11;
    if (label.length > max) {
      label = label.slice(0, max) + '...';
    }
    return label;
  }
}

export { getBubblesHierarchy, createBubbles };