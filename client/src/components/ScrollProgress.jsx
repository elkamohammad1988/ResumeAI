import React, { useEffect, useState } from "react";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      const pct = (h.scrollTop / total) * 100;
      setProgress(Math.min(100, Math.max(0, pct)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 h-0.5 bg-transparent pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#00d96f] transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(0,217,111,0.6)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
