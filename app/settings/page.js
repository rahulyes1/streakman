"use client";

import { useState, useEffect } from "react";
import IntensitySlider from "@/components/IntensitySlider";

const PRESETS = {
  chill: {
    surprise: 1,
    competition: 1,
    progression: 1,
    achievement: 1,
    reminders: 1,
  },
  balanced: {
    surprise: 2,
    competition: 2,
    progression: 2,
    achievement: 2,
    reminders: 2,
  },
  beast: {
    surprise: 4,
    competition: 4,
    progression: 4,
    achievement: 4,
    reminders: 4,
  },
};

const SLIDER_CONFIGS = [
  {
    id: "surprise",
    label: "Surprise & Randomness",
    description: "Daily spin, random rewards, mystery challenges"
  },
  {
    id: "competition",
    label: "Competition",
    description: "Leaderboards, challenges, streak battles"
  },
  {
    id: "progression",
    label: "Progression Feedback",
    description: "XP bars, levels, progress tracking"
  },
  {
    id: "achievement",
    label: "Achievement Celebrations",
    description: "Badges, animations, level-up notifications"
  },
  {
    id: "reminders",
    label: "Reminders & Urgency",
    description: "Streak warnings, daily notifications, deadlines"
  },
];

export default function Settings() {
  const [intensities, setIntensities] = useState({
    surprise: 2,
    competition: 2,
    progression: 2,
    achievement: 2,
    reminders: 2,
  });
  const [activePreset, setActivePreset] = useState("balanced");
  const [minimalMode, setMinimalMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gamificationIntensities");
    if (saved) {
      setIntensities(JSON.parse(saved));
    }
    const savedMinimal = localStorage.getItem("minimalMode");
    if (savedMinimal) {
      setMinimalMode(JSON.parse(savedMinimal));
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("gamificationIntensities", JSON.stringify(intensities));
  }, [intensities]);

  useEffect(() => {
    localStorage.setItem("minimalMode", JSON.stringify(minimalMode));
  }, [minimalMode]);

  function handleSliderChange(id, value) {
    setIntensities(prev => ({ ...prev, [id]: value }));
    setActivePreset(null); // Clear preset when manually adjusting
  }

  function applyPreset(presetName) {
    setIntensities(PRESETS[presetName]);
    setActivePreset(presetName);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Settings ⚙️</h1>

        {/* Gamification Intensity Section */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Gamification Intensity</h2>
            <p className="text-sm text-[#94A3B8]">
              Customize how much game-like features you want. Turn down for a
              calmer experience, or crank up for maximum motivation!
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => applyPreset("chill")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activePreset === "chill"
                  ? "bg-[#60A5FA] text-white"
                  : "bg-[#0F172A] text-[#94A3B8] border border-[#334155] hover:border-[#60A5FA]"
              }`}
            >
              🌙 Chill
            </button>
            <button
              onClick={() => applyPreset("balanced")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activePreset === "balanced"
                  ? "bg-[#60A5FA] text-white"
                  : "bg-[#0F172A] text-[#94A3B8] border border-[#334155] hover:border-[#60A5FA]"
              }`}
            >
              ⚖️ Balanced
            </button>
            <button
              onClick={() => applyPreset("beast")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activePreset === "beast"
                  ? "bg-[#60A5FA] text-white"
                  : "bg-[#0F172A] text-[#94A3B8] border border-[#334155] hover:border-[#60A5FA]"
              }`}
            >
              🔥 Beast
            </button>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            {SLIDER_CONFIGS.map((config) => (
              <div key={config.id}>
                <IntensitySlider
                  label={config.label}
                  value={intensities[config.id]}
                  onChange={(value) => handleSliderChange(config.id, value)}
                />
                <p className="text-xs text-[#64748B] mt-1 ml-4">
                  {config.description}
                </p>
              </div>
            ))}
          </div>

          {/* Save Indicator */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#34D399]">
              ✓ Settings saved automatically
            </p>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <p className="text-[#94A3B8]">Coming soon...</p>
        </div>

        {/* Appearance Section */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>

          {/* Minimal Mode Toggle */}
          <div className="bg-[#0F172A] rounded-xl p-4 border border-[#334155]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold mb-1">🎯 Minimal Mode</h3>
                <p className="text-sm text-[#94A3B8]">
                  Simplified interface with no difficulty levels. Just track and complete tasks with one tap.
                </p>
              </div>
              <button
                onClick={() => setMinimalMode(!minimalMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  minimalMode ? "bg-[#60A5FA]" : "bg-[#334155]"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    minimalMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-6">
          <h2 className="text-xl font-semibold mb-2">Account</h2>
          <p className="text-[#94A3B8]">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
