import { useEffect, useRef, useState } from "react";
import { SIX_PATH } from "../../pov/glyph6.js";
import { SCENE } from "../../pov/copy.js";

// The meme: one number painted on the ground, a guy at each end yelling what they
// see, and you in front. The ground turns to the visitor's own standpoint, so the
// same 6 reads as whatever it reads as from where they're standing.

const VB = 600; // the scene is VB×VB; a caption strip sits underneath
const CAPTION = 84;
const HORIZON = 250;
const PLATE = { cx: 300, cy: 430, squash: 0.55 };
const GUY_A = [150, 255]; // stands at the 6's base: sees a 6
const GUY_B = [-150, -255]; // stands at its top: sees a 9

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Turns the ground the short way round to a new angle (in degrees).
function useAngle(target, reducedMotion) {
  const [angle, setAngle] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (reducedMotion) {
      cur.current = target;
      setAngle(target);
      return undefined;
    }
    const from = cur.current;
    let delta = ((((target - from) % 360) + 540) % 360) - 180;
    if (delta === -180) delta = 180;
    if (delta === 0) return undefined;
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const a = from + delta * easeInOut(p);
      cur.current = a;
      setAngle(a);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reducedMotion]);
  return angle;
}

// A point on the ground plane (y away from you) -> screen.
function project([x, y], deg) {
  const r = (deg * Math.PI) / 180;
  const rx = x * Math.cos(r) - y * Math.sin(r);
  const ry = x * Math.sin(r) + y * Math.cos(r);
  return [PLATE.cx + rx, PLATE.cy + ry * PLATE.squash];
}

const depthScale = (y) => 0.7 + ((y - HORIZON) / (VB - HORIZON)) * 0.62;

/* ---------- pieces ---------- */

