import { useEffect, useRef, useState } from "react";
import { TILT } from "../pov/copy.js";

const STABLE_MS = 400;

// Opt-in only. Never asks for anything until the visitor taps it.
export default function TiltToggle({ onFlip }) {
  const [on, setOn] = useState(false);
  const pending = useRef({ value: false, since: 0, committed: false });

  useEffect(() => {
    if (!on) return undefined;
    let timer = 0;
    const handle = (e) => {
      if (e.beta == null) return;
      const upside = e.beta < -120 || e.beta > 120;
      const p = pending.current;
      if (upside !== p.value) {
        p.value = upside;
        clearTimeout(timer);
        timer = window.setTimeout(() => {
          if (p.value !== p.committed) {
            p.committed = p.value;
            onFlip(p.value);
          }
        }, STABLE_MS);
      }
    };
    window.addEventListener("deviceorientation", handle);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("deviceorientation", handle);
    };
  }, [on, onFlip]);

  const toggle = async () => {
    if (on) {
      setOn(false);
      pending.current = { value: false, since: 0, committed: false };
      onFlip(false);
      return;
    }
    try {
      const DOE = window.DeviceOrientationEvent;
      if (DOE && typeof DOE.requestPermission === "function") {
        const res = await DOE.requestPermission();
        if (res !== "granted") return;
      }
    } catch {
      return;
    }
    setOn(true);
  };

  return (
    <button type="button" className="tilt-toggle" aria-pressed={on} onClick={toggle}>
      {on ? TILT.on : TILT.off}
      {on && <span className="tilt-toggle__hint">{TILT.hint}</span>}
    </button>
  );
}
