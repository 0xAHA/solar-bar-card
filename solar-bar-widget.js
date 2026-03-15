// Solar Bar Widget for Scriptable (iOS Medium Widget)
// Replicates the Solar Bar Card with animated energy flow dots
//
// ─── SETUP ───────────────────────────────────────────────
// 1. Install Scriptable from the App Store
// 2. Create a new script and paste this entire file
// 3. Configure the HA_URL, HA_TOKEN, and entity IDs below
// 4. Add a medium Scriptable widget to your home screen
// 5. Set the script to this file, and "When Interacting" to "Run Script"
//
// The widget auto-refreshes every ~5 minutes (iOS limitation).
// Tap the widget to open Scriptable and see an animated preview.
// ──────────────────────────────────────────────────────────

// ─── CONFIGURATION ───────────────────────────────────────
const CONFIG = {
  // Home Assistant connection
  HA_URL: "http://your-ha-instance:8123",
  HA_TOKEN: "YOUR_LONG_LIVED_ACCESS_TOKEN",

  // Entity IDs (set to null if not available)
  entities: {
    solar_production: "sensor.solar_power",
    grid_power: "sensor.grid_power",          // positive = export, negative = import (set invert_grid below if reversed)
    battery_power: "sensor.battery_power",     // positive = charging, negative = discharging
    battery_soc: "sensor.battery_soc",
    home_consumption: "sensor.home_consumption",
  },

  // If your grid sensor is positive=import, set this to true
  invert_grid: false,

  // Inverter size in kW (determines bar max width)
  inverter_size: 10,

  // Battery capacity in kW (determines battery bar width relative to inverter)
  battery_capacity: 5,

  // Show battery bar
  show_battery: true,

  // Animation speed (seconds per cycle) — used in live preview only
  flow_speed: 2,

  // Color palette (classic solar theme)
  colors: {
    solar:             "#FFE082",
    self_usage:        "#B39DDB",
    export:            "#A5D6A7",
    import:            "#FFAB91",
    battery_charge:    "#80DEEA",
    battery_discharge: "#64B5F6",
    battery_bar:       "#90CAF9",
    bar_background:    "#3A3A3C",
    card_background:   "#1C1C1E",
    text_primary:      "#FFFFFF",
    text_secondary:    "#8E8E93",
    bus_line:          "#8E8E93",
  },
};

// ─── FETCH DATA FROM HOME ASSISTANT ──────────────────────
async function fetchStates() {
  const states = {};
  const entityIds = Object.values(CONFIG.entities).filter(Boolean);

  try {
    const req = new Request(`${CONFIG.HA_URL}/api/states`);
    req.headers = {
      Authorization: `Bearer ${CONFIG.HA_TOKEN}`,
      "Content-Type": "application/json",
    };
    req.timeoutInterval = 10;
    const allStates = await req.loadJSON();
    const stateMap = {};
    for (const s of allStates) {
      stateMap[s.entity_id] = s;
    }
    for (const [key, entityId] of Object.entries(CONFIG.entities)) {
      if (entityId && stateMap[entityId]) {
        const val = parseFloat(stateMap[entityId].state);
        states[key] = isNaN(val) ? 0 : val;
      } else {
        states[key] = 0;
      }
    }
  } catch (e) {
    console.log("HA fetch error: " + e.message);
    // Return demo data if fetch fails
    return getDemoData();
  }
  return states;
}

function getDemoData() {
  return {
    solar_production: 4.2,
    grid_power: 1.5,       // exporting 1.5 kW
    battery_power: 0.8,    // charging 0.8 kW
    battery_soc: 65,
    home_consumption: 1.9,
  };
}

// ─── ENERGY CALCULATIONS ─────────────────────────────────
function calculateEnergy(states) {
  const solar = Math.max(0, states.solar_production);
  const battPower = states.battery_power;
  const battSOC = Math.max(0, Math.min(100, states.battery_soc));

  let gridRaw = states.grid_power;
  if (CONFIG.invert_grid) gridRaw = -gridRaw;
  // positive = export, negative = import
  const exportPower = Math.max(0, gridRaw);
  const importPower = Math.max(0, -gridRaw);

  const batteryCharging = Math.max(0, battPower);
  const batteryDischarging = Math.max(0, -battPower);

  const solarToHome = Math.max(0, solar - exportPower - batteryCharging);
  const homeConsumption = states.home_consumption > 0
    ? states.home_consumption
    : solarToHome + importPower + batteryDischarging;

  return {
    solar, exportPower, importPower,
    batteryCharging, batteryDischarging, battSOC,
    solarToHome, homeConsumption,
  };
}

