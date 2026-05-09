import React, { useEffect, useRef, useState } from "react";

/**
 * Wraps children and reveals them with a fade + slide-up animation
 * the first time they enter the viewport.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
  threshold = 0.15,
  rootMargin = "0px 0px -50px 0px",
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      setVisible(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const Tag = as;
  return (
    <Tag
      ref={ref}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={`transition-[opacity,transform] duration-700 ease-out will-change-[opacity,transform] ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </Tag>
  );
}
