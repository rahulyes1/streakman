"use client";

import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import CityBuilding from "@/components/city/CityBuilding";
import CityPostcard from "@/components/city/CityPostcard";
import CityStats from "@/components/city/CityStats";
import CityWeather from "@/components/city/CityWeather";
import { streakMilestone } from "@/lib/haptics";
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

function getCurrentStreak(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  return Math.max(...taskList.map((task) => Number(task?.streak || 0)), 0);
}

function readBestEverStreak() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("streakman_best_ever_streak") || "0", 10);
}

function getUsageDayCount() {
  if (typeof window === "undefined") return 1;
  let firstUse = localStorage.getItem("streakman_first_use");
  if (!firstUse) {
    firstUse = new Date().toISOString();
    localStorage.setItem("streakman_first_use", firstUse);
  }

  const first = new Date(firstUse);
  const today = new Date();
  first.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((today.getTime() - first.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function hasThreeMissedDays(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  if (taskList.length === 0) return false;

  const indices = [5, 4, 3];
  return indices.every((historyIndex) =>
    taskList.every((task) => !Boolean(task?.completionHistory?.[historyIndex]))
  );
}

export default function CityPage() {
  const [tasks, setTasks] = useState(() => readTasks());
  const [xp, setXp] = useState(() => readXP());
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [toast, setToast] = useState("");
  const [bestEverStreak, setBestEverStreak] = useState(() => readBestEverStreak());
  const [showNewBest, setShowNewBest] = useState(false);
  const [usageDayCount] = useState(() => getUsageDayCount());
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

      const currentStreak = getCurrentStreak(nextTasks);
      const storedBest = readBestEverStreak();
      if (currentStreak > storedBest) {
        localStorage.setItem("streakman_best_ever_streak", String(currentStreak));
        setBestEverStreak(currentStreak);
        setShowNewBest(true);
        streakMilestone();
      } else {
        setBestEverStreak(storedBest);
        setShowNewBest(false);
      }
    };

    checkOvernightChanges(readTasks());
    const bootstrap = window.setTimeout(() => load(), 0);

    const onTasks = () => load();
    const onXp = () => setXp(readXP());

    window.addEventListener("tasksUpdated", onTasks);
    window.addEventListener("xpUpdated", onXp);

    return () => {
      window.clearTimeout(bootstrap);
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
  const basePopulation = getPopulation(xp);
  const completedToday = tasks.filter((task) => task.completedToday).length;
  const incompleteToday = tasks.filter((task) => !task.completedToday).length;
  const displayPopulation = Math.max(0, basePopulation + completedToday * 5 - incompleteToday * 2);
  const level = getLevelFromXP(xp).level;
  const currentStreak = getCurrentStreak(tasks);
  const bestStreak = getBestStreak(tasks);
  const recentMissed = hasThreeMissedDays(tasks);
  const cityMood = (() => {
    if (scoreData.totalScore >= 75 && completedToday > 0 && !recentMissed) {
      return { emoji: "\u{1F31F}", label: "Flourishing", colorClass: "text-emerald-300" };
    }
    if (scoreData.totalScore < 25 || recentMissed) {
      return { emoji: "\u{1F198}", label: "Buildings going dark", colorClass: "text-rose-300" };
    }
    if (scoreData.totalScore >= 50) {
      return { emoji: "\u{1F60A}", label: "Doing well", colorClass: "text-teal-300" };
    }
    return { emoji: "\u{1F61F}", label: "Needs attention", colorClass: "text-amber-300" };
  })();
  const showMood = usageDayCount > 3;
  const ghostGap = Math.max(0, bestEverStreak - currentStreak);

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
            <p className="mt-1 text-sm text-zinc-400">Population {displayPopulation}</p>
            {showNewBest ? (
              <p className="mt-1 text-xs text-amber-300">
                <span className="emoji-premium emoji-premium-inline emoji-premium-amber mr-1">
                  {"\u{1F525}"}
                </span>
                New personal best!
              </p>
            ) : currentStreak > 0 && currentStreak < bestEverStreak ? (
              <p className="mt-1 text-xs text-zinc-500">
                <span className="emoji-premium emoji-premium-inline emoji-premium-muted mr-1">
                  {"\u{1F47B}"}
                </span>
                Your best: {bestEverStreak} days - {ghostGap} days away
              </p>
            ) : null}
          </header>

          <CityStats
            weather={weather}
            population={displayPopulation}
            level={level}
            totalScore={scoreData.totalScore}
            cityEvent={cityEvent}
            mood={showMood ? cityMood : null}
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
                      className="glass-card city-vacant-lot flex min-h-[108px] items-center justify-center rounded-2xl"
                    >
                      <span className="emoji-premium emoji-premium-icon emoji-premium-muted text-2xl">
                        {"\u{1F3DA}\uFE0F"}
                      </span>
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
                          <span className="emoji-premium emoji-premium-inline emoji-premium-teal mr-1">
                            {neighborhood.emoji}
                          </span>
                          {neighborhood.name}
                        </h3>
                        <span className="text-xs text-emerald-300">Unlocked</span>
                      </div>
                      <p className="text-xs text-zinc-400">{neighborhood.description}</p>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: neighborhood.slots }).map((_, index) => (
                          <span
                            key={`${neighborhood.id}-slot-${index}`}
                            className="emoji-premium emoji-premium-inline emoji-premium-muted text-xl opacity-60"
                          >
                            {"\u{1F3DA}\uFE0F"}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-zinc-100">
                          <span className="emoji-premium emoji-premium-inline emoji-premium-muted mr-1">
                            {"\u{1F512}"}
                          </span>
                          {neighborhood.name}
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
