"use client";

import { useState, useEffect } from "react";

export default function TaskCard({ task, onComplete, onCustomize, onFreeze, onDelete }) {
  const [minimalMode, setMinimalMode] = useState(false);
  const difficultyKeys = ['easy', 'normal', 'hard', 'extreme'];

  // Load minimal mode setting
  useEffect(() => {
    const savedMinimal = localStorage.getItem("minimalMode");
    if (savedMinimal) {
      setMinimalMode(JSON.parse(savedMinimal));
    }
  }, []);

  function getDifficultyDisplay(key) {
    const diff = task.difficulties[key];

    if (task.customized && diff.customLabel) {
      return diff.customLabel;
    }

    if (diff.customLabel) {
      return diff.customLabel;
    }

    return diff.label;
  }

  function handleComplete() {
    if (task.completedToday) return;

    if (minimalMode) {
      // In minimal mode, award fixed 50 XP
      onComplete(task.id, 50);
    } else {
      const points = task.difficulties[task.selectedDifficulty].points;
      onComplete(task.id, points);
    }
  }

  function getStreakDisplay() {
    const streak = task.streak;
    if (streak === 0) return "No streak";
    if (streak >= 30) return `${streak} days 🔥🔥🔥`;
    if (streak >= 14) return `${streak} days 🔥🔥`;
    if (streak >= 7) return `${streak} days 🔥`;
    return `${streak} days`;
  }

  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4 relative transition-spring hover:border-[#60A5FA]/30 hover:shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{task.emoji}</span>
          <div className="flex-1">
            <h2 className="text-base font-semibold">{task.name}</h2>
            <p className="text-xs text-[#94A3B8]">{getStreakDisplay()}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Freeze/Protected Badge */}
          {task.streak > 0 && onFreeze && !task.freezeProtected && (
            <button
              onClick={() => onFreeze(task.id)}
              className="text-xs bg-[#60A5FA]/20 text-[#60A5FA] px-2 py-1 rounded-md hover:bg-[#60A5FA]/30 transition-colors"
              title="Use freeze token"
            >
              💎
            </button>
          )}
          {task.freezeProtected && (
            <span className="text-xs bg-[#34D399]/20 text-[#34D399] px-2 py-1 rounded-md">
              🛡️
            </span>
          )}

          {/* Customize Button (only in non-minimal mode) */}
          {!minimalMode && (
            <button
              onClick={() => onCustomize(task)}
              className="text-[#94A3B8] hover:text-[#60A5FA] transition-colors p-1"
              title="Customize"
            >
              <span className="text-base">⚙️</span>
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={() => onDelete(task.id)}
              className="text-[#94A3B8] hover:text-[#EF4444] transition-colors p-1"
              title="Remove task"
            >
              <span className="text-base">×</span>
            </button>
          )}
        </div>
      </div>

      {task.completedToday ? (
        /* Completed State - Compact */}
        <div className="bg-[#34D399] text-white py-2 px-3 rounded-lg font-semibold text-sm text-center">
          ✅ Completed! {minimalMode ? '+50 XP' : `+${task.difficulties[task.selectedDifficulty].points} XP`}
        </div>
      ) : minimalMode ? (
        /* Minimal Mode - Just Complete Button */}
        <button
          onClick={handleComplete}
          className="w-full py-2 rounded-lg font-semibold text-sm transition-spring bg-[#60A5FA] text-white hover:bg-[#3B82F6] hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          Tap and can be done
        </button>
      ) : (
        <>
          {/* Difficulty Buttons - Compact 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {difficultyKeys.map((key) => {
              const isSelected = task.selectedDifficulty === key;
              const label = getDifficultyDisplay(key);
              const points = task.difficulties[key].points;

              return (
                <button
                  key={key}
                  onClick={() => onComplete(task.id, 0, key)}
                  className={`py-2 px-2 rounded-lg text-left transition-spring hover:scale-105 active:scale-95 ${
                    isSelected
                      ? "bg-[#60A5FA] text-white shadow-lg"
                      : "bg-[#0F172A] text-[#94A3B8] border border-[#334155] hover:border-[#60A5FA]/50"
                  }`}
                >
                  <div className="text-xs font-medium capitalize">{key}</div>
                  <div className={`text-xs ${isSelected ? "text-white/80" : "text-[#64748B]"} truncate`}>
                    {label}
                  </div>
                  <div className={`text-xs font-semibold ${isSelected ? "text-white" : "text-[#60A5FA]"}`}>
                    {points} pts
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mark Complete Button - Compact */}
          <button
            onClick={handleComplete}
            className="w-full py-2 rounded-lg font-semibold text-sm transition-spring bg-[#60A5FA] text-white hover:bg-[#3B82F6] hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            Tap and can be done
          </button>
        </>
      )}
    </div>
  );
}
