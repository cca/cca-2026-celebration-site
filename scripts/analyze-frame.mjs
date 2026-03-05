/**
 * Analyze frame SVG path structure to understand inner vs outer edges.
 * Run: node scripts/analyze-frame.mjs
 */
import fs from "node:fs";
import SvgPath from "svgpath";

const svg = fs.readFileSync("public/images/scanned-graphics/frames/frame-01.svg", "utf-8");
const vbMatch = svg.match(/viewBox="([^"]+)"/);
const [minX, minY, width, height] = vbMatch[1].split(/\s+/).map(Number);
const centerX = minX + width / 2;
const centerY = minY + height / 2;

console.log(`ViewBox: ${minX} ${minY} ${width} ${height}`);
console.log(`Center: ${centerX}, ${centerY}\n`);

// Extract paths with transforms
const pathRegex = /<path\s+d="([^"]+)"[^>]*transform="matrix\(([^)]+)\)"/g;
let match;
let pathIdx = 0;

while ((match = pathRegex.exec(svg)) !== null) {
  const [, d, matrixStr] = match;
  const [a, b, c, dd, e, f] = matrixStr.split(/[\s,]+/).map(Number);

  console.log(`=== Path ${pathIdx} ===`);
  console.log(`Transform: matrix(${a}, ${b}, ${c}, ${dd}, ${e}, ${f})`);

  // Use svgpath to apply transform and convert to absolute coords
  const transformed = SvgPath(d)
    .matrix([a, b, c, dd, e, f])
    .abs()
    .unshort(); // expand shorthand curves

  // Flatten curves to line segments for analysis
  const flattened = SvgPath(d)
    .matrix([a, b, c, dd, e, f])
    .abs()
    .unshort()
    .iterate((segment, index, x, y) => {
      // Just collecting info
    });

  // Get all segments
  const segments = [];
  transformed.iterate((seg, idx, x, y) => {
    segments.push({ cmd: seg[0], args: seg.slice(1), startX: x, startY: y });
  });

  console.log(`Segments: ${segments.length}`);

  // Sample points along the path by converting curves to points
  const points = [];
  const path2 = SvgPath(d).matrix([a, b, c, dd, e, f]).abs().unshort();
  let curX = 0, curY = 0;

  path2.iterate((seg) => {
    const cmd = seg[0];
    if (cmd === "M") {
      curX = seg[1]; curY = seg[2];
      points.push([curX, curY]);
    } else if (cmd === "L") {
      curX = seg[1]; curY = seg[2];
      points.push([curX, curY]);
    } else if (cmd === "H") {
      curX = seg[1];
      points.push([curX, curY]);
    } else if (cmd === "V") {
      curY = seg[1];
      points.push([curX, curY]);
    } else if (cmd === "C") {
      // Cubic bezier: sample multiple points
      const [, x1, y1, x2, y2, x3, y3] = seg;
      for (let t = 0.25; t <= 1; t += 0.25) {
        const mt = 1 - t;
        const px = mt*mt*mt*curX + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x3;
        const py = mt*mt*mt*curY + 3*mt*mt*t*y1 + 3*mt*t*t*y2 + t*t*t*y3;
        points.push([px, py]);
      }
      curX = x3; curY = y3;
    } else if (cmd === "Z" || cmd === "z") {
      // close path
    }
  });

  // Find min/max to understand bounding box
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  console.log(`Points: ${points.length}`);
  console.log(`X range: ${Math.min(...xs).toFixed(1)} to ${Math.max(...xs).toFixed(1)}`);
  console.log(`Y range: ${Math.min(...ys).toFixed(1)} to ${Math.max(...ys).toFixed(1)}`);

  // Compute distance of each point from frame center
  const dists = points.map(p => Math.sqrt((p[0]-centerX)**2 + (p[1]-centerY)**2));
  const halfLen = Math.floor(points.length / 2);

  // Split points in half — first half and second half
  const firstHalfAvgDist = dists.slice(0, halfLen).reduce((a,b)=>a+b,0) / halfLen;
  const secondHalfAvgDist = dists.slice(halfLen).reduce((a,b)=>a+b,0) / (points.length - halfLen);

  console.log(`First half avg dist from center: ${firstHalfAvgDist.toFixed(1)}`);
  console.log(`Second half avg dist from center: ${secondHalfAvgDist.toFixed(1)}`);
  console.log(`Inner edge is: ${firstHalfAvgDist < secondHalfAvgDist ? "first half" : "second half"}`);

  // Print first few and last few points
  console.log(`First 3 points: ${points.slice(0,3).map(p=>`(${p[0].toFixed(1)},${p[1].toFixed(1)})`).join(" → ")}`);
  console.log(`Mid points: ${points.slice(halfLen-1, halfLen+2).map(p=>`(${p[0].toFixed(1)},${p[1].toFixed(1)})`).join(" → ")}`);
  console.log(`Last 3 points: ${points.slice(-3).map(p=>`(${p[0].toFixed(1)},${p[1].toFixed(1)})`).join(" → ")}`);
  console.log();

  pathIdx++;
}
