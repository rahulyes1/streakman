"use client";

export default function ProgressBar({ label, value, max, color }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-[#F1F5F9]">{label}</span>
        <span className="text-[#94A3B8]">
          {value}/{max} ({Math.round(percentage)}%)
        </span>
      </div>
      <div className="h-3 bg-[#0F172A] rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