// ─── DRAWING HELPERS ─────────────────────────────────────
function hexToRGB(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  r = Math.min(r, h / 2, w / 2);
  const path = new Path();
  path.move(new Point(x + r, y));
  path.addLine(new Point(x + w - r, y));
  path.addQuadCurve(new Point(x + w, y + r), new Point(x + w, y));
  path.addLine(new Point(x + w, y + h - r));
  path.addQuadCurve(new Point(x + w - r, y + h), new Point(x + w, y + h));
  path.addLine(new Point(x + r, y + h));
  path.addQuadCurve(new Point(x, y + h - r), new Point(x, y + h));
  path.addLine(new Point(x, y + r));
  path.addQuadCurve(new Point(x + r, y), new Point(x, y));
  path.closeSubpath();
  ctx.addPath(path);
  ctx.fillPath();
}

function drawCircle(ctx, cx, cy, r) {
  const path = new Path();
  path.addEllipse(new Rect(cx - r, cy - r, r * 2, r * 2));
  ctx.addPath(path);
  ctx.fillPath();
}

function estimateTextWidth(text, fontSize) {
  // Approximate character widths for system semibold font
  let width = 0;
  for (const ch of text) {
    if (ch === ' ') width += fontSize * 0.3;
    else if (ch >= '0' && ch <= '9') width += fontSize * 0.58;
    else if (ch === '.') width += fontSize * 0.3;
    else if (ch === '%') width += fontSize * 0.7;
    else if (ch === '/') width += fontSize * 0.35;
    else if (ch === '⌂' || ch === '⚡' || ch === '☀' || ch === '🌙' || ch === '🏠') width += fontSize * 1.0;
    else if (ch >= 'A' && ch <= 'Z') width += fontSize * 0.65;
    else if (ch >= 'a' && ch <= 'z') width += fontSize * 0.52;
    else width += fontSize * 0.55;
  }
  return width;
}

function drawText(ctx, text, x, y, fontSize, color, align) {
  ctx.setFont(Font.semiboldSystemFont(fontSize));
  ctx.setTextColor(new Color(color));
  const estW = estimateTextWidth(text, fontSize);
  const estH = fontSize * 1.2;
  let drawX = x;
  if (align === "center") drawX = x - estW / 2;
  else if (align === "right") drawX = x - estW;
  ctx.drawTextInRect(text, new Rect(drawX, y - estH / 2, estW + 10, estH + 4));
}

// ─── DRAW ENERGY FLOW CURVES ─────────────────────────────
function drawBusLine(ctx, points, color, alpha) {
  const path = new Path();
  path.move(new Point(points[0].x, points[0].y));
  for (let i = 1; i < points.length; i++) {
    if (points[i].cp) {
      path.addQuadCurve(
        new Point(points[i].x, points[i].y),
        new Point(points[i].cp.x, points[i].cp.y)
      );
    } else {
      path.addLine(new Point(points[i].x, points[i].y));
    }
  }
  ctx.addPath(path);
  ctx.setStrokeColor(new Color(color, alpha));
  ctx.setLineWidth(1.5);
  ctx.strokePath();
}

function getPointOnPath(points, t) {
  // Simple linear interpolation along the polyline
  if (points.length < 2) return points[0] || { x: 0, y: 0 };
  // Calculate total length
  let segments = [];
  let totalLen = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push(len);
    totalLen += len;
  }
  const targetDist = t * totalLen;
  let traveled = 0;
  for (let i = 0; i < segments.length; i++) {
    if (traveled + segments[i] >= targetDist) {
      const segT = (targetDist - traveled) / segments[i];
      return {
        x: points[i].x + (points[i + 1].x - points[i].x) * segT,
        y: points[i].y + (points[i + 1].y - points[i].y) * segT,
      };
    }
    traveled += segments[i];
  }
  return points[points.length - 1];
}

