import { readingFor, standpointFor } from "./standpoint.js";
import {
  BAND_LINE,
  FLIPPED_LINE,
  PACE_LINE,
  READING_MEANING,
  READING_WORD,
  RETURNING,
  SCENE,
  greetingFor,
} from "./copy.js";

// Per-band colours. Page tokens in tokens.css mirror bg/ink/accent; the scene and
// the share card read these directly.
export const PALETTES = {
  deadzone: {
    sky: ["#04060a", "#0d1a20"],
    ground: "#141c21",
    groundEdge: "#0b1115",
    paint: "#e9fdff",
    figure: "#d9fbff",
    bubble: "#ffffff",
    ink: "#000000",
    bg: "#070b0e",
    text: "#d9fbff",
    accent: "#3cf2ff",
    accent2: "#ff3cac",
    stars: true,
  },
  dawn: {
    sky: ["#ff9fb2", "#ffd9c7"],
    ground: "#8e8a99",
    groundEdge: "#6f6b7d",
    paint: "#ffffff",
    figure: "#1a1020",
    bubble: "#ffffff",
    ink: "#1a1020",
    bg: "#fff1ec",
    text: "#1a1020",
    accent: "#ff5d8f",
    accent2: "#7b5cff",
    clouds: true,
  },
  morning: {
    sky: ["#62b8ff", "#cfeaff"],
    ground: "#8f979f",
    groundEdge: "#727b84",
    paint: "#ffffff",
    figure: "#0b1b2b",
    bubble: "#ffffff",
    ink: "#0b1b2b",
    bg: "#eef8ff",
    text: "#0b1b2b",
    accent: "#ffd23f",
    accent2: "#2f80ed",
    clouds: true,
  },
  afternoon: {
    sky: ["#1e90ff", "#8fd3ff"],
    ground: "#9aa1a8",
    groundEdge: "#7d858c",
    paint: "#ffffff",
    figure: "#0a0a0a",
    bubble: "#ffffff",
    ink: "#0a0a0a",
    bg: "#f5fbff",
    text: "#0a0a0a",
    accent: "#ffe600",
    accent2: "#ff3d00",
    clouds: true,
  },
  golden: {
    sky: ["#ff7a2f", "#ffd27d"],
    ground: "#9c7f6a",
    groundEdge: "#7e6352",
    paint: "#fff6e6",
    figure: "#2a1300",
    bubble: "#ffffff",
    ink: "#2a1300",
    bg: "#fff4e0",
    text: "#2a1300",
    accent: "#ff5e00",
    accent2: "#6a2c91",
  },
  night: {
    sky: ["#070d33", "#26336f"],
    ground: "#2b3152",
    groundEdge: "#1c2140",
    paint: "#f2f4ff",
    figure: "#f2f4ff",
    bubble: "#ffffff",
    ink: "#000000",
    bg: "#0d1230",
    text: "#f2f4ff",
    accent: "#b6ff3b",
    accent2: "#8fa8ff",
    stars: true,
  },
};

// The ground turns so the visitor's reading faces them: 6 upright, σ a quarter
// turn clockwise, 9 upside down, wave a quarter turn the other way.
export const READING_ANGLE = { 6: 0, sigma: 90, 9: 180, wave: 270 };

const DEG = Math.PI / 180;

// Where the sun (or moon) hangs in the cartoon sky, from the real one.
// SunCalc azimuth: 0 = south, negative = east (left), positive = west (right).
function skyBodyFor(sun) {
  const az = Math.max(-1, Math.min(1, sun.azimuth / (115 * DEG)));
  const alt = Math.max(0, Math.min(1, sun.altitude / (70 * DEG)));
  return { x: 300 + az * 220, y: 150 - alt * 95, isMoon: sun.isMoon };
}

function returningLineFor(r) {
  if (!r) return "";
  if (r.kind === "reading") return RETURNING.reading(r.lastReading, r.reading);
  if (r.kind === "band") return RETURNING.band(r.lastBand);
  if (r.kind === "device") return RETURNING.device;
  return RETURNING.same;
}

// signals -> everything the page needs to render this visitor's view.
export function composeView(s) {
  const sp = standpointFor(s.sun, s.device, s.orientation);
  const reading = readingFor(sp, s.flipped);
  return {
    band: s.band,
    device: s.device,
    orientation: s.orientation,
    palette: PALETTES[s.band],
    reading,
    angle: READING_ANGLE[reading],
    sky: skyBodyFor(s.sun),
    idle: s.idle && !s.reducedMotion,
    flipped: s.flipped,
    reducedMotion: s.reducedMotion,
    copy: {
      greeting: greetingFor(s.hour),
      bandLine: s.flipped ? FLIPPED_LINE[reading] : BAND_LINE[s.band],
      returning: returningLineFor(s.returning),
      pace: PACE_LINE[s.pace] || "",
      word: READING_WORD[reading],
      meaning: READING_MEANING[reading],
      you: SCENE.you[reading],
    },
  };
}
