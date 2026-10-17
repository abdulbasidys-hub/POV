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
const vmul = (a, k) => [a[0] * k, a[1] * k];
const FOUR = [[0, 1, 2], [2, 3, 4], [4, 5, 6], [6, 7, 8]];
const THREE = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];

function beamGeometry({ near, len, size, nearCount }) {
  const r = (200 * Math.PI) / 180; // running away up-left from the near end
  const D = [Math.cos(r), Math.sin(r)];
  const W = [-11 * size, 15 * size]; // top face, across the pile
  const H = [0, 18.4 * size]; // side face, the beam's height
  const fourSteps = [W, H, W, H, W, H, W, H];
  const threeSteps = [W, H, W, W, H, W, W, H]; // the gaps step like a top face
  const chain = (start, steps) => steps.reduce((acc, st) => [...acc, vadd(acc[acc.length - 1], st)], [start]);
  const N = chain(near, nearCount === 4 ? fourSteps : threeSteps);
  const F0 = chain(vadd(near, vmul(D, len)), nearCount === 4 ? threeSteps : fourSteps);
  // keep each far endpoint on its own line
  const F = F0.map((p, k) => vadd(N[k], vmul(D, (p[0] - N[k][0]) * D[0] + (p[1] - N[k][1]) * D[1])));
  return { N, F };
}

const pts = (list) => list.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");

export function Beams({ near, len, size = 1, nearCount, ink = "#111111", cap = "#bdbdbd", strokeWidth = 3 }) {
  const g = beamGeometry({ near, len, size, nearCount });
  const nearGroups = nearCount === 4 ? FOUR : THREE;
  const farGroups = nearCount === 4 ? THREE : FOUR;
  return (
    <g strokeLinejoin="round" strokeLinecap="round" strokeWidth={strokeWidth} stroke={ink}>
      {/* the near ends you count: grey end faces */}
      {nearGroups.map(([i, j, k]) => {
        const [a, b, c] = [g.N[i], g.N[j], g.N[k]];
        const d = vadd(a, [c[0] - b[0], c[1] - b[1]]);
        return <path key={`n${i}`} d={`M${pts([a, b, c, d])} Z`} fill={cap} />;
      })}
      {farGroups.map(([i, j, k]) => (
        <path key={`f${i}`} d={`M${pts([g.F[i], g.F[j], g.F[k]])}`} fill="none" />
      ))}
      {g.N.map((p, k) => (
        <path key={`s${k}`} d={`M${pts([p, g.F[k]])}`} fill="none" />
      ))}
    </g>
  );
}

// Hero scene: a white mat on the ground, the pile on it, near end by you.
function SticksGround({ palette, side }) {
  return (
    <g>
      <ellipse cx="324" cy="398" rx="236" ry="124" fill="#000" opacity="0.18" />
      <ellipse cx="318" cy="390" rx="236" ry="124" fill={palette.paint} />
      <Beams near={[466, 350]} len={270} size={1.04} nearCount={side === "front" ? 3 : 4} strokeWidth={3.2} />
    </g>
  );
}

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
    // Your guy stands by the near end (next to you), the other at the far end.
    layout: { near: [548, 512], far: [96, 300] },
  },
  { id: "mom-wow", Drawing: MomWow },
];

export function memeIndexOf(id) {
  const i = MEMES.findIndex((m) => m.id === id);
  return i < 0 ? 0 : i;
}
