import Reveal from "./Reveal.jsx";
import Crossfade from "./Crossfade.jsx";
import { CONCEPT } from "../pov/copy.js";

export default function Concept({ view }) {
  return (
    <Reveal className="section concept" reducedMotion={view.reducedMotion} aria-label="Concept">
      <h2 className="concept__q">{CONCEPT.line1}</h2>
      <p className="concept__tag">{CONCEPT.line2}</p>
      <Crossfade className="concept__pace" text={view.copy.pace} reducedMotion={view.reducedMotion} />
      <p className="concept__last">{CONCEPT.line4}</p>
    </Reveal>
  );
}
