import SunCalc from "suncalc";
import { tzToCoords } from "./tzCoords.js";
import { readingFor, standpointFor } from "./standpoint.js";

// Signals are internal only. Nothing here is ever rendered raw or sent anywhere.

const HISTORY_KEY = "pov.history";

export function storageGet(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storageSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage blocked: the site renders the same without it */
  }
}

function mq(query) {
  try {
    return window.matchMedia(query).matches;
  } catch {
    return false;
  }
}

// §3.1
export function bandFor(hour) {
  if (hour >= 2 && hour < 5) return "deadzone";
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 16) return "afternoon";
  if (hour >= 16 && hour < 19) return "golden";
  return "night";
}


export function systemTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

// Minutes the zone is ahead of UTC at `date`.
function zoneOffsetMinutes(date, tz) {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(date);
    const m = {};
    for (const p of parts) m[p.type] = p.value;
    const asUTC = Date.UTC(+m.year, +m.month - 1, +m.day, +m.hour % 24, +m.minute, +m.second);
    return Math.round((asUTC - date.getTime()) / 60000);
  } catch {
    return -date.getTimezoneOffset();
  }
}

// §3.3
export function placeFor(tz) {
  const segs = (tz || "").split("/");
  const city = (segs[segs.length - 1] || "your").replace(/_/g, " ");
  const region = segs.length > 1 ? segs[0] : "";
  return { city: city || "your", region };
}

// §3.2
export function sunFor(date, lat, lng) {
  const s = SunCalc.getPosition(date, lat, lng);
  if (s.altitude >= 0) return { altitude: s.altitude, azimuth: s.azimuth, isMoon: false };
  const m = SunCalc.getMoonPosition(date, lat, lng);
  return { altitude: m.altitude, azimuth: m.azimuth, isMoon: true };
}

/**
 * Everything that depends on "when" and "on what clock".
 * `tz` defaults to the system zone; `forceHour` (dev only) fakes the local hour in that zone.
 */
export function timeSignals(now = new Date(), tz = systemTimeZone(), forceHour = null) {
  const system = systemTimeZone();
  const useSystem = !tz || tz === system;
  const offset = useSystem ? -now.getTimezoneOffset() : zoneOffsetMinutes(now, tz);
  const local = new Date(now.getTime() + offset * 60000); // read with getUTC*
  let instant = now;
  let hour = local.getUTCHours();
  if (forceHour != null) {
    const shiftMin = (forceHour - hour) * 60 - local.getUTCMinutes() + 30;
    instant = new Date(now.getTime() + shiftMin * 60000);
    hour = forceHour;
  }
  const coords = tzToCoords(tz || system, -offset);
  return {
    hour,
    band: bandFor(hour),
    tz: tz || system,
    place: placeFor(tz || system),
    coords,
    sun: sunFor(instant, coords.lat, coords.lng),
  };
}

// §3.4
export function readDevice() {
  const coarse = mq("(pointer: coarse)");
  const sw = (window.screen && window.screen.width) || window.innerWidth;
  const sh = (window.screen && window.screen.height) || window.innerHeight;
  const shortSide = Math.min(sw, sh);
  if (coarse && shortSide < 600) return "phone";
  if (coarse) return "tablet";
  return "desktop";
}

// §3.5
export function readOrientation() {
  return mq("(orientation: portrait)") ? "portrait" : "landscape";
}

// §3.9 — reads the previous visit, then records this one.
function readHistory({ band, device, orientation, reading }) {
  const prev = storageGet(HISTORY_KEY);
  const now = Date.now();
  storageSet(HISTORY_KEY, {
    firstSeen: (prev && prev.firstSeen) || now,
    lastBand: band,
    lastDevice: device,
    lastOrientation: orientation,
    lastReading: reading,
    visits: ((prev && prev.visits) || 0) + 1,
  });
  if (!prev) return { returning: null };
  if (prev.lastReading && prev.lastReading !== reading)
    return { returning: { kind: "reading", lastReading: prev.lastReading, reading } };
  if (prev.lastBand && prev.lastBand !== band) return { returning: { kind: "band", lastBand: prev.lastBand } };
  if (
    (prev.lastDevice && prev.lastDevice !== device) ||
    (prev.lastOrientation && prev.lastOrientation !== orientation)
  )
    return { returning: { kind: "device" } };
  return { returning: { kind: "same" } };
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return Boolean(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

// Runs once on load.
export function readSignals() {
  const now = new Date();
  const time = timeSignals(now);
  const device = readDevice();
  const orientation = readOrientation();
  const reading = readingFor(standpointFor(time.sun, device, orientation));
  const history = readHistory({ band: time.band, device, orientation, reading });

  return {
    ...time,
    device,
    orientation,
    returning: history.returning,
    prefersLight: mq("(prefers-color-scheme: light)"),
    reducedMotion: mq("(prefers-reduced-motion: reduce)"),
    webgl: hasWebGL(),
    pace: "undecided",
    idle: false,
    flipped: false,
  };
}
