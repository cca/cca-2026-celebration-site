/**
 * Generate inner-edge clip paths for frame SVGs.
 *
 * Each frame path traces a closed strip shape. We:
 * 1. Flatten curves to dense points with transforms applied
 * 2. Split each path into two halves using two-turnaround splitting
 * 3. Try both axes, pick the split with best separation × balance
 * 4. Pick the inner half (closer to frame center)
 * 5. Classify position based on inner leg geometry
 * 6. Combine all inner legs clockwise into a clip path
 * 7. Synthesize missing sides for 3-path frames
 * 8. Bridge corner gaps between sides
 *
 * Run: node scripts/generate-frame-clips.mjs
 */
import fs from "node:fs";
import SvgPath from "svgpath";

function flattenPath(d, matrix, samplesPerCurve = 12) {
  const path = SvgPath(d).matrix(matrix).abs().unshort();
  const points = [];
  let curX = 0, curY = 0;

  path.iterate((seg) => {
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
      const [, x1, y1, x2, y2, x3, y3] = seg;
      for (let i = 1; i <= samplesPerCurve; i++) {
        const t = i / samplesPerCurve;
        const mt = 1 - t;
        points.push([
          mt*mt*mt*curX + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x3,
          mt*mt*mt*curY + 3*mt*mt*t*y1 + 3*mt*t*t*y2 + t*t*t*y3,
        ]);
      }
      curX = x3; curY = y3;
    }
  });

  return points;
}

/**
 * Split a closed strip path into two halves at the min/max of the given axis.
 * Returns [half1, half2] where each follows one edge of the strip.
 */
function twoTurnaroundSplit(points, axis) {
  let minIdx = 0, maxIdx = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i][axis] < points[minIdx][axis]) minIdx = i;
    if (points[i][axis] > points[maxIdx][axis]) maxIdx = i;
  }

  // Ensure we go from the lower index to the higher index for half1
  let startIdx = minIdx, endIdx = maxIdx;
  if (startIdx > endIdx) { const tmp = startIdx; startIdx = endIdx; endIdx = tmp; }

  const half1 = points.slice(startIdx, endIdx + 1);
  const half2 = [...points.slice(endIdx), ...points.slice(0, startIdx + 1)];

  return [half1, half2];
}

/**
 * Extract inner edge of an L-shaped or complex path using distance from frame center.
 * Points closer to center are on the inner edge. Returns the longest contiguous
 * run of "inner" points.
 */
function extractInnerByDistance(points, centerX, centerY) {
  const n = points.length;
  const dists = points.map(p => Math.hypot(p[0] - centerX, p[1] - centerY));
  const sortedDists = [...dists].sort((a, b) => a - b);
  const threshold = sortedDists[Math.floor(n / 2)];

  // Find the longest contiguous run of inner points (below median distance).
  // Check wraparound since path is closed.
  let bestStart = 0, bestLen = 0;
  for (let start = 0; start < n; start++) {
    if (dists[start] >= threshold) continue;
    if (bestStart > 0 && start >= bestStart && start < bestStart + bestLen) continue;
    let len = 0;
    for (let j = 0; j < n; j++) {
      if (dists[(start + j) % n] < threshold) len++;
      else break;
    }
    if (len > bestLen) { bestLen = len; bestStart = start; }
  }

  if (bestLen === 0) return points;
  const result = [];
  for (let i = 0; i < bestLen; i++) {
    result.push(points[(bestStart + i) % n]);
  }
  return result;
}

/**
 * Ray-segment intersection. Returns { dist, point } or null.
 */
function raySegIntersect(ox, oy, dx, dy, x1, y1, x2, y2) {
  const sx = x2 - x1, sy = y2 - y1;
  const denom = dx * sy - dy * sx;
  if (Math.abs(denom) < 1e-10) return null;
  const t = ((x1 - ox) * sy - (y1 - oy) * sx) / denom;
  const u = ((x1 - ox) * dy - (y1 - oy) * dx) / denom;
  if (t > 0.1 && u >= 0 && u <= 1) {
    return { dist: t, point: [ox + dx * t, oy + dy * t] };
  }
  return null;
}

