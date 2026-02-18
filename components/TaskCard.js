"use client";

import { useState } from "react";

export default function TaskCard({ task, onComplete, onCustomize, onFreeze, onDelete }) {
  const [minimalMode] = useState(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem("minimalMode");
    return saved ? JSON.parse(saved) : false;
  });

  const difficultyKeys = ["easy", "normal", "hard", "extreme"];

  function getDifficultyDisplay(key) {
    const diff = task.difficulties[key];
    if (task.customized && diff.customLabel) return diff.customLabel;
    if (diff.customLabel) return diff.customLabel;
    return diff.label;
  }

  function handleComplete() {
    if (minimalMode) {
      onComplete(task.id, 50);
      return;
    }
    const points = task.difficulties[task.selectedDifficulty].points;
    onComplete(task.id, points);
  }

  function getStreakDisplay() {
    const streak = task.streak;
    if (streak === 0) return "No streak";
    if (streak >= 30) return `${streak} days`;
    if (streak >= 14) return `${streak} days`;
    if (streak >= 7) return `${streak} days`;
    return `${streak} days`;
  }

  return (
    <div className="relative rounded-xl border border-[#334155] bg-[#1E293B] p-4 transition-spring hover:border-[#60A5FA]/30 hover:shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-2xl">{task.emoji}</span>
          <div className="flex-1">
            <h2 className="text-base font-semibold">{task.name}</h2>
            <p className="text-xs text-[#94A3B8]">{getStreakDisplay()}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {task.streak > 0 && onFreeze && !task.freezeProtected && (
            <button
              onClick={() => onFreeze(task.id)}
              className="rounded-md bg-[#60A5FA]/20 px-2 py-1 text-xs text-[#60A5FA] transition-colors hover:bg-[#60A5FA]/30"
              title="Use freeze token"
            >
              Freeze
            </button>
          )}
          {task.freezeProtected && (
            <span className="rounded-md bg-[#34D399]/20 px-2 py-1 text-xs text-[#34D399]">Shield</span>
          )}

          {!minimalMode && (
            <button
              onClick={() => onCustomize(task)}
              className="p-1 text-[#94A3B8] transition-colors hover:text-[#60A5FA]"
              title="Customize"
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 text-[#94A3B8] transition-colors hover:text-[#EF4444]"
              title="Remove task"
            >
              X
            </button>
          )}
        </div>
      </div>

      {task.completedToday ? (
        <button
          onClick={handleComplete}
          className="w-full rounded-lg bg-[#34D399] px-3 py-2 text-sm font-semibold text-white transition-spring hover:scale-105 hover:bg-[#10B981] active:scale-95"
        >
          Mark as not done
        </button>
      ) : minimalMode ? (
        <button
          onClick={handleComplete}
          className="w-full rounded-lg bg-[#60A5FA] py-2 text-sm font-semibold text-white transition-spring hover:scale-105 hover:bg-[#3B82F6] hover:shadow-lg active:scale-95"
        >
          Mark done
        </button>
      ) : (
        <>
          <div className="mb-2 grid grid-cols-2 gap-2">
            {difficultyKeys.map((key) => {
              const isSelected = task.selectedDifficulty === key;
              const label = getDifficultyDisplay(key);
              const points = task.difficulties[key].points;

              return (
                <button
                  key={key}
                  onClick={() => onComplete(task.id, 0, key)}
                  className={`rounded-lg px-2 py-2 text-left transition-spring hover:scale-105 active:scale-95 ${
                    isSelected
                      ? "bg-[#60A5FA] text-white shadow-lg"
                      : "border border-[#334155] bg-[#0F172A] text-[#94A3B8] hover:border-[#60A5FA]/50"
                  }`}
                >
                  <div className="text-xs font-medium capitalize">{key}</div>
                  <div className={`truncate text-xs ${isSelected ? "text-white/80" : "text-[#64748B]"}`}>
                    {label}
                  </div>
                  <div className={`text-xs font-semibold ${isSelected ? "text-white" : "text-[#60A5FA]"}`}>
                    {points} pts
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleComplete}
            className="w-full rounded-lg bg-[#60A5FA] py-2 text-sm font-semibold text-white transition-spring hover:scale-105 hover:bg-[#3B82F6] hover:shadow-lg active:scale-95"
          >
            Mark done
          </button>
        </>
      )}
    </div>
  );
}

