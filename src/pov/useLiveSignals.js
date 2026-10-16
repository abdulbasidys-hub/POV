import { useEffect, useState } from "react";
import { readOrientation } from "./readSignals.js";

const PACE_WINDOW_MS = 6000;
const RUSHER_PX_PER_S = 1200;
const IDLE_MS = 8000;
const GAP_MS = 160; // pauses longer than this don't count as "scrolling time"

// Live signals: clock (60s), orientation, pace, idle.
export function useLiveSignals() {
  const [now, setNow] = useState(() => new Date());
  const [orientation, setOrientation] = useState(readOrientation);
  const [pace, setPace] = useState("undecided");
  const [idle, setIdle] = useState(false);

  // Clock: the sun moves, so recompute every 60s.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Orientation
  useEffect(() => {
    let mql;
    try {
      mql = window.matchMedia("(orientation: portrait)");
    } catch {
      return undefined;
    }
    const onChange = () => setOrientation(mql.matches ? "portrait" : "landscape");
    mql.addEventListener ? mql.addEventListener("change", onChange) : mql.addListener(onChange);
    return () => {
      mql.removeEventListener ? mql.removeEventListener("change", onChange) : mql.removeListener(onChange);
    };
  }, []);

  // Pace: average scroll speed while actually scrolling, over the first 6s of scrolling.
  useEffect(() => {
    let start = 0;
    let lastT = 0;
    let lastY = window.scrollY;
    let dist = 0;
    let active = 0;
    let timer = 0;
    let done = false;

    const decide = () => {
      if (done) return;
      done = true;
      const speed = active > 0 ? (dist / active) * 1000 : 0;
      setPace(speed > RUSHER_PX_PER_S ? "rusher" : "reader");
      window.removeEventListener("scroll", onScroll, true);
    };

    // Capture phase also catches the page's own scroller in tilt mode.
    const onScroll = (e) => {
      const t = performance.now();
      const y = e && e.target && e.target.nodeType === 1 ? e.target.scrollTop : window.scrollY;
      if (!start) {
        start = t;
        lastT = t;
        lastY = y;
        timer = window.setTimeout(decide, PACE_WINDOW_MS);
        return;
      }
      const dt = t - lastT;
      if (dt > 0 && dt <= GAP_MS) {
        dist += Math.abs(y - lastY);
        active += dt;
      }
      lastT = t;
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      clearTimeout(timer);
    };
  }, []);

  // Idle: no scroll, pointer, touch or key for 8s.
  useEffect(() => {
    let timer = 0;
    let isIdle = false;
    const wake = () => {
      if (isIdle) {
        isIdle = false;
        setIdle(false);
      }
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        isIdle = true;
        setIdle(true);
      }, IDLE_MS);
    };
    const events = ["scroll", "pointermove", "pointerdown", "touchstart", "keydown", "wheel"];
    events.forEach((e) => window.addEventListener(e, wake, { passive: true, capture: true }));
    wake();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, wake, true));
    };
  }, []);

  return { now, orientation, pace, idle };
}
