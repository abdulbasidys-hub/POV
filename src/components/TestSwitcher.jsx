import { useEffect } from "react";
import { TESTER } from "../pov/copy.js";

// TESTING ONLY (CONFIG.TEST_SWITCHER). Flip between memes and sides.
export default function TestSwitcher({ name, index, count, side, onStep, onSwapSide }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") onStep(1);
      else if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStep]);

  return (
    <div className="tester" role="group" aria-label="Meme tester">
      <span className="tester__tag">{TESTER.label}</span>
      <button type="button" className="tester__btn" onClick={() => onStep(-1)} aria-label={TESTER.prev}>
        ◀
      </button>
      <span className="tester__name">
        {name}
        <span className="tester__count">
          {index + 1}/{count} · {side}
        </span>
      </span>
      <button type="button" className="tester__btn" onClick={() => onStep(1)} aria-label={TESTER.next}>
        ▶
      </button>
      <button type="button" className="tester__side" onClick={onSwapSide}>
        {TESTER.side}
      </button>
      <span className="tester__hint">{TESTER.hint}</span>
    </div>
  );
}
