import { SIX_PATH } from "./glyph6.js";

// Two-POV memes: one drawing painted on the ground that reads one way from the
// front end and another way from the back. Each Drawing is authored upright as
// seen from the front, centred on 0,0, within roughly ±150 × ±185.
// Text for each meme lives in copy.js (MEME_COPY), keyed by id.

function SixNine({ palette }) {
  return (
    <g transform="scale(1.5)">
      <path d={SIX_PATH} transform="translate(-5 7)" fill="#000" opacity="0.22" stroke="#000" strokeWidth="9" strokeLinejoin="round" />
      <path d={SIX_PATH} fill={palette.paint} stroke={palette.paint} strokeWidth="9" strokeLinejoin="round" />
    </g>
  );
}

// The "3 or 4 sticks" impossible figure, drawn as in the original meme: beams
// lying on the ground. Nine parallel lines; at the left end they close off as 4
// beams (each with a grey end face), at the right end as 3 beams with gaps.
// Unlike the painted memes this is drawn in screen space, not on the turning
// ground: you stand at one end of the pile or the other.
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const vmul = (a, k) => [a[0] * k, a[1] * k];

function beamGeometry({ origin, len, angle = -20, W = [11, 15], H = [0, 18.4] }) {
  const r = (angle * Math.PI) / 180;
  const D = [Math.cos(r), Math.sin(r)];
  const L = [origin];
  for (let k = 1; k < 9; k++) L.push(vadd(L[k - 1], k % 2 ? W : H));
  const steps = [W, H, W, W, H, W, W, H]; // the gaps at the right end step like a top face
  const R = [vadd(origin, vmul(D, len))];
  for (let k = 1; k < 9; k++) R.push(vadd(R[k - 1], steps[k - 1]));
  // keep each right endpoint on its own line
  return {
    L,
    R: R.map((p, k) => vadd(L[k], vmul(D, (p[0] - L[k][0]) * D[0] + (p[1] - L[k][1]) * D[1]))),
  };
}

const pts = (list) => list.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");

// `mark`: "four" | "three" — colour that end's faces to show where you stand.
export function Beams({ origin, len, size = 1, ink = "#111111", cap = "#bdbdbd", mark, markColor, strokeWidth = 3 }) {
  const g = beamGeometry({ origin, len, W: [11 * size, 15 * size], H: [0, 18.4 * size] });
  const sw = strokeWidth;
  return (
    <g strokeLinejoin="round" strokeLinecap="round">
      {[0, 1, 2, 3].map((j) => {
        const [a, b, c] = [g.L[2 * j], g.L[2 * j + 1], g.L[2 * j + 2]];
        const d = vadd(a, [c[0] - b[0], c[1] - b[1]]);
        return <path key={`l${j}`} d={`M${pts([a, b, c, d])} Z`} fill={mark === "four" ? markColor : cap} stroke={ink} strokeWidth={sw} />;
      })}
      {mark === "three" &&
        [[0, 1, 2], [3, 4, 5], [6, 7, 8]].map(([i, j, k]) => {
          const [a, b, c] = [g.R[i], g.R[j], g.R[k]];
          const d = vadd(a, [c[0] - b[0], c[1] - b[1]]);
          return <path key={`m${i}`} d={`M${pts([a, b, c, d])} Z`} fill={markColor} stroke={ink} strokeWidth={sw} />;
        })}
      {[[0, 1, 2], [3, 4, 5], [6, 7, 8]].map(([i, j, k]) => (
        <path key={`r${i}`} d={`M${pts([g.R[i], g.R[j], g.R[k]])}`} fill="none" stroke={ink} strokeWidth={sw} />
      ))}
      {g.L.map((p, k) => (
        <path key={`s${k}`} d={`M${pts([p, g.R[k]])}`} fill="none" stroke={ink} strokeWidth={sw} />
      ))}
    </g>
  );
}

// Hero scene: a white mat on the ground with the pile centred on it. The scene
// mirrors it (turning it round) to show the visitor's end; see Scene.jsx.
function SticksGround({ palette }) {
  return (
    <g>
      <ellipse cx="306" cy="428" rx="232" ry="128" fill="#000" opacity="0.18" />
      <ellipse cx="300" cy="420" rx="232" ry="128" fill={palette.paint} />
      <Beams origin={[140, 396]} len={290} size={1.1} strokeWidth={3.2} />
    </g>
  );
}

// Stage: the pile, with your end lit up. Stage.jsx turns it to your side.
function SticksStage({ palette, side }) {
  const yours = side === "front" ? "three" : "four";
  return (
    <g>
      <rect x="-205" y="-150" width="410" height="300" rx="20" transform="translate(10 12)" fill="#000" opacity="0.45" />
      <rect x="-205" y="-150" width="410" height="300" rx="20" fill="#ffffff" stroke="#111" strokeWidth="6" />
      <ellipse cx={yours === "four" ? -148 : 156} cy={yours === "four" ? 48 : -50} rx="62" ry="104" fill={palette.accent} opacity="0.35" />
      <Beams origin={[-176, 0]} len={330} size={1.3} mark={yours} markColor={palette.accent} strokeWidth={3.6} />
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
    StageDrawing: SticksStage,
    // Drawn as seen from the four end. The two guys stand at the ends; you stay
    // bottom-left while the pile turns round so your end comes to you.
    layout: { front: [532, 360], back: [72, 484], you: -232, turnedFor: "front" },
  },
  { id: "mom-wow", Drawing: MomWow },
];

export function memeIndexOf(id) {
  const i = MEMES.findIndex((m) => m.id === id);
  return i < 0 ? 0 : i;
}
