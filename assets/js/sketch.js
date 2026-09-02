p5.disableFriendlyErrors = true;

const CONFIG = {
  nodeCount: 64,
  orbitCount: 3,
  connectionDistance: 155,
  depth: 520,
  seed: 1402
};

let nodes = [];
let t = 0;
let reducedMotion = false;

function setup() {
  const canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent('p5-container');
  pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
  frameRate(60);
  randomSeed(CONFIG.seed);
  noiseSeed(CONFIG.seed);
  reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  initNodes();
}

function initNodes() {
  nodes = [];
  for (let i = 0; i < CONFIG.nodeCount; i++) {
    nodes.push({
      angle: random(TWO_PI),
      radius: random(80, Math.min(width, height) * 0.42),
      z: random(-CONFIG.depth, CONFIG.depth),
      speed: random(0.0012, 0.0038) * (random() > 0.5 ? 1 : -1),
      phase: random(TWO_PI),
      size: random(2.2, 5.2)
    });
  }
}

function draw() {
  clear();
  if (!reducedMotion) t += 0.012;

  const theme = document.documentElement.dataset.theme || 'dark';
  const dark = theme !== 'light';
  const main = dark ? [6, 182, 212] : [8, 145, 178];
  const second = dark ? [16, 185, 129] : [14, 165, 233];
  const alphaLine = dark ? 52 : 64;
  const alphaPoint = dark ? 190 : 170;

  rotateX(-0.18 + Math.sin(t * 0.35) * 0.035);
  rotateY(t * 0.10);
  rotateZ(Math.sin(t * 0.22) * 0.025);

  const pts = nodes.map((n, i) => {
    const wobble = Math.sin(t * 1.7 + n.phase) * 18;
    const a = n.angle + t * n.speed * 160;
    return {
      x: Math.cos(a) * (n.radius + wobble),
      y: Math.sin(a * 0.93) * (n.radius * 0.58 + wobble * 0.5),
      z: n.z + Math.sin(t + n.phase) * 60,
      size: n.size,
      i
    };
  });

  blendMode(ADD);
  strokeWeight(1);
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const dz = pts[i].z - pts[j].z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const limit = CONFIG.connectionDistance * CONFIG.connectionDistance;
      if (d2 < limit) {
        const a = (1 - d2 / limit) * alphaLine;
        stroke(main[0], main[1], main[2], a);
        line(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
      }
    }
  }

  noFill();
  for (let k = 0; k < CONFIG.orbitCount; k++) {
    push();
    rotateX(HALF_PI + k * 0.55 + t * (0.08 + k * 0.015));
    rotateZ(t * (0.13 + k * 0.03));
    stroke(k % 2 ? second[0] : main[0], k % 2 ? second[1] : main[1], k % 2 ? second[2] : main[2], dark ? 42 : 48);
    strokeWeight(1.2);
    ellipse(0, 0, 380 + k * 86, 380 + k * 86, 96);
    pop();
  }

  noStroke();
  for (const p of pts) {
    push();
    translate(p.x, p.y, p.z);
    const pulse = 1 + Math.sin(t * 2.5 + p.i) * 0.22;
    fill(main[0], main[1], main[2], alphaPoint);
    sphere(p.size * pulse, 10, 8);
    pop();
  }

  push();
  rotateX(t * 0.45);
  rotateY(t * 0.7);
  stroke(second[0], second[1], second[2], dark ? 145 : 130);
  strokeWeight(1.4);
  noFill();
  box(86);
  pop();

  blendMode(BLEND);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initNodes();
}