/**
 * Ray-rectangle intersection.
 */
function rayRectIntersect(ox, oy, dx, dy, x0, y0, w, h) {
  const edges = [
    [x0, y0, x0 + w, y0],
    [x0 + w, y0, x0 + w, y0 + h],
    [x0 + w, y0 + h, x0, y0 + h],
    [x0, y0 + h, x0, y0],
  ];
  let closest = Infinity, hit = null;
  for (const [x1, y1, x2, y2] of edges) {
    const r = raySegIntersect(ox, oy, dx, dy, x1, y1, x2, y2);
    if (r && r.dist < closest) { closest = r.dist; hit = r.point; }
  }
  return hit;
}

/**
 * Generate clip path for a frame using ray-casting approach.
 * Used for override frames where turnaround split doesn't work.
 */
function rayCastClipPath(filePath) {
  const svg = fs.readFileSync(filePath, "utf-8");
  const vbMatch = svg.match(/viewBox="([^"]+)"/);
  const [minX, minY, width, height] = vbMatch[1].split(/\s+/).map(Number);
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  const pathRegex = /<path\s+d="([^"]+)"[^>]*transform="matrix\(([^)]+)\)"/g;
  const allPaths = [];
  let match;
  while ((match = pathRegex.exec(svg)) !== null) {
    const [, d, matrixStr] = match;
    const matrix = matrixStr.split(/[\s,]+/).map(Number);
    allPaths.push(flattenPath(d, matrix));
  }

  if (allPaths.length === 0) return null;

  const numRays = 720;
  const clipPoints = [];

  for (let i = 0; i < numRays; i++) {
    const angle = (2 * Math.PI * i) / numRays;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    let closest = Infinity, hit = null;

    for (const pts of allPaths) {
      for (let j = 0; j < pts.length - 1; j++) {
        const r = raySegIntersect(centerX, centerY, dx, dy,
          pts[j][0], pts[j][1], pts[j + 1][0], pts[j + 1][1]);
        if (r && r.dist < closest) { closest = r.dist; hit = r.point; }
      }
    }

    if (!hit) {
      hit = rayRectIntersect(centerX, centerY, dx, dy, minX, minY, width, height);
    }
    if (hit) clipPoints.push(hit);
  }

  if (clipPoints.length === 0) return null;

  const r = (n) => Math.round(n * 10) / 10;
  let pathD = `M${r(clipPoints[0][0])} ${r(clipPoints[0][1])}`;
  for (let i = 1; i < clipPoints.length; i++) {
    pathD += ` L${r(clipPoints[i][0])} ${r(clipPoints[i][1])}`;
  }
  pathD += " Z";

  return { viewBox: vbMatch[1], clipPath: pathD, totalPoints: clipPoints.length };
}

