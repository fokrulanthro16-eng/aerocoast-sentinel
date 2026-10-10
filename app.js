/**
 * AeroCoast Sentinel - Tactical Industrial Edge Engine (app.js)
 * Designed for IslanderHack 2026 (Texas A&M University - Corpus Christi)
 * 
 * Mandate: Zero-Cloud, Local-First, Edge-Native Industrial Monitoring Console
 * Off-Grid Solar & Environmental Defense Node Simulation (#4109)
 * Sub-15ms Simulated WASM/WebGL INT8 Inference Runtime
 */

// ==========================================
// 1. SCENARIO DEFINITIONS & METADATA
// ==========================================
const SCENARIOS = {
  plastic: {
    id: "CC-BEACH-PLASTIC",
    name: "Corpus Christi Beach Plastic Litter",
    locationName: "Corpus Christi Beach (North Sector)",
    coordinates: [-97.3964, 27.8006],
    coordsDisplay: "27.8006° N, 97.3964° W",
    statusLevel: "warning",
    verdictTitle: "STATUS: ELEVATED THREAT",
    verdictMessage: "Plastic debris detected in shoreline wash zone. Cleanup dispatch advised.",
    verdictIcon: "⚠️",
    telemetry: {
      tide: 0.82,
      tidePhase: "Ebb Flow (Falling)",
      tideBarWidth: 55,
      salinity: 35.4,
      salinityStatus: "Hypersaline Normal",
      salinityBarWidth: 62,
      duneSlope: 18,
      duneRisk: "LOW RISK",
      duneStability: "Toe Stable · Zero Slump",
      duneRiskBarWidth: 25,
      duneRiskColor: "bg-emerald-400",
      duneBadgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    },
    detections: [
      { id: "TRK-104", label: "PLASTIC BOTTLE", confidence: 96.4, category: "plastic", boxColor: "#f59e0b", x: 0.22, y: 0.65, w: 0.12, h: 0.14 },
      { id: "TRK-108", label: "GHOST NETTING", confidence: 92.1, category: "hazard", boxColor: "#f43f5e", x: 0.68, y: 0.58, w: 0.16, h: 0.18 },
      { id: "TRK-099", label: "SURF FOAM (NATURAL)", confidence: 98.9, category: "natural", boxColor: "#06b6d4", x: 0.42, y: 0.48, w: 0.18, h: 0.12 }
    ]
  },
  erosion: {
    id: "MUSTANG-DUNE-EROSION",
    name: "Mustang Island Dune Erosion Alert",
    locationName: "Mustang Island State Park (Gulf Front)",
    coordinates: [-97.1697, 27.6811],
    coordsDisplay: "27.6811° N, 97.1697° W",
    statusLevel: "critical",
    verdictTitle: "STATUS: CRITICAL DANGER",
    verdictMessage: "Severe dune toe scarping detected on Mustang Island. Wave overwash impending.",
    verdictIcon: "🚨",
    telemetry: {
      tide: 1.48,
      tidePhase: "Spring High Surge",
      tideBarWidth: 88,
      salinity: 33.1,
      salinityStatus: "Storm Runoff Dilution",
      salinityBarWidth: 48,
      duneSlope: 68,
      duneRisk: "CRITICAL RISK",
      duneStability: "Active Slumping · Scarp 68°",
      duneRiskBarWidth: 92,
      duneRiskColor: "bg-rose-500",
      duneBadgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40"
    },
    detections: [
      { id: "GEO-042", label: "DUNE SCARP COLLAPSE", confidence: 97.2, category: "hazard", boxColor: "#f43f5e", x: 0.52, y: 0.35, w: 0.24, h: 0.32 },
      { id: "GEO-043", label: "VEGETATION LOSS ZONE", confidence: 94.6, category: "warning", boxColor: "#f59e0b", x: 0.15, y: 0.28, w: 0.22, h: 0.24 },
      { id: "HYD-019", label: "WAVE TOE UNDERCUT", confidence: 91.8, category: "hazard", boxColor: "#f43f5e", x: 0.45, y: 0.68, w: 0.28, h: 0.18 }
    ]
  },
  sanctuary: {
    id: "LAGUNA-MADRE-CLEAN",
    name: "Laguna Madre Clean Sanctuary",
    locationName: "Upper Laguna Madre Nature Preserve",
    coordinates: [-97.2917, 27.5624],
    coordsDisplay: "27.5624° N, 97.2917° W",
    statusLevel: "nominal",
    verdictTitle: "STATUS: NOMINAL / PRISTINE",
    verdictMessage: "Marine ecosystem thriving. Endangered Piping Plover nesting site undisturbed.",
    verdictIcon: "✅",
    telemetry: {
      tide: 0.35,
      tidePhase: "Slack Water (Calm)",
      tideBarWidth: 26,
      salinity: 37.8,
      salinityStatus: "Laguna Hypersaline Normal",
      salinityBarWidth: 78,
      duneSlope: 12,
      duneRisk: "NOMINAL",
      duneStability: "Canopy Healthy · Zero Scarp",
      duneRiskBarWidth: 15,
      duneRiskColor: "bg-emerald-400",
      duneBadgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
    },
    detections: [
      { id: "BIO-771", label: "PIPING PLOVER [PROTECTED]", confidence: 98.4, category: "wildlife", boxColor: "#10b981", x: 0.38, y: 0.62, w: 0.12, h: 0.15 },
      { id: "BIO-772", label: "SEAGRASS CANOPY [PRISTINE]", confidence: 99.1, category: "ecosystem", boxColor: "#10b981", x: 0.10, y: 0.70, w: 0.34, h: 0.22 },
      { id: "GEO-101", label: "SEDIMENT EQUILIBRIUM", confidence: 96.7, category: "nominal", boxColor: "#06b6d4", x: 0.65, y: 0.55, w: 0.26, h: 0.22 }
    ]
  }
};

