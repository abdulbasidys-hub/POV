import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Reveal from "./Reveal.jsx";
import { REVEAL } from "../pov/copy.js";
import { shareMyView } from "../share/makeShareCard.js";

export default function YourView({ view, canvasRef }) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(0);
  const frags = view.copy.revealFragments;

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const shown = await shareMyView({ view, canvas: canvasRef.current });
      if (shown) {
        setToast(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(false), 3200);
      }
    } finally {
      setBusy(false);
    }
  };

  // Same sentence as view.copy.reveal, with each fragment set in italic.
  const parts = [];
  frags.forEach((f, i) => {
    if (i > 0) parts.push(i === frags.length - 1 ? " and " : ", ");
    parts.push(<em key={f}>{f}</em>);
  });

  return (
    <Reveal className="section yourview" reducedMotion={view.reducedMotion} aria-labelledby="yourview-h">
      <h2 id="yourview-h" className="label">
        {REVEAL.heading}
      </h2>
      <p className="yourview__sentence" aria-label={view.copy.reveal}>
        {view.copy.lead} {parts}.
      </p>
      <p className="yourview__meaning">{view.copy.meaning}</p>
      <p className="yourview__after small">{REVEAL.after}</p>
      <button type="button" className="btn" onClick={onShare} disabled={busy}>
        <span className="btn__dot" aria-hidden="true" />
        {busy ? REVEAL.shareBusy : REVEAL.shareButton}
      </button>
      {createPortal(
        <div className={`toast ${toast ? "is-shown" : ""}`} role="status" aria-hidden={!toast}>
          {REVEAL.toast}
        </div>,
        document.body
      )}
    </Reveal>
  );
}
