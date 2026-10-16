# BUILD.md — 69 ($POV)

> Same thing. Different POV.

A one-page landing site for the Solana memecoin **69 ($POV)**, launching on pump.fun.
The site is the concept: **no two visitors see the same site**, because each person's view is built from where they are actually standing: their local time, their sun, their device, how they hold it, where they came from, and how they move.

Nothing is random. Nothing is numbered. The visitor is never told there are "variants".

---

## 0. Ground rules for the build

- Stack: **React + Vite**, static, deployed on **Vercel**. **No backend.**
- Styling: plain CSS with CSS custom properties. **No UI libraries.**
- Allowed dependencies (only these):
  - `three`
  - `@react-three/fiber`
  - `@react-three/drei`, for helpers only: shadows, environment, `Text3D`/`Center`
  - `suncalc`
- Everything runs client-side. **No tracking, no analytics, no data leaves the device.**
- **No permission prompts on load.** Geolocation, camera and notifications are never used. Device tilt is opt-in only (see §3.8).
- Never show variant numbers, IDs, "POV x of y", or anything that suggests a fixed set of versions.
- Wrap every `localStorage` read and write in `try/catch`. The site must render perfectly without storage.
- Respect `prefers-reduced-motion`: a static hero render, with no scroll-driven motion.

---

## 1. File structure

```
/
├─ index.html
├─ package.json
├─ vite.config.js
├─ public/
│  ├─ fonts/            # font JSON for Text3D (typeface.json)
│  ├─ og.png            # static social preview (1200x630)
│  └─ fallback-hero.png # used if WebGL unavailable
└─ src/
   ├─ main.jsx
   ├─ App.jsx
   ├─ config.js                 # CA, links: the ONLY file edited at launch
   ├─ styles/
   │  ├─ tokens.css             # base tokens + per-band palettes
   │  └─ global.css
   ├─ pov/
   │  ├─ readSignals.js         # collects all signals once on load
   │  ├─ useLiveSignals.js      # scroll speed, idle, orientation changes
   │  ├─ tzCoords.js            # IANA timezone -> approx lat/lng
   │  ├─ composeView.js         # signals -> view object (palette, camera, copy)
   │  └─ copy.js                # ALL site copy lives here
   ├─ components/
   │  ├─ Hero/
   │  │  ├─ HeroScene.jsx       # three.js scene
   │  │  └─ HeroFallback.jsx
   │  ├─ Concept.jsx
   │  ├─ YourView.jsx           # the reveal + share
   │  ├─ HowToBuy.jsx           # only renders when CA is set
   │  ├─ ContractAddress.jsx    # only renders when CA is set
   │  ├─ TiltToggle.jsx         # mobile only
   │  ├─ Footer.jsx
   │  └─ Grain.jsx              # film grain + vignette overlay
   └─ share/
      └─ makeShareCard.js       # builds the PNG share card on a 2D canvas
```

### `src/config.js`

```js
export const CONFIG = {
  NAME: "69",
  TICKER: "$POV",
  CA: "",                                  // empty = pre-launch mode
  X_URL: "https://x.com/REPLACE_ME",
  SITE_URL: "https://REPLACE_ME",
};
export const PUMPFUN_URL = (ca) => `https://pump.fun/coin/${ca}`;
export const IS_LIVE = Boolean(CONFIG.CA && CONFIG.CA.trim());
```

**Pre-launch mode (`CA` empty):** the How to Buy and Contract Address sections are **not rendered at all**. There is no placeholder text. Setting `CA` is the only change needed at launch.

---

## 2. Aesthetic: dark cinematic

- The base is near-black. The site feels like a film still: moody, dramatic light, lots of negative space.
- A subtle **film grain** overlay is animated at a low framerate (around 12fps) and disabled for reduced-motion.
- A soft **vignette** sits on all edges.
- **Letterbox bars** appear on desktop landscape only, as thin black bars top and bottom, around 6vh.
- Type:
  - **Display:** "Cormorant Garamond" (Google Fonts), weights 300 and 600, set large with tight tracking.
  - **Body / UI:** "Inter", weights 400 and 500, set small with generous letter-spacing on labels.
- Motion is slow and weighted. Use long easings (`cubic-bezier(.2,.7,.1,1)`), 600–1200ms. Nothing bouncy.
- The palette is driven entirely by the **time band** (§3.1) through CSS variables set on `:root` at load:

| Band | Hours (local) | Mood | `--bg` | `--light` (key light) | `--accent` | `--text` |
|---|---|---|---|---|---|---|
| deadzone | 02:00–04:59 | screen glow, insomnia | `#05070a` | `#5fd3d9` (cyan monitor) | `#1f6f73` | `#cfe9ea` |
| dawn | 05:00–07:59 | first light | `#0b0a14` | `#f2a7a0` (rose) | `#5a4a8a` | `#ece6f2` |
| morning | 08:00–11:59 | cold, clear | `#0a0d12` | `#cfe0f5` (steel) | `#4f6f96` | `#e8eef6` |
| afternoon | 12:00–15:59 | harsh overhead | `#0c0c0c` | `#ffffff` (hard white) | `#8a8a8a` | `#f4f4f4` |
| golden | 16:00–18:59 | long shadows | `#100a05` | `#ffb347` (amber) | `#a3561c` | `#f6e8d6` |
| night | 19:00–01:59 | moonlight | `#04050a` | `#8fa8ff` (moon blue) | `#2e3a73` | `#d9def5` |

