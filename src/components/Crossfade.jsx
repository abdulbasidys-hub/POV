import { useEffect, useRef, useState } from "react";

// Swaps text with a slow fade: out, swap, in (900ms total).
export default function Crossfade({ text, as: Tag = "p", className = "", duration = 900, reducedMotion, ...rest }) {
  const [shown, setShown] = useState(text);
  const [visible, setVisible] = useState(Boolean(text));
  const timer = useRef(0);

  useEffect(() => {
    if (text === shown) {
      setVisible(Boolean(text));
      return undefined;
    }
    if (reducedMotion) {
      setShown(text);
      setVisible(Boolean(text));
      return undefined;
    }
    setVisible(false);
    timer.current = window.setTimeout(() => {
      setShown(text);
      setVisible(Boolean(text));
    }, shown ? duration / 2 : 0);
    return () => clearTimeout(timer.current);
  }, [text]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Tag
      className={`${className} ${visible ? "is-shown" : ""}`}
      style={{ transition: `opacity ${duration / 2}ms var(--ease)`, opacity: visible ? undefined : 0 }}
      aria-live="polite"
      {...rest}
    >
      {shown || " "}
    </Tag>
  );
}
