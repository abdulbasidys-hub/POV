import { CONFIG, IS_LIVE, PUMPFUN_URL } from "../config.js";
import { FOOTER } from "../pov/copy.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__mark">{CONFIG.TICKER}</div>
      <nav className="footer__links" aria-label="Links">
        <a href={CONFIG.X_URL} target="_blank" rel="noopener noreferrer">
          {FOOTER.x}
        </a>
        {CONFIG.TG_URL && (
          <a href={CONFIG.TG_URL} target="_blank" rel="noopener noreferrer">
            {FOOTER.tg}
          </a>
        )}
        {IS_LIVE && (
          <a href={PUMPFUN_URL(CONFIG.CA.trim())} target="_blank" rel="noopener noreferrer">
            {FOOTER.pumpfun}
          </a>
        )}
      </nav>
      <p className="footer__disclaimer">{FOOTER.disclaimer}</p>
    </footer>
  );
}
