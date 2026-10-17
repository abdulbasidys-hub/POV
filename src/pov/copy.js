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

// Every two-POV meme: what each guy yells, and what each end reads as.
// `lead` + `word` is the headline ("YOU SEE A" + "6"); `me` is the share card's
// version of the lead; `phrase` is used inside sentences.
export const MEME_COPY = {
  "six-nine": {
    name: "6 or 9",
    question: "6 OR 9?",
    tagline: "Two guys. One number. Both right.",
    guys: { front: "IT'S A 6!", back: "IT'S A 9!" },
    front: { lead: "YOU SEE A", me: "I SEE A", word: "6", phrase: "a 6", meaning: "A 6. Upright, the way it was written.", you: "6. OBVIOUSLY." },
    back: { lead: "YOU SEE A", me: "I SEE A", word: "9", phrase: "a 9", meaning: "A 9. The same 6, from the other side.", you: "9. OBVIOUSLY." },
  },
  sticks: {
    name: "3 or 4 sticks",
    question: "3 OR 4?",
    tagline: "Two guys. One pile of sticks. Both counted right.",
    guys: { front: "NO, THREE!", back: "FOUR!" },
    front: { lead: "YOU SEE", me: "I SEE", word: "3 STICKS", phrase: "3 sticks", meaning: "Three sticks. Count again from the other end.", you: "3. I COUNTED." },
    back: { lead: "YOU SEE", me: "I SEE", word: "4 STICKS", phrase: "4 sticks", meaning: "Four sticks. Count again from the other end.", you: "4. I COUNTED." },
  },
  "mom-wow": {
    name: "MOM or WOW",
    question: "MOM OR WOW?",
    tagline: "Two guys. One word. Both read it right.",
    guys: { front: "IT SAYS MOM!", back: "IT SAYS WOW!" },
    front: { lead: "IT SAYS", me: "IT SAYS", word: "MOM", phrase: "MOM", meaning: "MOM. Who you call when it dips.", you: "MOM. OBVIOUSLY." },
    back: { lead: "IT SAYS", me: "IT SAYS", word: "WOW", phrase: "WOW", meaning: "WOW. What you say when it doesn't.", you: "WOW. OBVIOUSLY." },
  },
};

export const SCENE = { youTag: "YOU" };

// Tilt mode, after the drawing has turned round.
export const flippedLine = (phrase) => `upside down. now it's ${phrase}. funny how that works.`;

export const PACE_LINE = {
  rusher: "slow down, degen. you'll catch the shape, not the details.",
  reader: "you slowed down. that changes what you see.",
  undecided: "",
};

export const RETURNING = {
  side: (lastPhrase, nowPhrase) => `last time you saw ${lastPhrase}. now it's ${nowPhrase}. same thing.`,
  band: (lastBand) =>
    `last time you were here it was ${BAND_PHRASE[lastBand] || "another hour"}. same thing. the light moved.`,
  device: "last time you held it differently. same thing. new angle.",
  same: "same time, same screen. still not the same view.",
};

export const NAV = {
  about: "Your POV",
  buy: "How to buy",
  x: "X",
  tg: "Telegram",
  ctaLive: "Buy $POV",
  ctaSoon: "CA soon",
};

// The meme's question goes first.
export const MARQUEE = ["SAME THING", "DIFFERENT POV", "$POV", "WHAT DO YOU SEE?", "ASK A FREN"];

export const HERO = {
  sub: "SAME THING. DIFFERENT POV.",
  body: [
    "Where you stand decides what you see: your sky, your screen, the way you hold it.",
    "The site you're looking at isn't the one anyone else sees.",
  ],
  toStage: "See your POV",
  follow: "Follow on X",
  buy: "Buy on pump.fun",
};

export const STAGE = {
  label: "Your POV",
  heading: "From where you're standing",
  share: "Post your POV",
  shareBusy: "Cooking…",
  fine: "everyone sees something different. screenshot yours. ask a fren.",
  toast: "Your POV is saved. Post it.",
};

export const COMMUNITY = {
  label: "Your turn",
  heading: "SEEN SOMETHING WITH TWO SIDES?",
  body: "A word, a doodle, a chart, a shadow. Anything that changes depending on where you stand. Post it in the community and tag $POV.",
  post: "Post it on X",
  join: "Join the community",
  text: (siteUrl) => `Found something with two POVs. What do you see? $POV ${siteUrl}`,
};

export const TESTER = {
  label: "TEST",
  prev: "Previous meme",
  next: "Next meme",
  side: "Switch side",
  hint: "swipe the scene or use ← →",
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
  text: (siteUrl, phrase) => `Same thing. Different POV. I see ${phrase} — what do you see? $POV ${siteUrl}`,
  label: "MY POV",
  ask: "WHAT DO YOU SEE?",
  ticker: "$POV",
  filename: "my-pov.png",
};
