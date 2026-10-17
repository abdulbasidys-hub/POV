import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Reveal from "./Reveal.jsx";
import Crossfade from "./Crossfade.jsx";
import { useAngle } from "./Hero/Scene.jsx";
import { STAGE } from "../pov/copy.js";
import { shareMyView } from "../share/makeShareCard.js";

// The visitor's POV, on stage: the drawing under a spotlight, turned the way
// they see it, and what it is from where they're standing.

const CURTAIN = "#d62839";
const FOLD = "#9e1b2a";

function Curtain({ side, ink }) {
  // Drawn for the left; mirrored for the right.
  const t = side === "right" ? "translate(800 0) scale(-1 1)" : undefined;
  return (
    <g transform={t}>
      <path
        d="M0 0 H180 Q150 120 170 230 Q190 330 120 470 Q90 520 110 560 H0 Z"
        fill={CURTAIN}
        stroke={ink}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M45 40 Q30 220 50 380 Q58 470 40 540" fill="none" stroke={FOLD} strokeWidth="9" strokeLinecap="round" />
      <path d="M100 40 Q85 200 108 330 Q118 420 82 510" fill="none" stroke={FOLD} strokeWidth="9" strokeLinecap="round" />
      <path d="M150 40 Q130 150 150 240" fill="none" stroke={FOLD} strokeWidth="7" strokeLinecap="round" />
      {/* tie-back */}
      <path d="M118 300 Q150 312 172 296" fill="none" stroke="#ffd23f" strokeWidth="9" strokeLinecap="round" />
    </g>
  );
}

function StageArt({ view }) {
  const { palette, meme, reducedMotion } = view;
  const { Drawing, StageDrawing } = meme;
  const angle = useAngle(view.angle, reducedMotion);
  const ink = "#111";
  return (
    <svg className="stage__art" viewBox="0 0 800 560" role="img" aria-label={`${view.copy.lead} ${view.copy.word}`}>
      <defs>
        <radialGradient id="spot" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#fff6c8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff6c8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff6c8" stopOpacity="0.32" />
          <stop offset="1" stopColor="#fff6c8" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* back wall and floorboards */}
      <rect width="800" height="560" fill="#1a0b10" />
      <rect y="440" width="800" height="120" fill="#8b5a2b" />
      {[470, 500, 530].map((y) => (
        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#6b4320" strokeWidth="4" />
      ))}
      <rect y="436" width="800" height="8" fill={ink} />

      {/* spotlight */}
      <path d="M330 0 H470 L640 470 H160 Z" fill="url(#beam)" />
      <ellipse cx="400" cy="470" rx="250" ry="34" fill="#fff6c8" opacity="0.25" />
      <rect width="800" height="560" fill="url(#spot)" />

      {/* the patch of ground, as you see it */}
      <g transform="translate(400 262)">
        {StageDrawing ? (
          <g transform={`scale(${Math.cos(((angle + (meme.layout?.turnedFor === "front" ? 180 : 0)) * Math.PI) / 180).toFixed(4)} 1)`}>
            <StageDrawing palette={palette} side={view.side} />
          </g>
        ) : (
          <>
            <rect x="-168" y="-196" width="336" height="392" rx="22" transform="translate(10 12)" fill="#000" opacity="0.45" />
            <rect x="-168" y="-196" width="336" height="392" rx="22" fill={palette.ground} stroke={ink} strokeWidth="6" />
            <g transform={`rotate(${angle.toFixed(2)}) scale(0.86)`}>
              <Drawing palette={palette} />
            </g>
          </>
        )}
      </g>

      {/* curtains and valance */}
      <Curtain side="left" ink={ink} />
      <Curtain side="right" ink={ink} />
      <path
        d="M0 0 H800 V46 Q760 78 720 46 Q680 78 640 46 Q600 78 560 46 Q520 78 480 46 Q440 78 400 46 Q360 78 320 46 Q280 78 240 46 Q200 78 160 46 Q120 78 80 46 Q40 78 0 46 Z"
        fill={CURTAIN}
        stroke={ink}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M0 22 H800" stroke={FOLD} strokeWidth="6" />
    </svg>
  );
}

export default function Stage({ view, sceneRef }) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(0);
  const { copy } = view;

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (await shareMyView({ view, svg: sceneRef.current })) {
        setToast(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(false), 3200);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Reveal className="section stage" id="pov" reducedMotion={view.reducedMotion} aria-labelledby="stage-h">
      <div className="stage__frame">
        <StageArt view={view} />
      </div>
      <div className="stage__copy">
        <p className="label">{STAGE.label}</p>
        <p className="stage__eyebrow">{STAGE.heading}</p>
        <h2 id="stage-h" className="stage__title">
          {copy.lead}{" "}
          <span className="stage__word" key={`${view.meme.id}-${view.side}`}>
            {copy.word}
          </span>
          .
        </h2>
        <p className="stage__meaning">{copy.meaning}</p>
        <button type="button" className="btn btn--accent" onClick={onShare} disabled={busy}>
          {busy ? STAGE.shareBusy : STAGE.share}
        </button>
        {copy.returning && <p className="sticker sticker--note">{copy.returning}</p>}
        <Crossfade className="stage__pace" text={copy.pace} reducedMotion={view.reducedMotion} />
        <p className="stage__fine">{STAGE.fine}</p>
      </div>
      {createPortal(
        <div className={`toast ${toast ? "is-shown" : ""}`} role="status" aria-hidden={!toast}>
          {STAGE.toast}
        </div>,
        document.body
      )}
    </Reveal>
  );
}