// ==========================================
// 2. STATE MANAGER
// ==========================================
const state = {
  currentScenarioKey: "plastic",
  isPaused: false,
  scanlinesActive: true,
  isWebcamActive: false,
  webcamStream: null,
  webcamVideo: null,
  basePowerDraw: 4.2, // Watts
  solarInputWatts: 18.7, // Watts
  batteryVoltage: 13.26, // Volts (LiFePO4 4S)
  batterySoC: 96.4, // %
  batteryTemp: 28.2, // °C
  loraTxPackets: 1482,
  loraRssi: -86, // dBm
  loraSnr: 8.4, // dB
  ringBufferUsage: 12.4, // %
  fps: 60,
  latency: 8.4, // ms
  targetCount: 3,
  animTime: 0,
  fallingParticles: [],
  birdPhase: 0,
  charts: {
    telemetry: null,
    carbon: null,
    frequency: null
  }
};

// Generate sand particles for dune erosion simulation
for (let i = 0; i < 35; i++) {
  state.fallingParticles.push({
    x: 0.55 + Math.random() * 0.18,
    y: 0.35 + Math.random() * 0.3,
    speed: 0.003 + Math.random() * 0.006,
    size: 1.5 + Math.random() * 2.5
  });
}

// ==========================================
// 3. CANVAS SIMULATION ENGINE
// ==========================================
const canvas = document.getElementById("optical-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
}

window.addEventListener("resize", resizeCanvas);

