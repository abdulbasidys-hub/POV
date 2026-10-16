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

// Figure–ground: from the front end you count 3 painted bars; from the back
// end the unpainted gaps become 4 rounded sticks poking into the paint.
function Sticks({ palette }) {
  const W = 34; // column width
  const bars = [-2, 0, 2].map((c) => c * W); // centres of the 3 bars
  const gaps = [-3, -1, 1, 3].map((c) => c * W); // centres of the 4 sticks
  const blockTop = -185;
  const join = -20; // where the bars meet the painted block
  const paint = palette.paint;
  const shape = (
    <>
      <rect x={-4 * W - 6} y={blockTop} width={8 * W + 12} height={join - blockTop} rx="10" fill={paint} />
      {bars.map((x) => (
        <rect key={x} x={x - W / 2} y={join - 2} width={W} height={182} fill={paint} />
      ))}
      {gaps.map((x) => (
        <path
          key={x}
          d={`M${x - W / 2} ${join + 1} V${blockTop + 34 + W / 2} A${W / 2} ${W / 2} 0 0 1 ${x + W / 2} ${blockTop + 34 + W / 2} V${join + 1} Z`}
          fill={palette.ground}
        />
      ))}
    </>
  );
  return (
    <g>
      <g transform="translate(-6 8)" opacity="0.22">
        <rect x={-4 * W - 6} y={blockTop} width={8 * W + 12} height={join - blockTop} rx="10" fill="#000" />
        {bars.map((x) => (
          <rect key={x} x={x - W / 2} y={join - 2} width={W} height={182} fill="#000" />
        ))}
      </g>
      {shape}
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

// An arrow painted pointing away from the front end: "up" from there, "down"
// from the back.
function PumpDump({ palette }) {
  const d = "M-46 180 V-30 H-118 L0 -185 L118 -30 H46 V180 Z";
  return (
    <g>
      <path d={d} transform="translate(-6 8)" fill="#000" opacity="0.22" />
      <path d={d} fill={palette.paint} stroke={palette.paint} strokeWidth="8" strokeLinejoin="round" />
    </g>
  );
}

export const MEMES = [
  { id: "six-nine", Drawing: SixNine },
  { id: "sticks", Drawing: Sticks },
  { id: "mom-wow", Drawing: MomWow },
  { id: "pump-dump", Drawing: PumpDump },
];

export function memeIndexOf(id) {
  const i = MEMES.findIndex((m) => m.id === id);
  return i < 0 ? 0 : i;
}
