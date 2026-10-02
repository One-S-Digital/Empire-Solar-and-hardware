"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Reveal.module.css";

/** Once-only entrance when the block scrolls into view (Overhaul Plan, section 4). */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  // "idle" renders visible (server and no-JS); "armed" hides it just before it is observed
  const [state, setState] = useState<"idle" | "armed" | "in">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) return; // already on screen: no flash of hidden content
    setState("armed");
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setState("in");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = state === "armed" ? styles.armed : state === "in" ? styles.in : "";
  return (
    <div ref={ref} className={[cls, className].join(" ").trim()}>
      {children}
    </div>
  );
}