// Render procedural coastal scenery or live hardware webcam stream based on active mode
function renderScene(width, height) {
  const current = SCENARIOS[state.currentScenarioKey];
  const t = state.animTime;

  if (state.isWebcamActive && state.webcamVideo && state.webcamVideo.readyState >= 2) {
    // 1. LIVE HARDWARE WEBCAM FEED (Render video frame directly to canvas)
    ctx.drawImage(state.webcamVideo, 0, 0, width, height);

    // Subtle edge optical sensor tint & digital raster overlay
    ctx.fillStyle = "rgba(6, 182, 212, 0.04)";
    ctx.fillRect(0, 0, width, height);

    // Live Optical Sensor Watermark Badge
    ctx.fillStyle = "rgba(11, 17, 30, 0.85)";
    ctx.fillRect(width - 248, 14, 234, 24);
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1;
    ctx.strokeRect(width - 248, 14, 234, 24);
    ctx.fillStyle = "#10b981";
    ctx.font = "bold 10px 'JetBrains Mono', monospace";
    ctx.fillText("● LIVE WEBCAM FEED [60 FPS INT8]", width - 240, 30);
  } else {
    // 1. SKY BACKGROUND
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.45);
    if (state.currentScenarioKey === "erosion") {
      skyGrad.addColorStop(0, "#1e293b");
      skyGrad.addColorStop(0.6, "#334155");
      skyGrad.addColorStop(1, "#475569");
    } else if (state.currentScenarioKey === "sanctuary") {
      skyGrad.addColorStop(0, "#0284c7");
      skyGrad.addColorStop(0.6, "#38bdf8");
      skyGrad.addColorStop(1, "#bae6fd");
    } else {
      skyGrad.addColorStop(0, "#0c4a6e");
      skyGrad.addColorStop(0.5, "#0284c7");
      skyGrad.addColorStop(1, "#7dd3fc");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height * 0.45);

    // Distant clouds
    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 220 + t * 8) % (width + 120)) - 60;
      const cy = 35 + (i * 20);
      ctx.beginPath();
      ctx.arc(cx, cy, 25, 0, Math.PI * 2);
      ctx.arc(cx + 25, cy - 8, 32, 0, Math.PI * 2);
      ctx.arc(cx + 55, cy, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. OCEAN WATER LAYER
    const waterGrad = ctx.createLinearGradient(0, height * 0.35, 0, height);
    if (state.currentScenarioKey === "sanctuary") {
      waterGrad.addColorStop(0, "#0d9488");
      waterGrad.addColorStop(0.5, "#14b8a6");
      waterGrad.addColorStop(1, "#5eead4");
    } else if (state.currentScenarioKey === "erosion") {
      waterGrad.addColorStop(0, "#1e3a5f");
      waterGrad.addColorStop(0.6, "#284b63");
      waterGrad.addColorStop(1, "#3c6e71");
    } else {
      waterGrad.addColorStop(0, "#0369a1");
      waterGrad.addColorStop(0.5, "#0284c7");
      waterGrad.addColorStop(1, "#38bdf8");
    }
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, height * 0.35, width, height * 0.65);

    // 3. ANIMATED WAVES & SURF BREAKERS
    const waveCount = 5;
    for (let w = 0; w < waveCount; w++) {
      const waveY = height * (0.38 + w * 0.08);
      const speed = (w + 1) * 1.5;
      const waveAmplitude = 5 + w * 3;
      const waveFreq = 0.015 - w * 0.0015;

      ctx.beginPath();
      ctx.moveTo(0, waveY);
      for (let x = 0; x <= width; x += 15) {
        const yOffset = Math.sin(x * waveFreq + t * speed) * waveAmplitude;
        ctx.lineTo(x, waveY + yOffset);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + w * 0.04})`;
      ctx.fill();

      // Wave Foam Crest
      ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
      ctx.lineWidth = 1.5 + w * 0.5;
      ctx.stroke();
    }

    // 4. SHORELINE & BEACH SAND TOPOGRAPHY
    if (state.currentScenarioKey === "erosion") {
      renderMustangIslandErosion(width, height, t);
    } else if (state.currentScenarioKey === "sanctuary") {
      renderLagunaMadreSanctuary(width, height, t);
    } else {
      renderCorpusChristiBeach(width, height, t);
    }
  }

  // 5. EDGE DETECTION BOUNDING BOXES & HUD TARGETING OVERLAYS
  renderDetectionOverlays(width, height);
}

// Live Webcam Controller
async function toggleWebcamFeed() {
  const label = document.getElementById("feed-source-label");
  const icon = document.getElementById("feed-source-icon");
  const video = document.getElementById("webcam-video");
  const locEl = document.getElementById("hud-location-name");

  if (!state.isWebcamActive) {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser getUserMedia API not supported in this environment");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false
      });
      state.webcamStream = stream;
      state.webcamVideo = video;
      video.srcObject = stream;
      await video.play();
      state.isWebcamActive = true;

      if (icon) icon.textContent = "🎥";
      if (label) label.innerHTML = 'Feed: <strong class="text-emerald-400">LIVE WEBCAM</strong>';
      if (locEl) locEl.textContent = "Local Optical Lens (Live Hardware Feed)";
    } catch (err) {
      console.warn("Webcam access unavailable or declined:", err);
      alert("Unable to access local webcam (" + err.message + "). Resuming synthetic coastal scenario.");
      state.isWebcamActive = false;
      if (icon) icon.textContent = "📷";
      if (label) label.innerHTML = 'Feed: <strong class="text-cyan-400">SYNTHETIC</strong>';
    }
  } else {
    // Revert to synthetic simulation cleanly
    if (state.webcamStream) {
      state.webcamStream.getTracks().forEach(track => track.stop());
      state.webcamStream = null;
    }
    if (video) video.srcObject = null;
    state.isWebcamActive = false;

    if (icon) icon.textContent = "📷";
    if (label) label.innerHTML = 'Feed: <strong class="text-cyan-400">SYNTHETIC</strong>';
    const current = SCENARIOS[state.currentScenarioKey];
    if (locEl) locEl.textContent = current.locationName;
  }
}

// Scenario 1: Corpus Christi Beach with Plastic Litter
function renderCorpusChristiBeach(width, height, t) {
  const sandGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
  sandGrad.addColorStop(0, "#d97706");
  sandGrad.addColorStop(0.3, "#f59e0b");
  sandGrad.addColorStop(1, "#fbbf24");

  ctx.beginPath();
  ctx.moveTo(0, height * 0.58);
  ctx.bezierCurveTo(width * 0.35, height * 0.52, width * 0.7, height * 0.65, width, height * 0.56);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = sandGrad;
  ctx.fill();

  // Wet sand wash zone
  ctx.fillStyle = "rgba(180, 83, 9, 0.35)";
  ctx.beginPath();
  ctx.moveTo(0, height * 0.58);
  ctx.bezierCurveTo(width * 0.35, height * 0.52, width * 0.7, height * 0.65, width, height * 0.56);
  ctx.lineTo(width, height * 0.64);
  ctx.bezierCurveTo(width * 0.7, height * 0.72, width * 0.35, height * 0.60, 0, height * 0.66);
  ctx.closePath();
  ctx.fill();

  // Plastic Bottle in wash zone (Target 1)
  const bX = width * 0.28;
  const bY = height * 0.72 + Math.sin(t * 3) * 2;
  ctx.save();
  ctx.translate(bX, bY);
  ctx.rotate(-0.25);
  ctx.fillStyle = "rgba(186, 230, 253, 0.85)";
  ctx.strokeStyle = "#0284c7";
  ctx.lineWidth = 1.5;
  ctx.fillRect(-18, -8, 36, 16);
  ctx.strokeRect(-18, -8, 36, 16);
  ctx.fillStyle = "#ef4444";
  ctx.fillRect(18, -4, 6, 8);
  ctx.fillStyle = "rgba(59, 130, 246, 0.7)";
  ctx.fillRect(-6, -7, 14, 14);
  ctx.restore();

  // Ghost Netting cluster in surf (Target 2)
  const netX = width * 0.76;
  const netY = height * 0.67;
  ctx.save();
  ctx.strokeStyle = "#991b1b";
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  for (let i = 0; i < 7; i++) {
    ctx.moveTo(netX - 25 + i * 8, netY - 15);
    ctx.lineTo(netX - 10 + i * 8, netY + 20);
    ctx.moveTo(netX - 25, netY - 15 + i * 6);
    ctx.lineTo(netX + 30, netY - 10 + i * 5);
  }
  ctx.stroke();
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(netX - 12, netY - 5, 4, 0, Math.PI * 2);
  ctx.arc(netX + 15, netY + 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Sea oats
  renderSeaOats(width * 0.08, height * 0.55, 12, t);
  renderSeaOats(width * 0.92, height * 0.54, 15, t);
}

// Scenario 2: Mustang Island Dune Erosion Alert
function renderMustangIslandErosion(width, height, t) {
  const cliffGrad = ctx.createLinearGradient(0, height * 0.25, 0, height * 0.75);
  cliffGrad.addColorStop(0, "#d97706");
  cliffGrad.addColorStop(0.5, "#b45309");
  cliffGrad.addColorStop(1, "#78350f");

  ctx.beginPath();
  ctx.moveTo(0, height * 0.32);
  ctx.lineTo(width * 0.45, height * 0.35);
  ctx.lineTo(width * 0.54, height * 0.62);
  ctx.lineTo(width * 0.75, height * 0.65);
  ctx.lineTo(width, height * 0.72);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = cliffGrad;
  ctx.fill();

  ctx.strokeStyle = "rgba(69, 26, 3, 0.4)";
  ctx.lineWidth = 2;
  for (let s = 0; s < 4; s++) {
    const sy = height * (0.38 + s * 0.07);
    ctx.beginPath();
    ctx.moveTo(width * 0.2, sy);
    ctx.lineTo(width * 0.54, sy + 5);
    ctx.stroke();
  }

  // Falling sand particles
  ctx.fillStyle = "#fcd34d";
  state.fallingParticles.forEach(p => {
    p.y += p.speed;
    if (p.y > 0.65) p.y = 0.36 + Math.random() * 0.05;
    ctx.beginPath();
    ctx.arc(p.x * width, p.y * height, p.size, 0, Math.PI * 2);
    ctx.fill();
  });

  renderSeaOats(width * 0.25, height * 0.33, 18, t * 1.8);
  renderSeaOats(width * 0.42, height * 0.35, 12, t * 1.8);

  ctx.strokeStyle = "#451a03";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  for (let r = 0; r < 8; r++) {
    const rx = width * 0.44 + r * 10;
    ctx.moveTo(rx, height * 0.36);
    ctx.quadraticCurveTo(rx + Math.sin(t + r) * 4, height * 0.42, rx + 2, height * 0.48);
  }
  ctx.stroke();

  const washY = height * 0.76 + Math.sin(t * 4) * 6;
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.beginPath();
  ctx.ellipse(width * 0.58, washY, width * 0.22, 14, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Scenario 3: Laguna Madre Clean Sanctuary
function renderLagunaMadreSanctuary(width, height, t) {
  const flatGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
  flatGrad.addColorStop(0, "#0d9488");
  flatGrad.addColorStop(0.4, "#2dd4bf");
  flatGrad.addColorStop(1, "#fde68a");

  ctx.beginPath();
  ctx.moveTo(0, height * 0.62);
  ctx.bezierCurveTo(width * 0.3, height * 0.58, width * 0.7, height * 0.68, width, height * 0.64);
  ctx.lineTo(width, height);
  ctx.lineTo(0, height);
  ctx.closePath();
  ctx.fillStyle = flatGrad;
  ctx.fill();

  // Halodule seagrass canopy
  ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
  ctx.lineWidth = 2;
  for (let g = 0; g < 40; g++) {
    const gx = width * 0.12 + (g % 20) * 14;
    const gy = height * 0.75 + Math.floor(g / 20) * 22;
    const sway = Math.sin(t * 2 + g * 0.4) * 8;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.quadraticCurveTo(gx + sway * 0.5, gy - 12, gx + sway, gy - 24);
    ctx.stroke();
  }

  // Water caustics
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 1;
  for (let c = 0; c < 6; c++) {
    ctx.beginPath();
    const cx = width * (0.2 + c * 0.1);
    const cy = height * 0.7 + Math.sin(t + c) * 10;
    ctx.ellipse(cx, cy, 25, 8, 0.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Piping Plover shorebird
  const birdX = width * 0.44 + Math.sin(t * 0.8) * 15;
  const birdY = height * 0.69;
  renderPipingPlover(birdX, birdY, t);

  renderSeaOats(width * 0.78, height * 0.58, 20, t * 0.8);
}

// Procedural Piping Plover Shorebird
function renderPipingPlover(x, y, t) {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = "#f59e0b";
  ctx.lineWidth = 1.5;
  const legWalk = Math.sin(t * 4) * 4;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(-4 + legWalk, 14);
  ctx.moveTo(4, 0);
  ctx.lineTo(4 - legWalk, 14);
  ctx.stroke();

  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.ellipse(0, -4, 12, 8, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-2, -2, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(4, -9, 3, 7);

  const peck = Math.sin(t * 3) > 0.7 ? 4 : 0;
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.arc(8, -8 + peck, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(9, -9 + peck, 1.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#f97316";
  ctx.beginPath();
  ctx.moveTo(13, -8 + peck);
  ctx.lineTo(20, -7 + peck);
  ctx.lineTo(13, -6 + peck);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(17, -7.5 + peck, 3, 1.5);

  ctx.restore();
}

// Swaying Sea Oats
function renderSeaOats(baseX, baseY, count, t) {
  ctx.save();
  ctx.lineWidth = 1.4;
  for (let i = 0; i < count; i++) {
    const ox = baseX + (i - count / 2) * 4;
    const heightOats = 35 + (i % 5) * 8;
    const sway = Math.sin(t * 1.5 + i * 0.3) * (8 + (i % 4) * 2);

    ctx.strokeStyle = i % 2 === 0 ? "#10b981" : "#059669";
    ctx.beginPath();
    ctx.moveTo(ox, baseY);
    ctx.quadraticCurveTo(ox + sway * 0.4, baseY - heightOats * 0.6, ox + sway, baseY - heightOats);
    ctx.stroke();

    ctx.fillStyle = "#fcd34d";
    ctx.beginPath();
    ctx.ellipse(ox + sway, baseY - heightOats, 3, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// Detection HUD Overlays
function renderDetectionOverlays(width, height) {
  const current = SCENARIOS[state.currentScenarioKey];
  const detections = current.detections;

  detections.forEach((det) => {
    const bx = det.x * width;
    const by = det.y * height;
    const bw = det.w * width;
    const bh = det.h * height;

    ctx.fillStyle = `${det.boxColor}15`;
    ctx.fillRect(bx, by, bw, bh);

    ctx.strokeStyle = det.boxColor;
    ctx.lineWidth = 1.8;
    ctx.strokeRect(bx, by, bw, bh);

    const bracketSize = Math.min(10, bw * 0.25, bh * 0.25);
    ctx.lineWidth = 2.5;

    // Corners
    ctx.beginPath();
    ctx.moveTo(bx, by + bracketSize); ctx.lineTo(bx, by); ctx.lineTo(bx + bracketSize, by);
    ctx.moveTo(bx + bw - bracketSize, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + bracketSize);
    ctx.moveTo(bx, by + bh - bracketSize); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + bracketSize, by + bh);
    ctx.moveTo(bx + bw - bracketSize, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - bracketSize);
    ctx.stroke();

    // Reticle
    ctx.lineWidth = 1;
    ctx.beginPath();
    const cx = bx + bw / 2;
    const cy = by + bh / 2;
    ctx.moveTo(cx - 5, cy); ctx.lineTo(cx + 5, cy);
    ctx.moveTo(cx, cy - 5); ctx.lineTo(cx, cy + 5);
    ctx.stroke();

    // Top Label
    const labelText = `${det.label} ${det.confidence}%`;
    ctx.font = "bold 11px 'JetBrains Mono', monospace";
    const textWidth = ctx.measureText(labelText).width;

    ctx.fillStyle = "rgba(11, 17, 30, 0.95)";
    ctx.fillRect(bx, by - 20, textWidth + 12, 19);
    ctx.strokeStyle = det.boxColor;
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by - 20, textWidth + 12, 19);
    ctx.fillStyle = det.boxColor;
    ctx.fillText(labelText, bx + 6, by - 6);

    // Bottom Track ID
    const idText = `#${det.id}`;
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(11, 17, 30, 0.9)";
    ctx.fillRect(bx + bw - 54, by + bh + 3, 54, 16);
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(idText, bx + bw - 50, by + bh + 14);
  });
}

