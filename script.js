const capabilityContent = {
  verify: {
    kicker: "Verify // Flight software",
    index: "01",
    title: "Correctness under pressure.",
    copy:
      "Flight software taught me to turn complex behavior into something testable.",
    points: [
      "Flight planning and navigation interfaces",
      "Legacy Ada, automated tests, and verification",
    ],
    readoutLabel: "Flight-plan data wait time",
    readoutValue: "-30%",
  },
  coordinate: {
    kicker: "Coordinate // Integration",
    index: "02",
    title: "Interfaces before assumptions.",
    copy:
      "The work gets clearer when code, hardware, requirements, and teams share one map.",
    points: [
      "Interface reviews and cross-team handoffs",
      "Concurrency, runtime, and integration risk",
    ],
    readoutLabel: "Peer reviews completed",
    readoutValue: "50+",
  },
  automate: {
    kicker: "Automate // Engineering tooling",
    index: "03",
    title: "Tools that return time.",
    copy:
      "Good automation should make information easier to inspect, not harder to believe.",
    points: [
      "Requirements tools and AI evaluation",
      "Retrieval, ranking, citations, and search",
    ],
    readoutLabel: "Engineering hours saved",
    readoutValue: "100+",
  },
  simulate: {
    kicker: "Simulate // Robotics",
    index: "04",
    title: "Perception into motion.",
    copy:
      "The best projects cross the line from sensing the world to acting in it.",
    points: [
      "OpenCV, Kalman prediction, and motor control",
      "Foosball rods, players, and ball tracking",
    ],
    readoutLabel: "Vision loop rate",
    readoutValue: "50 Hz",
  },
};

const depthContent = {
  flight: {
    label: "Flight Software",
    title: "Start with the interface, then prove the behavior.",
    copy:
      "In avionics work, I care about the unglamorous things that decide whether a change is trustworthy: timing, shared resources, interface assumptions, and tests that cover failure cases.",
    points: [
      "Read enough of the legacy system that the fix is not just a guess.",
      "Validate message handling against requirements, including failure behavior.",
      "Leave behind tests and clearer review notes for the next engineer.",
    ],
  },
  ai: {
    label: "AI Tooling",
    title: "Use AI where the workflow can still be inspected.",
    copy:
      "I am interested in AI as engineering infrastructure: search, synthesis, evaluation, and task support that makes people faster without making the work harder to verify.",
    points: [
      "Compare sparse and dense retrieval against measurable precision and recall.",
      "Keep generated answers citation-grounded so claims can be inspected.",
      "Treat model output as a useful draft, not a source of authority.",
    ],
  },
  robotics: {
    label: "Robotics",
    title: "Perception and control only matter when they survive integration.",
    copy:
      "The foosball system forced the satisfying kind of engineering tradeoff: vision latency, prediction, actuation, communication, and physical constraints all pulling at the same time.",
    points: [
      "Track a fast-moving ball at 50 Hz and estimate velocity with Kalman filtering.",
      "Coordinate multiple axes through serial commands and homing behavior.",
      "Prototype strategies in simulation before hardware integration.",
    ],
  },
};

const setListItems = (element, items) => {
  element.innerHTML = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    element.appendChild(li);
  });
};

const activateButtons = (buttons, activeButton) => {
  buttons.forEach((button) => {
    const isActive = button === activeButton;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
};

const capabilityButtons = document.querySelectorAll("[data-capability]");
const capabilityKicker = document.getElementById("capability-kicker");
const capabilityIndex = document.getElementById("capability-index");
const capabilityTitle = document.getElementById("capability-title");
const capabilityCopy = document.getElementById("capability-copy");
const capabilityPoints = document.getElementById("capability-points");
const productStage = document.querySelector("[data-product-stage]");
const systemImages = document.querySelectorAll("[data-system-image]");
const motionCanvas = document.querySelector("[data-motion-film]");
const transformGhost = document.querySelector("[data-transform-ghost]");
const transformGrid = document.querySelector("[data-transform-grid]");
const systemHotspots = document.querySelectorAll("[data-system-hotspot]");
const readoutLabel = document.querySelector("[data-readout-label]");
const readoutValue = document.querySelector("[data-readout-value]");
const systemSteps = document.querySelectorAll("[data-system-step]");
const stageClock = document.querySelector("[data-stage-clock]");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const canHoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const root = document.documentElement;
const productConsole = document.querySelector(".product-console");
const systemOrder = ["verify", "coordinate", "automate", "simulate"];
const transformTiles = [];
let activeSystemName = productStage?.dataset.activeSystem || "verify";
let transformTimeout = null;
let systemsFrame = null;
let productConsoleStart = 0;
let productScrollRange = 1;
let motionFilmProgress = 0;
let motionFilmFrame = null;
let motionFilmDpr = 1;
let readoutJumpTimeout = null;

const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
const beatProgress = (progress, start, end) => clamp((progress - start) / (end - start));
const smoothProgress = (value) => value * value * (3 - 2 * value);
const lerp = (from, to, amount) => from + (to - from) * amount;

const getSystemImage = (systemName) =>
  Array.from(systemImages).find((image) => image.dataset.systemImage === systemName);

const buildTransformTiles = () => {
  if (!transformGrid) return;

  const columns = 7;
  const rows = 4;
  transformGrid.style.setProperty("--tile-columns", columns);
  transformGrid.style.setProperty("--tile-rows", rows);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const tile = document.createElement("span");
      const x = columns === 1 ? 50 : (column / (columns - 1)) * 100;
      const y = rows === 1 ? 50 : (row / (rows - 1)) * 100;
      const delay = column * 34 + row * 58;
      const driftX = (column - (columns - 1) / 2) * 9;
      const driftY = (row - (rows - 1) / 2) * 11;

      tile.className = "transform-tile";
      tile.dataset.bgPosition = `${x}% ${y}%`;
      tile.style.setProperty("--tile-delay", `${delay}ms`);
      tile.style.setProperty("--tile-drift-x", `${driftX.toFixed(1)}px`);
      tile.style.setProperty("--tile-drift-y", `${driftY.toFixed(1)}px`);
      tile.style.backgroundSize = `${columns * 100}% ${rows * 100}%`;
      tile.style.backgroundPosition = tile.dataset.bgPosition;
      transformGrid.appendChild(tile);
      transformTiles.push(tile);
    }
  }
};