The site is always dark. The band changes the *light*, not the darkness. Ignore system light mode for the background, and use it only as a signal (§3.9).

---

## 3. The signals

`readSignals()` runs once on load and returns a plain object. `useLiveSignals()` updates the live ones. **Signal values are internal only and never rendered raw.**

### 3.1 Local time → `band`
Use `new Date().getHours()` and the table in §2.

### 3.2 Sun position → `sun`
- Get the timezone with `Intl.DateTimeFormat().resolvedOptions().timeZone`.
- `tzCoords.js` maps around 50 major IANA zones to approximate `{lat, lng}`. Cover every continent, including `Africa/Lagos`, `Africa/Nairobi`, `Africa/Johannesburg`, `Europe/London`, `America/New_York`, `America/Los_Angeles`, `Asia/Dubai`, `Asia/Singapore`, `Asia/Tokyo` and `Australia/Sydney`.
- Fallback when the zone isn't in the map: `lng = -getTimezoneOffset() / 4`, `lat = 15`.
- Get altitude and azimuth with `SunCalc.getPosition(now, lat, lng)`. Recompute every 60s.
- If altitude < 0, use `SunCalc.getMoonPosition` instead, and set `sun.isMoon = true`.
- This drives the **key light direction** in the hero (§4).

### 3.3 Region → `place`
- `place.city` is the last segment of the timezone, with underscores turned into spaces (`Africa/Lagos` → "Lagos").
- `place.region` is the first segment (Africa, Europe, America, Asia, Australia, Pacific…).
- Only ever phrase it as **"on Lagos time"**, never "in Lagos". The timezone isn't the visitor's location.

### 3.4 Device → `device`
- `phone`: coarse pointer and short side < 600px.
- `tablet`: coarse pointer and short side ≥ 600px.
- `desktop`: everything else.

Use `matchMedia('(pointer: coarse)')` and the screen dimensions.

### 3.5 Orientation → `orientation`
- Values are `portrait` or `landscape`, via `matchMedia('(orientation: portrait)')`.
- It's live: rotating the device re-composes the hero camera with a slow 1.2s camera move, not a cut.

### 3.6 Referrer → `source`
- Check the `?ref=` or `utm_source` query param first, then `document.referrer` hostname:
  - `x.com`, `twitter.com`, `t.co` → `x`
  - `t.me`, `telegram.*` → `telegram`
  - `dexscreener.com` → `dexscreener`
  - `pump.fun` → `pumpfun`
  - empty or anything else → `direct`
- Persist the first-ever source in storage. The current visit's source is what's used.

### 3.7 Behaviour → `pace` (live)
- Track scroll velocity over the first 6 seconds of scrolling:
  - Average above 1200px/s → `rusher`.
  - Otherwise → `reader`.
  - The default before decision is `undecided`.
- Track idle time: no scroll, pointer or touch for 8s sets `idle = true`. During idle, the hero light drifts slowly (§4). Any input sets it back to false.
- When `pace` resolves, the Concept section's second line **crossfades** to the matching copy over 900ms.

### 3.8 Tilt mode (opt-in, mobile only) → `flipped`
- A small, quiet text button sits in the Hero corner, labelled "tilt mode".
- On iOS, it calls `DeviceOrientationEvent.requestPermission()`. On Android, it just listens.
- When the phone is held upside down (`beta` < −120 or > 120 with a stable reading for 400ms):
  - The whole page content rotates 180° so it reads correctly upside down.
  - The hero swaps to its "other side" reading (§4).
  - The headline swaps to the flipped copy (§6).
- It's never automatic, and the site works fully without it.

### 3.9 Returning → `history`
Store this in localStorage: `{ firstSeen, lastBand, lastDevice, lastOrientation, visits }`.
- `visits` is internal only and never shown.
- On a return visit, if `lastBand` or `lastDevice` differs from now, show the returning line (§6) under the hero.
- If nothing changed, show the "nothing changed" line.