function processFrame(filePath) {
  const svg = fs.readFileSync(filePath, "utf-8");
  const vbMatch = svg.match(/viewBox="([^"]+)"/);
  const [minX, minY, width, height] = vbMatch[1].split(/\s+/).map(Number);
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  const pathRegex = /<path\s+d="([^"]+)"[^>]*transform="matrix\(([^)]+)\)"/g;
  const sides = [];
  let match;

  while ((match = pathRegex.exec(svg)) !== null) {
    const [, d, matrixStr] = match;
    const matrix = matrixStr.split(/[\s,]+/).map(Number);
    const points = flattenPath(d, matrix);
    if (points.length < 4) continue;

    const xs = points.map(p => p[0]);
    const ys = points.map(p => p[1]);
    const bboxMinX = Math.min(...xs), bboxMaxX = Math.max(...xs);
    const bboxMinY = Math.min(...ys), bboxMaxY = Math.max(...ys);
    const bboxW = bboxMaxX - bboxMinX;
    const bboxH = bboxMaxY - bboxMinY;

    // For clear strips, use turnaround split along the long axis.
    // For L-shaped / diagonal / ambiguous paths, use distance-from-center.
    const aspectRatio = bboxW / bboxH;
    let bestInnerLeg = null;

    if (aspectRatio > 1.5 || aspectRatio < 1 / 1.5) {
      // Clear strip shape: turnaround split on the long axis
      const axis = aspectRatio > 1.5 ? 0 : 1;
      const perpAxis = 1 - axis;
      const centerPerp = perpAxis === 0 ? centerX : centerY;
      const [half1, half2] = twoTurnaroundSplit(points, axis);
      if (half1.length >= 2 && half2.length >= 2) {
        const avg1 = half1.reduce((s, p) => s + p[perpAxis], 0) / half1.length;
        const avg2 = half2.reduce((s, p) => s + p[perpAxis], 0) / half2.length;
        const dist1 = Math.abs(avg1 - centerPerp);
        const dist2 = Math.abs(avg2 - centerPerp);
        bestInnerLeg = dist1 < dist2 ? [...half1] : [...half2];
      }
    } else {
      // L-shaped, diagonal, or ambiguous: extract inner edge by distance from center
      bestInnerLeg = extractInnerByDistance(points, centerX, centerY);
    }

    if (!bestInnerLeg || bestInnerLeg.length < 2) continue;

    // Classify position AFTER inner leg extraction
    const spanX = bboxW / width;
    const spanY = bboxH / height;
    const legXs = bestInnerLeg.map(p => p[0]);
    const legYs = bestInnerLeg.map(p => p[1]);
    const legCX = legXs.reduce((a, b) => a + b, 0) / legXs.length;
    const legCY = legYs.reduce((a, b) => a + b, 0) / legYs.length;

    let position;
    if (spanX > 0.5 && spanY > 0.5) {
      // Full-frame diagonal: use centroid direction from center
      const dx = legCX - centerX;
      const dy = legCY - centerY;
      if (Math.abs(dx) > Math.abs(dy)) {
        position = dx < 0 ? "left" : "right";
      } else {
        position = dy < 0 ? "top" : "bottom";
      }
    } else if (bboxH > bboxW) {
      // Vertical strip: use inner leg centroid X
      position = legCX < centerX ? "left" : "right";
    } else {
      // Horizontal strip: use inner leg centroid Y
      position = legCY < centerY ? "top" : "bottom";
    }

    sides.push({ position, innerLeg: bestInnerLeg, bboxW, bboxH });
  }

  // Detect and report
  const byPos = {};
  for (const s of sides) {
    if (byPos[s.position]) {
      // Duplicate position — keep the one with more points
      if (s.innerLeg.length > byPos[s.position].innerLeg.length) {
        byPos[s.position] = s;
      }
    } else {
      byPos[s.position] = s;
    }
  }

  const detected = Object.keys(byPos);
  const missing = ["top", "right", "bottom", "left"].filter(p => !byPos[p]);

  // Synthesize missing sides for 3-path frames
  if (missing.length === 1) {
    const missingPos = missing[0];
    // The clockwise order is: top → right → bottom → left
    const cwOrder = ["top", "right", "bottom", "left"];
    const missingIdx = cwOrder.indexOf(missingPos);
    const prevPos = cwOrder[(missingIdx + 3) % 4]; // side before (CCW neighbor)
    const nextPos = cwOrder[(missingIdx + 1) % 4]; // side after (CW neighbor)

    // Get the oriented legs of the neighbors to find their endpoints
    const getOrientedLeg = (pos) => {
      const orderEntry = [
        ["top", 0, true], ["right", 1, true], ["bottom", 0, false], ["left", 1, false],
      ].find(([p]) => p === pos);
      const [, axis, ascending] = orderEntry;
      const pts = [...byPos[pos].innerLeg];
      const first = pts[0][axis], last = pts[pts.length - 1][axis];
      if (ascending ? first > last : first < last) pts.reverse();
      return pts;
    };

    if (byPos[prevPos] && byPos[nextPos]) {
      const prevLeg = getOrientedLeg(prevPos);
      const nextLeg = getOrientedLeg(nextPos);
      // The missing side connects end of prev to start of next
      const startPt = prevLeg[prevLeg.length - 1];
      const endPt = nextLeg[0];
      byPos[missingPos] = {
        position: missingPos,
        innerLeg: [startPt, endPt],
        synthesized: true,
      };
    }
  }

  // Order clockwise: top(L→R), right(T→B), bottom(R→L), left(B→T)
  const orderedSegments = [];
  for (const [pos, axis, ascending] of [
    ["top", 0, true],
    ["right", 1, true],
    ["bottom", 0, false],
    ["left", 1, false],
  ]) {
    if (!byPos[pos]) continue;
    const pts = [...byPos[pos].innerLeg];
    const first = pts[0][axis];
    const last = pts[pts.length - 1][axis];
    if (ascending ? first > last : first < last) pts.reverse();
    orderedSegments.push({ pos, pts });
  }

  // Bridge corner gaps: insert straight line between segments if endpoints are far apart
  const orderedPoints = [];
  for (let i = 0; i < orderedSegments.length; i++) {
    const seg = orderedSegments[i];
    orderedPoints.push(...seg.pts);
  }

  if (orderedPoints.length === 0) return null;

  const r = (n) => Math.round(n * 10) / 10;
  let pathD = `M${r(orderedPoints[0][0])} ${r(orderedPoints[0][1])}`;
  for (let i = 1; i < orderedPoints.length; i++) {
    pathD += ` L${r(orderedPoints[i][0])} ${r(orderedPoints[i][1])}`;
  }
  pathD += " Z";

  return {
    viewBox: vbMatch[1],
    clipPath: pathD,
    totalPoints: orderedPoints.length,
    detected,
    missing,
    synthesized: missing.length === 1 && byPos[missing[0]]?.synthesized,
    pathCount: sides.length,
  };
}

