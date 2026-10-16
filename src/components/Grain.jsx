import { useEffect, useRef } from "react";

const FRAMES = 6;
const SIZE = 256;
const FPS = 12;

function makeFrames() {
  const urls = [];
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d");
  if (!ctx) return urls;
  const img = ctx.createImageData(SIZE, SIZE);
  for (let f = 0; f < FRAMES; f++) {
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    urls.push(c.toDataURL("image/png"));
  }
  return urls;
}

// Film grain at ~12fps plus a soft vignette. Static grain when motion is reduced.
export default function Grain({ reducedMotion }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const frames = makeFrames();
    if (!frames.length) return undefined;
    el.style.backgroundImage = `url(${frames[0]})`;
    if (reducedMotion) return undefined;

    let i = 0;
    let raf = 0;
    let last = 0;
    const tick = (t) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 1000 / FPS) return;
      last = t;
      i = (i + 1) % frames.length;
      el.style.backgroundImage = `url(${frames[i]})`;
      el.style.backgroundPosition = `${(Math.random() * SIZE) | 0}px ${(Math.random() * SIZE) | 0}px`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  return (
    <>
      <div ref={ref} className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="letterbox letterbox--top" aria-hidden="true" />
      <div className="letterbox letterbox--bottom" aria-hidden="true" />
    </>
  );
}
