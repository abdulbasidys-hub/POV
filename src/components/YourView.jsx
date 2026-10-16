import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Reveal from "./Reveal.jsx";
import { POV } from "../pov/copy.js";
import { shareMyView } from "../share/makeShareCard.js";

// States the visitor's POV. No reasons, just what they see.
export default function YourView({ view, canvasRef }) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(0);

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

  return (
    <Reveal className="section yourview" reducedMotion={view.reducedMotion} aria-labelledby="yourview-h">
      <h2 id="yourview-h" className="label">
        {POV.label}
      </h2>
      <p className="yourview__statement">{view.copy.statement}</p>
      <p className="yourview__meaning">{view.copy.meaning}</p>
      <button type="button" className="btn" onClick={onShare} disabled={busy}>
        <span className="btn__dot" aria-hidden="true" />
        {busy ? POV.shareBusy : POV.shareButton}
      </button>
      {createPortal(
        <div className={`toast ${toast ? "is-shown" : ""}`} role="status" aria-hidden={!toast}>
          {POV.toast}
        </div>,
        document.body
      )}
    </Reveal>
  );
}