function Guy({ x, y, cap, palette, shadowDx }) {
  const k = depthScale(y);
  // Point at the middle of the painted number.
  const sx = x;
  const sy = y - 70 * k;
  let ax = PLATE.cx - sx;
  let ay = PLATE.cy - sy;
  const len = Math.hypot(ax, ay) || 1;
  ax = (ax / len) * 40;
  ay = (ay / len) * 40;
  const side = x < PLATE.cx ? 1 : -1; // which way the free hand sits
  const stroke = { stroke: palette.figure, strokeWidth: 7, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})`}>
      <ellipse cx={shadowDx} cy={3} rx={30} ry={8} fill="#000" opacity="0.28" />
      <path d="M-15 0 L0 -40 L15 0" {...stroke} />
      <path d="M0 -40 L0 -80" {...stroke} />
      <path d={`M0 -70 L${ax.toFixed(1)} ${(-70 + ay).toFixed(1)}`} {...stroke} />
      <path d={`M0 -70 L${-side * 17} -55 L${-side * 6} -45`} {...stroke} />
      <circle cx="0" cy="-97" r="18" fill={palette.bubble} stroke={palette.ink} strokeWidth="4" />
      <circle cx="-6" cy="-100" r="2.6" fill={palette.ink} />
      <circle cx="6" cy="-100" r="2.6" fill={palette.ink} />
      <ellipse cx="0" cy="-89" rx="5" ry="4.5" fill={palette.ink} />
      {cap && (
        <path
          d="M-18 -103 Q-17 -121 0 -121 Q17 -121 18 -103 Z M10 -106 L31 -104 L18 -101"
          fill={palette.accent2}
          stroke={palette.ink}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}

function Bubble({ x, y, text, palette, size = 28, tailTo, className = "" }) {
  const w = text.length * size * 0.5 + 34;
  const h = size + 22;
  const cx = Math.min(VB - w / 2 - 10, Math.max(w / 2 + 10, x));
  const cy = Math.max(h / 2 + 12, y);
  const [tx, ty] = tailTo;
  const baseX = Math.min(cx + w / 2 - 22, Math.max(cx - w / 2 + 22, tx));
  return (
    <g className={`scene-bubble ${className}`}>
      <path
        d={`M${baseX - 10} ${cy + h / 2 - 2} L${tx} ${ty} L${baseX + 10} ${cy + h / 2 - 2} Z`}
        fill={palette.bubble}
        stroke={palette.ink}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x={cx - w / 2} y={cy - h / 2} width={w} height={h} rx={h / 2} fill={palette.bubble} stroke={palette.ink} strokeWidth="4" />
      <rect x={baseX - 12} y={cy + h / 2 - 8} width="24" height="8" fill={palette.bubble} />
      <text
        className="scene-text"
        x={cx}
        y={cy + size * 0.36}
        textAnchor="middle"
        fontFamily="Bangers, Impact, sans-serif"
        fontSize={size}
        letterSpacing="1"
        fill="#111"
      >
        {text}
      </text>
    </g>
  );
}

const STARS = [
  [40, 40], [95, 120], [150, 60], [210, 150], [260, 35], [330, 95], [395, 30], [440, 140], [500, 70], [560, 120], [70, 200], [520, 200],
];

function Sky({ palette, sky, band }) {
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.sky[0]} />
          <stop offset="1" stopColor={palette.sky[1]} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={VB} height={HORIZON + 2} fill="url(#sky)" />
      {palette.stars &&
        STARS.map(([x, y], i) => (
          <path
            key={i}
            className="scene-star"
            style={{ animationDelay: `${(i % 5) * 0.6}s` }}
            d={`M${x} ${y - 6} L${x + 1.6} ${y - 1.6} L${x + 6} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 6} L${x - 1.6} ${y + 1.6} L${x - 6} ${y} L${x - 1.6} ${y - 1.6} Z`}
            fill="#fff8d0"
          />
        ))}
      {palette.clouds && (
        <g className="scene-clouds" fill="#ffffff" stroke={palette.ink} strokeWidth="4" strokeLinejoin="round">
          <path d="M40 205 q0 -24 26 -24 q8 -20 32 -16 q20 -14 38 6 q28 0 26 24 q0 10 -12 10 h-98 q-12 0 -12 0 z" />
          <path d="M430 215 q0 -18 20 -18 q8 -16 26 -12 q16 -11 30 4 q22 0 20 18 q0 8 -10 8 h-76 q-10 0 -10 0 z" />
        </g>
      )}
      {sky.isMoon || band === "deadzone" ? (
        <g transform={`translate(${sky.x.toFixed(1)} ${sky.y.toFixed(1)})`}>
          <circle r="30" fill="#fff4c7" stroke={palette.ink} strokeWidth="4" />
          <circle cx="-9" cy="-6" r="6" fill="#e9dca5" />
          <circle cx="10" cy="8" r="4" fill="#e9dca5" />
          <circle cx="6" cy="-12" r="3" fill="#e9dca5" />
        </g>
      ) : (
        <g transform={`translate(${sky.x.toFixed(1)} ${sky.y.toFixed(1)})`}>
          <g className="scene-rays" stroke={palette.ink} strokeWidth="4" strokeLinecap="round">
            {Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              return <line key={i} x1={Math.cos(a) * 44} y1={Math.sin(a) * 44} x2={Math.cos(a) * 58} y2={Math.sin(a) * 58} />;
            })}
          </g>
          <circle r="34" fill="#ffe14d" stroke={palette.ink} strokeWidth="4" />
        </g>
      )}
      {/* far-off skyline on the horizon */}
      <path
        d={`M0 ${HORIZON} V${HORIZON - 26} h40 v-14 h30 v22 h36 v-34 h28 v26 h44 v-12 h40 v18 h30 v-40 h34 v32 h46 v-18 h38 v24 h30 v-30 h40 v20 h44 v-10 h44 V${HORIZON} Z`}
        fill={palette.groundEdge}
        opacity="0.55"
      />
    </g>
  );
}

/* ---------- scene ---------- */

export default function Scene({ view, svgRef, label }) {
  const { palette, sky, band, reducedMotion, idle } = view;
  const angle = useAngle(view.angle, reducedMotion);

  // Shadows fall away from the sun; longer when it's low.
  const lowness = Math.max(0, Math.min(1, (sky.y - 55) / 95));
  const shadowDx = Math.max(-1, Math.min(1, (PLATE.cx - sky.x) / 230)) * (8 + lowness * 34);

  const a = project(GUY_A, angle);
  const b = project(GUY_B, angle);
  const guys = [
    { key: "a", pos: a, cap: false, text: SCENE.guyA },
    { key: "b", pos: b, cap: true, text: SCENE.guyB },
  ].sort((p, q) => p.pos[1] - q.pos[1]);

  const bubbleFor = (g, i) => {
    const [x, y] = g.pos;
    const k = depthScale(y);
    const headTop = y - 120 * k;
    const outward = x < PLATE.cx ? -1 : 1;
    return (
      <Bubble
        key={`bubble-${g.key}`}
        x={x + outward * 50}
        y={headTop - 44}
        text={g.text}
        palette={palette}
        tailTo={[x + outward * 6, headTop + 4]}
        className={idle ? `is-arguing is-arguing--${i}` : ""}
      />
    );
  };

  return (
    <svg
      ref={svgRef}
      className="scene"
      viewBox={`0 0 ${VB} ${VB + CAPTION}`}
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Sky palette={palette} sky={sky} band={band} />

      {/* the ground */}
      <rect x="0" y={HORIZON} width={VB} height={VB - HORIZON} fill={palette.ground} />
      <rect x="0" y={HORIZON} width={VB} height="6" fill={palette.groundEdge} />
      {band === "deadzone" && (
        <>
          <defs>
            <radialGradient id="screenglow" cx="0.5" cy="1" r="0.75">
              <stop offset="0" stopColor={palette.accent} stopOpacity="0.55" />
              <stop offset="1" stopColor={palette.accent} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect x="0" y={HORIZON} width={VB} height={VB - HORIZON} fill="url(#screenglow)" />
        </>
      )}

      {/* the number, painted flat on the ground and turned to your standpoint */}
      <g transform={`translate(${PLATE.cx} ${PLATE.cy}) scale(1 ${PLATE.squash}) rotate(${angle.toFixed(2)})`}>
        <circle r="268" fill="none" stroke={palette.paint} strokeOpacity="0.5" strokeWidth="8" strokeDasharray="26 20" />
        <g transform="scale(1.5)">
          <path d={SIX_PATH} transform="translate(-5 7)" fill="#000" opacity="0.22" stroke="#000" strokeWidth="9" strokeLinejoin="round" />
          <path d={SIX_PATH} fill={palette.paint} stroke={palette.paint} strokeWidth="9" strokeLinejoin="round" />
        </g>
      </g>

      {/* the two guys, far one first */}
      {guys.map((g) => (
        <Guy key={g.key} x={g.pos[0]} y={g.pos[1]} cap={g.cap} palette={palette} shadowDx={shadowDx} />
      ))}
      {guys.map(bubbleFor)}

      {/* you, from behind, in front of everything */}
      <g className="scene-you">
        {band === "deadzone" && (
          <g>
            <rect x="376" y="548" width="44" height="70" rx="8" fill="#111" stroke={palette.ink} strokeWidth="4" />
            <rect x="382" y="556" width="32" height="52" rx="4" fill={palette.accent} />
          </g>
        )}
        <path d="M170 610 Q178 566 300 562 Q422 566 430 610 Z" fill={palette.accent2} stroke={palette.ink} strokeWidth="5" />
        <circle cx="300" cy="566" r="44" fill="#2b1d16" stroke={palette.ink} strokeWidth="5" />
        <g transform="translate(206 588) rotate(-6)">
          <rect x="-34" y="-17" width="68" height="34" rx="6" fill={palette.accent} stroke={palette.ink} strokeWidth="4" />
          <text x="0" y="10" textAnchor="middle" fontFamily="Bangers, Impact, sans-serif" fontSize="26" letterSpacing="2" fill="#111" className="scene-text">
            {SCENE.youTag}
          </text>
        </g>
      </g>

      {/* caption strip: what you say */}
      <rect x="0" y={VB} width={VB} height={CAPTION} fill="#111" />
      <text
        className="scene-text"
        x={VB / 2}
        y={VB + CAPTION / 2 + 12}
        textAnchor="middle"
        fontFamily="Bangers, Impact, sans-serif"
        fontSize="34"
        letterSpacing="1.5"
        fill="#ffffff"
      >
        <tspan fill={palette.accent}>{SCENE.youTag}: </tspan>
        {view.copy.you}
      </text>
    </svg>
  );
}
