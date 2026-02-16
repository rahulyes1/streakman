"use client";

import { useState } from "react";

const REWARDS = [
  { type: "xp", value: 25, weight: 80, label: "+25 XP", emoji: "✨" },
  { type: "xp", value: 50, weight: 15, label: "+50 XP", emoji: "⭐" },
  { type: "xp", value: 100, weight: 4, label: "+100 XP", emoji: "🌟" },
  { type: "token", value: 1, weight: 1, label: "💎 Freeze Token", emoji: "💎" },
];

export default function DailySpin({ canSpin, onSpin }) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);

  function getRandomReward() {
    const totalWeight = REWARDS.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;

    for (const reward of REWARDS) {
      random -= reward.weight;
      if (random <= 0) {
        return reward;
      }
    }

    return REWARDS[0]; // Fallback
  }

  function handleSpin() {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // Simulate spinning for 2 seconds
    setTimeout(() => {
      const reward = getRandomReward();
      setResult(reward);
      setIsSpinning(false);
      onSpin(reward);
    }, 2000);
  }

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#F1F5F9]">🎲 Daily Spin</h3>
        {!canSpin && !result && (
          <span className="text-xs text-[#94A3B8]">Available tomorrow</span>
        )}
      </div>

      {/* Spin Wheel Visual */}
      <div className="flex justify-center mb-4">
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#34D399] flex items-center justify-center text-4xl ${
            isSpinning ? 'animate-spin-slow' : ''
          }`}
        >
          {isSpinning ? '🎰' : '🎁'}
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="bg-[#34D399]/10 border border-[#34D399]/30 rounded-xl p-3 mb-4 text-center animate-fadeIn">
          <p className="text-2xl mb-2">{result.emoji}</p>
          <p className="text-sm font-semibold text-[#34D399]">
            You won {result.label}!
          </p>
        </div>
      )}

      {/* Spin Button */}
      {canSpin && !result ? (
        <button
          onClick={handleSpin}
          disabled={isSpinning}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            isSpinning
              ? 'bg-[#94A3B8] text-[#0F172A] cursor-not-allowed'
              : 'bg-gradient-to-r from-[#60A5FA] to-[#34D399] text-white hover:scale-105'
          }`}
        >
          {isSpinning ? 'SPINNING...' : 'SPIN NOW'}
        </button>
      ) : !canSpin ? (
        <div className="w-full py-3 rounded-xl font-semibold bg-[#0F172A] text-[#64748B] text-center border border-[#334155]">
          Come back tomorrow!
        </div>
      ) : null}

      {/* Reward Odds */}
      <div className="mt-4 text-xs text-[#94A3B8] space-y-1">
        <p className="font-semibold mb-2">Rewards:</p>
        {REWARDS.map((r, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{r.label}</span>
            <span>{r.weight}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