const stageImageTransform = (fromSystem, toSystem) => {
  if (!productStage || motionQuery.matches || fromSystem === toSystem) return;

  const fromImage = getSystemImage(fromSystem);
  const toImage = getSystemImage(toSystem);
  if (!fromImage || !toImage) return;

  const fromPosition = window.getComputedStyle(fromImage).objectPosition || "50% 50%";
  const toPosition = window.getComputedStyle(toImage).objectPosition || "50% 50%";

  if (transformGhost) {
    transformGhost.style.backgroundImage = `url("${fromImage.currentSrc || fromImage.src}")`;
    transformGhost.style.backgroundPosition = fromPosition;
  }

  transformTiles.forEach((tile) => {
    tile.style.backgroundImage = `url("${toImage.currentSrc || toImage.src}")`;
    tile.style.backgroundPosition = tile.dataset.bgPosition || toPosition;
  });

  productStage.dataset.transitionSystem = toSystem;
  productStage.classList.remove("is-transforming");
  void productStage.offsetWidth;
  productStage.classList.add("is-transforming");

  window.clearTimeout(transformTimeout);
  transformTimeout = window.setTimeout(() => {
    productStage.classList.remove("is-transforming");
    delete productStage.dataset.transitionSystem;
  }, 1500);
};

const resizeMotionFilmCanvas = () => {
  if (!motionCanvas) return;

  const rect = motionCanvas.getBoundingClientRect();
  motionFilmDpr = Math.min(window.devicePixelRatio || 1, 2);
  motionCanvas.width = Math.max(1, Math.round(rect.width * motionFilmDpr));
  motionCanvas.height = Math.max(1, Math.round(rect.height * motionFilmDpr));
};

const drawFilmLine = (ctx, x1, y1, x2, y2, color, width = 1, alpha = 1) => {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
};

const drawFilmPanel = (ctx, x, y, width, height, alpha, flash = 0) => {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.fillStyle = `rgba(6, 18, 18, ${0.4 + flash * 0.24})`;
  ctx.strokeStyle = `rgba(185, 255, 247, ${0.34 + flash * 0.5})`;
  ctx.lineWidth = 1 + flash * 2;
  ctx.shadowColor = "rgba(185, 255, 247, 0.75)";
  ctx.shadowBlur = 10 + flash * 44;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeRect(0, 0, width, height);

  ctx.shadowBlur = 0;
  ctx.strokeStyle = `rgba(185, 255, 247, ${0.14 + flash * 0.36})`;
  ctx.lineWidth = 1;
  for (let line = 0; line < 5; line += 1) {
    const yLine = 9 + line * (height - 18) / 4;
    ctx.beginPath();
    ctx.moveTo(10, yLine);
    ctx.lineTo(width - 10, yLine + Math.sin(line + flash * 8) * 3);
    ctx.stroke();
  }
  ctx.restore();
};

const drawVerifyScene = (ctx, width, height, progress, time, alpha) => {
  if (alpha <= 0.01) return;

  const flight = smoothProgress(beatProgress(progress, 0.02, 0.3));
  const cx = width * lerp(0.78, 0.62, flight);
  const cy = height * lerp(0.34, 0.48, flight);
  const pulse = Math.sin(time * 0.004) * 0.5 + 0.5;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "screen";

  for (let ring = 0; ring < 5; ring += 1) {
    const ringScale = 0.5 + flight * 2.25 + ring * 0.28 + pulse * 0.04;
    ctx.strokeStyle = `rgba(185, 255, 247, ${0.08 + flight * 0.16})`;
    ctx.lineWidth = 1 + flight * 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, width * 0.07 * ringScale, height * 0.036 * ringScale, -0.08, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let ray = 0; ray < 26; ray += 1) {
    const angle = -0.9 + ray * 0.072 + Math.sin(time * 0.0015 + ray) * 0.025;
    const length = width * (0.2 + flight * 0.58 + (ray % 4) * 0.018);
    const start = width * (0.08 + flight * 0.18);
    const shade = ray % 3 === 0 ? "rgba(224, 184, 93, 0.42)" : "rgba(185, 255, 247, 0.34)";
    drawFilmLine(
      ctx,
      cx - Math.cos(angle) * start,
      cy - Math.sin(angle) * start,
      cx + Math.cos(angle) * length,
      cy + Math.sin(angle) * length,
      shade,
      0.55 + flight * 2.4,
      0.18 + flight * 0.4
    );
  }

  const flare = ctx.createRadialGradient(cx, cy, 0, cx, cy, width * (0.08 + flight * 0.34));
  flare.addColorStop(0, `rgba(185, 255, 247, ${0.2 + flight * 0.18})`);
  flare.addColorStop(0.34, `rgba(100, 226, 213, ${0.08 + flight * 0.12})`);
  flare.addColorStop(1, "rgba(100, 226, 213, 0)");
  ctx.fillStyle = flare;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
};

