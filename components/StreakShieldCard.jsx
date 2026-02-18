"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

function readTokens() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("streakman_freeze_tokens") || "0", 10);
}

function todayString() {
  return new Date().toDateString();
}

function buildShieldState() {
  if (typeof window === "undefined") {
    return {
      tasks: [],
      freezeTokens: 0,
      hour: 0,
      protectedToday: false,
    };
  }

  return {
    tasks: readTasks(),
    freezeTokens: readTokens(),
    hour: new Date().getHours(),
    protectedToday: localStorage.getItem("streakman_shield_used") === todayString(),
  };
}

export default function StreakShieldCard() {
  const [shieldState, setShieldState] = useState(buildShieldState);
  const router = useRouter();

  const refresh = () => {
    setShieldState(buildShieldState());
  };

  useEffect(() => {
    const handleTasks = () => refresh();
    const handleTokens = () => refresh();
    const bootstrapTimer = window.setTimeout(refresh, 0);

    window.addEventListener("tasksUpdated", handleTasks);
    window.addEventListener("tokensUpdated", handleTokens);

    const timer = window.setInterval(() => {
      refresh();
    }, 60000);

    return () => {
      window.removeEventListener("tasksUpdated", handleTasks);
      window.removeEventListener("tokensUpdated", handleTokens);
      window.clearTimeout(bootstrapTimer);
      window.clearInterval(timer);
    };
  }, []);

  const tasks = shieldState.tasks;
  const freezeTokens = shieldState.freezeTokens;
  const hour = shieldState.hour;
  const protectedToday = shieldState.protectedToday;
  const longestStreak = useMemo(() => Math.max(...tasks.map((task) => task.streak || 0), 0), [tasks]);
  const hasIncompleteTask = tasks.some((task) => !task.completedToday);
  const baseRiskWindow = longestStreak >= 3 && hour >= 20 && hasIncompleteTask;
  const showProtected = baseRiskWindow && protectedToday;
  const showAtRisk = baseRiskWindow && !protectedToday && freezeTokens >= 1;

  if (!showAtRisk && !showProtected) return null;

  const handleUseToken = () => {
    if (!showAtRisk || freezeTokens < 1) return;

    const nextTokens = Math.max(0, freezeTokens - 1);
    localStorage.setItem("streakman_freeze_tokens", String(nextTokens));
    localStorage.setItem("streakman_shield_used", todayString());

    setShieldState((current) => ({
      ...current,
      freezeTokens: nextTokens,
      protectedToday: true,
    }));

    window.dispatchEvent(new Event("tokensUpdated"));
  };

  if (showProtected) {
    return (
      <section className="glass-card mb-6 rounded-3xl border border-emerald-300/45 bg-gradient-to-r from-emerald-300/15 to-teal-300/15 p-5" data-active="true">
        <h3 className="text-lg font-semibold text-emerald-300">{"\u{1F6E1}\uFE0F"} Streak Protected</h3>
        <p className="mt-2 text-sm text-zinc-300">Your streak is safe for today.</p>
      </section>
    );
  }

  return (
    <section className="glass-card mb-6 rounded-3xl border border-rose-300/40 bg-gradient-to-r from-rose-300/12 to-amber-300/12 p-5" data-active="true">
      <h3 className="text-lg font-semibold text-rose-300">{"\u{1F525}"} Streak at Risk</h3>
      <p className="mt-1 text-sm text-zinc-300">Longest active streak: {longestStreak} days</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => router.push("/tasks")}
          className="glass-card min-h-11 rounded-xl px-4 text-sm font-semibold text-zinc-100"
        >
          Complete a Task
        </button>
        <button
          type="button"
          onClick={handleUseToken}
          className="glass-card min-h-11 rounded-xl border border-amber-300/35 px-4 text-sm font-semibold text-amber-200"
        >
          Use Freeze Token {"\u{1F48E}"}
        </button>
      </div>
    </section>
  );
}
