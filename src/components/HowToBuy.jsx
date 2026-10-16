import Reveal from "./Reveal.jsx";
import { CONFIG, IS_LIVE, PUMPFUN_URL } from "../config.js";
import { HOW_TO_BUY, LAUNCH } from "../pov/copy.js";

// Live: the four steps. Pre-launch: where the CA will drop.
export default function HowToBuy({ reducedMotion }) {
  if (!IS_LIVE) {
    return (
      <Reveal className="section launch" id="buy" reducedMotion={reducedMotion} aria-labelledby="launch-h">
        <div className="launch__card">
          <h2 id="launch-h" className="section__h">
            {LAUNCH.heading}
          </h2>
          <p className="launch__body">{LAUNCH.body}</p>
          <a className="btn btn--accent" href={CONFIG.X_URL} target="_blank" rel="noopener noreferrer">
            {LAUNCH.cta}
          </a>
        </div>
      </Reveal>
    );
  }
  const ca = CONFIG.CA.trim();
  return (
    <Reveal className="section" id="buy" reducedMotion={reducedMotion} aria-labelledby="buy-h">
      <h2 id="buy-h" className="section__h">
        {HOW_TO_BUY.heading}
      </h2>
      <ol className="steps">
        {HOW_TO_BUY.steps.map((s, i) => (
          <li className="step" key={s.title}>
            <span className="step__n">{i + 1}</span>
            <h3 className="step__title">
              {s.link ? (
                <a href={PUMPFUN_URL(ca)} target="_blank" rel="noopener noreferrer">
                  {s.title}
                </a>
              ) : (
                s.title
              )}
            </h3>
            <p className="step__body">{s.body}</p>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
