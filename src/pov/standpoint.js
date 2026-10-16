// Where the visitor stands around the digit, and what that makes it read as.
//
// The sculpture is a single 6 lying flat on the ground, its top pointing away from
// the front side (-z). Walk round it and it reads as four different things:
//
//   front  →  6
//   right  →  σ      (sigma: volatility in a market, a whole personality online)
//   back   →  9
//   left   →  wave   (a wave just breaking)
//
// Nothing is random: you always stand in relation to your own sun (or moon), so
// your place around the object moves with your local sky. The device decides the
// height you look from and how far round you lean.

const DEG = Math.PI / 180;

// Degrees between the sun's compass bearing and where the visitor stands.
const SKY_OFFSET = 60;

export const READINGS = ["6", "sigma", "9", "wave"];

export const COMPOSITIONS = {
  // Standing over it, a few steps back. Reads clearly.
  desktop: { offset: 0, elevation: 40, distance: 7.4, fov: 30, lead: 1.0 },
  // Looking straight down at the floor; the shadow fills the frame.
  phonePortrait: { offset: 0, elevation: 64, distance: 9.2, fov: 36, lead: 0.9 },
  // Turn the phone sideways and you're a quarter-turn round: the sideways view.
  phoneLandscape: { offset: -90, elevation: 30, distance: 6.8, fov: 30, lead: 0.6 },
  // Three-quarter, mid-height.
  tablet: { offset: 20, elevation: 46, distance: 8.0, fov: 32, lead: 0.9 },
};

export function compositionKey(device, orientation) {
  if (device === "phone") return orientation === "portrait" ? "phonePortrait" : "phoneLandscape";
  if (device === "tablet") return "tablet";
  return "desktop";
}

// Wrap degrees to (-180, 180].
export function wrapDeg(d) {
  const w = ((((d + 180) % 360) + 360) % 360) - 180;
  return w === -180 ? 180 : w;
}

/**
 * Scene convention: an orbit azimuth `a` puts the camera at (sin a, ·, cos a).
 * a = 0 is the front (+z), where the digit reads as a 6. Moving to +a turns the
 * digit clockwise on screen.
 * SunCalc azimuth: 0 = south, +90° = west. The key light sits at sunAz + 180°.
 */
export function standpointFor(sun, device, orientation) {
  const key = compositionKey(device, orientation);
  const c = COMPOSITIONS[key];
  const azimuthDeg = wrapDeg(sun.azimuth / DEG + SKY_OFFSET + c.offset);
  return { key, azimuthDeg, elevationDeg: c.elevation, ...c };
}

// One of READINGS: which quarter of the circle the visitor is standing in.
export function readingFor(standpoint, flipped = false) {
  const a = wrapDeg(standpoint.azimuthDeg + (flipped ? 180 : 0));
  if (Math.abs(a) <= 45) return "6";
  if (Math.abs(a) >= 135) return "9";
  return a > 0 ? "sigma" : "wave";
}
