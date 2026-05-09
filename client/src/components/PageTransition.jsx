import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Fades the page in on route change. Re-keys via the location pathname so
 * React unmounts the old route and the new one starts from opacity-0.
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  // Reset scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="animate-fadeIn">
      {children}
    </div>
  );
}
