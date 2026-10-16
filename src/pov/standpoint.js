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
// your place around the object moves with your local sky. The device decides how
// far round you lean.

const DEG = Math.PI / 180;

// Degrees between the sun's compass bearing and where the visitor stands.
const SKY_OFFSET = 60;

export const READINGS = ["6", "sigma", "9", "wave"];

// How far round the circle each way of holding the screen puts you.
export const COMPOSITIONS = {
  desktop: { offset: 0 },
  phonePortrait: { offset: 0 },
  // Turn the phone sideways and you're a quarter-turn round: the sideways view.
  phoneLandscape: { offset: -90 },
  tablet: { offset: 20 },
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
 * azimuthDeg is where you stand around the digit: 0 is the front, where it reads
 * as a 6; moving to +a turns the digit clockwise from where you stand.
 * SunCalc azimuth: 0 = south, +90° = west.
 */
export function standpointFor(sun, device, orientation) {
  const key = compositionKey(device, orientation);
  const c = COMPOSITIONS[key];
  const azimuthDeg = wrapDeg(sun.azimuth / DEG + SKY_OFFSET + c.offset);
  return { key, azimuthDeg };
}

// One of READINGS: which quarter of the circle the visitor is standing in.
export function readingFor(standpoint, flipped = false) {
  const a = wrapDeg(standpoint.azimuthDeg + (flipped ? 180 : 0));
  if (Math.abs(a) <= 45) return "6";
  if (Math.abs(a) >= 135) return "9";
  return a > 0 ? "sigma" : "wave";
}