### 3.10 Fine signals
- `prefersLight`: from `matchMedia('(prefers-color-scheme: light)')`. If true, raise the hero ambient light by 15%. The background stays dark.
- `lang`: from `navigator.language`. If it starts with something other than `en`, the reveal adds the language fragment (§6).
- `reducedMotion`: from `matchMedia('(prefers-reduced-motion: reduce)')`.

---

## 4. The hero: one object, your light

A single sculptural **"69"**, built with `Text3D` in Cormorant Garamond 600:
- It's extruded and slightly bevelled.
- The material is dark matte stone or obsidian (`meshStandardMaterial`, roughness ~0.75, metalness ~0.1).
- It stands on an endless dark floor that **receives shadows**.

**Lighting is the whole point:**
- One **directional key light** is positioned from the visitor's real `sun.azimuth` and `sun.altitude`. Its colour is `--light`.
  - Low sun (golden, dawn) → long dramatic shadows.
  - High sun (afternoon) → a short, hard shadow pooled under the object.
  - Moon → a dim blue key light with soft shadows.
  - Deadzone → the key light is replaced by a cold cyan point light in front of the object, as if lit by a phone screen in the dark.
- Ambient light is very low, around 0.08–0.15, so the shadow reads strongly.
- A thin volumetric haze uses fog matched to `--bg`.

**Camera composition** comes from `device` × `orientation`:

| Device / orientation | Camera |
|---|---|
| Desktop landscape | Low, front-on, wide. The object reads clearly as "69". The shadow stretches toward the viewer. |
| Phone portrait | High, looking down at around 55°. The **shadow** dominates the frame and the object reads more as a form than as numbers. |
| Phone landscape | Side-on, around 70° off-axis. The digits overlap into an abstract shape. |
| Tablet | Three-quarter view, mid-height. |

- The camera is static apart from a very slight pointer or gyro parallax (±3°), which is off for reduced-motion.
- **Idle drift:** while `idle`, the key light slowly sweeps ±10° in azimuth over 12s, so the shadow breathes.
- **Flipped (tilt mode):** the object rotates 180° on its Z axis over 1.4s. A rotated 69 is still 69, and the copy acknowledges that (§6).

**Performance and fallback:**
- Cap DPR at 1.5 and the shadow map at 2048 (1024 on phones).
- If WebGL isn't available, render `HeroFallback` (`/fallback-hero.png`) tinted with CSS using `--light`.
- Create the renderer with `preserveDrawingBuffer: true`, which the share card needs (§7).

Under the object, overlaid in HTML:
- Greeting: small caps, Inter, letter-spaced (§6).
- Headline: Cormorant, large, from the band copy (§6).
- The returning line, if any.

---

## 5. Page sections (in order)

1. **Hero** (§4). Full viewport.
2. **Concept.**
   - Line 1, always: "6 or 9?"
   - Line 2, always: "Same thing. Different POV."
   - Line 3: the `pace` line, which crossfades in once resolved and is blank while undecided.
   - Line 4, always: "The site you're looking at isn't the one anyone else sees."
3. **Your View: the reveal.**
   - A heading, "Why you're seeing this", then one composed sentence (§6) set large in Cormorant.
   - Below that, the **Share my view** button (§7).
4. **How to Buy.** Only rendered if `IS_LIVE`. Four minimal steps:
   1. Get Phantom.
   2. Get SOL.
   3. Open $POV on pump.fun (links to `PUMPFUN_URL(CA)`).
   4. Swap.
5. **Contract Address.** Only rendered if `IS_LIVE`.
   - The CA is shown in monospace with a copy button.
   - On copy, the button text becomes "Copied. Same CA. Every POV." for 2s.
6. **Footer.**
   - X link, and a pump.fun link if live.
   - The line: "69 is a memecoin with no intrinsic value or expectation of financial return. Depends how you look at it."

Section reveals are slow fade-and-rise on scroll entry, via IntersectionObserver. They're instant for reduced-motion.

---

## 6. Copy (all of it lives in `src/pov/copy.js`)

### Greeting (hero, small)
- 05:00–11:59 → "gm"
- 12:00–18:59 → "good afternoon, anon"
- 19:00–01:59 → "gn… or not"
- 02:00–04:59 → "why are you awake"

### Headline by band
| Band | Headline |
|---|---|
| deadzone | "Nobody sees it like this. Except you." |
| dawn | "The light is just arriving. So are you." |
| morning | "Clear light. Clear view. Or so you think." |
| afternoon | "Sun overhead. Nowhere to hide." |
| golden | "Long shadows. Longer stories." |
| night | "You're seeing it by moonlight." |

Flipped headline (tilt mode): "Upside down. Still 69. Funny how that works."

### Pace line (Concept, line 3)
- rusher: "You're moving fast. You'll catch the shape, not the details."
- reader: "You slowed down. That changes what you see."

