// ALL site copy lives here.

export const GREETING = {
  morning: "gm", // 05:00–11:59
  afternoon: "good afternoon, anon", // 12:00–18:59
  night: "gn… or not", // 19:00–01:59
  deadzone: "why are you awake", // 02:00–04:59
};

export function greetingFor(hour) {
  if (hour >= 2 && hour < 5) return GREETING.deadzone;
  if (hour >= 5 && hour < 12) return GREETING.morning;
  if (hour >= 12 && hour < 19) return GREETING.afternoon;
  return GREETING.night;
}

export const HEADLINE = {
  deadzone: "Nobody sees it like this. Except you.",
  dawn: "The light is just arriving. So are you.",
  morning: "Clear light. Clear view. Or so you think.",
  afternoon: "Sun overhead. Nowhere to hide.",
  golden: "Long shadows. Longer stories.",
  night: "You're seeing it by moonlight.",
};

// What the visitor has in front of them. Same 6, four sides.
export const READING_PHRASE = { 6: "a 6", 9: "a 9", sigma: "a σ", wave: "a wave" };

// What each side means. Shown under the reveal sentence.
export const READING_MEANING = {
  6: "A 6. Upright, the way it was written.",
  9: "A 9. The same 6, from the other side.",
  sigma: "σ. Volatility, if you trade. Sigma, if you're online.",
  wave: "A wave, just breaking. Most people only see it once it has.",
};

// Tilt mode, after the object has turned around.
export const HEADLINE_FLIPPED = {
  6: "Upside down. Now it's a 6. Funny how that works.",
  9: "Upside down. Now it's a 9. Funny how that works.",
  sigma: "Upside down. Now it's a σ. Funny how that works.",
  wave: "Upside down. Now it's a wave. Funny how that works.",
};

export const BAND_PHRASE = {
  deadzone: "the dead of night",
  dawn: "dawn",
  morning: "morning",
  afternoon: "afternoon",
  golden: "golden hour",
  night: "night",
};

export const PACE_LINE = {
  rusher: "You're moving fast. You'll catch the shape, not the details.",
  reader: "You slowed down. That changes what you see.",
  undecided: "",
};

export const RETURNING = {
  reading: (last, now) =>
    `Last time you saw ${READING_PHRASE[last] || "something else"}. Now it's ${READING_PHRASE[now]}. Same thing.`,
  band: (lastBand) =>
    `Last time you were here it was ${BAND_PHRASE[lastBand] || "another hour"}. Same thing. The light moved.`,
  device: "Last time you held it differently. Same thing. New angle.",
  same: "Same time, same screen. Still not the same view.",
};

export const CONCEPT = {
  line1: "6 or 9?",
  line2: "Same thing. Different POV.",
  line4: "The site you're looking at isn't the one anyone else sees.",
};

export const REVEAL = {
  heading: "Why you're seeing this",
  lead: {
    6: "You're seeing a 6 because",
    9: "You're seeing a 9 because",
    sigma: "You're seeing a σ because",
    wave: "You're seeing a wave because",
  },
  time: (band, city) => `it's ${BAND_PHRASE[band]} on ${city} time`,
  device: {
    phonePortrait: "you're holding a phone upright",
    phoneLandscape: "you've turned your phone sideways",
    tablet: "you're on a tablet",
    desktop: "you're sitting at a big screen",
  },
  source: {
    x: "you came from the timeline",
    telegram: "someone in a group chat sent you",
    dexscreener: "you came from the chart",
    pumpfun: "you came from the curve",
    direct: "you found your own way here",
  },
  lang: "your browser speaks a different language",
  pace: {
    rusher: "you were in a hurry",
    reader: "you took your time",
    undecided: "you barely moved",
  },
  after: "Change any of that, and you'd see something else.",
  shareButton: "Share my view",
  shareBusy: "Developing…",
  toast: "Your view is saved. Post it.",
};

export const SHARE = {
  text: (siteUrl, reading) =>
    `Same thing. Different POV. I see ${READING_PHRASE[reading]} — what do you see? $POV ${siteUrl}`,
  cardTagline: "Same thing. Different POV.",
  cardTicker: "$POV",
  filename: "my-pov.png",
};

export const HOW_TO_BUY = {
  heading: "How to buy",
  steps: [
    { title: "Get Phantom", body: "Install the Phantom wallet on your phone or browser." },
    { title: "Get SOL", body: "Buy SOL and send it to your Phantom wallet." },
    { title: "Open $POV on pump.fun", body: "Connect your wallet on the coin page.", link: true },
    { title: "Swap", body: "Swap SOL for $POV. Same coin, whichever way you hold it." },
  ],
};

export const CONTRACT = {
  heading: "Contract address",
  copy: "Copy",
  copied: "Copied. Same CA. Every POV.",
};

export const TILT = {
  off: "tilt mode",
  on: "tilt mode · on",
  hint: "turn it upside down",
};

export const FOOTER = {
  x: "X",
  pumpfun: "pump.fun",
  disclaimer:
    "69 is a memecoin with no intrinsic value or expectation of financial return. Depends how you look at it.",
};

// Joins fragments naturally: "a, b, c and d".
export function joinNatural(parts) {
  const p = parts.filter(Boolean);
  if (p.length <= 1) return p.join("");
  return `${p.slice(0, -1).join(", ")} and ${p[p.length - 1]}`;
}
