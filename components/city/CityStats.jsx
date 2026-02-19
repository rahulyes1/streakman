"use client";

import { useEffect, useRef, useState } from "react";

const WEATHER_META = {
  sunny: { emoji: "\u2600\uFE0F", label: "Sunny" },
  cloudy: { emoji: "\u26C5", label: "Cloudy" },
  overcast: { emoji: "\u2601\uFE0F", label: "Overcast" },
  rain: { emoji: "\u{1F327}\uFE0F", label: "Rain" },
};

export default function CityStats({ weather, population, level, totalScore, cityEvent, mood = null }) {
  const [displayPopulation, setDisplayPopulation] = useState(population);
  const previousRef = useRef(population);

  useEffect(() => {
    const from = previousRef.current;
    const to = population;
    if (from === to) return;

    const duration = 500;
    const start = performance.now();

    const animate = (timestamp) => {
      const ratio = Math.min(1, (timestamp - start) / duration);
      const nextValue = Math.round(from + (to - from) * ratio);
      setDisplayPopulation(nextValue);
      if (ratio < 1) {
        requestAnimationFrame(animate);
      } else {
        previousRef.current = to;
      }
    };

    requestAnimationFrame(animate);
  }, [population]);

  const weatherMeta = WEATHER_META[weather] || WEATHER_META.cloudy;

  return (
    <div className="mb-4">
      <div className="glass-card rounded-2xl p-3">
        <div className="grid grid-cols-3 items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-zinc-200">
            <span className="emoji-premium emoji-premium-inline emoji-premium-muted">{weatherMeta.emoji}</span>
            <span>{weatherMeta.label}</span>
          </div>
          <div className="text-center font-semibold text-zinc-100">Pop. {displayPopulation}</div>
          <div className="text-right font-semibold text-zinc-200">Lv.{level}</div>
        </div>
        <p className="mt-1 text-xs text-zinc-500">City score {totalScore}</p>
        {mood && (
          <p className={`mt-1 text-xs ${mood.colorClass}`}>
            <span className="emoji-premium emoji-premium-inline mr-1">{mood.emoji}</span>
            {mood.label}
          </p>
        )}
      </div>

      {cityEvent && (
        <div className="mt-2 rounded-xl bg-amber-300/10 px-3 py-2 text-xs text-amber-300">
          <span className="emoji-premium emoji-premium-inline emoji-premium-amber mr-1">{cityEvent.emoji}</span>
          {cityEvent.title}
        </div>
      )}
    </div>
  );
}