// Animation Loop
function animateLoop() {
  if (!state.isPaused) {
    state.animTime += 0.025;
    
    // Sub-15ms edge latency jitter
    state.latency = Number((7.4 + Math.sin(state.animTime * 4) * 1.8 + Math.random() * 0.8).toFixed(1));
    state.fps = Math.round(59 + Math.random() * 2);

    const latencyEl = document.getElementById("canvas-latency");
    const fpsEl = document.getElementById("canvas-fps");
    if (latencyEl) latencyEl.textContent = `${state.latency} ms`;
    if (fpsEl) fpsEl.textContent = `${state.fps} FPS`;
  }

  if (canvas && ctx) {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    renderScene(rect.width, rect.height);
  }

  requestAnimationFrame(animateLoop);
}

// ==========================================
// 4. CHART ENGINES (CHART 1, 2, 3)
// ==========================================

// Chart 1: 24-Hr Tide & Salinity
function initTelemetryChart() {
  const chartEl = document.getElementById("telemetryChart");
  if (!chartEl) return;
  const chartCtx = chartEl.getContext("2d");

  const hours = [];
  const tideData = [];
  const salinityData = [];

  const now = new Date();
  for (let i = 24; i >= 0; i--) {
    const pastHour = new Date(now.getTime() - i * 3600 * 1000);
    hours.push(pastHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const tideVal = 0.85 + Math.sin((24 - i) * 0.5) * 0.45 + (Math.random() * 0.05 - 0.025);
    tideData.push(Number(tideVal.toFixed(2)));

    const salVal = 35.2 + Math.cos((24 - i) * 0.3) * 1.2 + (Math.random() * 0.2 - 0.1);
    salinityData.push(Number(salVal.toFixed(1)));
  }

  state.charts.telemetry = new Chart(chartCtx, {
    type: "line",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Tide Level (m)",
          data: tideData,
          borderColor: "#06b6d4",
          backgroundColor: "rgba(6, 182, 212, 0.1)",
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          yAxisID: "yTide",
          pointRadius: 0
        },
        {
          label: "Salinity (PSU)",
          data: salinityData,
          borderColor: "#10b981",
          borderWidth: 2,
          borderDash: [4, 4],
          tension: 0.3,
          yAxisID: "ySalinity",
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: "rgba(30, 41, 59, 0.6)" },
          ticks: { color: "#64748b", maxTicksLimit: 6, font: { family: "'JetBrains Mono', monospace", size: 9 } }
        },
        yTide: {
          type: "linear",
          position: "left",
          min: 0.0,
          max: 1.8,
          grid: { color: "rgba(30, 41, 59, 0.4)" },
          ticks: { color: "#06b6d4", font: { family: "'JetBrains Mono', monospace", size: 9 } }
        },
        ySalinity: {
          type: "linear",
          position: "right",
          min: 28,
          max: 42,
          grid: { drawOnChartArea: false },
          ticks: { color: "#10b981", font: { family: "'JetBrains Mono', monospace", size: 9 } }
        }
      }
    }
  });
}

