"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkMissionProgress, getDailyMission } from "@/lib/dailyMission";

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

export default function DailyMissionCard() {
  const [mission, setMission] = useState(() => getDailyMission(readTasks()));
  const router = useRouter();

  const refreshMission = () => {
    const tasks = readTasks();
    const result = checkMissionProgress(tasks);
    setMission(result.mission);
  };

  useEffect(() => {
    const onTasks = () => refreshMission();
    window.addEventListener("tasksUpdated", onTasks);
    return () => window.removeEventListener("tasksUpdated", onTasks);
  }, []);

  if (!mission) return null;

  const progress = Number(mission.progress || 0);
  const target = Math.max(1, Number(mission.target || 1));
  const percentage = Math.min(100, Math.round((progress / target) * 100));
  const completed = Boolean(mission.completed);

  return (
    <div
      className={`mb-5 rounded-3xl p-[1px] ${
        completed
          ? "bg-gradient-to-r from-emerald-300/60 to-teal-300/50"
          : "bg-gradient-to-r from-teal-300/45 to-amber-300/45"
      }`}
    >
      <section className="glass-card rounded-3xl p-5" data-active="true">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-300">
            <span className="emoji-premium emoji-premium-inline emoji-premium-teal mr-1">⚡</span>
            Daily Mission
          </h3>
          <span className="glass-card rounded-full px-3 py-1 text-xs font-semibold text-teal-200">
            +{mission.xpReward} XP
          </span>
        </div>

        <p className="text-base font-semibold text-zinc-100">{mission.title}</p>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
            <span>Progress</span>
            <span>
              {progress} / {target}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className={`h-full rounded-full transition-spring ${
                completed ? "bg-emerald-300" : "bg-gradient-to-r from-teal-300 to-amber-300"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {completed ? (
            <p className="text-sm font-semibold text-emerald-300">
              <span className="emoji-premium emoji-premium-inline emoji-premium-teal mr-1">✅</span>
              Mission Complete
            </p>
          ) : (
            <p className="text-sm text-zinc-400">Keep momentum to finish this mission.</p>
          )}
          <button
            type="button"
            onClick={() => router.push("/tasks")}
            className="glass-card min-h-11 rounded-xl px-4 text-sm font-semibold text-zinc-100"
          >
            Go
          </button>
        </div>
      </section>
    </div>
  );
}
