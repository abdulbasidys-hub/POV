import { readingFor, standpointFor } from "./standpoint.js";
import {
  BAND_PHRASE,
  HEADLINE,
  HEADLINE_FLIPPED,
  READING_MEANING,
  PACE_LINE,
  RETURNING,
  POV,
  greetingFor,
} from "./copy.js";

// Mirrors tokens.css; the 3D scene and the share card need the raw values.
export const PALETTES = {
  deadzone: { bg: "#05070a", light: "#5fd3d9", accent: "#1f6f73", text: "#cfe9ea" },
  dawn: { bg: "#0b0a14", light: "#f2a7a0", accent: "#5a4a8a", text: "#ece6f2" },
  morning: { bg: "#0a0d12", light: "#cfe0f5", accent: "#4f6f96", text: "#e8eef6" },
  afternoon: { bg: "#0c0c0c", light: "#ffffff", accent: "#8a8a8a", text: "#f4f4f4" },
  golden: { bg: "#100a05", light: "#ffb347", accent: "#a3561c", text: "#f6e8d6" },
  night: { bg: "#04050a", light: "#8fa8ff", accent: "#2e3a73", text: "#d9def5" },
};

const DEG = Math.PI / 180;

// Camera orbit for a standpoint. The target leads a little toward the viewer so the
// object sits above the hero text.
export function cameraFor(sp) {
  const az = sp.azimuthDeg * DEG;
  const el = sp.elevationDeg * DEG;
  const target = [Math.sin(az) * sp.lead, 0, Math.cos(az) * sp.lead];
  return {
    key: sp.key,
    azimuth: az,
    elevation: el,
    distance: sp.distance,
    fov: sp.fov,
    target,
    position: [
      target[0] + sp.distance * Math.cos(el) * Math.sin(az),
      sp.distance * Math.sin(el),
      target[2] + sp.distance * Math.cos(el) * Math.cos(az),
    ],
  };
}

/**
 * Key light from the real sky. Scene compass: south is -z, east +x, so the light
 * sits at orbit azimuth sunAz + 180°. SunCalc azimuth: 0 = south, +90° = west.
 * The visitor stands relative to the same sky (standpoint.js), so the light always
 * rakes in from the same side of *their* view of the object.
 */
function keyLightFor(band, sun, prefersLight, sp) {
  const ambientBase = { deadzone: 0.08, dawn: 0.11, morning: 0.13, afternoon: 0.15, golden: 0.1, night: 0.12 }[band];
  const ambient = ambientBase * (prefersLight ? 1.15 : 1);

  if (band === "deadzone") {
    // A phone screen in the dark: a cold point light held between you and the object.
    const a = sp.azimuthDeg * DEG;
    const position = [Math.sin(a) * 1.9 + Math.cos(a) * 0.3, 1.1, Math.cos(a) * 1.9 - Math.sin(a) * 0.3];
    return { mode: "point", position, intensity: 9, distance: 9, ambient, shadowRadius: 5 };
  }

  const isMoon = sun.isMoon;
  // Keep the light just above the horizon so the shadow always lands somewhere.
  const minAlt = isMoon ? 14 : 4;
  const alt = Math.min(Math.max(sun.altitude / DEG, minAlt), 84) * DEG;
  const az = sun.azimuth;
  const dir = [-Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt)];

  const base = isMoon ? 2.6 : { dawn: 2.6, morning: 3.0, afternoon: 4.2, golden: 3.2, night: 1.6 }[band] || 3;
  // A grazing light barely reaches the floor; lift it so long shadows still have something to fall on.
  const intensity = base * (1 + 1.6 * (1 - Math.sin(alt)));
  const shadowRadius = isMoon ? 7 : band === "afternoon" ? 1 : band === "golden" ? 2 : 3;
  return { mode: "directional", direction: dir, altitudeDeg: alt / DEG, intensity, ambient, shadowRadius, isMoon };
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
    camera: cameraFor(sp),
    light: keyLightFor(s.band, s.sun, s.prefersLight, sp),
    idle: s.idle && !s.reducedMotion,
    flipped: s.flipped,
    reducedMotion: s.reducedMotion,
    copy: {
      greeting: greetingFor(s.hour),
      headline: s.flipped ? HEADLINE_FLIPPED[reading] : HEADLINE[s.band],
      returning: returningLineFor(s.returning),
      pace: PACE_LINE[s.pace] || "",
      statement: POV.statement[reading],
      meaning: READING_MEANING[reading],
      bandPhrase: BAND_PHRASE[s.band],
    },
  };
}
