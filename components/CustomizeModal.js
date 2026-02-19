"use client";

import { useState } from "react";

export default function CustomizeModal({ task, onSave, onClose }) {
  const [customLabels, setCustomLabels] = useState(() => ({
    easy: task?.difficulties?.easy?.customLabel || "",
    normal: task?.difficulties?.normal?.customLabel || "",
    hard: task?.difficulties?.hard?.customLabel || "",
    extreme: task?.difficulties?.extreme?.customLabel || "",
  }));

  if (!task) return null;

  function handleSave() {
    onSave(task.id, customLabels);
    onClose();
  }

  function handleUseDefaults() {
    setCustomLabels({
      easy: "",
      normal: "",
      hard: "",
      extreme: "",
    });
    onSave(task.id, {
      easy: null,
      normal: null,
      hard: null,
      extreme: null,
    });
    onClose();
  }

  const difficultyConfig = [
    { key: "easy", label: "EASY", points: 20, color: "text-[#34D399]" },
    { key: "normal", label: "NORMAL", points: 40, color: "text-[#60A5FA]" },
    { key: "hard", label: "HARD", points: 60, color: "text-[#F59E0B]" },
    { key: "extreme", label: "EXTREME", points: 80, color: "text-[#EF4444]" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fadeIn">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#334155] bg-[#1E293B]">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#334155] bg-[#1E293B] p-5">
          <h2 className="text-xl font-bold text-[#F1F5F9]">
            Customize: {task.name}{" "}
            <span className="emoji-premium emoji-premium-inline emoji-premium-muted">{task.emoji}</span>
          </h2>
          <button onClick={onClose} className="text-2xl text-[#94A3B8] hover:text-[#F1F5F9]">
            {"\u00D7"}
          </button>
        </div>

        <div className="space-y-5 p-5">
          {difficultyConfig.map((config) => (
            <div key={config.key} className="rounded-xl border border-[#334155] bg-[#0F172A] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className={`font-bold ${config.color}`}>{config.label}</span>
                <span className="text-sm text-[#94A3B8]">({config.points} points)</span>
              </div>

              <div className="mb-2">
                <p className="text-sm text-[#94A3B8]">
                  Default: &quot;{task.difficulties[config.key].label}&quot;
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#F1F5F9]">Your definition (optional):</label>
                <input
                  type="text"
                  value={customLabels[config.key]}
                  onChange={(e) =>
                    setCustomLabels((prev) => ({
                      ...prev,
                      [config.key]: e.target.value,
                    }))
                  }
                  placeholder={task.difficulties[config.key].customLabel || "e.g., Your specific goal"}
                  className="w-full rounded-lg border border-[#334155] bg-[#1E293B] px-3 py-2 text-[#F1F5F9] placeholder-[#64748B] transition-colors focus:border-[#60A5FA] focus:outline-none"
                />
              </div>

              <p className="mt-2 text-xs text-[#64748B]">Leave blank to use default</p>
            </div>
          ))}

          <div className="rounded-xl border border-[#60A5FA]/30 bg-[#60A5FA]/10 p-4">
            <p className="text-sm text-[#60A5FA]">
              <span className="emoji-premium emoji-premium-inline emoji-premium-teal mr-1">
                {"\u{1F4A1}"}
              </span>
              Tip: Make these specific to YOUR goals for better tracking!
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-[#334155] bg-[#1E293B] p-5">
          <button
            onClick={handleUseDefaults}
            className="flex-1 rounded-xl border border-[#334155] bg-[#0F172A] py-3 font-semibold text-[#94A3B8] transition-colors hover:border-[#60A5FA]"
          >
            Use Smart Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-[#60A5FA] py-3 font-semibold text-white transition-colors hover:bg-[#3B82F6]"
          >
            Save Custom Definitions
          </button>
        </div>
      </div>
    </div>
  );
}
