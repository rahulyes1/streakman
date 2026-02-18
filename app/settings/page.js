"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import IntensitySlider from "@/components/IntensitySlider";
import { getCurrentUser, signOut } from "@/lib/auth";

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
    description: "Daily spin, random rewards, mystery challenges",
  },
  {
    id: "competition",
    label: "Competition",
    description: "Leaderboards, challenges, streak battles",
  },
  {
    id: "progression",
    label: "Progression Feedback",
    description: "XP bars, levels, progress tracking",
  },
  {
    id: "achievement",
    label: "Achievement Celebrations",
    description: "Badges, animations, level-up notifications",
  },
  {
    id: "reminders",
    label: "Reminders & Urgency",
    description: "Streak warnings, daily notifications, deadlines",
  },
];

function getInitialIntensities() {
  if (typeof window === "undefined") return PRESETS.balanced;

  const saved = localStorage.getItem("gamificationIntensities");
  if (!saved) return PRESETS.balanced;

  try {
    return JSON.parse(saved);
  } catch {
    return PRESETS.balanced;
  }
}

function getInitialMinimalMode() {
  if (typeof window === "undefined") return false;

  const saved = localStorage.getItem("minimalMode");
  if (!saved) return false;

  try {
    return JSON.parse(saved);
  } catch {
    return false;
  }
}

function detectPreset(values) {
  if (
    values.surprise === PRESETS.chill.surprise &&
    values.competition === PRESETS.chill.competition &&
    values.progression === PRESETS.chill.progression &&
    values.achievement === PRESETS.chill.achievement &&
    values.reminders === PRESETS.chill.reminders
  ) {
    return "chill";
  }

  if (
    values.surprise === PRESETS.balanced.surprise &&
    values.competition === PRESETS.balanced.competition &&
    values.progression === PRESETS.balanced.progression &&
    values.achievement === PRESETS.balanced.achievement &&
    values.reminders === PRESETS.balanced.reminders
  ) {
    return "balanced";
  }

  if (
    values.surprise === PRESETS.beast.surprise &&
    values.competition === PRESETS.beast.competition &&
    values.progression === PRESETS.beast.progression &&
    values.achievement === PRESETS.beast.achievement &&
    values.reminders === PRESETS.beast.reminders
  ) {
    return "beast";
  }

  return null;
}

export default function Settings() {
  const [intensities, setIntensities] = useState(() => getInitialIntensities());
  const [activePreset, setActivePreset] = useState(() => detectPreset(getInitialIntensities()));
  const [minimalMode, setMinimalMode] = useState(() => getInitialMinimalMode());
  const [currentUser] = useState(() => getCurrentUser());
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem("gamificationIntensities", JSON.stringify(intensities));
  }, [intensities]);

  useEffect(() => {
    localStorage.setItem("minimalMode", JSON.stringify(minimalMode));
  }, [minimalMode]);

  function handleSliderChange(id, value) {
    setIntensities((current) => ({ ...current, [id]: value }));
    setActivePreset(null);
  }

  function applyPreset(presetName) {
    setIntensities(PRESETS[presetName]);
    setActivePreset(presetName);
  }

  function handleSignOut() {
    signOut();
    router.replace("/signin");
  }

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 pb-28 pt-6 text-zinc-100">
        <div className="mesh-leak mesh-leak-teal" />
        <div className="mesh-leak mesh-leak-purple" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-zinc-400">Tune your streak system exactly how you like it.</p>
          </header>

          <section className="glass-card mb-6 rounded-3xl p-6" data-active="true">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Gamification Intensity</h2>
              <p className="mt-1 text-sm text-zinc-400">
                Lower for a calmer experience, or turn it up for stronger prompts and reward feedback.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
              <PresetButton
                label="Chill"
                icon="\u{1F319}"
                active={activePreset === "chill"}
                onClick={() => applyPreset("chill")}
              />
              <PresetButton
                label="Balanced"
                icon="\u2696\uFE0F"
                active={activePreset === "balanced"}
                onClick={() => applyPreset("balanced")}
              />
              <PresetButton
                label="Beast"
                icon="\u{1F525}"
                active={activePreset === "beast"}
                onClick={() => applyPreset("beast")}
              />
            </div>

            <div className="space-y-4">
              {SLIDER_CONFIGS.map((config) => (
                <div key={config.id}>
                  <IntensitySlider
                    label={config.label}
                    value={intensities[config.id]}
                    onChange={(value) => handleSliderChange(config.id, value)}
                  />
                  <p className="ml-1 mt-1 text-xs text-zinc-500">{config.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-emerald-300">Settings are saved automatically.</p>
            </div>
          </section>

          <section className="glass-card mb-6 rounded-3xl p-6">
            <h2 className="text-xl font-semibold">Appearance</h2>
            <div className="mt-4 rounded-xl bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold">Minimal Mode</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    Simplifies the interface by reducing visual game intensity and keeping core task actions in focus.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMinimalMode((current) => !current)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    minimalMode ? "bg-teal-300" : "bg-white/20"
                  }`}
                  aria-label="Toggle minimal mode"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      minimalMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="mt-2 text-sm text-zinc-500">Notification preferences are coming soon.</p>
            </div>
            <div className="glass-card rounded-2xl p-5">
              <h2 className="text-lg font-semibold">Account</h2>
              {currentUser ? (
                <>
                  <p className="mt-2 text-sm text-zinc-400">
                    Signed in as <span className="font-semibold text-zinc-200">{currentUser.name}</span>
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">{currentUser.email}</p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="glass-card mt-4 min-h-11 rounded-xl px-4 text-sm font-semibold text-rose-300"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <p className="mt-2 text-sm text-zinc-500">No active account session.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <BottomNav />
    </>
  );
}

function PresetButton({ label, icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`glass-card min-h-11 rounded-xl px-3 py-2 text-sm font-semibold transition-spring ${
        active
          ? "border border-teal-300/45 bg-teal-300/15 text-teal-100"
          : "text-zinc-300 hover:text-zinc-100"
      }`}
    >
      <span className="mr-1">{icon}</span>
      {label}
    </button>
  );
}
