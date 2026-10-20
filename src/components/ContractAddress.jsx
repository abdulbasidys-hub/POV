import { useEffect, useRef, useState } from "react";
import Reveal from "./Reveal.jsx";
import { CONFIG, IS_LIVE } from "../config.js";
import { CONTRACT } from "../pov/copy.js";

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export default function ContractAddress({ reducedMotion }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Always shown. Until CONFIG.CA is filled in it says "coming soon".
  const ca = IS_LIVE ? CONFIG.CA.trim() : "";

  const onCopy = async () => {
    if (!ca) return;
    if (await copyText(ca)) {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Reveal className="section" id="ca" reducedMotion={reducedMotion} aria-labelledby="ca-h">
      <h2 id="ca-h" className="section__h">
        {CONTRACT.heading}
      </h2>
      <div className="ca">
        <code className={`ca__value ${ca ? "" : "is-pending"}`}>{ca || CONTRACT.pending}</code>
        <button type="button" className="btn btn--accent" onClick={onCopy} disabled={!ca} aria-live="polite">
          {copied ? CONTRACT.copied : CONTRACT.copy}
        </button>
      </div>
    </Reveal>
  );
}
