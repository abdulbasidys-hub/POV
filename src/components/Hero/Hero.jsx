import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Scene from "./Scene.jsx";
import TiltToggle from "../TiltToggle.jsx";
import Crossfade from "../Crossfade.jsx";
import { CONFIG, IS_LIVE, PUMPFUN_URL } from "../../config.js";
import { HERO, READING_PHRASE, SCENE } from "../../pov/copy.js";
import { shareMyView } from "../../share/makeShareCard.js";

export default function Hero({ view, signals, onFlip }) {
  const svgRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(false);
  const toastTimer = useRef(0);
  const mobile = signals.device !== "desktop";
  const { copy, reading } = view;

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (await shareMyView({ view, svg: svgRef.current })) {
        setToast(true);
        clearTimeout(toastTimer.current);
        toastTimer.current = window.setTimeout(() => setToast(false), 3200);
      }
    } finally {
      setBusy(false);
    }
  };

  const label = `A 6 painted on the ground. One guy yells "${SCENE.guyA}", the other yells "${SCENE.guyB}". From where you stand it's ${READING_PHRASE[reading]}.`;

  return (
    <section className="hero" id="top">
      <div className="hero__copy">
        <p className="sticker sticker--greet">{copy.greeting}</p>
        <Crossfade className="hero__band" text={copy.bandLine} reducedMotion={view.reducedMotion} />
        <p className="label">{HERO.label}</p>
        <h1 className="hero__title">
          {HERO.lead}{" "}
          <span className={`hero__word ${reading === "sigma" ? "is-greek" : ""}`} key={reading}>
            {copy.word}
          </span>
          .
        </h1>
        <p className="hero__meaning">{copy.meaning}</p>
        <div className="hero__ctas">
          <button type="button" className="btn btn--accent" onClick={onShare} disabled={busy}>
            {busy ? HERO.shareBusy : HERO.share}
          </button>
          <a
            className="btn"
            href={IS_LIVE ? PUMPFUN_URL(CONFIG.CA.trim()) : CONFIG.X_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {IS_LIVE ? HERO.buy : HERO.follow}
          </a>
        </div>
        {copy.returning && <p className="sticker sticker--note">{copy.returning}</p>}
        <p className="hero__fine">{HERO.fine}</p>
      </div>

      <div className="hero__art">
        <div className="scene-card">
          <Scene view={view} svgRef={svgRef} label={label} />
        </div>
        {mobile && <TiltToggle onFlip={onFlip} />}
      </div>

      {createPortal(
        <div className={`toast ${toast ? "is-shown" : ""}`} role="status" aria-hidden={!toast}>
          {HERO.toast}
        </div>,
        document.body
      )}
    </section>
  );
}
