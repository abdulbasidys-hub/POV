import { SIX_PATH } from "./glyph6.js";

// Two-POV memes: one drawing painted on the ground that reads one way from the
// front end and another way from the back. Each Drawing is authored upright as
// seen from the front, centred on 0,0, within roughly ±150 × ±185.
// Text for each meme lives in copy.js (MEME_COPY), keyed by id.

function SixNine({ palette }) {
  return (
    <g transform="scale(1.32)">
      <path d={SIX_PATH} transform="translate(-5 7)" fill="#000" opacity="0.22" stroke="#000" strokeWidth="9" strokeLinejoin="round" />
      <path d={SIX_PATH} fill={palette.paint} stroke={palette.paint} strokeWidth="9" strokeLinejoin="round" />
    </g>
  );
}

// The "3 or 4 sticks" impossible figure, drawn as in the original meme: beams
// lying on the ground. Nine parallel lines close off as 4 beams at one end
// (pairs of strips) and as 3 at the other (with gaps between them). The pile is
// drawn from your side: its near end (lower right, by you) shows your count.
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const vmul = (a, k) => [a[0] * k, a[1] * k];
const FOUR = [[0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 8]];
const THREE = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

// Width of each of the 8 strips between the 9 lines. Strips 2 and 5 are the
// gaps at the three end; keeping them narrower stops the three beams looking
// spread apart (at the four end they're a slightly slimmer face, barely seen).
const STRIPS = [1, 1, 0.62, 1, 1, 0.62, 1, 1];
// What each strip is at each end: T = top face, S = side face, G = gap.
const ROLES = { 4: "TSTSTSTS", 3: "TSGTSGTS" };

const BEAM = {
  len: 280,
  dir: (200 * Math.PI) / 180, // running away up-left from the near end
  W: [-12, 16.4], // a full-width top face (or gap), across the pile
  H: [0, 20], // a full-width side face: the beam's height
};

function beamGeometry(nearCount) {
  const D = [Math.cos(BEAM.dir), Math.sin(BEAM.dir)];
  const step = (role, w) => vmul(role === "S" ? BEAM.H : BEAM.W, w);
  const chain = (start, roles) =>
    STRIPS.reduce((acc, w, i) => [...acc, vadd(acc[acc.length - 1], step(roles[i], w))], [start]);
  const N = chain([0, 0], ROLES[nearCount]);
  const F0 = chain(vmul(D, BEAM.len), ROLES[nearCount === 4 ? 3 : 4]);
  // keep each far endpoint on its own line
  const F = F0.map((p, k) => vadd(N[k], vmul(D, (p[0] - N[k][0]) * D[0] + (p[1] - N[k][1]) * D[1])));
  const nearGroups = nearCount === 4 ? FOUR : THREE;
  const caps = nearGroups.map(([i, j, k]) => {
    const [a, b, c] = [N[i], N[j], N[k]];
    return [a, b, c, vadd(a, vsub(c, b))];
  });
  return { N, F, caps, farGroups: nearCount === 4 ? THREE : FOUR };
}

// Fit both versions of the pile inside the mat: centre it, then size the mat
// (an ellipse) around every corner with a margin.
const MAT = { cx: 304, cy: 394, aspect: 0.5, maxRx: 238 };
const PILE = (() => {
  const all = [3, 4].flatMap((n) => {
    const g = beamGeometry(n);
    return [...g.N, ...g.F, ...g.caps.flat()];
  });
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const centre = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  const need = Math.max(...all.map(([x, y]) => Math.hypot(x - centre[0], (y - centre[1]) / MAT.aspect))) * 1.12;
  const scale = Math.min(1, MAT.maxRx / need);
  const rx = need * scale;
  const toScreen = (p) => [MAT.cx + (p[0] - centre[0]) * scale, MAT.cy + (p[1] - centre[1]) * scale];
  return { centre, scale, rx, ry: rx * MAT.aspect, near: toScreen([0, 0]), far: toScreen(vmul([Math.cos(BEAM.dir), Math.sin(BEAM.dir)], BEAM.len)) };
})();

const pts = (list) => list.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");

export function Beams({ nearCount, ink = "#111111", cap = "#bdbdbd", strokeWidth = 3 }) {
  const g = beamGeometry(nearCount);
  return (
    <g strokeLinejoin="round" strokeLinecap="round" strokeWidth={strokeWidth} stroke={ink}>
      {/* the near ends you count: grey end faces */}
      {g.caps.map((c, i) => (
        <path key={`n${i}`} d={`M${pts(c)} Z`} fill={cap} />
      ))}
      {g.farGroups.map(([i, j, k]) => (
        <path key={`f${i}`} d={`M${pts([g.F[i], g.F[j], g.F[k]])}`} fill="none" />
      ))}
      {g.N.map((p, k) => (
        <path key={`s${k}`} d={`M${pts([p, g.F[k]])}`} fill="none" />
      ))}
    </g>
  );
}

// Hero scene: a white mat on the ground, the pile centred on it, near end by you.
function SticksGround({ palette, side }) {
  const { centre, scale, rx, ry } = PILE;
  return (
    <g>
      <ellipse cx={MAT.cx + 6} cy={MAT.cy + 8} rx={rx} ry={ry} fill="#000" opacity="0.18" />
      <ellipse cx={MAT.cx} cy={MAT.cy} rx={rx} ry={ry} fill={palette.paint} />
      <g transform={`translate(${MAT.cx} ${MAT.cy}) scale(${scale.toFixed(4)}) translate(${(-centre[0]).toFixed(1)} ${(-centre[1]).toFixed(1)})`}>
        <Beams nearCount={side === "front" ? 3 : 4} strokeWidth={3.2 / scale} />
      </g>
    </g>
  );
}

// Your guy stands just past the near end, the other just past the far end.
const STICKS_LAYOUT = {
  near: [Math.min(560, PILE.near[0] + 78), Math.min(540, PILE.near[1] + 118)],
  far: [Math.max(70, PILE.far[0] - 60), Math.max(282, PILE.far[1] + 30)],
};

function MomWow({ palette }) {
  const common = {
    x: 0,
    textAnchor: "middle",
    fontFamily: "Bangers, Impact, sans-serif",
    fontSize: 160,
    letterSpacing: 6,
    className: "scene-text",
  };
  // Bangers sits on its baseline; nudge so the word is centred on 0,0.
  return (
    <g>
      <text {...common} y={58} transform="translate(-6 8)" fill="#000" opacity="0.22">
        MOM
      </text>
      <text {...common} y={58} fill={palette.paint} stroke={palette.paint} strokeWidth="6" strokeLinejoin="round">
        MOM
      </text>
    </g>
  );
}

export const MEMES = [
  { id: "six-nine", Drawing: SixNine },
  {
    id: "sticks",
    Ground: SticksGround,
    layout: STICKS_LAYOUT,
  },
  { id: "mom-wow", Drawing: MomWow },
];

export function memeIndexOf(id) {
  const i = MEMES.findIndex((m) => m.id === id);
  return i < 0 ? 0 : i;
}
