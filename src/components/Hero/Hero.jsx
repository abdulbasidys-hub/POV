import { Component, Suspense, lazy, useCallback, useState } from "react";
import HeroFallback from "./HeroFallback.jsx";
import TiltToggle from "../TiltToggle.jsx";
import Crossfade from "../Crossfade.jsx";
import { CONFIG } from "../../config.js";

const HeroScene = lazy(() => import("./HeroScene.jsx"));

class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <HeroFallback view={this.props.view} /> : this.props.children;
  }
}

export default function Hero({ view, signals, canvasRef, onFlip }) {
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const mobile = signals.device !== "desktop";

  return (
    <header className="hero">
      <div className={`hero__stage ${ready ? "is-ready" : ""}`}>
        {signals.webgl ? (
          <SceneBoundary view={view}>
            <Suspense fallback={null}>
              <HeroScene view={view} isPhone={signals.device === "phone"} canvasRef={canvasRef} onReady={onReady} />
            </Suspense>
          </SceneBoundary>
        ) : (
          <HeroFallback view={view} />
        )}
      </div>
      <div className="hero__scrim" aria-hidden="true" />

      <div className="hero__mark">
        {CONFIG.NAME}
        <span>{CONFIG.TICKER}</span>
      </div>
      {mobile && <TiltToggle onFlip={onFlip} />}

      <div className="hero__overlay">
        <p className="hero__greeting">{view.copy.greeting}</p>
        <Crossfade as="h1" className="hero__headline" text={view.copy.headline} reducedMotion={view.reducedMotion} />
        {view.copy.returning && <p className="hero__returning">{view.copy.returning}</p>}
      </div>
    </header>
  );
}
