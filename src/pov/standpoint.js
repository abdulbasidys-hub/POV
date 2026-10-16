// Where the visitor stands around the drawing on the ground, and so which end
// of it they read from.
//
// Each meme is one drawing that reads one way from its front end and another
// from its back end (a 6 from the front is a 9 from the back). Stand anywhere in
// the front half of the circle and you read the front; the back half, the back.
//
// Nothing is random: you always stand in relation to your own sun (or moon), so
// your place around the drawing moves with your local sky. The device decides how
// far round you lean.

const DEG = Math.PI / 180;

// Degrees between the sun's compass bearing and where the visitor stands.
const SKY_OFFSET = 60;

export const SIDES = ["front", "back"];

// How far round the circle each way of holding the screen puts you.
export const COMPOSITIONS = {
  desktop: { offset: 0 },
  phonePortrait: { offset: 0 },
  // Turn the phone sideways and you're a quarter-turn round.
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
 * azimuthDeg is where you stand around the drawing: 0 is the front end.
 * SunCalc azimuth: 0 = south, +90° = west.
 */
export function standpointFor(sun, device, orientation) {
  const key = compositionKey(device, orientation);
  const c = COMPOSITIONS[key];
  const azimuthDeg = wrapDeg(sun.azimuth / DEG + SKY_OFFSET + c.offset);
  return { key, azimuthDeg };
}

// "front" or "back": which half of the circle the visitor is standing in.
// Tilt mode turns the drawing round, which swaps the ends.
export function sideFor(standpoint, flipped = false) {
  const a = wrapDeg(standpoint.azimuthDeg + (flipped ? 180 : 0));
  return Math.abs(a) <= 90 ? "front" : "back";
}

export function otherSide(side) {
  return side === "front" ? "back" : "front";
}
