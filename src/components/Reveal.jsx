import { useEffect, useRef, useState } from "react";

// Slow fade-and-rise on scroll entry. Instant for reduced motion.
export default function Reveal({ as: Tag = "section", className = "", reducedMotion, children, ...rest }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(Boolean(reducedMotion));

  useEffect(() => {
    if (reducedMotion) {
      setInView(true);
      return undefined;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion]);

  return (
    <Tag ref={ref} className={`${className} reveal-on-scroll ${inView ? "is-in" : ""}`} {...rest}>
      {children}
    </Tag>
  );
}
