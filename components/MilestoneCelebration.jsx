"use client";

import { useEffect, useRef } from "react";
import { claimMilestone } from "@/lib/milestones";

export default function MilestoneCelebration({ milestone, onClose }) {
  const hasAppliedReward = useRef(false);

  useEffect(() => {
    if (!milestone || hasAppliedReward.current) return;

    hasAppliedReward.current = true;

    const currentXP = parseInt(localStorage.getItem("streakman_xp") || "0", 10);
    localStorage.setItem("streakman_xp", String(currentXP + milestone.xpBonus));

    claimMilestone(milestone.day);
    window.dispatchEvent(new Event("xpUpdated"));
  }, [milestone]);

  if (!milestone) return null;

  return (
    <div className="fixed inset-0 z-[70] glass-effect flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-card w-full max-w-md rounded-3xl border border-purple-300/30 bg-gradient-to-br from-purple-300/15 to-teal-300/15 p-6 text-center animate-modalSlideUp" data-active="true">
        <div className="mb-3 text-6xl animate-scaleIn">{milestone.emoji}</div>
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Streak Milestone</p>
        <h2 className="mt-2 text-2xl font-bold text-zinc-100">{milestone.title}</h2>
        <p className="mt-3 text-sm text-zinc-300">{milestone.message}</p>
        <p className="mt-4 text-lg font-semibold text-teal-200">+{milestone.xpBonus} XP</p>

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
