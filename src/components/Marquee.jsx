import { MARQUEE } from "../pov/copy.js";

// Scrolling ticker strip. Static when motion is reduced.
export default function Marquee({ question }) {
  const one = [question, ...MARQUEE];
  const run = [...one, ...one];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((n) => (
          <span className="marquee__run" key={n}>
            {run.map((t, i) => (
              <span key={i}>
                {t}
                <span className="marquee__star">✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
