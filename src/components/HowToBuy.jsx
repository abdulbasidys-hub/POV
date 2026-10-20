import Reveal from "./Reveal.jsx";
import { CONFIG, IS_LIVE, PUMPFUN_URL } from "../config.js";
import { HOW_TO_BUY } from "../pov/copy.js";

// The four steps, once the CA is set.
export default function HowToBuy({ reducedMotion }) {
  if (!IS_LIVE) return null;
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
