"use client";

export default function XPBar({ currentXP, level }) {
  const xpNeeded = level * 1000;
  const xpProgress = currentXP % xpNeeded;
  const percentage = Math.min((xpProgress / xpNeeded) * 100, 100);

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[#F1F5F9]">Level {level}</span>
        <span className="text-xs text-[#94A3B8]">
          {xpProgress} / {xpNeeded} XP
        </span>
      </div>
      <div className="relative w-full bg-[#0F172A] rounded-full h-6 overflow-hidden">
        <div
          className="h-full bg-[#60A5FA] transition-all duration-500 rounded-full flex items-center justify-center"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 10 && (
            <span className="text-xs font-bold text-white">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
