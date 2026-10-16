// No WebGL: a still of the digit from above, turned to where this visitor stands,
// so it still reads as their 6, their 9, or neither. Tinted with the band's light.
export default function HeroFallback({ view }) {
  const deg = view ? (view.camera.azimuth * 180) / Math.PI + (view.flipped ? 180 : 0) : 0;
  return (
    <div className="hero-fallback" aria-hidden="true">
      <img
        src="/fallback-hero.png"
        alt=""
        width="1000"
        height="1000"
        decoding="async"
        style={{ transform: `translate(-50%, -50%) rotate(${deg.toFixed(1)}deg)` }}
      />
    </div>
  );
}
