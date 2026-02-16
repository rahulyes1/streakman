"use client";

import { useState, useEffect } from "react";

export default function CustomizeModal({ task, onSave, onClose }) {
  const [customLabels, setCustomLabels] = useState({
    easy: "",
    normal: "",
    hard: "",
    extreme: ""
  });

  useEffect(() => {
    if (task) {
      setCustomLabels({
        easy: task.difficulties.easy.customLabel || "",
        normal: task.difficulties.normal.customLabel || "",
        hard: task.difficulties.hard.customLabel || "",
        extreme: task.difficulties.extreme.customLabel || ""
      });
    }
  }, [task]);

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
      extreme: ""
    });
    onSave(task.id, {
      easy: null,
      normal: null,
      hard: null,
      extreme: null
    });
    onClose();
  }

  const difficultyConfig = [
    { key: 'easy', label: 'EASY', points: 20, color: 'text-[#34D399]' },
    { key: 'normal', label: 'NORMAL', points: 40, color: 'text-[#60A5FA]' },
    { key: 'hard', label: 'HARD', points: 60, color: 'text-[#F59E0B]' },
    { key: 'extreme', label: 'EXTREME', points: 80, color: 'text-[#EF4444]' }
  ];

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1E293B] rounded-2xl border border-[#334155] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1E293B] border-b border-[#334155] p-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#F1F5F9]">
            Customize: {task.name} {task.emoji}
          </h2>
          <button
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-5">
          {difficultyConfig.map((config) => (
            <div key={config.key} className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
              <div className="flex items-center justify-between mb-3">
                <span className={`font-bold ${config.color}`}>{config.label}</span>
                <span className="text-sm text-[#94A3B8]">({config.points} points)</span>
              </div>

              <div className="mb-2">
                <p className="text-sm text-[#94A3B8]">
                  Default: "{task.difficulties[config.key].label}"
                </p>
              </div>

              <div>
                <label className="block text-sm text-[#F1F5F9] mb-2">
                  Your definition (optional):
                </label>
                <input
                  type="text"
                  value={customLabels[config.key]}
                  onChange={(e) => setCustomLabels(prev => ({
                    ...prev,
                    [config.key]: e.target.value
                  }))}
                  placeholder={task.difficulties[config.key].customLabel || "e.g., Your specific goal"}
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#60A5FA] transition-colors"
                />
              </div>

              <p className="text-xs text-[#64748B] mt-2">
                Leave blank to use default
              </p>
            </div>
          ))}

          {/* Tip */}
          <div className="bg-[#60A5FA]/10 border border-[#60A5FA]/30 rounded-xl p-4">
            <p className="text-sm text-[#60A5FA]">
              💡 Tip: Make these specific to YOUR goals for better tracking!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1E293B] border-t border-[#334155] p-5 flex gap-3">
          <button
            onClick={handleUseDefaults}
            className="flex-1 py-3 rounded-xl font-semibold bg-[#0F172A] text-[#94A3B8] border border-[#334155] hover:border-[#60A5FA] transition-colors"
          >
            Use Smart Defaults
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-semibold bg-[#60A5FA] text-white hover:bg-[#3B82F6] transition-colors"
          >
            Save Custom Definitions
          </button>
        </div>
      </div>
    </div>
  );
}
