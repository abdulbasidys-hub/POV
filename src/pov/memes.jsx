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

// The "3 or 4 sticks" impossible figure, painted on a white board: nine evenly
// spaced lines run the full length. At the back end they close off as 4 beams
// (pairs of strips, no gaps); at the front end as 3 beams (three lines each),
// and the strips between them become gaps. Each end counts true on its own.
const BEAM_GAP = 22;
const BEAM_X = Array.from({ length: 9 }, (_, i) => (i - 4) * BEAM_GAP);
const BEAM_BACK = -135;
const BEAM_FRONT = 135;
const BEAM_END = [9, 16]; // depth of each beam's end face

function Sticks({ palette }) {
  const ink = palette.ink === "#000000" ? "#111111" : palette.ink;
  const end = (l, r, y, dir, key) => (
    <path
      key={key}
      d={`M${BEAM_X[l]} ${y} L${BEAM_X[r]} ${y} L${BEAM_X[r] + BEAM_END[0]} ${y + dir * BEAM_END[1]} L${BEAM_X[l] + BEAM_END[0]} ${y + dir * BEAM_END[1]} Z`}
      fill="#c9c9c9"
      stroke={ink}
      strokeWidth="3.4"
      strokeLinejoin="round"
    />
  );
  return (
    <g>
      <rect x="-122" y="-167" width="256" height="350" rx="14" fill="#000" opacity="0.22" />
      <rect x="-128" y="-175" width="256" height="350" rx="14" fill={palette.paint} />
      {[[0, 2], [2, 4], [4, 6], [6, 8]].map(([l, r], i) => end(l, r, BEAM_BACK, -1, `b${i}`))}
      {[[0, 2], [3, 5], [6, 8]].map(([l, r], i) => end(l, r, BEAM_FRONT, 1, `f${i}`))}
      {BEAM_X.map((x) => (
        <line key={x} x1={x} y1={BEAM_BACK} x2={x} y2={BEAM_FRONT} stroke={ink} strokeWidth="3.4" strokeLinecap="round" />
      ))}
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

// An upside-down face: brows and mouth are the same curve, so from the front
// it smiles, and from the back the brows become a frown.
function HappySad({ palette }) {
  const ink = "#111111";
  // A U-shaped curve (opens upward) centred at height y.
  const arc = (y, w, depth) => `M${-w} ${y} Q0 ${y + depth} ${w} ${y}`;
  return (
    <g>
      <circle r="168" transform="translate(-6 8)" fill="#000" opacity="0.22" />
      <circle r="168" fill="#ffd23f" stroke={ink} strokeWidth="10" />
      <circle cx="-56" cy="0" r="18" fill={ink} />
      <circle cx="56" cy="0" r="18" fill={ink} />
      {/* front: a smile under the eyes. back: worried brows over them */}
      <path d={arc(52, 80, 70)} fill="none" stroke={ink} strokeWidth="14" strokeLinecap="round" />
      {/* front: a crease on the forehead. back: a frown down by the chin */}
      <path d={arc(-112, 50, 30)} fill="none" stroke={ink} strokeWidth="12" strokeLinecap="round" />
    </g>
  );
}

export const MEMES = [
  { id: "six-nine", Drawing: SixNine },
  { id: "sticks", Drawing: Sticks },
  { id: "mom-wow", Drawing: MomWow },
  { id: "happy-sad", Drawing: HappySad },
];

export function memeIndexOf(id) {
  const i = MEMES.findIndex((m) => m.id === id);
  return i < 0 ? 0 : i;
}
