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
    <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-[#F1F5F9]">{label}</label>
        <span className="text-sm font-bold text-[#60A5FA]">
          {LEVELS[value].label}
        </span>
      </div>

      {/* Slider Dots */}
      <div className="flex items-center gap-2">
        {LEVELS.map((level, idx) => (
          <div key={level.value} className="flex-1 flex flex-col items-center gap-2">
            {/* Dot */}
            <button
              onClick={() => onChange(level.value)}
              className={`w-full h-3 rounded-full transition-all cursor-pointer ${
                value >= level.value
                  ? "bg-[#60A5FA] hover:bg-[#3B82F6]"
                  : "bg-[#334155] hover:bg-[#475569]"
              }`}
              aria-label={`Set ${label} to ${level.label}`}
            />
            {/* Label */}
            <span className="text-xs text-[#94A3B8]">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
