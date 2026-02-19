"use client";

import { getBuildingLevel, BUILDING_LEVELS } from "@/lib/cityEngine";

export default function CityPostcard({ task, buildingType, buildingEmoji, onClose }) {
  if (!task) return null;

  const streak = Number(task.streak || 0);
  const bestStreak = Number(task.bestStreak || 0);
  const completedToday = Boolean(task.completedToday);
  const level = getBuildingLevel(streak);
  const history = Array.isArray(task.completionHistory) ? task.completionHistory : Array(7).fill(false);
  const nextLevel = BUILDING_LEVELS.find((entry) => entry.level === level + 1) || null;
  const daysToNext = nextLevel ? Math.max(0, nextLevel.streakMin - streak) : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-x-0 bottom-0 animate-modalSlideUp px-4 pb-6" onClick={(e) => e.stopPropagation()}>
        <div className="glass-card mx-auto w-full max-w-xl rounded-3xl p-5" data-active="true">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-5xl">{buildingEmoji}</p>
              <h3 className="mt-2 text-xl font-semibold text-zinc-100">{task.name}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="glass-card flex h-11 w-11 items-center justify-center rounded-xl text-zinc-300"
              aria-label="Close postcard"
            >
              x
            </button>
          </div>

          <div className="space-y-1 text-sm text-zinc-300">
            <p>Current streak: {streak} days 🔥</p>
            <p>Best streak: {bestStreak} days</p>
            <p>Completed today: {completedToday ? "\u2705" : "\u274C"}</p>
            <p>
              This {buildingType} has been open for {streak} consecutive days.
            </p>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-400">Last 7 days</p>
            <div className="grid grid-cols-7 gap-2">
              {history.map((value, index) => (
                <div
                  key={`${task.id}-history-${index}`}
                  className={`flex min-h-10 items-center justify-center rounded-lg text-xs ${
                    value ? "bg-emerald-300/20 text-emerald-300" : "bg-white/[0.04] text-zinc-500"
                  }`}
                >
                  {value ? "\u2705" : "\u274C"}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-zinc-400">Building level</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => {
                const filled = index < level;
                return (
                  <span
                    key={`${task.id}-lvl-${index}`}
                    className={`h-2.5 w-2.5 rounded-full ${filled ? "bg-teal-300" : "bg-white/20"}`}
                  />
                );
              })}
            </div>
            {nextLevel && (
              <p className="mt-2 text-xs text-zinc-400">{daysToNext} days to next level</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
