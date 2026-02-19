"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CITY_BUILDINGS = [
  "\u{1F3E0}",
  "\u{1F3E2}",
  "\u{1F4DA}",
  "\u{2615}",
  "\u{1F3CB}\uFE0F",
];

function useTicker(target, duration, trigger) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!trigger) return undefined;
    const start = performance.now();

    const tick = (timestamp) => {
      const ratio = Math.min(1, (timestamp - start) / duration);
      setValue(Math.round(target * ratio));
      if (ratio < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [duration, target, trigger]);

  return value;
}

export default function OnboardingPage() {
  const [screen, setScreen] = useState(1);
  const [name, setName] = useState("");
  const router = useRouter();
  const population = useTicker(847, 3000, screen === 1);

  useEffect(() => {
    if (screen !== 1) return undefined;
    const timer = window.setTimeout(() => setScreen(2), 4000);
    return () => window.clearTimeout(timer);
  }, [screen]);

  const goToTasks = () => {
    sessionStorage.setItem("streakman_onboarding_checked", "1");
    router.push("/tasks");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] text-zinc-100">
      <div className="mesh-leak mesh-leak-teal" />
      <div className="mesh-leak mesh-leak-purple" />

      {screen === 1 && (
        <div
          className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-6 text-center"
          onClick={() => setScreen(2)}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              localStorage.setItem("streakman_onboarded", "true");
              goToTasks();
            }}
            className="absolute right-4 top-4 text-sm text-zinc-400 underline"
          >
            Skip
          </button>

          <div className="mb-6 flex gap-2">
            {CITY_BUILDINGS.map((emoji, index) => (
              <div
                key={`building-${emoji}-${index}`}
                className="glass-card streak-breathe-slow flex h-14 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <span className="emoji-premium emoji-premium-icon emoji-premium-teal">{emoji}</span>
              </div>
            ))}
          </div>

          <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Population</p>
          <p className="mb-5 text-4xl font-bold text-teal-300">{population}</p>
          <h1 className="text-3xl font-bold tracking-tight">Your habits. Built into a city.</h1>
          <p className="mt-2 text-sm text-zinc-400">Every streak becomes a building.</p>
          <span className="mt-8 animate-slideUp rounded-full bg-teal-300/15 px-5 py-2 text-sm font-semibold text-teal-200 [animation-delay:1s]">
            Begin
          </span>
        </div>
      )}

      {screen === 2 && (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-md items-center px-6">
          <div className="glass-card w-full rounded-3xl p-6" data-active="true">
            <h2 className="text-2xl font-bold">What should we call you?</h2>
            <p className="mt-1 text-sm text-zinc-400">Optional - you can skip this</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Explorer"
              className="glass-card mt-4 h-11 w-full rounded-xl px-3 text-sm outline-none placeholder:text-zinc-500"
            />
            <button
              type="button"
              className="glass-card mt-4 min-h-11 w-full rounded-xl bg-teal-300/15 px-4 text-sm font-semibold text-teal-200"
              onClick={() => {
                localStorage.setItem("streakman_username", (name || "Explorer").trim() || "Explorer");
                setScreen(3);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {screen === 3 && (
        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-12 pt-8 animate-fadeIn">
          <h2 className="text-3xl font-bold">Your city is empty.</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Every habit you add becomes a building. Start with whatever matters most to you.
          </p>

          <div className="mt-6 grid grid-cols-4 gap-3 md:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={`onboard-slot-${index}`}
                className="glass-card flex min-h-[86px] items-center justify-center rounded-2xl border border-zinc-700/60 opacity-55"
              >
                {index === 0 ? (
                  <span className="text-2xl text-zinc-300 animate-pulse">|</span>
                ) : (
                  <span className="emoji-premium emoji-premium-icon emoji-premium-muted text-xl text-zinc-600">
                    {"\u{1F3DA}\uFE0F"}
                  </span>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={goToTasks}
            className="glass-card mt-7 min-h-11 w-full rounded-xl bg-teal-300/15 px-4 text-sm font-semibold text-teal-200"
          >
            Add my first habit
          </button>
          <Link href="/templates" className="mt-3 block text-center text-sm text-zinc-400 underline">
            Browse habit templates -&gt;
          </Link>
        </div>
      )}
    </div>
  );
}