// --- Main ---
const allFrameIds = [];
for (let i = 1; i <= 23; i++) {
  allFrameIds.push(`frame-${String(i).padStart(2, "0")}`);
}

// Skip frames 06 and 08 (2-path, fundamentally different)
const skipIds = new Set(["frame-06", "frame-08"]);

// Frames where turnaround split fails — use ray-casting override
const overrideIds = new Set(["frame-05", "frame-09", "frame-14", "frame-19"]);

const results = {};
let successCount = 0;
let failCount = 0;

for (const frameId of allFrameIds) {
  const filePath = `public/images/scanned-graphics/frames/${frameId}.svg`;
  if (!fs.existsSync(filePath)) {
    console.log(`\n=== ${frameId} === MISSING FILE`);
    continue;
  }

  console.log(`\n=== ${frameId} ===`);

  if (skipIds.has(frameId)) {
    console.log("  SKIPPED (2-path frame)");
    continue;
  }

  let result;
  if (overrideIds.has(frameId)) {
    console.log("  Using ray-cast override");
    result = rayCastClipPath(filePath);
    if (result) {
      result.detected = ["ray-cast"];
      result.missing = [];
      result.synthesized = false;
      result.pathCount = 0;
    }
  } else {
    result = processFrame(filePath);
  }

  if (!result) {
    console.log("  FAILED — no clip points generated");
    failCount++;
    continue;
  }

  console.log(`  Paths: ${result.pathCount}`);
  if (result.detected) console.log(`  Detected sides: ${result.detected.join(", ")}`);
  if (result.missing?.length > 0) {
    console.log(`  Missing sides: ${result.missing.join(", ")}${result.synthesized ? " (synthesized)" : ""}`);
  }
  console.log(`  Total clip points: ${result.totalPoints}`);

  results[frameId] = result;
  successCount++;

  // Write debug SVG
  const frameSvg = fs.readFileSync(filePath, "utf-8");
  const framePaths = frameSvg.match(/<path[^>]*\/>/g)?.join("\n") || "";

  const debugSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${result.viewBox}" style="background:#f5f5f5">
  <path d="${result.clipPath}" fill="rgba(0,120,255,0.2)" stroke="blue" stroke-width="1.5"/>
  <g opacity="0.5">${framePaths}</g>
  <path d="${result.clipPath}" fill="none" stroke="red" stroke-width="0.5"/>
</svg>`;
  fs.writeFileSync(`scripts/debug-clip-${frameId}.svg`, debugSvg);
}

console.log(`\n\n=== SUMMARY ===`);
console.log(`Success: ${successCount}  |  Failed: ${failCount}  |  Skipped: ${skipIds.size}`);
console.log(`\nWorking frames: ${Object.keys(results).join(", ")}`);
