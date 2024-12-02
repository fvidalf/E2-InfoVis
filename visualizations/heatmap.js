const MARGIN = { top: 50, right: 50, bottom: 50, left: 100 };

// El código de esta visualización está basado en el ejemplo de @holtzy en GitHub,
// disponible en https://d3-graph-gallery.com/graph/heatmap_style.html

function getPlatforms(data) {
  let platforms = [];
  data.forEach(function(d) {
    if (!platforms.includes(d.Platform)) {
      platforms.push(d.Platform);
    }
  });
  return platforms;
}

function getGenres(data) {
  let genres = [];
  data.forEach(function(d) {
    if (!genres.includes(d.Genre)) {
      genres.push(d.Genre);
    }
  });
  return genres;
}

function getSquares(data) {

  let sales = {};
  let platforms = getPlatforms(data);
  let genres = getGenres(data);
  platforms.forEach(function(platform) {
    sales[platform] = {};
    genres.forEach(function(genre) {
      sales[platform][genre] = 0;
    });
  });

  data.forEach(function(d) {
    sales[d.Platform][d.Genre] += +d.Global_Sales;
  });

  let salesArray = [];
  for (let platform in sales) {
    for (let genre in sales[platform]) {
      salesArray.push([platform, genre, sales[platform][genre]]);
    }
  }
  return { salesArray, platforms, genres };
}

function createHeatmap(squares) {

  console.log(squares);
  let data = squares.salesArray;
  let platforms = squares.platforms;
  let genres = squares.genres;

  const width = 800;
  const height = 400;

  const SVG2 = d3.select("#vis-2")
    .append("g")
    .style("display", "flex")
    .append("svg")
    .attr("width", width + MARGIN.left + MARGIN.right)
    .attr("height", height + MARGIN.top + MARGIN.bottom)
    .append("g")
    .attr("transform", "translate(" + MARGIN.left + "," + MARGIN.top + ")");

  let x = d3.scaleBand()
    .range([ 0, width ])
    .domain(platforms)
    .padding(0.05);
  SVG2.append("g")
    .style("font-size", 10)
    .style("fill", "black")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0))
    .select(".domain").remove();

  let y = d3.scaleBand()
    .range([ height, 0 ])
    .domain(genres)
    .padding(0.05);
  SVG2.append("g")
    .style("font-size", 10)
    .call(d3.axisLeft(y).tickSize(0))
    .select(".domain").remove()

  let tooltip = d3.select("#vis-2")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("position", "relative")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("width", "fit-content")
    .style("overflow-wrap", "break-word")
    .style("text-wrap", "wrap");
  let mouseover = function(d) {
    tooltip
      .style("opacity", 1)
    d3.select(this)
      .style("stroke", "black")
      .style("opacity", 1)
  }
  let mousemove = function(event, d) {
    let coordinates = d3.pointer(event);
    console.log(coordinates);
    tooltip
      .html(d[2].toFixed(2))
      .style("left", (coordinates[0] + MARGIN.left + 20) + "px")
      .style("top", (coordinates[1] - height - MARGIN.top - 20) + "px")
  }
  let mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
    d3.select(this)
      .style("stroke", "none")
      .style("opacity", 0.8)
  }

  let color = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[2])])
    .range(["white", "darkslateblue"]);

  SVG2
    .selectAll()
    .data(data)
    .join("rect")
    .attr("x", d => x(d[0]))
    .attr("y", d => y(d[1]))
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", d => color(d[2]))
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
}

export { getSquares, createHeatmap };