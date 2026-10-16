import Reveal from "./Reveal.jsx";
import Crossfade from "./Crossfade.jsx";
import { CONCEPT } from "../pov/copy.js";

export default function Concept({ view }) {
  return (
    <Reveal className="section concept" id="concept" reducedMotion={view.reducedMotion} aria-label="6 or 9?">
      <h2 className="concept__q">{CONCEPT.line1}</h2>
      <p className="concept__tag">{CONCEPT.line2}</p>
      <div className="concept__body">
        {CONCEPT.body.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </div>
      <Crossfade className="concept__pace" text={view.copy.pace} reducedMotion={view.reducedMotion} />
    </Reveal>
  );
}