function drawFlowDots(ctx, points, color, numDots, phase) {
  for (let i = 0; i < numDots; i++) {
    const t = ((phase + i / numDots) % 1 + 1) % 1;
    const pt = getPointOnPath(points, t);
    // Fade in/out at endpoints
    const edgeFade = Math.min(t, 1 - t) * 5;
    const alpha = Math.min(0.9, edgeFade);
    ctx.setFillColor(new Color(color, alpha));
    drawCircle(ctx, pt.x, pt.y, 3);
  }
}

// ─── MAIN WIDGET RENDERING ──────────────────────────────
function renderWidget(ctx, width, height, energy, animPhase) {
  const c = CONFIG.colors;
  const pad = { left: 16, right: 16, top: 12, bottom: 10 };

  // ── Background
  ctx.setFillColor(new Color(c.card_background));
  drawRoundedRect(ctx, 0, 0, width, height, 20);

  // ── Layout constants
  const barH = 24;
  const iconR = 14;
  const gap = 8;
  const flowAreaH = 32;

  const contentW = width - pad.left - pad.right;

  // ── Header
  const headerY = pad.top;
  const solarLabel = energy.solar > 0
    ? `☀️ ${energy.solar.toFixed(1)} kW`
    : "🌙 Standby";
  drawText(ctx, solarLabel, pad.left, headerY + 8, 14, c.text_primary, "left");

  const homeLabel = `🏠 ${energy.homeConsumption.toFixed(1)} kW`;
  drawText(ctx, homeLabel, width - pad.right, headerY + 8, 12, c.text_secondary, "right");

  // ── Bars area
  const barAreaTop = headerY + 26;
  const barY = barAreaTop;

  // Calculate element positions
  let x = pad.left;
  const positions = {};

  // House icon
  positions.house = { cx: x + iconR, cy: barY + barH / 2 };
  x += iconR * 2 + gap;

  // Battery bar (if enabled)
  let battBarW = 0;
  if (CONFIG.show_battery && CONFIG.entities.battery_soc) {
    battBarW = Math.max(30, (CONFIG.battery_capacity / CONFIG.inverter_size) * contentW * 0.3);
    positions.battery = { x: x, y: barY, w: battBarW, cx: x + battBarW / 2, cy: barY + barH / 2 };
    x += battBarW + gap;
  }

  // Solar bar (fills remaining space minus grid icon)
  const gridIconSpace = iconR * 2 + gap;
  const solarBarW = width - pad.right - gridIconSpace - x;
  positions.solar = { x: x, y: barY, w: Math.max(10, solarBarW), cx: x + Math.max(10, solarBarW) / 2, cy: barY + barH / 2 };
  x += Math.max(10, solarBarW) + gap;

  // Grid icon
  positions.grid = { cx: x + iconR, cy: barY + barH / 2 };

  // ── Draw House Icon
  const houseColor = energy.importPower > 0 && energy.solar <= 0 ? c.import : c.self_usage;
  ctx.setFillColor(new Color(houseColor));
  drawCircle(ctx, positions.house.cx, positions.house.cy, iconR);
  drawText(ctx, "⌂", positions.house.cx, positions.house.cy, 14, "#FFFFFF", "center");

  // ── Draw Battery Bar
  if (positions.battery) {
    const batt = positions.battery;
    ctx.setFillColor(new Color(c.bar_background));
    drawRoundedRect(ctx, batt.x, batt.y, batt.w, barH, barH / 2);

    // Fill
    const fillW = Math.max(0, (energy.battSOC / 100) * batt.w);
    let fillColor = c.battery_bar;
    if (energy.batteryCharging > 0) fillColor = c.battery_charge;
    if (energy.batteryDischarging > 0) fillColor = c.battery_discharge;
    if (energy.battSOC < 20) fillColor = "#f44336";

    if (fillW > 0) {
      ctx.setFillColor(new Color(fillColor));
      // Clip fill to bar shape
      const clippedW = Math.min(fillW, batt.w);
      drawRoundedRect(ctx, batt.x, batt.y, clippedW, barH, barH / 2);
    }

    // SOC text
    if (batt.w > 35) {
      drawText(ctx, `${Math.round(energy.battSOC)}%`, batt.cx, batt.cy, 10, "#FFFFFF", "center");
    }
  }

  // ── Draw Solar Bar
  const sb = positions.solar;
  ctx.setFillColor(new Color(c.bar_background));
  drawRoundedRect(ctx, sb.x, sb.y, sb.w, barH, barH / 2);

  if (energy.solar > 0) {
    const invSize = CONFIG.inverter_size;
    const totalProd = Math.min(energy.solar, invSize);
    const barScale = sb.w / invSize;
    let segX = sb.x;

    // Segments: solarToHome, batteryCharging, export, unused
    const segments = [
      { value: energy.solarToHome, color: c.self_usage, label: `${energy.solarToHome.toFixed(1)}` },
      { value: energy.batteryCharging, color: c.battery_charge, label: `${energy.batteryCharging.toFixed(1)}` },
      { value: energy.exportPower, color: c.export, label: `${energy.exportPower.toFixed(1)}` },
    ].filter(s => s.value > 0);

    for (const seg of segments) {
      const segW = seg.value * barScale;
      if (segW > 1) {
        ctx.setFillColor(new Color(seg.color));
        drawRoundedRect(ctx, segX, sb.y, Math.min(segW, sb.x + sb.w - segX), barH, segX === sb.x ? barH / 2 : 2);
        if (segW > 28) {
          drawText(ctx, seg.label, segX + segW / 2, sb.cy, 9, "#FFFFFF", "center");
        }
        segX += segW;
      }
    }
  } else {
    // Standby — grey bar, subdued
    ctx.setFillColor(new Color("#E0E0E0", 0.15));
    drawRoundedRect(ctx, sb.x, sb.y, sb.w, barH, barH / 2);
  }

  // ── Draw Grid Icon
  let gridColor = "#9E9E9E";
  if (energy.importPower > 0) gridColor = c.import;
  if (energy.exportPower > 0) gridColor = c.export;
  ctx.setFillColor(new Color(gridColor));
  drawCircle(ctx, positions.grid.cx, positions.grid.cy, iconR);
  drawText(ctx, "⚡", positions.grid.cx, positions.grid.cy, 12, "#FFFFFF", "center");

  // ── Energy Flow Curves (below bars)
  const busY = barY + barH + flowAreaH / 2 + 4;
  const barBottom = barY + barH + 2;
  const rx = 8;
  const ry = 6;

  const solarCX = sb.cx;
  const houseCX = positions.house.cx;
  const gridCX = positions.grid.cx;
  const battCX = positions.battery ? positions.battery.cx : null;

  // Build flow paths as point arrays for interpolation
  const flows = [];

  // Solar → House
  if (energy.solarToHome > 0) {
    flows.push({
      points: [
        { x: solarCX, y: barBottom },
        { x: solarCX, y: busY - ry },
        { x: solarCX - rx, y: busY },
        { x: houseCX + rx, y: busY },
        { x: houseCX, y: busY - ry },
        { x: houseCX, y: barBottom },
      ],
      color: c.self_usage,
      power: energy.solarToHome,
    });
  }

  // Solar → Grid (export)
  if (energy.exportPower > 0.05) {
    flows.push({
      points: [
        { x: solarCX, y: barBottom },
        { x: solarCX, y: busY - ry },
        { x: solarCX + rx, y: busY },
        { x: gridCX - rx, y: busY },
        { x: gridCX, y: busY - ry },
        { x: gridCX, y: barBottom },
      ],
      color: c.export,
      power: energy.exportPower,
    });
  }

  // Solar → Battery (charging)
  if (energy.batteryCharging > 0 && battCX !== null) {
    flows.push({
      points: [
        { x: solarCX, y: barBottom },
        { x: solarCX, y: busY - ry },
        { x: solarCX - rx, y: busY },
        { x: battCX, y: busY },
        { x: battCX, y: barBottom },
      ],
      color: c.battery_charge,
      power: energy.batteryCharging,
    });
  }

  // Battery → House (discharging)
  if (energy.batteryDischarging > 0 && battCX !== null) {
    flows.push({
      points: [
        { x: battCX, y: barBottom },
        { x: battCX, y: busY },
        { x: houseCX + rx, y: busY },
        { x: houseCX, y: busY - ry },
        { x: houseCX, y: barBottom },
      ],
      color: c.battery_discharge,
      power: energy.batteryDischarging,
    });
  }

  // Grid → House (importing)
  if (energy.importPower > 0.05) {
    flows.push({
      points: [
        { x: gridCX, y: barBottom },
        { x: gridCX, y: busY - ry },
        { x: gridCX - rx, y: busY },
        { x: houseCX + rx, y: busY },
        { x: houseCX, y: busY - ry },
        { x: houseCX, y: barBottom },
      ],
      color: c.import,
      power: energy.importPower,
    });
  }

  // Draw bus lines (dashed neutral lines connecting elements)
  for (const flow of flows) {
    drawBusLine(ctx, flow.points, c.bus_line, 0.2);
  }

  // Draw animated dots along each flow
  const maxPower = Math.max(...flows.map(f => f.power), 0.01);
  for (const flow of flows) {
    const powerRatio = Math.pow(flow.power / maxPower, 0.35);
    const numDots = Math.max(2, Math.min(4, Math.round(flow.points.length * 0.7)));
    // Phase offset per flow for visual variety
    const flowPhase = (animPhase * powerRatio * 1.5) % 1;
    drawFlowDots(ctx, flow.points, flow.color, numDots, flowPhase);
  }

  // ── Bottom stats row
  const statsY = busY + 14;
  const statsH = height - statsY - pad.bottom;

  if (statsH > 14) {
    const stats = [];
    stats.push({ label: "Solar", value: `${energy.solar.toFixed(1)} kW`, color: c.solar });
    if (energy.exportPower > 0) {
      stats.push({ label: "Export", value: `${energy.exportPower.toFixed(1)} kW`, color: c.export });
    }
    if (energy.importPower > 0) {
      stats.push({ label: "Import", value: `${energy.importPower.toFixed(1)} kW`, color: c.import });
    }
    stats.push({ label: "Home", value: `${energy.homeConsumption.toFixed(1)} kW`, color: c.self_usage });
    if (positions.battery) {
      stats.push({ label: "Battery", value: `${Math.round(energy.battSOC)}%`, color: c.battery_bar });
    }

    const statW = contentW / stats.length;
    for (let i = 0; i < stats.length; i++) {
      const sx = pad.left + i * statW + statW / 2;

      // Color dot indicator
      ctx.setFillColor(new Color(stats[i].color));
      drawCircle(ctx, sx - 20, statsY + 6, 3);

      drawText(ctx, stats[i].label, sx - 14, statsY + 6, 9, c.text_secondary, "left");
      drawText(ctx, stats[i].value, sx + statW / 2 - 8, statsY + 6, 9, c.text_primary, "right");
    }
  }
}