### Returning line (under hero)
- Band changed: "Last time you were here it was {lastBandPhrase}. Same thing. The light moved."
- Device changed: "Last time you held it differently. Same thing. New angle."
- Nothing changed: "Same time, same screen. Still not the same view."

Band phrases: deadzone → "the dead of night", dawn → "dawn", morning → "morning", afternoon → "afternoon", golden → "golden hour", night → "night".

### The reveal sentence (Your View)
Compose it from fragments, joined naturally with commas and a final "and":

> "You're seeing this because **{timeFrag}**, **{deviceFrag}**, **{sourceFrag}**{, **langFrag**} and **{paceFrag}**."

- **timeFrag:** "it's {bandPhrase} on {city} time"
  - Examples: "it's golden hour on Lagos time", "it's the dead of night on New York time".
- **deviceFrag:**
  - phone portrait → "you're holding a phone upright"
  - phone landscape → "you've turned your phone sideways"
  - tablet → "you're on a tablet"
  - desktop → "you're sitting at a big screen"
- **sourceFrag:**
  - x → "you came from the timeline"
  - telegram → "someone in a group chat sent you"
  - dexscreener → "you came from the chart"
  - pumpfun → "you came from the curve"
  - direct → "you found your own way here"
- **langFrag** (only if non-English browser): "your browser speaks a different language"
- **paceFrag:**
  - rusher → "you were in a hurry"
  - reader → "you took your time"
  - undecided → "you barely moved"

Under the sentence, in small Inter: "Change any of that, and you'd see something else."

### Share text (X intent)
"Same thing. Different POV. This is mine — what's yours? $POV {SITE_URL}"

---

## 7. Share my view

`makeShareCard()` builds a **1200×630 PNG** on an offscreen 2D canvas:
- The background is `--bg` with the band's vignette.
- The left 60% is a snapshot of the hero canvas (`toDataURL`), cover-fit.
- The right 40% has three lines:
  - The reveal sentence in Cormorant, wrapped.
  - "Same thing. Different POV." in small Inter.
  - "$POV" in the bottom corner.
- Add light grain noise.

Button flow:
1. Generate the PNG.
2. On mobile, if `navigator.canShare({ files })` is supported, use the native share sheet with the file and the share text.
3. Otherwise, download the PNG as `my-pov.png` and open `https://x.com/intent/tweet?text=` with the encoded share text in a new tab.
4. Show a toast: "Your view is saved. Post it."

---

## 8. Meta and SEO

- Title: "69 ($POV): Same thing. Different POV."
- Description: "No two people see this site the same way."
- OG and Twitter card (`summary_large_image`) use the static `/og.png`. Make it a generic dark shot of the 69 object with the tagline.
- Favicon: a minimal "69" in Cormorant, light on dark.
- The theme-color meta is set at runtime to the band's `--bg`.

---

## 9. Dev-only preview panel

- Visible **only** when `import.meta.env.DEV` is true, and stripped from production builds.
- A floating panel lets the developer force any signal and see the page re-compose live:
  - band
  - fake hour, which also drives the sun
  - timezone
  - device
  - orientation
  - source
  - pace
  - returning state
  - flipped
  - reduced motion
- This exists so every combination can be checked without changing clocks or devices.

---

## 10. Build order

1. Scaffold Vite + React, `config.js`, tokens and global CSS, fonts, grain and vignette, and the static section layout with copy from `copy.js`.
2. `readSignals` and `composeView`, wired to palette variables and copy, with the dev panel.
3. The hero scene: object, floor, sun-driven key light, camera presets, fallback.
4. Live signals: orientation re-compose, pace crossfade, idle drift, returning line.
5. Your View reveal, plus the share card and share flow.
6. Tilt mode.
7. Conditional How to Buy and CA sections, gated on `IS_LIVE`.
8. Meta and OG, then performance pass (Lighthouse mobile ≥ 85 performance), then reduced-motion pass.

---

## 11. Done when

- [ ] Opening the site at different hours shows a different palette, light direction, shadow length and headline.
- [ ] Phone portrait, phone landscape, tablet and desktop each show a distinctly different hero composition, and rotating a phone moves the camera smoothly.
- [ ] The reveal sentence correctly reflects time, timezone city, device, source, language and pace.
- [ ] `?ref=x` and `?ref=telegram` change the reveal correctly.
- [ ] Revisiting shows the correct returning line.
- [ ] No number, ID or "variant" language appears anywhere in the production UI.
- [ ] No permission prompt appears without the user tapping "tilt mode".
- [ ] The share card generates on mobile and desktop, and the X intent opens with the correct text.
- [ ] With `CA: ""`, How to Buy and CA are absent. Setting `CA` renders both, and copy works.
- [ ] The site works with localStorage blocked, with WebGL disabled (fallback), and with reduced motion on.
- [ ] Deploys to Vercel as a static build with no backend.
