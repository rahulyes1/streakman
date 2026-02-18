"use client";

export default function ProgressBar({ label, value, max, color }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-zinc-100">{label}</span>
        <span className="text-zinc-400">
          {value}/{max} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
