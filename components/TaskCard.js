"use client";

export default function TaskCard({ task, onComplete, onCustomize }) {
  const difficultyKeys = ['easy', 'normal', 'hard', 'extreme'];

  function getDifficultyDisplay(key) {
    const diff = task.difficulties[key];
    const isCustomized = task.customized && diff.customLabel;

    if (isCustomized) {
      return {
        mainLabel: diff.customLabel,
        subLabel: null
      };
    } else {
      return {
        mainLabel: diff.label,
        subLabel: diff.customLabel ? `(e.g., ${diff.customLabel})` : null
      };
    }
  }

  function handleComplete() {
    if (task.completedToday) return;
    const points = task.difficulties[task.selectedDifficulty].points;
    onComplete(task.id, points);
  }

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 relative">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1">
          <h2 className="text-lg font-semibold">
            {task.name} {task.emoji}
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1">Streak: {task.streak} days</p>
        </div>

        {/* Customize Button */}
        <button
          onClick={() => onCustomize(task)}
          className="text-[#94A3B8] hover:text-[#60A5FA] transition-colors p-1 group relative"
          title="Customize difficulty levels"
        >
          <span className="text-lg">⚙️</span>
          {/* Tooltip */}
          <span className="absolute right-0 top-8 bg-[#0F172A] text-xs text-[#94A3B8] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-[#334155]">
            Customize difficulty levels
          </span>
        </button>
      </div>

      {task.completedToday ? (
        /* Completed State */
        <div className="mt-4 bg-[#34D399] text-white py-3 px-4 rounded-xl font-semibold text-center">
          ✅ Completed! {task.difficulties[task.selectedDifficulty].label} (+
          {task.difficulties[task.selectedDifficulty].points}pts)
        </div>
      ) : (
        <>
          {/* Difficulty Buttons - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
            {difficultyKeys.map((key) => {
              const diff = task.difficulties[key];
              const display = getDifficultyDisplay(key);
              const isSelected = task.selectedDifficulty === key;

              return (
                <button
                  key={key}
                  onClick={() => onComplete(task.id, 0, key)} // 0 points means just select
                  className={`py-3 px-3 rounded-xl text-left transition-colors ${
                    isSelected
                      ? "bg-[#60A5FA] text-white"
                      : "bg-[#0F172A] text-[#94A3B8] border border-[#334155]"
                  }`}
                >
                  <div className="font-medium text-sm capitalize">{key}</div>
                  <div className={`text-xs mt-1 ${isSelected ? "text-white/90" : "text-[#64748B]"}`}>
                    {display.mainLabel}
                  </div>
                  {display.subLabel && (
                    <div className={`text-xs mt-0.5 ${isSelected ? "text-white/70" : "text-[#475569]"}`}>
                      {display.subLabel}
                    </div>
                  )}
                  <div className={`text-xs font-semibold mt-1 ${isSelected ? "text-white" : "text-[#60A5FA]"}`}>
                    {diff.points} pts
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mark Complete Button */}
          <button
            onClick={handleComplete}
            className="w-full py-3 rounded-xl font-semibold transition-colors bg-[#60A5FA] text-white hover:bg-[#3B82F6]"
          >
            Mark Complete
          </button>
        </>
      )}
    </div>
  );
}
