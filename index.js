console.clear();

var n = 5, // number of layers
  m = 200, // number of samples per layer
  k = 10; // number of bumps per layer

var stack = d3.stack().keys(d3.range(n)).offset(d3.stackOffsetNone);


var layers = stack(
  d3.transpose(
    d3.range(n).map(() => bumps(m, k))
  )
);
console.log(layers)

var svg = d3.select("svg");
var width = +svg.attr("width");
var height = +svg.attr("height");

var x = d3
  .scaleLinear()
  .domain([0, m - 1])
  .range([0, width]);

var y = d3
  .scaleLinear()
  .domain([d3.min(layers, stackMin), d3.max(layers, stackMax)])
  .range([height, 0]);

var z = d3.interpolateReds;

var area = d3
  .area()
  .x((d,i) => x(i))
  .y0(d => y(d[0]))
  .y1(d => y(d[1]))

svg
  .selectAll("path")
  .data(layers)
  .enter()
  .append("path")
  .attr("d", area)
  //.attr("fill", function() { return z(Math.random()); });
  .attr("fill", (d, i) => z(0.6 + ((0.8 - 0.6) / (n - 1)) * i))

function stackMax(layer) {
  return d3.max(layer, (d) => d[1]);
}

function stackMin(layer) {
  return d3.min(layer, (d) => d[0]);
}

var isStop = false;
function stop() {
  isStop = true;
}
function start() {
  isStop = false;
  transition();
}

var delay = (s) => new Promise((resolve) => setTimeout(resolve, s * 1000));

async function transition() {
  var t;
  const _layers = stack(
    d3.transpose(Array.from({ length: n }, () => bumps(m, k)))
  );
  y.domain([
    d3.min(_layers, (l) => d3.min(l, (d) => d[0])),
    d3.max(_layers, (l) => d3.max(l, (d) => d[1]))
  ]);
  d3.selectAll("path").data(_layers).transition().duration(450).attr("d", area);

  if (!isStop) {
    await delay(0.3);
    transition();
  }
}

function bumps(n, m) {
  var a = [],
    i;
  for (i = 0; i < n; ++i) a[i] = 0;
  for (i = 0; i < m; ++i) bump(a, n);
  return a;
}

function bump(a, n) {
  var x = 1 / (0.1 + Math.random()),
    y = 2 * Math.random() - 0.5,
    z = 10 / (0.1 + Math.random());
  for (var i = 0; i < n; i++) {
    var w = (i / n - y) * z;
    a[i] += x * Math.exp(-w * w);
  }
}
