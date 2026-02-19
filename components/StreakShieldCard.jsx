"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function readTasks() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem("streakman_tasks");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function todayKey() {
  return new Date().toDateString();
}

function readTokens() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("streakman_freeze_tokens") || "0", 10);
}

export default function StreakShieldCard() {
  const [tasks, setTasks] = useState(() => readTasks());
  const [freezeTokens, setFreezeTokens] = useState(() => readTokens());
  const [hour, setHour] = useState(() => new Date().getHours());
  const [usedToday, setUsedToday] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("streakman_shield_used") === todayKey();
  });
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      setTasks(readTasks());
      setFreezeTokens(readTokens());
      setHour(new Date().getHours());
      setUsedToday(localStorage.getItem("streakman_shield_used") === todayKey());
    };

    const onTasks = () => refresh();
    const onTokens = () => refresh();
    const timer = window.setInterval(() => refresh(), 60000);

    window.addEventListener("tasksUpdated", onTasks);
    window.addEventListener("tokensUpdated", onTokens);
    return () => {
      window.removeEventListener("tasksUpdated", onTasks);
      window.removeEventListener("tokensUpdated", onTokens);
      window.clearInterval(timer);
    };
  }, []);

  const bestStreak = useMemo(
    () => Math.max(...tasks.map((task) => Number(task?.bestStreak || 0)), 0),
    [tasks]
  );
  const longestActiveStreak = useMemo(
    () => Math.max(...tasks.map((task) => Number(task?.streak || 0)), 0),
    [tasks]
  );
  const hasIncomplete = tasks.some((task) => !task.completedToday);
  const riskWindow = bestStreak >= 3 && hour >= 20 && hasIncomplete;
  const showProtected = riskWindow && usedToday;
  const showAtRisk = riskWindow && !usedToday && freezeTokens >= 1;

  if (!showAtRisk && !showProtected) return null;

  const useToken = () => {
    if (!showAtRisk || freezeTokens < 1) return;
    const nextTokens = Math.max(0, freezeTokens - 1);
    localStorage.setItem("streakman_freeze_tokens", String(nextTokens));
    localStorage.setItem("streakman_shield_used", todayKey());
    setFreezeTokens(nextTokens);
    setUsedToday(true);
    window.dispatchEvent(new Event("tokensUpdated"));
  };

  if (showProtected) {
    return (
      <div className="mb-5 rounded-3xl bg-gradient-to-r from-emerald-300/60 to-teal-300/50 p-[1px]">
        <section className="glass-card rounded-3xl p-5" data-active="true">
          <h3 className="text-lg font-semibold text-emerald-300">🛡️ Streak Protected</h3>
          <p className="mt-2 text-sm text-zinc-300">Your streak is safe today</p>
        </section>
      </div>
    );
  }

  return (
    <div className="mb-5 rounded-3xl bg-gradient-to-r from-rose-300/50 to-amber-300/55 p-[1px]">
      <section className="glass-card rounded-3xl p-5" data-active="true">
        <h3 className="text-lg font-semibold text-rose-300">🔥 Streak at Risk</h3>
        <p className="mt-2 text-sm text-zinc-300">Longest active streak: {longestActiveStreak} days</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push("/tasks")}
            className="glass-card min-h-11 rounded-xl bg-teal-300/15 px-4 text-sm font-semibold text-zinc-100"
          >
            Complete a Task
          </button>
          <button
            type="button"
            onClick={useToken}
            className="glass-card min-h-11 rounded-xl px-4 text-sm font-semibold text-amber-200"
          >
            Use Freeze Token 💎
          </button>
        </div>
      </section>
    </div>
  );
}