const drawCoordinateScene = (ctx, width, height, progress, time, alpha) => {
  if (alpha <= 0.01) return;

  const glow = smoothProgress(beatProgress(progress, 0.3, 0.44));
  const flashPeak = Math.max(0, 1 - Math.abs(progress - 0.4) / 0.055);
  const blackout = smoothProgress(beatProgress(progress, 0.45, 0.57));
  const flicker = Math.sin(time * 0.045) > 0.22 ? 1 : 0.45;
  const flash = clamp(flashPeak * flicker);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = `rgba(0, 0, 0, ${blackout * 0.62})`;
  ctx.fillRect(0, 0, width, height);

  drawFilmPanel(ctx, width * 0.6, height * 0.22, width * 0.18, height * 0.16, glow, flash);
  drawFilmPanel(ctx, width * 0.78, height * 0.4, width * 0.15, height * 0.13, glow * 0.9, flash * 0.85);
  drawFilmPanel(ctx, width * 0.66, height * 0.62, width * 0.17, height * 0.13, glow * 0.75, flash * 0.65);

  const points = [
    [width * 0.65, height * 0.3],
    [width * 0.86, height * 0.46],
    [width * 0.74, height * 0.68],
    [width * 0.93, height * 0.66],
  ];
  ctx.strokeStyle = `rgba(185, 255, 247, ${0.18 + glow * 0.52})`;
  ctx.lineWidth = 1 + glow * 3;
  ctx.shadowColor = "rgba(185, 255, 247, 0.8)";
  ctx.shadowBlur = 8 + flash * 42;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    drawFilmLine(ctx, x1, y1, x2, y2, ctx.strokeStyle, ctx.lineWidth, 0.78);
  }
  points.forEach(([x, y], index) => {
    const radius = 4 + glow * 8 + Math.sin(time * 0.004 + index) * 1.5;
    ctx.beginPath();
    ctx.fillStyle = `rgba(139, 209, 124, ${0.26 + glow * 0.5})`;
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

const drawAiScene = (ctx, width, height, progress, time, alpha) => {
  if (alpha <= 0.01) return;

  const intensity = smoothProgress(beatProgress(progress, 0.52, 0.8));
  const nodes = [
    [0.58, 0.26],
    [0.72, 0.34],
    [0.86, 0.25],
    [0.62, 0.54],
    [0.79, 0.58],
    [0.91, 0.7],
    [0.7, 0.78],
  ].map(([x, y]) => [x * width, y * height]);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.lineCap = "round";
  const links = [[0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [3, 6], [4, 6], [0, 3]];
  links.forEach(([from, to], index) => {
    const [x1, y1] = nodes[from];
    const [x2, y2] = nodes[to];
    const charge = (Math.sin(time * 0.004 + index * 0.8) + 1) / 2;
    ctx.strokeStyle = `rgba(139, 209, 124, ${0.16 + intensity * 0.58 + charge * 0.12})`;
    ctx.lineWidth = 1 + intensity * 6 + charge * 1.5;
    ctx.shadowColor = "rgba(139, 209, 124, 0.85)";
    ctx.shadowBlur = 4 + intensity * 30;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2 + Math.sin(time * 0.002 + index) * 20, x2, y2);
    ctx.stroke();
  });

  nodes.forEach(([x, y], index) => {
    const charge = (Math.sin(time * 0.005 + index * 0.9) + 1) / 2;
    const radius = 3 + intensity * 9 + charge * 2;
    ctx.fillStyle = `rgba(185, 255, 247, ${0.22 + intensity * 0.6})`;
    ctx.shadowColor = "rgba(185, 255, 247, 0.9)";
    ctx.shadowBlur = 8 + intensity * 32;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};

const drawFoosballScene = (ctx, width, height, progress, time, alpha) => {
  if (alpha <= 0.01) return;

  const arrive = smoothProgress(beatProgress(progress, 0.74, 0.91));
  const swoop = smoothProgress(beatProgress(progress, 0.82, 0.99));
  const pulse = (Math.sin(time * 0.006) + 1) / 2;
  const tableX = width * 0.56;
  const tableY = height * 0.5;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "screen";

  const scanGradient = ctx.createLinearGradient(width * 0.42, height * 0.05, width * 0.95, height * 0.9);
  scanGradient.addColorStop(0, "rgba(100, 226, 213, 0)");
  scanGradient.addColorStop(0.48, `rgba(100, 226, 213, ${0.05 + arrive * 0.28})`);
  scanGradient.addColorStop(1, "rgba(100, 226, 213, 0)");
  ctx.fillStyle = scanGradient;
  ctx.fillRect(0, 0, width, height);

  for (let trail = 0; trail < 5; trail += 1) {
    const offset = trail * 0.08;
    const t = clamp(swoop - offset, 0, 1);
    const arcLift = Math.sin(t * Math.PI) * height * (0.12 + trail * 0.012);
    const startX = width * (0.95 - trail * 0.08);
    const endX = width * (0.54 + trail * 0.035);
    const startY = height * (0.36 + trail * 0.065);
    const endY = height * (0.56 + trail * 0.03);

    ctx.strokeStyle = trail % 2 ? "rgba(224, 184, 93, 0.5)" : "rgba(100, 226, 213, 0.62)";
    ctx.lineWidth = 1.5 + arrive * 3.2;
    ctx.shadowColor = trail % 2 ? "rgba(224, 184, 93, 0.8)" : "rgba(100, 226, 213, 0.85)";
    ctx.shadowBlur = 10 + arrive * 30;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(lerp(startX, endX, 0.55), lerp(startY, endY, 0.55) - arcLift, lerp(startX, endX, t), lerp(startY, endY, t));
    ctx.stroke();
  }

  for (let marker = 0; marker < 7; marker += 1) {
    const angle = marker * 0.9 + time * 0.002;
    const radius = width * (0.06 + arrive * 0.12);
    const x = tableX + Math.cos(angle) * radius;
    const y = tableY + Math.sin(angle * 1.4) * radius * 0.42;
    ctx.fillStyle = `rgba(185, 255, 247, ${0.08 + arrive * 0.32 + pulse * 0.08})`;
    ctx.shadowColor = "rgba(100, 226, 213, 0.9)";
    ctx.shadowBlur = 8 + arrive * 26;
    ctx.beginPath();
    ctx.arc(x, y, 2.5 + arrive * 5, 0, Math.PI * 2);
    ctx.fill();
  }

  const ballT = smoothProgress(beatProgress(progress, 0.88, 1));
  const ballX = lerp(width * 0.77, width * 0.52 + Math.sin(time * 0.006) * 20, ballT);
  const ballY = lerp(height * 0.38, height * 0.61 + Math.sin(time * 0.008) * 10, ballT);
  const ballGlow = ctx.createRadialGradient(ballX, ballY, 0, ballX, ballY, 16 + ballT * 24);
  ballGlow.addColorStop(0, `rgba(224, 184, 93, ${0.28 + ballT * 0.58})`);
  ballGlow.addColorStop(1, "rgba(224, 184, 93, 0)");
  ctx.fillStyle = ballGlow;
  ctx.fillRect(ballX - 50, ballY - 50, 100, 100);
  ctx.restore();
};

const drawMotionFilm = (time = 0) => {
  if (!motionCanvas) return;

  const ctx = motionCanvas.getContext("2d");
  const width = motionCanvas.width / motionFilmDpr;
  const height = motionCanvas.height / motionFilmDpr;
  if (!ctx || !width || !height) return;

  ctx.save();
  ctx.setTransform(motionFilmDpr, 0, 0, motionFilmDpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const progress = motionFilmProgress;
  const timeValue = motionQuery.matches ? 0 : time;
  const phase = progress * (systemOrder.length - 1);
  const verifyAlpha = clamp(1 - beatProgress(progress, 0.28, 0.42));
  const coordinateAlpha = Math.min(beatProgress(progress, 0.24, 0.36), 1 - beatProgress(progress, 0.56, 0.66));
  const aiAlpha = Math.min(beatProgress(progress, 0.48, 0.6), 1 - beatProgress(progress, 0.8, 0.9));
  const foosballAlpha = beatProgress(progress, 0.72, 0.88);

  const background = ctx.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "rgba(2, 7, 6, 0.1)");
  background.addColorStop(0.58, "rgba(4, 14, 13, 0.34)");
  background.addColorStop(1, "rgba(2, 3, 3, 0.42)");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  drawVerifyScene(ctx, width, height, progress, timeValue, verifyAlpha);
  drawCoordinateScene(ctx, width, height, progress, timeValue, coordinateAlpha);
  drawAiScene(ctx, width, height, progress, timeValue, aiAlpha);
  drawFoosballScene(ctx, width, height, progress, timeValue, foosballAlpha);

  systemImages.forEach((image, index) => {
    const weight = clamp(1 - Math.abs(phase - index));
    if (weight <= 0.01) return;

    const breathe = motionQuery.matches ? 0 : Math.sin(time * 0.00055 + index * 1.7) * 6;
    const settle = motionQuery.matches ? 0 : Math.cos(time * 0.00042 + index) * 4;
    let driftX = (index - phase) * 26 + breathe;
    let driftY = (index % 2 === 0 ? -1 : 1) * (1 - weight) * 10 + settle;
    let scale = 1.08 - weight * 0.035 + Math.sin(time * 0.0003 + index) * 0.008;

    if (image.dataset.systemImage === "verify") {
      const verifyFlight = smoothProgress(beatProgress(progress, 0.02, 0.3));
      scale += verifyFlight * 0.18;
      driftX -= verifyFlight * 28;
    }

    if (image.dataset.systemImage === "simulate") {
      const foosballArrive = smoothProgress(beatProgress(progress, 0.76, 0.92));
      scale += foosballArrive * 0.06;
      driftY += (1 - foosballArrive) * 72;
    }

    image.style.transform = `translate3d(calc(var(--pointer-x) * -10px + ${driftX.toFixed(1)}px), calc(var(--pointer-y) * -8px + ${driftY.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
  });

  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = "rgba(185, 255, 247, 0.16)";
  ctx.lineWidth = 1;
  for (let y = (timeValue * 0.025) % 18; y < height; y += 18) {
    ctx.beginPath();
    ctx.moveTo(width * 0.42, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  motionFilmFrame = window.requestAnimationFrame(drawMotionFilm);
};

const startMotionFilm = () => {
  if (!motionCanvas || motionFilmFrame !== null) return;

  resizeMotionFilmCanvas();
  motionFilmFrame = window.requestAnimationFrame(drawMotionFilm);
};

buildTransformTiles();

const measureSystemsProgressBounds = () => {
  if (!productConsole) return;

  productConsoleStart = productConsole.getBoundingClientRect().top + window.scrollY;
  productScrollRange = Math.max(productConsole.offsetHeight - window.innerHeight, 1);
};

const setVisualProgress = () => {
  if (!productStage || !productConsole) return;

  const progress = clamp((window.scrollY - productConsoleStart) / productScrollRange);
  motionFilmProgress = progress;
  const phase = progress * (systemOrder.length - 1);
  const activeFromProgress =
    progress < 0.3
      ? "verify"
      : progress < 0.56
        ? "coordinate"
        : progress < 0.8
          ? "automate"
          : "simulate";

  productStage.style.setProperty("--systems-progress", progress.toFixed(3));
  productStage.style.setProperty("--phase-progress", phase.toFixed(3));
  productStage.style.setProperty("--verify-weight", clamp(1 - Math.abs(phase - 0)).toFixed(3));
  productStage.style.setProperty("--coordinate-weight", clamp(1 - Math.abs(phase - 1)).toFixed(3));
  productStage.style.setProperty("--automate-weight", clamp(1 - Math.abs(phase - 2)).toFixed(3));
  productStage.style.setProperty("--simulate-weight", clamp(1 - Math.abs(phase - 3)).toFixed(3));

  const verifyFlight = beatProgress(progress, 0.02, 0.28);
  const screenGlow = beatProgress(progress, 0.3, 0.42);
  const screenFlashRise = beatProgress(progress, 0.34, 0.39);
  const screenFlashFall = 1 - beatProgress(progress, 0.39, 0.46);
  const screenFlash = clamp(Math.min(screenFlashRise, screenFlashFall) * 1.45);
  const screenDark = beatProgress(progress, 0.43, 0.56);
  const networkProgress = beatProgress(progress, 0.16, 0.36);
  const aiProgress = beatProgress(progress, 0.48, 0.8);
  const aiIntensity = beatProgress(progress, 0.54, 0.78);
  const roboticsProgress = beatProgress(progress, 0.72, 1);
  const foosballArrive = beatProgress(progress, 0.76, 0.9);
  const playerSwoop = beatProgress(progress, 0.82, 0.98);
  const playerSwoopLeft = 1 - playerSwoop;
  const verifyWeight = clamp(1 - Math.abs(phase - 0));
  const coordinateWeight = clamp(1 - Math.abs(phase - 1));
  const automateWeight = clamp(1 - Math.abs(phase - 2));
  const simulateWeight = clamp(1 - Math.abs(phase - 3));

  productStage.style.setProperty("--verify-flight", verifyFlight.toFixed(3));
  productStage.style.setProperty("--screen-glow", screenGlow.toFixed(3));
  productStage.style.setProperty("--screen-flash", screenFlash.toFixed(3));
  productStage.style.setProperty("--screen-dark", screenDark.toFixed(3));
  productStage.style.setProperty("--ai-intensity", aiIntensity.toFixed(3));
  productStage.style.setProperty("--foosball-arrive", foosballArrive.toFixed(3));
  productStage.style.setProperty("--player-swoop", playerSwoop.toFixed(3));
  productStage.style.setProperty("--verify-ring-glow", `${(12 + verifyFlight * 44).toFixed(1)}px`);
  productStage.style.setProperty("--verify-ring-inner-glow", `${(18 + verifyFlight * 40).toFixed(1)}px`);
  productStage.style.setProperty("--verify-ring-opacity", (0.1 + verifyFlight * 0.55).toFixed(3));
  productStage.style.setProperty("--verify-ring-scale", (0.58 + verifyFlight * 1.12).toFixed(3));
  productStage.style.setProperty("--verify-ring-two-opacity", (0.08 + verifyFlight * 0.42).toFixed(3));
  productStage.style.setProperty("--verify-ring-two-scale", (0.42 + verifyFlight * 1.55).toFixed(3));
  productStage.style.setProperty("--screen-node-glow", `${(16 + screenFlash * 34).toFixed(1)}px`);
  productStage.style.setProperty("--screen-node-cyan-glow", `${(screenGlow * 22).toFixed(1)}px`);
  productStage.style.setProperty("--screen-flash-glow", `${(10 + screenFlash * 52).toFixed(1)}px`);
  productStage.style.setProperty("--screen-flash-inner-glow", `${(12 + screenFlash * 30).toFixed(1)}px`);
  productStage.style.setProperty("--screen-opacity", (screenGlow * (1 - screenDark * 0.74)).toFixed(3));
  productStage.style.setProperty("--screen-scale", (0.94 + screenFlash * 0.08).toFixed(3));
  productStage.style.setProperty("--screen-link-height", `${(1 + screenGlow * 2).toFixed(1)}px`);
  productStage.style.setProperty("--screen-link-opacity", (0.34 + screenGlow * 0.56).toFixed(3));
  productStage.style.setProperty("--screen-link-glow", `${(screenFlash * 34).toFixed(1)}px`);
  productStage.style.setProperty("--ai-card-inner-glow", `${(22 + aiIntensity * 20).toFixed(1)}px`);
  productStage.style.setProperty("--ai-card-outer-glow", `${(16 + aiIntensity * 28).toFixed(1)}px`);
  productStage.style.setProperty("--ai-link-height", `${(1 + aiIntensity * 5).toFixed(1)}px`);
  productStage.style.setProperty("--ai-link-glow", `${(4 + aiIntensity * 26).toFixed(1)}px`);
  productStage.style.setProperty("--ai-link-cyan-glow", `${(2 + aiIntensity * 18).toFixed(1)}px`);
  productStage.style.setProperty("--ai-link-opacity", (0.16 + aiIntensity * 0.74).toFixed(3));
  productStage.style.setProperty("--ai-link-scale", (0.18 + aiIntensity * 0.82).toFixed(3));
  productStage.style.setProperty("--ai-beam-height", `${(1 + aiIntensity * 5).toFixed(1)}px`);
  productStage.style.setProperty("--ai-beam-opacity", (aiProgress * (0.62 + aiIntensity * 0.38)).toFixed(3));
  productStage.style.setProperty("--ai-beam-glow", `${(aiIntensity * 34).toFixed(1)}px`);
  productStage.style.setProperty("--player-scale", (0.72 + playerSwoop * 0.28).toFixed(3));
  productStage.style.setProperty("--network-progress", networkProgress.toFixed(3));
  productStage.style.setProperty("--ai-progress", aiProgress.toFixed(3));
  productStage.style.setProperty("--robotics-progress", roboticsProgress.toFixed(3));
  productStage.style.setProperty("--verify-effect-opacity", Math.max(verifyWeight * 0.88, verifyFlight * 0.2).toFixed(3));
  productStage.style.setProperty(
    "--coordinate-effect-opacity",
    Math.max(coordinateWeight * 0.76, screenGlow * 0.32, networkProgress * 0.22).toFixed(3)
  );
  productStage.style.setProperty(
    "--automate-effect-opacity",
    Math.max(automateWeight * 0.78, aiIntensity * 0.36).toFixed(3)
  );
  productStage.style.setProperty(
    "--simulate-effect-opacity",
    Math.max(simulateWeight * 0.76, foosballArrive * 0.38).toFixed(3)
  );
  productStage.style.setProperty("--network-node-scale", (0.35 + networkProgress * 0.65).toFixed(3));
  productStage.style.setProperty("--ai-card-offset", `${((1 - aiProgress) * 90).toFixed(1)}px`);
  productStage.style.setProperty("--ai-card-lift", `${((1 - aiProgress) * -18).toFixed(1)}px`);
  productStage.style.setProperty("--rod-one-offset", `${((1 - roboticsProgress) * 86).toFixed(1)}%`);
  productStage.style.setProperty("--rod-two-offset", `${((1 - roboticsProgress) * -86).toFixed(1)}%`);
  productStage.style.setProperty("--player-drop", `${((1 - roboticsProgress) * -46).toFixed(1)}px`);
  productStage.style.setProperty("--ball-track-x", `${((1 - roboticsProgress) * -220).toFixed(1)}px`);
  productStage.style.setProperty("--ball-track-y", `${((1 - roboticsProgress) * -86).toFixed(1)}px`);
  productStage.style.setProperty("--player-one-x", `${(-52 * playerSwoopLeft).toFixed(1)}px`);
  productStage.style.setProperty("--player-one-y", `${(-28 * playerSwoopLeft).toFixed(1)}px`);
  productStage.style.setProperty("--player-one-rotate", `${(-24 * playerSwoopLeft).toFixed(1)}deg`);
  productStage.style.setProperty("--player-two-x", `${(24 * playerSwoopLeft).toFixed(1)}px`);
  productStage.style.setProperty("--player-two-y", `${(-54 * playerSwoopLeft).toFixed(1)}px`);
  productStage.style.setProperty("--player-two-rotate", `${(18 * playerSwoopLeft).toFixed(1)}deg`);
  productStage.style.setProperty("--player-three-x", `${(58 * playerSwoopLeft).toFixed(1)}px`);
  productStage.style.setProperty("--player-three-y", `${(-22 * playerSwoopLeft).toFixed(1)}px`);
  productStage.style.setProperty("--player-three-rotate", `${(28 * playerSwoopLeft).toFixed(1)}deg`);

  systemImages.forEach((image, index) => {
    const weight = clamp(1 - Math.abs(phase - index));
    let driftX = (index - phase) * 28;
    let driftY = (index % 2 === 0 ? -1 : 1) * (1 - weight) * 10;
    let scale = 1.075 - weight * 0.04;
    const revealInset = Math.max(0, (1 - weight) * 16);
    let extraBrightness = 0;

    if (image.dataset.systemImage === "verify") {
      scale += verifyFlight * 0.15;
      driftX -= verifyFlight * 18;
      extraBrightness = verifyFlight * 0.18;
    }

    if (image.dataset.systemImage === "coordinate") {
      extraBrightness = screenFlash * 0.26 - screenDark * 0.16;
    }

    if (image.dataset.systemImage === "automate") {
      extraBrightness = aiIntensity * 0.2;
    }

    if (image.dataset.systemImage === "simulate") {
      scale += foosballArrive * 0.045;
      driftX += (1 - foosballArrive) * 18;
      driftY += (1 - foosballArrive) * 70;
    }

    image.style.opacity = (weight * (motionCanvas ? 0.86 : 0.98)).toFixed(3);
    image.style.zIndex = String(1 + Math.round(weight * 8));
    image.style.filter = `saturate(${(0.8 + weight * 0.24 + aiIntensity * 0.08).toFixed(3)}) brightness(${(0.7 + weight * 0.22 + extraBrightness).toFixed(3)}) contrast(${(1.1 + verifyFlight * 0.06).toFixed(3)})`;
    image.style.clipPath = `inset(0 ${revealInset.toFixed(1)}% 0 ${Math.max(0, revealInset - 4).toFixed(1)}%)`;

    if (motionQuery.matches) {
      image.style.transform = "";
    } else {
      image.style.transform = `translate3d(calc(var(--pointer-x) * -10px + ${driftX.toFixed(1)}px), calc(var(--pointer-y) * -8px + ${driftY.toFixed(1)}px), 0) scale(${scale.toFixed(3)})`;
    }
  });

  if (activeFromProgress !== activeSystemName) {
    activateCapability(activeFromProgress);
  }
};

const scheduleSystemsProgress = () => {
  if (systemsFrame !== null) return;

  systemsFrame = window.requestAnimationFrame(() => {
    systemsFrame = null;
    setVisualProgress();
  });
};

const setActiveSystemImage = (systemName) => {
  const previousSystemName = activeSystemName;
  stageImageTransform(previousSystemName, systemName);

  if (productStage) {
    productStage.dataset.activeSystem = systemName;
  }

  systemImages.forEach((image) => {
    image.classList.toggle("is-active", image.dataset.systemImage === systemName);
  });

  systemHotspots.forEach((hotspot) => {
    hotspot.classList.toggle("is-active", hotspot.dataset.systemHotspot === systemName);
  });

  activeSystemName = systemName;
};

const scrollToSystemStep = (systemName) => {
  const step = Array.from(systemSteps).find((item) => item.dataset.systemStep === systemName);
  if (!step) return;

  step.scrollIntoView({
    block: "center",
    behavior: motionQuery.matches ? "auto" : "smooth",
  });
};

const activateCapability = (systemName) => {
  const content = capabilityContent[systemName];
  const button = Array.from(capabilityButtons).find((item) => item.dataset.capability === systemName);
  if (!content || !button) return;

  activateButtons(capabilityButtons, button);
  setActiveSystemImage(systemName);
  capabilityKicker.textContent = content.kicker;
  capabilityIndex.textContent = content.index;
  capabilityTitle.textContent = content.title;
  capabilityCopy.textContent = content.copy;
  setListItems(capabilityPoints, content.points);

  if (readoutLabel && readoutValue) {
    const hasReadoutChange =
      readoutLabel.textContent !== content.readoutLabel ||
      readoutValue.textContent !== content.readoutValue;

    readoutLabel.textContent = content.readoutLabel;
    readoutValue.textContent = content.readoutValue;

    if (hasReadoutChange && !motionQuery.matches) {
      const readout = readoutLabel.closest(".system-readout");

      if (readout) {
        window.clearTimeout(readoutJumpTimeout);
        readout.classList.remove("is-jumping");
        void readout.offsetWidth;
        readout.classList.add("is-jumping");
        readoutJumpTimeout = window.setTimeout(() => {
          readout.classList.remove("is-jumping");
        }, 280);
      }
    }
  }
};

capabilityButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateCapability(button.dataset.capability);
    scrollToSystemStep(button.dataset.capability);
  });
  button.addEventListener("pointerenter", () => {
    if (canHoverQuery.matches) activateCapability(button.dataset.capability);
  });
  button.addEventListener("focus", () => activateCapability(button.dataset.capability));
});

systemHotspots.forEach((hotspot) => {
  hotspot.addEventListener("click", () => {
    activateCapability(hotspot.dataset.systemHotspot);
    scrollToSystemStep(hotspot.dataset.systemHotspot);
  });
  hotspot.addEventListener("pointerenter", () => {
    if (canHoverQuery.matches) activateCapability(hotspot.dataset.systemHotspot);
  });
});

measureSystemsProgressBounds();
setVisualProgress();
startMotionFilm();

const depthButtons = document.querySelectorAll("[data-depth]");
const depthLabel = document.getElementById("depth-label");
const depthTitle = document.getElementById("depth-title");
const depthCopy = document.getElementById("depth-copy");
const depthPointOne = document.getElementById("depth-point-1");
const depthPointTwo = document.getElementById("depth-point-2");
const depthPointThree = document.getElementById("depth-point-3");

depthButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const content = depthContent[button.dataset.depth];
    if (!content) return;

    activateButtons(depthButtons, button);
    depthLabel.textContent = content.label;
    depthTitle.textContent = content.title;
    depthCopy.textContent = content.copy;
    depthPointOne.textContent = content.points[0];
    depthPointTwo.textContent = content.points[1];
    depthPointThree.textContent = content.points[2];
  });
});

const navLinks = document.querySelectorAll("[data-nav-link]");
const sectionMap = new Map(
  Array.from(document.querySelectorAll("[data-section]")).map((section) => [section.dataset.section, section])
);

const setActiveNav = (sectionId) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.navLink === sectionId);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveNav(entry.target.dataset.section);
      }
    });
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: 0,
  }
);

sectionMap.forEach((section) => {
  sectionObserver.observe(section);
});

const revealElements = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.16,
    rootMargin: "0px 0px -6% 0px",
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

const yearNode = document.getElementById("current-year");
if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

const updateStageClock = () => {
  if (!stageClock) return;

  stageClock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

updateStageClock();
window.setInterval(updateStageClock, 1000);

const aircraftBackground = document.querySelector("[data-aircraft-background]");
const aircraftAsset = document.querySelector("[data-aircraft-asset]");
const scrollAircraft = document.querySelector("[data-scroll-aircraft]");
const heroImage = document.querySelector("[data-hero-image]");
let previousScrollAircraftY = window.scrollY;

if (aircraftAsset) {
  aircraftAsset.addEventListener("error", () => {
    aircraftAsset.hidden = true;
  });
}

const fakeTerminalLines = [
  {
    type: "command",
    text: "inspect --program c130t --module flight-plan-server",
  },
  {
    type: "log",
    time: "14:22:03.118",
    severity: "INFO",
    category: "ADA",
    text: "legacy behavior mapped; shared resource contention isolated",
  },
  {
    type: "log",
    time: "14:22:03.642",
    severity: "INFO",
    category: "FMS",
    text: "flight-plan data access wait time reduced by 30%",
  },
  {
    type: "command",
    text: "verify --interface nav --cases valid,invalid,failure",
  },
  {
    type: "log",
    time: "14:22:04.090",
    severity: "INFO",
    category: "PYTEST",
    text: "300+ automated tests generated for message handling",
  },
  {
    type: "log",
    time: "14:22:04.214",
    severity: "INFO",
    category: "EFFORT",
    text: "manual execution effort reduced by 80-90%",
  },
  {
    type: "command",
    text: "doors-dxl analyze --requirements reusable",
  },
  {
    type: "log",
    time: "14:22:05.001",
    severity: "INFO",
    category: "DXL",
    text: "100+ engineering hours saved through reusable analysis tools",
  },
  {
    type: "log",
    time: "14:22:05.188",
    severity: "INFO",
    category: "AI",
    text: "rag pipeline compares bm25, tf-idf, and sentence-transformer retrieval",
  },
  {
    type: "command",
    text: "simulate --system automated-foosball --loop 50hz",
  },
  {
    type: "log",
    time: "14:22:06.336",
    severity: "INFO",
    category: "VISION",
    text: "kalman prediction feeds four-axis motor coordination",
  },
  {
    type: "log",
    time: "14:22:06.812",
    severity: "INFO",
    category: "STATUS",
    text: "system notes updated with the parts worth remembering",
  },
];

class FakeTerminal {
  constructor(element, lines = fakeTerminalLines) {
    this.element = element;
    this.output = element.querySelector("[data-fake-terminal-output]");
    this.lines = lines;
    this.prompt = element.dataset.prompt || "hirsh@flight-lab:~$";
    this.timeouts = [];
    this.runId = 0;
  }

  schedule(callback, delay) {
    const timeout = window.setTimeout(callback, delay);
    this.timeouts.push(timeout);
  }

  stop() {
    this.runId += 1;
    this.timeouts.forEach((timeout) => window.clearTimeout(timeout));
    this.timeouts = [];
  }

  clear() {
    if (this.output) {
      this.output.innerHTML = "";
    }
  }

  scrollToBottom() {
    if (this.output) {
      this.output.scrollTop = this.output.scrollHeight;
    }
  }

  createLine(line) {
    const row = document.createElement("p");
    row.className = "fake-terminal-line";

    const label = document.createElement("span");
    const textNode = document.createTextNode("");

    if (line.type === "command") {
      label.className = "fake-terminal-prompt";
      label.textContent = this.prompt;
    } else {
      label.className = `fake-terminal-time${line.tone === "warn" ? " fake-terminal-warn" : ""}`;
      label.textContent = line.time;

      const severity = document.createElement("span");
      severity.className = `fake-terminal-severity${line.tone === "warn" ? " fake-terminal-warn" : ""}`;
      severity.textContent = line.severity || "INFO";

      const category = document.createElement("span");
      category.className = "fake-terminal-category";
      category.textContent = line.category || "DIAG";

      row.append(label, severity, category, textNode);
      this.output.appendChild(row);
      this.scrollToBottom();

      return { row, textNode };
    }

    row.append(label, textNode);
    this.output.appendChild(row);
    this.scrollToBottom();

    return { row, textNode };
  }

  addCursor(row) {
    const cursor = document.createElement("span");
    cursor.className = "fake-terminal-cursor";
    cursor.setAttribute("aria-hidden", "true");
    row.appendChild(cursor);
  }

  renderStatic() {
    this.stop();
    if (!this.output) return;

    this.clear();
    this.lines.forEach((line, index) => {
      const { row, textNode } = this.createLine(line);
      textNode.textContent = ` ${line.text}`;

      if (index === this.lines.length - 1) {
        this.addCursor(row);
      }
    });
    this.scrollToBottom();
  }

  typeText(textNode, text, index, done, runId) {
    if (runId !== this.runId) return;

    textNode.textContent = ` ${text.slice(0, index)}`;
    this.scrollToBottom();

    if (index >= text.length) {
      done();
      return;
    }

    this.schedule(() => this.typeText(textNode, text, index + 1, done, runId), 14);
  }

  streamLine(index, runId) {
    if (!this.output || runId !== this.runId) return;

    if (index >= this.lines.length) {
      this.schedule(() => this.start(), 2800);
      return;
    }

    const line = this.lines[index];
    const { row, textNode } = this.createLine(line);
    const isLast = index === this.lines.length - 1;
    const showNext = () => {
      if (isLast) {
        this.addCursor(row);
      }

      this.schedule(() => this.streamLine(index + 1, runId), line.type === "command" ? 320 : 560);
    };

    if (line.type === "command") {
      this.typeText(textNode, line.text, 0, showNext, runId);
    } else {
      this.schedule(() => {
        textNode.textContent = ` ${line.text}`;
        this.scrollToBottom();
        showNext();
      }, 180);
    }
  }

  start() {
    this.stop();
    if (!this.output) return;

    if (motionQuery.matches) {
      this.renderStatic();
      return;
    }

    this.clear();
    const runId = this.runId;
    this.streamLine(0, runId);
  }
}

const fakeTerminals = Array.from(document.querySelectorAll("[data-fake-terminal]")).map(
  (terminal) => new FakeTerminal(terminal)
);

fakeTerminals.forEach((terminal) => {
  terminal.start();
});

const updateAircraftParallax = () => {
  if (!aircraftBackground || motionQuery.matches) {
    if (!heroImage) {
      root.style.setProperty("--aircraft-parallax-x", "0px");
      root.style.setProperty("--aircraft-parallax-y", "0px");
      return;
    }
  }

  const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(window.scrollY / maxScroll, 1);
  const heroProgress = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1);
  const x = Math.sin(progress * Math.PI) * 18;
  const y = heroProgress * -24;

  root.style.setProperty("--aircraft-parallax-x", `${x.toFixed(2)}px`);
  root.style.setProperty("--aircraft-parallax-y", `${y.toFixed(2)}px`);
  root.style.setProperty("--hero-scroll", heroProgress.toFixed(3));
};

const updatePointerParallax = (event) => {
  if (motionQuery.matches) return;

  const x = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2;
  const y = (event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2;

  root.style.setProperty("--pointer-x", x.toFixed(3));
  root.style.setProperty("--pointer-y", y.toFixed(3));
};

const updateScrollAircraftPosition = () => {
  if (!scrollAircraft || motionQuery.matches) return;

  const maxScroll = Math.max(root.scrollHeight - window.innerHeight, 1);
  const currentScroll = window.scrollY;
  const progress = Math.min(currentScroll / maxScroll, 1);
  const arc = Math.sin(progress * Math.PI);
  const x = -18 + progress * 136;
  const y = 70 - progress * 54 - arc * 7;
  const angle = -9 + progress * 18;
  const opacity = 0.34 + arc * 0.24;

  if (Math.abs(currentScroll - previousScrollAircraftY) > 1) {
    root.style.setProperty("--scroll-aircraft-direction", currentScroll > previousScrollAircraftY ? "-1" : "1");
    previousScrollAircraftY = currentScroll;
  }

  root.style.setProperty("--scroll-aircraft-x", `${x.toFixed(2)}vw`);
  root.style.setProperty("--scroll-aircraft-y", `${y.toFixed(2)}vh`);
  root.style.setProperty("--scroll-aircraft-angle", `${angle.toFixed(2)}deg`);
  root.style.setProperty("--scroll-aircraft-opacity", opacity.toFixed(2));
};

let aircraftFrame = null;

const scheduleAircraftUpdate = () => {
  if (aircraftFrame !== null) return;

  aircraftFrame = window.requestAnimationFrame(() => {
    aircraftFrame = null;
    updateAircraftParallax();
    updateScrollAircraftPosition();
  });
};

updateAircraftParallax();
updateScrollAircraftPosition();
window.addEventListener("scroll", scheduleAircraftUpdate, { passive: true });
window.addEventListener("scroll", scheduleSystemsProgress, { passive: true });
window.addEventListener("resize", scheduleAircraftUpdate);
window.addEventListener("resize", () => {
  measureSystemsProgressBounds();
  resizeMotionFilmCanvas();
  scheduleSystemsProgress();
});
window.addEventListener("pointermove", updatePointerParallax, { passive: true });

if (typeof motionQuery.addEventListener === "function") {
  motionQuery.addEventListener("change", () => {
    updateAircraftParallax();
    updateScrollAircraftPosition();
    resizeMotionFilmCanvas();
    fakeTerminals.forEach((terminal) => terminal.start());
  });
} else if (typeof motionQuery.addListener === "function") {
  motionQuery.addListener(() => {
    updateAircraftParallax();
    updateScrollAircraftPosition();
    resizeMotionFilmCanvas();
    fakeTerminals.forEach((terminal) => terminal.start());
  });
}
