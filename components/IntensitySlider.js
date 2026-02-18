"use client";

const LEVELS = [
  { value: 0, label: "OFF" },
  { value: 1, label: "LOW" },
  { value: 2, label: "MID" },
  { value: 3, label: "HIGH" },
  { value: 4, label: "FULL" },
];

export default function IntensitySlider({ label, value, onChange }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-sm font-semibold text-zinc-100">{label}</label>
        <span className="rounded-full bg-teal-300/15 px-2.5 py-1 text-xs font-bold text-teal-200">
          {LEVELS[value].label}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {LEVELS.map((level, idx) => (
          <div key={level.value} className="flex-1 flex flex-col items-center gap-2">
            <button
              onClick={() => onChange(level.value)}
              className={`h-3 w-full cursor-pointer rounded-full transition-all ${
                value >= level.value
                  ? "bg-teal-300 hover:bg-teal-200"
                  : "bg-white/[0.08] hover:bg-white/[0.14]"
              }`}
              aria-label={`Set ${label} to ${level.label}`}
            />
            <span className="text-xs text-zinc-500">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
