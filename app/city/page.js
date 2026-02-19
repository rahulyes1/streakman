"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import CityBuilding from "@/components/city/CityBuilding";
import CityPostcard from "@/components/city/CityPostcard";
import CityStats from "@/components/city/CityStats";
import CityWeather from "@/components/city/CityWeather";
import { calculateScore } from "@/lib/scoring";
import { getLevelFromXP } from "@/lib/xpSystem";
import {
  BUILDING_EMOJIS,
  NEIGHBORHOODS,
  generateDailyEvent,
  getBestStreak,
  getBuildingLevel,
  getBuildingState,
  getBuildingType,
  getCityWeather,
  getPopulation,
} from "@/lib/cityEngine";

function readTasks() {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("streakman_tasks");
  if (!saved) return [];
  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readXP() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("streakman_xp") || "0", 10);
}

function dayKey(date = new Date()) {
  return date.toDateString();
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
}

export default function CityPage() {
  const [tasks, setTasks] = useState(() => readTasks());
  const [xp, setXp] = useState(() => readXP());
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [toast, setToast] = useState("");
  const [cityEvent, setCityEvent] = useState(() => {
    if (typeof window === "undefined") return null;
    return generateDailyEvent();
  });

  useEffect(() => {
    if (!cityEvent) return;
    localStorage.setItem("streakman_city_event", JSON.stringify(cityEvent));
  }, [cityEvent]);

  useEffect(() => {
    const checkOvernightChanges = (taskList) => {
      const today = dayKey();
      const lastUpdate = localStorage.getItem("streakman_city_last_update");
      const logs = [];

      if (lastUpdate === yesterdayKey()) {
        taskList.forEach((task) => {
          if (task?.completionHistory?.[6] === false) {
            const message = `building went dark overnight: ${task.name || task.id}`;
            logs.push(message);
            console.log(message);
          }
        });

        taskList.forEach((task) => {
          if ([7, 14, 30, 60].includes(Number(task?.streak || 0))) {
            const message = `new floor added: ${task.name || task.id}`;
            logs.push(message);
            console.log(message);
          }
        });
      }

      localStorage.setItem("streakman_city_last_update", today);
      if (logs.length > 0) {
        setToast("Your city changed overnight");
      }
    };

    const load = () => {
      const nextTasks = readTasks();
      setTasks(nextTasks);
      setXp(readXP());
      setCityEvent(generateDailyEvent());
    };

    checkOvernightChanges(readTasks());

    const onTasks = () => load();
    const onXp = () => setXp(readXP());

    window.addEventListener("tasksUpdated", onTasks);
    window.addEventListener("xpUpdated", onXp);

    return () => {
      window.removeEventListener("tasksUpdated", onTasks);
      window.removeEventListener("xpUpdated", onXp);
    };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const scoreData = calculateScore(tasks);
  const weather = getCityWeather(scoreData.totalScore);
  const population = getPopulation(xp);
  const level = getLevelFromXP(xp).level;
  const bestStreak = getBestStreak(tasks);

  const buildings = useMemo(
    () =>
      tasks.map((task) => {
        const buildingType = getBuildingType(task.name);
        const buildingLevel = getBuildingLevel(task.streak || 0);
        const buildingState = getBuildingState(task);
        const buildingEmoji = BUILDING_EMOJIS[buildingType] || BUILDING_EMOJIS.default;

        return {
          task,
          buildingType,
          buildingLevel,
          buildingState,
          buildingEmoji,
        };
      }),
    [tasks]
  );

  const selectedBuilding = buildings.find((entry) => entry.task.id === selectedTaskId) || null;
  const gridSize = Math.max(12, buildings.length);

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 pb-28 pt-6 text-zinc-100">
        <div className="mesh-leak mesh-leak-teal" />
        <div className="mesh-leak mesh-leak-purple" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <header className="mb-4">
            <h1 className="text-3xl font-bold tracking-tight">Your City</h1>
            <p className="mt-1 text-sm text-zinc-400">Population {population}</p>
          </header>

          <CityStats
            weather={weather}
            population={population}
            level={level}
            totalScore={scoreData.totalScore}
            cityEvent={cityEvent}
          />

          <section className="glass-card relative mb-5 overflow-hidden rounded-3xl p-4">
            <CityWeather weather={weather} />
            <div className="relative z-10 grid grid-cols-4 gap-3 md:grid-cols-6">
              {Array.from({ length: gridSize }).map((_, index) => {
                const building = buildings[index];
                if (!building) {
                  return (
                    <div
                      key={`lot-${index}`}
                      className="glass-card flex min-h-[108px] items-center justify-center rounded-2xl opacity-40"
                    >
                      <span className="text-2xl">🏚️</span>
                    </div>
                  );
                }

                return (
                  <CityBuilding
                    key={building.task.id}
                    task={building.task}
                    buildingType={building.buildingType}
                    buildingState={building.buildingState}
                    buildingLevel={building.buildingLevel}
                    buildingEmoji={building.buildingEmoji}
                    onClick={(task) => setSelectedTaskId(task.id)}
                  />
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            {NEIGHBORHOODS.map((neighborhood) => {
              const unlocked = bestStreak >= neighborhood.requiredStreak;
              const remaining = Math.max(0, neighborhood.requiredStreak - bestStreak);
              const progress = Math.min(100, Math.round((bestStreak / neighborhood.requiredStreak) * 100));

              return (
                <div key={neighborhood.id} className="glass-card rounded-2xl p-4">
                  {unlocked ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-zinc-100">
                          {neighborhood.emoji} {neighborhood.name}
                        </h3>
                        <span className="text-xs text-emerald-300">Unlocked</span>
                      </div>
                      <p className="text-xs text-zinc-400">{neighborhood.description}</p>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: neighborhood.slots }).map((_, index) => (
                          <span key={`${neighborhood.id}-slot-${index}`} className="text-xl opacity-60">
                            🏚️
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-zinc-100">
                          🔒 {neighborhood.name}
                        </h3>
                        <span className="text-xs text-zinc-400">
                          Day {bestStreak} / {neighborhood.requiredStreak}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400">{neighborhood.description}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-300 to-purple-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">{remaining} more days of any streak</p>
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </div>

        {toast && (
          <div className="fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-xl border border-teal-300/35 bg-[#0B0B0B]/90 px-4 py-2 text-sm text-teal-200">
            {toast}
          </div>
        )}
      </div>

      {selectedBuilding && (
        <CityPostcard
          task={selectedBuilding.task}
          buildingType={selectedBuilding.buildingType}
          buildingEmoji={selectedBuilding.buildingEmoji}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      <BottomNav />
    </>
  );
}
