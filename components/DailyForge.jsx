"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FloatingXP from "@/components/FloatingXP";
import { addXP } from "@/lib/xpSystem";
import {
  FORGE_TIERS,
  getForgeReward,
  getTodayForgeTier,
  getYesterdayForgeStats,
  isForgeAvailable,
  markForgeUsed,
} from "@/lib/dailyForge";
import { forgeComplete } from "@/lib/haptics";

const HOLD_DURATION_MS = 1500;

function readTasks() {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem("streakman_tasks");
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getTimeUntilMidnight() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const ms = Math.max(0, next.getTime() - now.getTime());
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function canVibrate() {
  return typeof window !== "undefined" && typeof navigator !== "undefined" && "vibrate" in navigator;
}

export default function DailyForge() {
  const [tier, setTier] = useState(() => getTodayForgeTier(readTasks()));
  const [available, setAvailable] = useState(() => isForgeAvailable());
  const [stats, setStats] = useState(() => getYesterdayForgeStats(readTasks()));
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reward, setReward] = useState(null);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(getTimeUntilMidnight);
  const [floatXp, setFloatXp] = useState(null);
  const [holdOrigin, setHoldOrigin] = useState({ x: 0, y: 0 });

  const rafRef = useRef(0);
  const pulseTimerRef = useRef(0);
  const completedRef = useRef(false);

  const tierConfig = FORGE_TIERS[tier] || FORGE_TIERS.none;
  const hasNoForge = tier === "none";

  const refresh = () => {
    const nextTasks = readTasks();
    setTier(getTodayForgeTier(nextTasks));
    setStats(getYesterdayForgeStats(nextTasks));
    setAvailable(isForgeAvailable());
  };

  useEffect(() => {
    const onTasksUpdated = () => refresh();
    const midnightTimer = window.setInterval(() => {
      setTimeUntilMidnight(getTimeUntilMidnight());
      setAvailable(isForgeAvailable());
    }, 1000);

    window.addEventListener("tasksUpdated", onTasksUpdated);
    return () => {
      window.removeEventListener("tasksUpdated", onTasksUpdated);
      window.clearInterval(midnightTimer);
    };
  }, []);

  const stopHold = () => {
    if (rafRef.current) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (pulseTimerRef.current) {
      window.clearInterval(pulseTimerRef.current);
      pulseTimerRef.current = 0;
    }
  };

  const completeForge = (origin) => {
    const result = getForgeReward(tier);

    markForgeUsed();
    setAvailable(false);
    setHolding(false);
    setProgress(100);
    setReward(result);

    if (result.xp > 0) {
      addXP(result.xp, "forge");
      setFloatXp({
        id: `${Date.now()}-${Math.random()}`,
        amount: result.xp,
        x: origin.x,
        y: origin.y,
      });
    }

    if (result.bonusToken) {
      const current = parseInt(localStorage.getItem("streakman_freeze_tokens") || "0", 10);
      localStorage.setItem("streakman_freeze_tokens", String(current + 1));
      window.dispatchEvent(new Event("tokensUpdated"));
    }

    forgeComplete();

    window.setTimeout(() => setProgress(0), 180);
  };

  const beginHold = (event) => {
    if (!available || hasNoForge || holding) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    setHoldOrigin(origin);
    setReward(null);
    setHolding(true);
    setProgress(0);
    completedRef.current = false;

    const start = performance.now();

    if (canVibrate()) {
      navigator.vibrate(15);
      pulseTimerRef.current = window.setInterval(() => {
        navigator.vibrate(10);
      }, 250);
    }

    const tick = (timestamp) => {
      const elapsed = timestamp - start;
      const ratio = Math.min(1, elapsed / HOLD_DURATION_MS);
      setProgress(Math.round(ratio * 100));

      if (ratio >= 1) {
        completedRef.current = true;
        stopHold();
        completeForge(origin);
        return;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
  };

  const cancelHold = () => {
    if (!holding) return;
    stopHold();
    if (!completedRef.current) {
      setHolding(false);
      setProgress(0);
    }
  };

  const statusText = useMemo(() => {
    if (!available) return `Come back tomorrow (${timeUntilMidnight})`;
    if (hasNoForge) return "Complete tasks today to unlock tomorrow's forge";
    return "Press and hold to forge your reward";
  }, [available, hasNoForge, timeUntilMidnight]);

  return (
    <section className="glass-card rounded-3xl p-5" data-active="true">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Daily Forge</p>
          <h3 className="mt-1 text-xl font-semibold text-zinc-100">
            {tierConfig.emoji ? (
              <span className="emoji-premium emoji-premium-icon emoji-premium-teal mr-1">
                {tierConfig.emoji}
              </span>
            ) : null}
            {tierConfig.label}
          </h3>
        </div>
        <div className="rounded-full bg-white/[0.04] px-3 py-1 text-xs text-zinc-300">
          Yesterday: {stats.completed}/{stats.total} ({stats.percentage}%)
        </div>
      </div>

      <p className="mb-4 text-sm text-zinc-400">{statusText}</p>

      <button
        type="button"
        onMouseDown={beginHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={beginHold}
        onTouchEnd={cancelHold}
        disabled={!available || hasNoForge}
        className={`relative min-h-11 w-full overflow-hidden rounded-2xl border px-4 py-3 text-sm font-semibold transition-spring ${
          !available || hasNoForge
            ? "cursor-not-allowed border-white/10 bg-white/[0.03] text-zinc-500"
            : "border-teal-300/40 bg-teal-300/10 text-zinc-100"
        }`}
      >
        <span
          className="absolute inset-y-0 left-0 bg-teal-300/20 transition-[width] duration-75"
          style={{ width: `${progress}%` }}
        />
        <span className="relative z-10">
          {holding ? `Forging... ${progress}%` : available && !hasNoForge ? "Hold 1.5s to Forge" : "Unavailable"}
        </span>
      </button>

      {reward && (
        <div className="mt-4 rounded-2xl border border-teal-300/35 bg-gradient-to-r from-teal-300/10 to-purple-300/10 p-4 text-center animate-scaleIn">
          <p className="text-sm text-zinc-400">Forge Reward</p>
          <p className="mt-1 text-3xl font-bold text-teal-300">+{reward.xp} XP</p>
          {reward.bonusMessage && <p className="mt-2 text-sm text-amber-300">{reward.bonusMessage}</p>}
        </div>
      )}

      {floatXp && (
        <FloatingXP
          amount={floatXp.amount}
          x={holdOrigin.x || floatXp.x}
          y={holdOrigin.y || floatXp.y}
          bonus={true}
          onDone={() => setFloatXp(null)}
        />
      )}
    </section>
  );
}
