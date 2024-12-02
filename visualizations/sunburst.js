
const MARGIN = { top: 50, right: 50, bottom: 50, left: 100 };
// El código de esta visualización está basado en el ejemplo de Mike Bostock,
// disponible en https://observablehq.com/@d3/zoomable-sunburst

function getSunburstHierarchy(data) {
  let root = {};

  data.forEach(function(d) {
    ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"].forEach(region => {
      if (!root[region]) {
        root[region] = {};
      }

      if (!root[region][d.Genre]) {
        root[region][d.Genre] = 0;
      }

      root[region][d.Genre] += +d[region];
    });
  });

  root = {name: "root", children: Object.entries(root).map(([region, genres]) => {
      return {
        name: region,
        children: Object.entries(genres).map(([genre, value]) => {
          return {
            name: genre,
            value: value
          };
        }),
      };
    })};

  return root;
}

function createSunburst(data) {

  console.log(data);

  const SVG1 = d3.select("#vis-1").append("svg");
  const width = 600;
  const height = 600;
  const radius = width / 6;

  const color = d3.scaleOrdinal(d3.quantize(d3.scaleSequential(d3.interpolateRainbow), data.children.length + 1));

  const hierarchy = d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);
  const root = d3.partition()
    .size([2 * Math.PI, hierarchy.height + 1])
    (hierarchy);
  root.each(d => d.current = d);

  let scales = {};

  root.each(node => {
    if (node.depth == 1) {
      const values = node.children.map(child => child.value);
      const min = Math.min(...values);
      const max = Math.max(...values);
      console.log(node.data.name);
      console.log(min);
      console.log(max);
      scales[node.data.name] = d3.scaleLinear().domain([min, max]).range([0.2, 0.9]);
    }
  });

  const arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

  const svg = SVG1
    .attr("width", width + MARGIN.left + MARGIN.right)
    .attr("height", height + MARGIN.top + MARGIN.bottom)
    .attr("viewBox", [-width / 2, -height / 2, width, width])
    .style("font", "10px sans-serif");

  const path = svg.append("g")
    .selectAll("path")
    .data(root.descendants().slice(1))
    .join("path")
    .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
    .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.9 : scales[d.parent.data.name](d.value)) : 0)
    .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")

    .attr("d", d => arc(d.current));

  path.filter(d => d.children)
    .style("cursor", "pointer")
    .on("click", clicked);

  const format = d3.format(",d");
  path.append("title")
    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

  const label = svg.append("g")
    .attr("pointer-events", "none")
    .attr("text-anchor", "middle")
    .style("user-select", "none")
    .selectAll("text")
    .data(root.descendants().slice(1))
    .join("text")
    .attr("dy", "0.35em")
    .attr("fill-opacity", d => +labelVisible(d.current))
    .attr("transform", d => labelTransform(d.current))
    .text(d => d.data.name);

  const parent = svg.append("circle")
    .datum(root)
    .attr("r", radius)
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .on("click", clicked);

  function clicked(event, p) {
    parent.datum(p.parent || root);

    root.each(d => d.target = {
      x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
      y0: Math.max(0, d.y0 - p.depth),
      y1: Math.max(0, d.y1 - p.depth)
    });

    const t = svg.transition().duration(750);

    path.transition(t)
      .tween("data", d => {
        const i = d3.interpolate(d.current, d.target);
        return t => d.current = i(t);
      })
      .filter(function(d) {
        return +this.getAttribute("fill-opacity") || arcVisible(d.target);
      })
      .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.9 : scales[d.parent.data.name](d.value)) : 0)
      .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none")

      .attrTween("d", d => () => arc(d.current));

    label.filter(function(d) {
      return +this.getAttribute("fill-opacity") || labelVisible(d.target);
    }).transition(t)
      .attr("fill-opacity", d => +labelVisible(d.target))
      .attrTween("transform", d => () => labelTransform(d.current));
  }

  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    const y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
}

export { createSunburst, getSunburstHierarchy };