import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Marquee from "./components/Marquee.jsx";
import Hero from "./components/Hero/Hero.jsx";
import Concept from "./components/Concept.jsx";
import Token from "./components/Token.jsx";
import HowToBuy from "./components/HowToBuy.jsx";
import ContractAddress from "./components/ContractAddress.jsx";
import Footer from "./components/Footer.jsx";
import { useLiveSignals } from "./pov/useLiveSignals.js";
import { timeSignals } from "./pov/readSignals.js";
import { composeView } from "./pov/composeView.js";

const FLIP_MS = 1400;

export default function App({ base }) {
  const live = useLiveSignals();
  const [flipped, setFlipped] = useState(false);
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

  const view = useMemo(() => composeView(signals), [signals]);

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
        <Marquee />
        <Hero view={view} signals={signals} onFlip={onFlip} />
        <main>
          <Concept view={view} />
          <Token reducedMotion={view.reducedMotion} />
          <HowToBuy reducedMotion={view.reducedMotion} />
          <ContractAddress reducedMotion={view.reducedMotion} />
        </main>
        <Footer />
      </div>
    </>
  );
}
