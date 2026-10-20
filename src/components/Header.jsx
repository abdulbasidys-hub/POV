import { CONFIG, IS_LIVE, PUMPFUN_URL } from "../config.js";
import { NAV } from "../pov/copy.js";

export default function Header() {
  const ctaHref = IS_LIVE ? PUMPFUN_URL(CONFIG.CA.trim()) : "#ca";
  return (
    <header className="topbar">
      <a className="logo" href="#top" aria-label={`${CONFIG.TICKER} home`}>
        <span className="logo__mark" aria-hidden="true">
          6
        </span>
        {CONFIG.TICKER}
      </a>
      <nav className="topbar__nav" aria-label="Sections">
        <a href="#concept">{NAV.about}</a>
        {IS_LIVE && <a href="#buy">{NAV.buy}</a>}
        <a href={CONFIG.X_URL} target="_blank" rel="noopener noreferrer">
          {NAV.x}
        </a>
        {CONFIG.TG_URL && (
          <a href={CONFIG.TG_URL} target="_blank" rel="noopener noreferrer">
            {NAV.tg}
          </a>
        )}
      </nav>
      <a
        className="btn btn--small btn--accent"
        href={ctaHref}
        {...(IS_LIVE ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {IS_LIVE ? NAV.ctaLive : NAV.ctaSoon}
      </a>
    </header>
  );
}
