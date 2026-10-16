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

// One line per time band, under the greeting.
export const BAND_LINE = {
  deadzone: "3am. nobody else sees it like this.",
  dawn: "early. like, actually early.",
  morning: "clear skies. clear view. or so you think.",
  afternoon: "sun's overhead. nowhere to hide.",
  golden: "golden hour. long shadows. longer bags.",
  night: "seeing it by moonlight.",
};

export const BAND_PHRASE = {
  deadzone: "the dead of night",
  dawn: "dawn",
  morning: "morning",
  afternoon: "afternoon",
  golden: "golden hour",
  night: "night",
};

// What the visitor has in front of them. Same 6, four sides.
export const READING_PHRASE = { 6: "a 6", 9: "a 9", sigma: "a σ", wave: "a wave" };

// The big headline: what goes after "YOU SEE A".
export const READING_WORD = { 6: "6", 9: "9", sigma: "σ", wave: "WAVE" };

// What each side means.
export const READING_MEANING = {
  6: "A 6. Upright, the way it was written.",
  9: "A 9. The same 6, from the other side.",
  sigma: "σ. Volatility, if you trade. Sigma, if you're online.",
  wave: "A wave, just breaking. Most people only see it once it has.",
};

// The hero scene: the two guys from the meme, and you.
export const SCENE = {
  guyA: "IT'S A 6!",
  guyB: "IT'S A 9!",
  you: {
    6: "6. OBVIOUSLY.",
    9: "9. OBVIOUSLY.",
    sigma: "YOU'RE BOTH WRONG. SIGMA.",
    wave: "GUYS. IT'S A WAVE.",
  },
  youTag: "YOU",
};

// Tilt mode, after the ground has turned around.
export const FLIPPED_LINE = {
  6: "upside down. now it's a 6. funny how that works.",
  9: "upside down. now it's a 9. funny how that works.",
  sigma: "upside down. now it's a σ. funny how that works.",
  wave: "upside down. now it's a wave. funny how that works.",
};

export const PACE_LINE = {
  rusher: "slow down, degen. you'll catch the shape, not the details.",
  reader: "you slowed down. that changes what you see.",
  undecided: "",
};

export const RETURNING = {
  reading: (last, now) =>
    `last time you saw ${READING_PHRASE[last] || "something else"}. now it's ${READING_PHRASE[now]}. same thing.`,
  band: (lastBand) =>
    `last time you were here it was ${BAND_PHRASE[lastBand] || "another hour"}. same thing. the light moved.`,
  device: "last time you held it differently. same thing. new angle.",
  same: "same time, same screen. still not the same view.",
};

export const NAV = {
  about: "6 or 9?",
  buy: "How to buy",
  x: "X",
  tg: "Telegram",
  ctaLive: "Buy $POV",
  ctaSoon: "CA soon",
};

export const MARQUEE = ["6 OR 9?", "SAME THING", "DIFFERENT POV", "$POV", "WHAT DO YOU SEE?", "ASK A FREN"];

export const HERO = {
  label: "Your POV",
  lead: "YOU SEE A",
  share: "Post your POV",
  shareBusy: "Cooking…",
  follow: "Follow on X",
  buy: "Buy on pump.fun",
  fine: "everyone sees something different. screenshot yours. ask a fren.",
  toast: "Your POV is saved. Post it.",
};

export const CONCEPT = {
  line1: "6 OR 9?",
  line2: "SAME THING. DIFFERENT POV.",
  body: [
    "Two guys. One number. Both right.",
    "Where you stand decides what you see: your sky, your screen, the way you hold it.",
    "The site you're looking at isn't the one anyone else sees.",
  ],
};

export const TOKEN = {
  heading: "The boring part",
  facts: [
    { big: "1B", small: "supply" },
    { big: "0%", small: "tax" },
    { big: "FAIR", small: "launch" },
    { big: "PUMP", small: ".fun" },
  ],
};

export const LAUNCH = {
  heading: "CA drops on X.",
  body: "Not here. Not yet. Follow so you see it first.",
  cta: "Follow on X",
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
  tg: "Telegram",
  pumpfun: "pump.fun",
  disclaimer:
    "69 is a memecoin with no intrinsic value or expectation of financial return. Depends how you look at it.",
};

export const SHARE = {
  text: (siteUrl, reading) =>
    `Same thing. Different POV. I see ${READING_PHRASE[reading]} — what do you see? $POV ${siteUrl}`,
  label: "MY POV",
  ask: "WHAT DO YOU SEE?",
  ticker: "$POV",
  filename: "my-pov.png",
};