// ─── WIDGET ENTRY POINT ──────────────────────────────────
async function createWidget() {
  const states = await fetchStates();
  const energy = calculateEnergy(states);

  // Medium widget dimensions (approximate @2x)
  const widgetW = 330;
  const widgetH = 155;

  const ctx = new DrawContext();
  ctx.size = new Size(widgetW, widgetH);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  // Static snapshot for widget (pick a random phase for dot positions)
  const animPhase = (Date.now() % 5000) / 5000;
  renderWidget(ctx, widgetW, widgetH, energy, animPhase);

  const widget = new ListWidget();
  widget.backgroundColor = new Color(CONFIG.colors.card_background);
  widget.backgroundImage = ctx.getImage();
  widget.setPadding(0, 0, 0, 0);

  // Refresh every 5 minutes
  widget.refreshAfterDate = new Date(Date.now() + 5 * 60 * 1000);

  return widget;
}

// ─── ANIMATED PREVIEW (in-app) ───────────────────────────
async function showAnimatedPreview() {
  const states = await fetchStates();
  const energy = calculateEnergy(states);

  const widgetW = 330;
  const widgetH = 155;

  const wv = new WebView();
  const fps = 30;
  const frames = fps * CONFIG.flow_speed;

  // Generate frames
  const frameImages = [];
  for (let i = 0; i < frames; i++) {
    const ctx = new DrawContext();
    ctx.size = new Size(widgetW, widgetH);
    ctx.opaque = false;
    ctx.respectScreenScale = true;
    renderWidget(ctx, widgetW, widgetH, energy, i / frames);
    frameImages.push(ctx.getImage());
  }

  // Show last frame as a quick table preview
  QuickLook.present(frameImages[0]);
}

// ─── RUN ─────────────────────────────────────────────────
if (config.runsInWidget) {
  const widget = await createWidget();
  Script.setWidget(widget);
  Script.complete();
} else {
  // In-app: show a static preview (tap to view)
  const widget = await createWidget();
  widget.presentMedium();
}
