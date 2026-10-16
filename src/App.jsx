import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Marquee from "./components/Marquee.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Stage from "./components/Stage.jsx";
import TestSwitcher from "./components/TestSwitcher.jsx";
import Token from "./components/Token.jsx";
import HowToBuy from "./components/HowToBuy.jsx";
import ContractAddress from "./components/ContractAddress.jsx";
import Footer from "./components/Footer.jsx";
import { useLiveSignals } from "./pov/useLiveSignals.js";
import { timeSignals } from "./pov/readSignals.js";
import { composeView } from "./pov/composeView.js";
import { MEMES, memeIndexOf } from "./pov/memes.jsx";
import { CONFIG } from "./config.js";

const FLIP_MS = 1400;

export default function App({ base }) {
  const live = useLiveSignals();
  const [flipped, setFlipped] = useState(false);
  const [memeIndex, setMemeIndex] = useState(() => memeIndexOf(CONFIG.MEME));
  const [swapSide, setSwapSide] = useState(false); // testing only
  const sceneRef = useRef(null);
  const pageRef = useRef(null);

  const signals = useMemo(
    () => ({
      ...base,
      ...timeSignals(live.now),
      orientation: live.orientation,
      pace: live.pace,
      idle: live.idle,
      flipped,
    }),
    [base, live, flipped]
  );

  const view = useMemo(() => composeView(signals, memeIndex, swapSide), [signals, memeIndex, swapSide]);

  const step = useCallback((d) => setMemeIndex((i) => (i + d + MEMES.length) % MEMES.length), []);

  // Palette + theme-color + motion flag on :root
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-band", view.band);
    root.setAttribute("data-reduced-motion", String(view.reducedMotion));
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = view.palette.bg;
  }, [view.band, view.palette.bg, view.reducedMotion]);

  // Tilt mode: turn the whole page as one piece, keeping the reader's place.
  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;
    let timer = 0;
    let raf = 0;
    if (view.flipped) {
      const y = window.scrollY;
      page.classList.add("is-flipped-layout");
      page.scrollTop = y;
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(() => page.classList.add("is-flipped"));
      });
    } else if (page.classList.contains("is-flipped-layout")) {
      page.classList.remove("is-flipped");
      const settle = () => {
        const y = page.scrollTop;
        page.classList.remove("is-flipped-layout");
        window.scrollTo(0, y);
      };
      if (view.reducedMotion) settle();
      else timer = window.setTimeout(settle, FLIP_MS);
    }
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [view.flipped, view.reducedMotion]);

  const onFlip = useCallback((v) => setFlipped(v), []);

  return (
    <>
      <div className="page" ref={pageRef}>
        <Header />
        <Marquee question={view.meme.question} />
        <Hero
          view={view}
          signals={signals}
          onFlip={onFlip}
          sceneRef={sceneRef}
          onSwipe={CONFIG.TEST_SWITCHER ? step : undefined}
        />
        <main>
          <Stage view={view} sceneRef={sceneRef} />
          <Token reducedMotion={view.reducedMotion} />
          <HowToBuy reducedMotion={view.reducedMotion} />
          <ContractAddress reducedMotion={view.reducedMotion} />
        </main>
        <Footer />
      </div>
      {CONFIG.TEST_SWITCHER && (
        <TestSwitcher
          name={view.meme.name}
          index={memeIndex}
          count={MEMES.length}
          side={view.side}
          onStep={step}
          onSwapSide={() => setSwapSide((v) => !v)}
        />
      )}
    </>
  );
}
