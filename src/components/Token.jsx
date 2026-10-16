import Reveal from "./Reveal.jsx";
import { TOKEN } from "../pov/copy.js";

export default function Token({ reducedMotion }) {
  return (
    <Reveal className="section token" reducedMotion={reducedMotion} aria-labelledby="token-h">
      <h2 id="token-h" className="section__h">
        {TOKEN.heading}
      </h2>
      <ul className="facts">
        {TOKEN.facts.map((f, i) => (
          <li className={`fact fact--${i}`} key={f.big}>
            <span className="fact__big">{f.big}</span>
            <span className="fact__small">{f.small}</span>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
