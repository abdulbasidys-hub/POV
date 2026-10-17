import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Reveal from "./Reveal.jsx";
import Crossfade from "./Crossfade.jsx";
import { CONFIG } from "../config.js";
import { COMMUNITY, STAGE } from "../pov/copy.js";
import { shareMyView } from "../share/makeShareCard.js";

// Your POV, stated plainly, and an ask to bring more two-sided things.
export default function Stage({ view, sceneRef }) {
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(0);
  const { copy } = view;
  const communityHref = CONFIG.COMMUNITY_URL || CONFIG.TG_URL || CONFIG.X_URL;
  const postHref = `https://x.com/intent/tweet?text=${encodeURIComponent(COMMUNITY.text(CONFIG.SITE_URL))}`;

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
    <Reveal className="section pov" id="pov" reducedMotion={view.reducedMotion} aria-labelledby="pov-h">
      <div className="pov__card pov__card--mine">
        <p className="label">{STAGE.label}</p>
        <p className="pov__eyebrow">{STAGE.heading}</p>
        <h2 id="pov-h" className="pov__title">
          {copy.lead}{" "}
          <span className="pov__word" key={`${view.meme.id}-${view.side}`}>
            {copy.word}
          </span>
          .
        </h2>
        <p className="pov__meaning">{copy.meaning}</p>
        <button type="button" className="btn btn--accent" onClick={onShare} disabled={busy}>
          {busy ? STAGE.shareBusy : STAGE.share}
        </button>
        {copy.returning && <p className="sticker sticker--note">{copy.returning}</p>}
        <Crossfade className="pov__pace" text={copy.pace} reducedMotion={view.reducedMotion} />
        <p className="pov__fine">{STAGE.fine}</p>
      </div>

      <div className="pov__card pov__card--ask">
        <p className="label">{COMMUNITY.label}</p>
        <h2 className="pov__ask">{COMMUNITY.heading}</h2>
        <p className="pov__body">{COMMUNITY.body}</p>
        <div className="pov__ctas">
          <a className="btn btn--accent" href={postHref} target="_blank" rel="noopener noreferrer">
            {COMMUNITY.post}
          </a>
          <a className="btn" href={communityHref} target="_blank" rel="noopener noreferrer">
            {COMMUNITY.join}
          </a>
        </div>
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
