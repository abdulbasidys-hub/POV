import { useRef } from "react";
import Scene from "./Scene.jsx";
import TiltToggle from "../TiltToggle.jsx";
import Crossfade from "../Crossfade.jsx";
import { CONFIG, IS_LIVE, PUMPFUN_URL } from "../../config.js";
import { HERO } from "../../pov/copy.js";

const SWIPE_PX = 50;

export default function Hero({ view, signals, onFlip, sceneRef, onSwipe }) {
  const mobile = signals.device !== "desktop";
  const { copy, meme } = view;
  const touch = useRef(null);

  // Testing only: swipe the scene left/right to change meme.
  const swipe = onSwipe
    ? {
        onTouchStart: (e) => {
          const t = e.touches[0];
          touch.current = { x: t.clientX, y: t.clientY };
        },
        onTouchEnd: (e) => {
          const s = touch.current;
          touch.current = null;
          if (!s) return;
          const t = e.changedTouches[0];
          const dx = t.clientX - s.x;
          if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(t.clientY - s.y)) onSwipe(dx < 0 ? 1 : -1);
        },
      }
    : {};

  const label = `${meme.name}: a drawing on the ground. One guy yells "${meme.guys.front}", the other yells "${meme.guys.back}". You say "${copy.you}"`;

  return (
    <section className="hero" id="top">
      <div className="hero__copy">
        <p className="sticker sticker--greet">{copy.greeting}</p>
        <Crossfade className="hero__band" text={copy.bandLine} reducedMotion={view.reducedMotion} />
        <h1 className="hero__title" key={meme.id}>
          {meme.question}
        </h1>
        <p className="hero__sub">{HERO.sub}</p>
        <div className="hero__body">
          <p>{meme.tagline}</p>
          {HERO.body.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </div>
        <div className="hero__ctas">
          <a className="btn btn--accent" href="#pov">
            {HERO.toStage}
          </a>
          <a
            className="btn"
            href={IS_LIVE ? PUMPFUN_URL(CONFIG.CA.trim()) : CONFIG.X_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {IS_LIVE ? HERO.buy : HERO.follow}
          </a>
        </div>
      </div>

      <div className="hero__art">
        <div className="scene-card" {...swipe}>
          <Scene view={view} svgRef={sceneRef} label={label} />
        </div>
        {mobile && <TiltToggle onFlip={onFlip} />}
      </div>
    </section>
  );
}