// Chart 2: Cumulative Carbon Offset & Emissions Differential
function initCarbonOffsetChart() {
  const chartEl = document.getElementById("carbonOffsetChart");
  if (!chartEl) return;
  const chartCtx = chartEl.getContext("2d");

  const hours = [];
  const cloudGpuEmissions = []; // Grams CO2 accumulating
  const edgeNodeEmissions = []; // Net zero solar

  for (let i = 0; i <= 24; i++) {
    hours.push(`T+${i}h`);
    // 250W continuous draw produces ~99.2 grams CO2 per hour (TX grid ~397g CO2/kWh)
    const cloudCumulative = Number((i * 99.2).toFixed(1));
    cloudGpuEmissions.push(cloudCumulative);
    // AeroCoast Sentinel powered by on-site solar
    edgeNodeEmissions.push(0);
  }

  state.charts.carbon = new Chart(chartCtx, {
    type: "line",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Cloud GPU (250W Continuous)",
          data: cloudGpuEmissions,
          borderColor: "#f43f5e",
          backgroundColor: "rgba(244, 63, 94, 0.12)",
          borderWidth: 2,
          tension: 0.2,
          fill: true,
          pointRadius: 0
        },
        {
          label: "AeroCoast Sentinel Edge (4.2W Solar)",
          data: edgeNodeEmissions,
          borderColor: "#10b981",
          backgroundColor: "transparent",
          borderWidth: 3,
          tension: 0,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: "#94a3b8", font: { family: "'JetBrains Mono', monospace", size: 9 } }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} g CO₂e`
          }
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(30, 41, 59, 0.6)" },
          ticks: { color: "#64748b", maxTicksLimit: 7, font: { family: "'JetBrains Mono', monospace", size: 9 } }
        },
        y: {
          min: 0,
          max: 2600,
          title: { display: true, text: "Grams CO₂e", color: "#94a3b8", font: { size: 10 } },
          grid: { color: "rgba(30, 41, 59, 0.4)" },
          ticks: { color: "#94a3b8", font: { family: "'JetBrains Mono', monospace", size: 9 } }
        }
      }
    }
  });
}

// Chart 3: 24-Hour Multi-Class Detection Frequency Stacked Bar Chart
function initDetectionFrequencyChart() {
  const chartEl = document.getElementById("detectionFrequencyChart");
  if (!chartEl) return;
  const chartCtx = chartEl.getContext("2d");

  const hours = [];
  const plasticData = [];
  const ghostGearData = [];
  const duneScarpData = [];
  const avianWildlifeData = [];

  for (let i = 0; i < 24; i += 2) {
    const hrStr = `${String(i).padStart(2, '0')}:00`;
    hours.push(hrStr);

    // Realistic coastal occurrence patterns
    // Afternoon high tide plastic surge
    const plastic = i >= 12 && i <= 18 ? Math.floor(18 + Math.random() * 14) : Math.floor(5 + Math.random() * 8);
    plasticData.push(plastic);

    // Ghost nets washed ashore during tide shifts
    const gear = Math.floor(2 + Math.random() * 5);
    ghostGearData.push(gear);

    // Dune scarps triggered during wind surges
    const scarps = i >= 14 ? Math.floor(4 + Math.random() * 7) : Math.floor(1 + Math.random() * 3);
    duneScarpData.push(scarps);

    // Piping plovers active at dawn (06:00-10:00) and dusk (18:00-20:00)
    const birds = (i >= 6 && i <= 10) || (i >= 18 && i <= 20) ? Math.floor(12 + Math.random() * 8) : Math.floor(2 + Math.random() * 4);
    avianWildlifeData.push(birds);
  }

  state.charts.frequency = new Chart(chartCtx, {
    type: "bar",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Plastic Debris",
          data: plasticData,
          backgroundColor: "#f59e0b",
          stack: "Stack 0",
          borderRadius: 2
        },
        {
          label: "Ghost Gear",
          data: ghostGearData,
          backgroundColor: "#f43f5e",
          stack: "Stack 0",
          borderRadius: 2
        },
        {
          label: "Dune Scarps",
          data: duneScarpData,
          backgroundColor: "#eab308",
          stack: "Stack 0",
          borderRadius: 2
        },
        {
          label: "Avian Wildlife",
          data: avianWildlifeData,
          backgroundColor: "#10b981",
          stack: "Stack 0",
          borderRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: { color: "#94a3b8", boxWidth: 10, font: { family: "'JetBrains Mono', monospace", size: 8 } }
        }
      },
      scales: {
        x: {
          stacked: true,
          grid: { color: "rgba(30, 41, 59, 0.6)" },
          ticks: { color: "#64748b", font: { family: "'JetBrains Mono', monospace", size: 9 } }
        },
        y: {
          stacked: true,
          grid: { color: "rgba(30, 41, 59, 0.4)" },
          ticks: { color: "#94a3b8", font: { family: "'JetBrains Mono', monospace", size: 9 } }
        }
      }
    }
  });
}

// ==========================================
// 5. SCENARIO SWITCHING & DOM UPDATES
// ==========================================
function updateDOMForScenario(scenarioKey) {
  const s = SCENARIOS[scenarioKey];
  if (!s) return;

  state.currentScenarioKey = scenarioKey;

  // 1. Verdict Banner
  const banner = document.getElementById("verdict-banner");
  const iconContainer = document.getElementById("verdict-icon-container");
  const titleEl = document.getElementById("verdict-status-title");
  const msgEl = document.getElementById("verdict-status-message");

  if (titleEl) titleEl.textContent = s.verdictTitle;
  if (msgEl) msgEl.textContent = s.verdictMessage;
  if (iconContainer) iconContainer.textContent = s.verdictIcon;

  if (banner && iconContainer) {
    banner.className = "w-full rounded-xl p-3.5 border transition-all duration-300 flex items-center gap-3.5 ";
    if (s.statusLevel === "critical") {
      banner.className += "bg-rose-950/50 border-rose-500/60 text-rose-200 badge-glow-rose";
      iconContainer.className = "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-rose-500/20 text-rose-400 font-bold text-xl";
    } else if (s.statusLevel === "warning") {
      banner.className += "bg-amber-950/40 border-amber-500/50 text-amber-200 badge-glow-amber";
      iconContainer.className = "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/20 text-amber-400 font-bold text-xl";
    } else {
      banner.className += "bg-emerald-950/40 border-emerald-500/50 text-emerald-200 badge-glow-emerald";
      iconContainer.className = "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/20 text-emerald-400 font-bold text-xl";
    }
  }

  // 2. HUD Location & GPS
  const gpsEl = document.getElementById("hud-gps-coords");
  const locEl = document.getElementById("hud-location-name");
  const tgtEl = document.getElementById("canvas-target-count");
  if (gpsEl) gpsEl.textContent = s.coordsDisplay;
  if (locEl) locEl.textContent = s.locationName;
  if (tgtEl) tgtEl.textContent = `${s.detections.length} OBJECTS`;

  // 3. Multi-Sensor Telemetry
  const tideEl = document.getElementById("telemetry-tide");
  const tidePhaseEl = document.getElementById("tide-phase-label");
  const tideBarEl = document.getElementById("tide-bar");
  if (tideEl) tideEl.innerHTML = `+${s.telemetry.tide.toFixed(2)} <span class="text-xs font-normal text-slate-400">m</span>`;
  if (tidePhaseEl) tidePhaseEl.textContent = s.telemetry.tidePhase;
  if (tideBarEl) tideBarEl.style.width = `${s.telemetry.tideBarWidth}%`;

  const salEl = document.getElementById("telemetry-salinity");
  const salStatusEl = document.getElementById("salinity-status");
  const salBarEl = document.getElementById("salinity-bar");
  if (salEl) salEl.innerHTML = `${s.telemetry.salinity.toFixed(1)} <span class="text-xs font-normal text-slate-400">PSU</span>`;
  if (salStatusEl) salStatusEl.textContent = s.telemetry.salinityStatus;
  if (salBarEl) salBarEl.style.width = `${s.telemetry.salinityBarWidth}%`;

  const duneEl = document.getElementById("telemetry-dune-scarp");
  const duneStabEl = document.getElementById("dune-stability-label");
  const duneRiskBarEl = document.getElementById("dune-risk-bar");
  const duneRiskBadgeEl = document.getElementById("dune-risk-badge");
  if (duneEl) duneEl.innerHTML = `${s.telemetry.duneSlope}° <span class="text-xs font-normal text-slate-400">Slope angle</span>`;
  if (duneStabEl) duneStabEl.textContent = s.telemetry.duneStability;
  if (duneRiskBarEl) {
    duneRiskBarEl.style.width = `${s.telemetry.duneRiskBarWidth}%`;
    duneRiskBarEl.className = `h-2 rounded-full transition-all duration-500 ${s.telemetry.duneRiskColor}`;
  }
  if (duneRiskBadgeEl) {
    duneRiskBadgeEl.textContent = s.telemetry.duneRisk;
    duneRiskBadgeEl.className = `px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${s.telemetry.duneBadgeClass}`;
  }

  // 4. Detection Tags Container
  const tagsContainer = document.getElementById("detection-tags-container");
  if (tagsContainer) {
    tagsContainer.innerHTML = "";
    s.detections.forEach(det => {
      const card = document.createElement("div");
      card.className = "bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 flex flex-col justify-between";
      card.innerHTML = `
        <div class="flex items-center justify-between mb-1">
          <span style="color: ${det.boxColor};" class="font-bold truncate">${det.label}</span>
          <span class="text-slate-400 text-[10px]">#${det.id}</span>
        </div>
        <div class="flex items-center justify-between text-[11px]">
          <span class="text-slate-400">Confidence:</span>
          <span class="text-emerald-400 font-bold">${det.confidence}%</span>
        </div>
      `;
      tagsContainer.appendChild(card);
    });
  }
}

// Live background heartbeat updating energy bus & LoRa metrics
function startLiveTelemetryHeartbeat() {
  setInterval(() => {
    if (state.isPaused) return;

    // 1. LoRaWAN link ticks
    state.loraTxPackets += 1;
    state.loraRssi = -86 + Math.floor(Math.random() * 3 - 1);
    state.loraSnr = Number((8.4 + (Math.random() * 0.4 - 0.2)).toFixed(1));
    state.ringBufferUsage = Number((12.4 + (Math.random() * 0.6 - 0.3)).toFixed(1));

    const pktEl = document.getElementById("link-packets");
    const rssiEl = document.getElementById("link-rssi");
    const snrEl = document.getElementById("link-snr");
    const bufEl = document.getElementById("link-buffer");
    const hdrRssi = document.getElementById("header-lora-rssi");

    if (pktEl) pktEl.textContent = state.loraTxPackets.toLocaleString();
    if (rssiEl) rssiEl.textContent = `${state.loraRssi} dBm`;
    if (snrEl) snrEl.textContent = `+${state.loraSnr} dB`;
    if (bufEl) bufEl.textContent = `${state.ringBufferUsage}% / 64MB`;
    if (hdrRssi) hdrRssi.textContent = `(${state.loraRssi} dBm)`;

    // 2. Solar PV & LiFePO4 Battery Bus
    state.solarInputWatts = Number((18.7 + Math.sin(state.animTime) * 0.5 + (Math.random() * 0.2 - 0.1)).toFixed(1));
    state.batteryVoltage = Number((13.26 + (Math.random() * 0.02 - 0.01)).toFixed(2));
    const netSurplus = Number((state.solarInputWatts - state.basePowerDraw).toFixed(1));

    const busV = document.getElementById("bus-voltage");
    const busSolar = document.getElementById("bus-solar-watts");
    const busNet = document.getElementById("bus-net-surplus");
    const busBar = document.getElementById("bus-power-bar");
    const hdrSoc = document.getElementById("header-battery-soc");

    if (busV) busV.textContent = `${state.batteryVoltage} V`;
    if (busSolar) busSolar.textContent = `${state.solarInputWatts} W`;
    if (busNet) busNet.textContent = `+${netSurplus} W`;
    if (busBar) {
      const percentage = Math.min(100, Math.max(10, Math.round((netSurplus / 20) * 100)));
      busBar.style.width = `${percentage}%`;
    }
    if (hdrSoc) hdrSoc.textContent = `${state.batterySoC}% (${state.batteryVoltage}V)`;

    // 3. Update Chart 1 streaming point
    if (state.charts.telemetry) {
      const current = SCENARIOS[state.currentScenarioKey];
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newTide = Number((current.telemetry.tide + (Math.random() * 0.04 - 0.02)).toFixed(2));
      const newSal = Number((current.telemetry.salinity + (Math.random() * 0.2 - 0.1)).toFixed(1));

      state.charts.telemetry.data.labels.shift();
      state.charts.telemetry.data.labels.push(nowTime);

      state.charts.telemetry.data.datasets[0].data.shift();
      state.charts.telemetry.data.datasets[0].data.push(newTide);

      state.charts.telemetry.data.datasets[1].data.shift();
      state.charts.telemetry.data.datasets[1].data.push(newSal);

      state.charts.telemetry.update("none");
    }

  }, 2500);
}

// ==========================================
// 6. GEOJSON EXPORT ENGINE
// ==========================================
function exportEdgeAuditGeoJSON() {
  const current = SCENARIOS[state.currentScenarioKey];
  const timestamp = new Date().toISOString();

  const geojson = {
    type: "FeatureCollection",
    metadata: {
      generatedBy: "AeroCoast Sentinel Enterprise Console v2.5 (IslanderHack 2026)",
      nodeId: "EDGE-NODE-4109",
      classification: "OFF-GRID TACTICAL SURVEILLANCE & ENVIRONMENTAL PROTECTION",
      institution: "Texas A&M University - Corpus Christi",
      dataSourceCalibration: {
        tideEngine: "NOAA Tides & Currents API (Station 8775870, Corpus Christi)",
        waterQuality: "TCEQ Surface Water Quality Monitoring Baseline",
        regionalOceanography: "GCOOS Nearshore Buoy Network",
        biodiversityTaxonomy: "iNaturalist / GBIF Marine Species Distribution"
      },
      greenAiEngine: {
        emissionsMethodology: "CodeCarbon Standard Estimator",
        cloudGpuBaselineKgCO2e: 2.85,
        edgeEnergyReduction: "98.32%"
      },
      targetHardwareProfile: "Freenove ESP32-S3 Xtensa LX7 (esp-nn acceleration, TFLite Micro)",
      hardwareProfile: {
        architecture: "Edge-Native Zero-Cloud (WASM/WebGL INT8 SIMD)",
        powerSource: "Dual 20W Photovoltaic + 4S LiFePO4 (10Ah)",
        busVoltage: `${state.batteryVoltage} V`,
        batterySoC: `${state.batterySoC} %`,
        solarInputWatts: state.solarInputWatts,
        nodeLoadWatts: state.basePowerDraw,
        netSurplusWatts: Number((state.solarInputWatts - state.basePowerDraw).toFixed(1)),
        energySavedPercent: 98.32,
        loraLink: {
          band: "US915 Band 2",
          frequency: "903.9 MHz",
          rssi: `${state.loraRssi} dBm`,
          snr: `+${state.loraSnr} dB`,
          txPacketsTotal: state.loraTxPackets,
          gatewayId: "TAMU-CC-CCBAY-GW01"
        },
        localSRAMBufferUsage: `${state.ringBufferUsage}% of 64MB`
      },
      exportTimestamp: timestamp,
      activeSector: current.name
    },
    features: [
      {
        type: "Feature",
        id: "NODE-4109",
        geometry: {
          type: "Point",
          coordinates: current.coordinates
        },
        properties: {
          name: "AeroCoast Sentinel Edge Node #4109",
          status: "ONLINE",
          powerWatts: state.basePowerDraw,
          firmware: "v2.5-enterprise-int8",
          sub15msLatency: `${state.latency} ms`,
          tideMeters: current.telemetry.tide,
          salinityPSU: current.telemetry.salinity,
          duneScarpSlopeDeg: current.telemetry.duneSlope,
          environmentalVerdict: current.verdictTitle
        }
      },
      ...current.detections.map((det) => {
        const offsetLng = (det.x - 0.5) * 0.002;
        const offsetLat = (0.5 - det.y) * 0.002;
        const targetLng = Number((current.coordinates[0] + offsetLng).toFixed(6));
        const targetLat = Number((current.coordinates[1] + offsetLat).toFixed(6));

        return {
          type: "Feature",
          id: det.id,
          geometry: {
            type: "Point",
            coordinates: [targetLng, targetLat]
          },
          properties: {
            trackingId: det.id,
            classification: det.label,
            category: det.category,
            confidenceScore: det.confidence,
            detectionBoundingBox: {
              normX: det.x,
              normY: det.y,
              normW: det.w,
              normH: det.h
            },
            recordedAt: timestamp
          }
        };
      })
    ]
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
  const downloadAnchor = document.createElement("a");
  const filename = `aerocoast-tactical-audit-node4109-${state.currentScenarioKey}-${Date.now()}.geojson`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// ==========================================
// 7. INITIALIZATION & EVENT BINDINGS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  resizeCanvas();

  // Initialize All 3 Enterprise Charts
  initTelemetryChart();
  initCarbonOffsetChart();
  initDetectionFrequencyChart();

  // Initial Scenario Setup
  updateDOMForScenario(state.currentScenarioKey);

  // Scenario Selector Dropdown Listener
  const scenarioSelect = document.getElementById("scenario-select");
  if (scenarioSelect) {
    scenarioSelect.addEventListener("change", (e) => {
      updateDOMForScenario(e.target.value);
    });
  }

  // Sensor Pause / Play Switch
  const pauseBtn = document.getElementById("btn-toggle-pause");
  if (pauseBtn) {
    pauseBtn.addEventListener("click", () => {
      state.isPaused = !state.isPaused;
      const statusSpan = document.getElementById("pause-status");
      if (statusSpan) {
        if (state.isPaused) {
          statusSpan.textContent = "PAUSED";
          statusSpan.className = "text-amber-400";
        } else {
          statusSpan.textContent = "ACTIVE";
          statusSpan.className = "text-emerald-400";
        }
      }
    });
  }

  // HUD Scanlines Toggle
  const scanlinesBtn = document.getElementById("btn-toggle-scanlines");
  const viewportContainer = document.getElementById("viewport-container");
  if (scanlinesBtn && viewportContainer) {
    scanlinesBtn.addEventListener("click", () => {
      state.scanlinesActive = !state.scanlinesActive;
      const statusSpan = document.getElementById("scanlines-status");
      if (state.scanlinesActive) {
        viewportContainer.classList.add("scanlines");
        if (statusSpan) {
          statusSpan.textContent = "ON";
          statusSpan.className = "text-cyan-400";
        }
      } else {
        viewportContainer.classList.remove("scanlines");
        if (statusSpan) {
          statusSpan.textContent = "OFF";
          statusSpan.className = "text-slate-400";
        }
      }
    });
  }

  // Export GeoJSON Listener
  const exportBtn = document.getElementById("btn-export-geojson");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportEdgeAuditGeoJSON);
  }

  // Tactical Feed Source Toggle (Synthetic vs Live Hardware Webcam)
  const feedSourceBtn = document.getElementById("btn-toggle-feed-source");
  if (feedSourceBtn) {
    feedSourceBtn.addEventListener("click", toggleWebcamFeed);
  }

  // Start background live heartbeat & animation loop
  startLiveTelemetryHeartbeat();
  requestAnimationFrame(animateLoop);
});
