"use client";

import { useState } from "react";

const REWARDS = [
  { type: "xp", value: 25, weight: 80, label: "+25 XP", emoji: "\u2728" },
  { type: "xp", value: 50, weight: 15, label: "+50 XP", emoji: "\u2B50" },
  { type: "xp", value: 100, weight: 4, label: "+100 XP", emoji: "\u{1F31F}" },
  { type: "token", value: 1, weight: 1, label: "Freeze Token", emoji: "\u{1F48E}" },
];

export default function DailySpin() {
  const [canSpin, setCanSpin] = useState(() => {
    if (typeof window === "undefined") return false;
    const lastSpinDate = localStorage.getItem("streakman_last_spin");
    const today = new Date().toDateString();
    return lastSpinDate !== today;
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);

  function getRandomReward() {
    const totalWeight = REWARDS.reduce((sum, reward) => sum + reward.weight, 0);
    let random = Math.random() * totalWeight;

    for (const reward of REWARDS) {
      random -= reward.weight;
      if (random <= 0) return reward;
    }

    return REWARDS[0];
  }

  function handleSpin() {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    setTimeout(() => {
      const reward = getRandomReward();
      setResult(reward);
      setIsSpinning(false);

      localStorage.setItem("streakman_last_spin", new Date().toDateString());
      setCanSpin(false);

      if (reward.type === "xp") {
        const currentXP = parseInt(localStorage.getItem("streakman_xp") || "0", 10);
        localStorage.setItem("streakman_xp", (currentXP + reward.value).toString());
        window.dispatchEvent(new Event("xpUpdated"));
      } else if (reward.type === "token") {
        const currentTokens = parseInt(localStorage.getItem("streakman_freeze_tokens") || "0", 10);
        localStorage.setItem("streakman_freeze_tokens", (currentTokens + reward.value).toString());
        window.dispatchEvent(new Event("tokensUpdated"));
      }
    }, 2000);
  }

  return (
    <div className="glass-card rounded-3xl p-5" data-active="true">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-100">Daily Spin</h3>
        {!canSpin && !result && <span className="text-xs text-zinc-400">Available tomorrow</span>}
      </div>

      <div className="mb-4 flex justify-center">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-300/80 to-purple-300/80 text-4xl ${
            isSpinning ? "animate-spin" : ""
          }`}
        >
          <span className="emoji-premium emoji-premium-icon emoji-premium-teal">
            {isSpinning ? "\u{1F3B0}" : "\u{1F381}"}
          </span>
        </div>
      </div>

      {result && (
        <div className="mb-4 rounded-xl border border-teal-300/40 bg-teal-300/10 p-3 text-center">
          <p className="mb-2 text-2xl">
            <span className="emoji-premium emoji-premium-icon emoji-premium-teal">{result.emoji}</span>
          </p>
          <p className="text-sm font-semibold text-teal-200">You won {result.label}!</p>
        </div>
      )}

      {canSpin && !result ? (
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`glass-card w-full rounded-xl py-3 font-semibold transition-all ${
            isSpinning
              ? "cursor-not-allowed bg-zinc-400/20 text-zinc-400"
              : "bg-gradient-to-r from-teal-300/20 to-purple-300/20 text-zinc-100 hover:text-teal-100"
          }`}
        >
          {isSpinning ? "SPINNING..." : "SPIN NOW"}
        </button>
      ) : !canSpin ? (
        <div className="glass-card w-full rounded-xl border border-white/10 py-3 text-center font-semibold text-zinc-500">
          Come back tomorrow!
        </div>
      ) : null}

      <div className="mt-4 space-y-1 text-xs text-zinc-400">
        <p className="mb-2 font-semibold">Rewards:</p>
        {REWARDS.map((reward) => (
          <div key={reward.label} className="flex justify-between">
            <span>
              <span className="emoji-premium emoji-premium-inline emoji-premium-muted mr-1">
                {reward.emoji}
              </span>
              {reward.label}
            </span>
            <span>{reward.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
