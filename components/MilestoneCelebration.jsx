"use client";

import { useEffect, useRef } from "react";
import { claimMilestone } from "@/lib/milestones";

export default function MilestoneCelebration({ milestone, onClose }) {
  const claimedRef = useRef(false);

  useEffect(() => {
    if (!milestone || claimedRef.current) return;
    claimedRef.current = true;
    claimMilestone(milestone.day);
  }, [milestone]);

  if (!milestone) return null;

  return (
    <div className="fixed inset-0 z-[70] glass-effect flex items-center justify-center p-4 animate-fadeIn">
      <div
        className="glass-card w-full max-w-md rounded-3xl border border-purple-300/35 bg-gradient-to-br from-purple-300/15 to-teal-300/15 p-6 text-center animate-modalSlideUp"
        data-active="true"
      >
        <p className="text-7xl">{milestone.emoji}</p>
        <h2 className="mt-3 text-3xl font-bold text-zinc-100">{milestone.title}</h2>
        <p className="mt-3 text-sm text-zinc-300">{milestone.message}</p>
        <p className="mt-4 text-3xl font-bold text-teal-300">+{milestone.xpBonus} XP</p>
        <button
          type="button"
          onClick={onClose}
          className="glass-card mt-6 min-h-11 w-full rounded-xl px-4 text-sm font-semibold text-zinc-100"
        >
          Keep Going
        </button>
      </div>
    </div>
  );
}
