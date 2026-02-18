"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  claimDailyMissionReward,
  getMissionProgress,
  getOrCreateDailyMission,
  updateDailyMission,
} from "@/lib/dailyMission";

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

function difficultyTone(difficulty) {
  if (difficulty === "hard") return "text-amber-300";
  if (difficulty === "medium") return "text-purple-300";
  return "text-teal-300";
}

function buildMissionState() {
  if (typeof window === "undefined") {
    return {
      mission: null,
      progress: { value: 0, target: 1, completed: false, ratio: 0 },
    };
  }

  const tasks = readTasks();
  let nextMission = getOrCreateDailyMission(tasks);
  const nextProgress = getMissionProgress(nextMission, tasks);

  if (nextProgress.completed && !nextMission.claimed) {
    nextMission = claimDailyMissionReward(nextMission);
  } else if (nextMission.completed !== nextProgress.completed) {
    nextMission = updateDailyMission({ ...nextMission, completed: nextProgress.completed });
  }

  return {
    mission: nextMission,
    progress: nextProgress,
  };
}

export default function DailyMissionCard() {
  const [missionState, setMissionState] = useState(buildMissionState);
  const router = useRouter();

  const refresh = () => {
    setMissionState(buildMissionState());
  };

  useEffect(() => {
    const handleTasks = () => refresh();
    const handleTick = () => refresh();
    const bootstrapTimer = window.setTimeout(handleTick, 0);

    window.addEventListener("tasksUpdated", handleTasks);
    const timer = window.setInterval(handleTick, 60000);

    return () => {
      window.removeEventListener("tasksUpdated", handleTasks);
      window.clearTimeout(bootstrapTimer);
      window.clearInterval(timer);
    };
  }, []);

  const mission = missionState.mission;
  const progress = missionState.progress;
  const isComplete = Boolean(mission?.claimed || progress.completed);

  const cardClass = useMemo(() => {
    if (isComplete) {
      return "glass-card mb-6 rounded-3xl border border-emerald-300/45 bg-gradient-to-r from-emerald-300/15 to-teal-300/15 p-5";
    }

    return "glass-card mb-6 rounded-3xl border border-amber-300/35 bg-gradient-to-r from-teal-300/10 to-amber-300/10 p-5";
  }, [isComplete]);

  if (!mission) return null;

  return (
    <section className={cardClass} data-active="true">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Daily Mission</p>
          <h3 className="mt-1 text-lg font-semibold text-zinc-100">{mission.title}</h3>
          <p className={`mt-1 text-xs uppercase tracking-wide ${difficultyTone(mission.difficulty)}`}>
            {mission.difficulty}
          </p>
        </div>
        <div className="glass-card rounded-full px-3 py-1 text-xs font-semibold text-teal-200">+{mission.rewardXp} XP</div>
      </div>

      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
          <span>Progress</span>
          <span>
            {progress.value}/{progress.target}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? "bg-emerald-300" : "bg-gradient-to-r from-teal-300 to-amber-300"
            }`}
            style={{ width: `${progress.ratio}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        {isComplete ? (
          <p className="text-sm font-semibold text-emerald-300">{"\u2705"} Mission complete</p>
        ) : (
          <p className="text-sm text-zinc-400">Keep momentum and lock the bonus.</p>
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
  );
}
