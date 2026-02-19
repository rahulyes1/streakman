"use client";

import { useEffect } from "react";

export default function FloatingXP({ amount, x, y, bonus = false, onDone }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDone?.();
    }, 620);

    return () => window.clearTimeout(timer);
  }, [onDone]);

  const label = amount >= 0 ? `+${amount} XP` : `${amount} XP`;

  return (
    <div
      className={`float-xp ${bonus ? "text-teal-300" : "text-zinc-100"} ${bonus ? "text-xl font-bold" : "text-sm font-semibold"}`}
      style={{ left: `${x}px`, top: `${y}px` }}
      role="status"
      aria-live="polite"
    >
      {bonus && <span className="mr-1 text-xs tracking-wide text-teal-200">BONUS</span>}
      <span>{label}</span>
    </div>
  );
}
