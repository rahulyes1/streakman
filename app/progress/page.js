"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BadgeDisplay from "@/components/BadgeDisplay";
import BottomNav from "@/components/BottomNav";
import DailyForge from "@/components/DailyForge";
import DailyMissionCard from "@/components/DailyMissionCard";
import MilestoneCelebration from "@/components/MilestoneCelebration";
import ProgressBar from "@/components/ProgressBar";
import StreakShieldCard from "@/components/StreakShieldCard";
import XPGuide from "@/components/XPGuide";
import { initializeDailyReset } from "@/lib/dailyReset";
import { streakMilestone } from "@/lib/haptics";
import { checkMilestones } from "@/lib/milestones";
import { calculateScore } from "@/lib/scoring";
import {
  LEVEL_THRESHOLDS,
  getComboMultiplier,
  getLevelFromXP,
  getTimeOfDayMultiplier,
} from "@/lib/xpSystem";

const STATUS_CONFIG = {
  exceptional: { emoji: "\u{1F525}", cellClass: "bg-amber-300/65 text-amber-950", label: "Exceptional" },
  perfect: { emoji: "\u{1F7E2}", cellClass: "bg-emerald-300/65 text-emerald-950", label: "Perfect" },
  struggled: { emoji: "\u{1F7E1}", cellClass: "bg-yellow-300/70 text-yellow-950", label: "Struggled" },
  missed: { emoji: "\u{1F534}", cellClass: "bg-rose-300/70 text-rose-950", label: "Missed" },
  upcoming: { emoji: "\u26AA", cellClass: "bg-white/[0.08] text-zinc-500", label: "Inactive" },
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", emoji: "\u{1F44B}" };
  if (hour < 18) return { text: "Good Afternoon", emoji: "\u{1F44B}" };
  return { text: "Good Evening", emoji: "\u{1F44B}" };
}

function getWeatherEmoji(totalScore) {
  if (totalScore >= 75) return "\u2600\uFE0F";
  if (totalScore >= 50) return "\u26C5";
  if (totalScore >= 25) return "\u2601\uFE0F";
  return "\u{1F327}\uFE0F";
}

function getDayCount(firstUseDate) {
  if (!firstUseDate) return 1;
  const start = new Date(firstUseDate);
  const today = new Date();
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(1, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

function readStoredTasks() {
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

function readStoredEvent() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("streakman_city_event");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function readBestEverStreak() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("streakman_best_ever_streak") || "0", 10);
}

function getCurrentStreak(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  return Math.max(...taskList.map((task) => Number(task?.streak || 0)), 0);
}

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showXPGuide, setShowXPGuide] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [totalXP, setTotalXP] = useState(0);
  const [freezeTokens, setFreezeTokens] = useState(0);
  const [cityEvent, setCityEvent] = useState(null);
  const [milestoneToCelebrate, setMilestoneToCelebrate] = useState(null);
  const [bestEverStreak, setBestEverStreak] = useState(() => readBestEverStreak());
  const [showNewBest, setShowNewBest] = useState(false);
  const [firstUseDate] = useState(() => {
    if (typeof window === "undefined") return null;
    let saved = localStorage.getItem("streakman_first_use");
    if (!saved) {
      saved = new Date().toISOString();
      localStorage.setItem("streakman_first_use", saved);
    }
    return saved;
  });
  const [scoreData, setScoreData] = useState({
    totalScore: 0,
    breakdown: {
      completionRate: 0,
      streakStrength: 0,
      weeklyConsistency: 0,
      improvementTrend: 0,
    },
    grade: "Needs Work",
  });
  const router = useRouter();

  useEffect(() => {
    initializeDailyReset();
  }, []);

  useEffect(() => {
    const loadTasks = () => {
      const parsed = readStoredTasks();
      setTasks(parsed);
      setScoreData(calculateScore(parsed));
      setMilestoneToCelebrate(checkMilestones(parsed));

      const currentStreak = getCurrentStreak(parsed);
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

    loadTasks();

    const onTasks = () => loadTasks();
    window.addEventListener("tasksUpdated", onTasks);
    return () => window.removeEventListener("tasksUpdated", onTasks);
  }, []);

  useEffect(() => {
    const loadXP = () => {
      const nextXP = parseInt(localStorage.getItem("streakman_xp") || "0", 10);
      setTotalXP(nextXP);
    };

    loadXP();

    const onXP = () => loadXP();
    window.addEventListener("xpUpdated", onXP);
    return () => window.removeEventListener("xpUpdated", onXP);
  }, []);

  useEffect(() => {
    const loadTokens = () => {
      setFreezeTokens(parseInt(localStorage.getItem("streakman_freeze_tokens") || "0", 10));
    };

    loadTokens();

    const onTokens = () => loadTokens();
    window.addEventListener("tokensUpdated", onTokens);
    return () => window.removeEventListener("tokensUpdated", onTokens);
  }, []);

  useEffect(() => {
    const loadEvent = () => setCityEvent(readStoredEvent());
    loadEvent();
    const onTasks = () => loadEvent();
    window.addEventListener("tasksUpdated", onTasks);
    return () => window.removeEventListener("tasksUpdated", onTasks);
  }, []);

  const levelInfo = getLevelFromXP(totalXP);
  const dayCount = getDayCount(firstUseDate);
  const completedToday = tasks.filter((task) => task.completedToday).length;
  const tasksRemaining = Math.max(0, tasks.length - completedToday);
  const currentStreak = Math.max(...tasks.map((task) => task.streak || 0), 0);
  const bestStreak = Math.max(...tasks.map((task) => task.bestStreak || 0), 0);
  const ghostGap = Math.max(0, bestEverStreak - currentStreak);
  const comboMultiplier = getComboMultiplier(currentStreak);
  const timeMultiplier = getTimeOfDayMultiplier();
  const nextLevelThreshold =
    levelInfo.next != null
      ? LEVEL_THRESHOLDS.find((entry) => entry.level === levelInfo.next)?.min || levelInfo.current
      : levelInfo.current;
  const weatherEmoji = getWeatherEmoji(scoreData.totalScore);
  const greeting = getGreeting();
  const hour = new Date().getHours();
  const breatheClass =
    completedToday >= tasks.length && tasks.length > 0
      ? ""
      : hour >= 21
      ? "streak-breathe-fast"
      : "streak-breathe-slow";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "report", label: "Report" },
    { id: "stats", label: "Stats" },
    { id: "forge", label: "Forge" },
    { id: "badges", label: "Badges" },
    { id: "guide", label: "Guide" },
  ];

  const momentumData = useMemo(() => {
    if (!firstUseDate) return [];

    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstUse = new Date(firstUseDate);
    firstUse.setHours(0, 0, 0, 0);

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = 20; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const dayEntry = {
        day: dayNames[date.getDay()],
        date: `${monthNames[date.getMonth()]} ${date.getDate()}`,
        score: null,
        status: "upcoming",
      };

      if (date < firstUse) {
        data.push(dayEntry);
        continue;
      }

      let completedCount = 0;

      tasks.forEach((task) => {
        if (!task.completionHistory || task.completionHistory.length === 0) return;
        const daysDiff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff < 7 && task.completionHistory[6 - daysDiff]) {
          completedCount += 1;
        }
      });

      const totalTasks = tasks.length || 1;
      const completionPercentage = (completedCount / totalTasks) * 100;

      if (completedCount === 0) {
        dayEntry.status = "missed";
        dayEntry.score = 0;
      } else if (completionPercentage >= 90) {
        dayEntry.status = "exceptional";
        dayEntry.score = Math.round(completionPercentage);
      } else if (completionPercentage >= 70) {
        dayEntry.status = "perfect";
        dayEntry.score = Math.round(completionPercentage);
      } else if (completionPercentage >= 40) {
        dayEntry.status = "struggled";
        dayEntry.score = Math.round(completionPercentage);
      } else {
        dayEntry.status = "missed";
        dayEntry.score = Math.round(completionPercentage);
      }

      data.push(dayEntry);
    }

    return data;
  }, [firstUseDate, tasks]);

  const momentumSummary = momentumData.reduce(
    (summary, day) => {
      if (day.status === "upcoming") return summary;
      return { ...summary, [day.status]: summary[day.status] + 1 };
    },
    { exceptional: 0, perfect: 0, struggled: 0, missed: 0 }
  );

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 pb-28 pt-6 text-zinc-100">
        <div className="mesh-leak mesh-leak-teal" />
        <div className="mesh-leak mesh-leak-purple" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <header className="mb-5">
            <h1 className="text-3xl font-bold tracking-tight">
              {greeting.text}{" "}
              <span className="emoji-premium emoji-premium-inline emoji-premium-teal">{greeting.emoji}</span>
            </h1>
            <p className="mt-1 text-sm text-zinc-400">Day {dayCount} of your streak</p>
          </header>

          <section className="glass-card mb-5 rounded-3xl p-5" data-active="true">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-300">Level {levelInfo.level}</span>
              <span className="text-zinc-400">{levelInfo.current} XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-teal-300 to-purple-300 transition-spring"
                style={{ width: `${levelInfo.percentage}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-2">
              <p className="text-xs text-zinc-400">
                {levelInfo.next ? `${levelInfo.xpToNext} XP to Level ${levelInfo.next}` : "Max level reached"}
              </p>
              <button
                type="button"
                onClick={() => setShowXPGuide(true)}
                className="flex h-4 w-4 items-center justify-center rounded-full border border-white/[0.15] text-xs text-zinc-400 transition-spring hover:border-teal-300/40 hover:text-teal-200"
                aria-label="Open XP guide"
              >
                ?
              </button>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {levelInfo.current} / {nextLevelThreshold} XP
            </p>
            {(comboMultiplier > 1 || timeMultiplier.multiplier !== 1) && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {comboMultiplier > 1 && (
                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-xs font-semibold text-amber-300">
                    {"\u{1F525}"} {comboMultiplier.toFixed(1)}x Combo
                  </span>
                )}
                {timeMultiplier.multiplier === 1.5 && (
                  <span className="rounded-full border border-teal-300/30 bg-teal-300/10 px-2 py-1 text-xs font-semibold text-teal-300">
                    {"\u{1F305}"} +50% XP
                  </span>
                )}
                {timeMultiplier.multiplier === 1.2 && (
                  <span className="rounded-full border border-teal-300/30 bg-teal-300/10 px-2 py-1 text-xs font-semibold text-teal-300">
                    {"\u2600\uFE0F"} +20% XP
                  </span>
                )}
                {timeMultiplier.multiplier === 0.9 && (
                  <span className="rounded-full border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-400">
                    {"\u{1F319}"} -10% XP
                  </span>
                )}
              </div>
            )}
          </section>

          <section className="mb-5 grid grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-400">Streak</p>
              <p className={`mt-1 text-2xl font-bold ${breatheClass}`}>{currentStreak}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-400">Freeze Tokens</p>
              <p className="mt-1 text-2xl font-bold">{freezeTokens}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-400">Score</p>
              <p className="mt-1 text-2xl font-bold">{scoreData.totalScore}</p>
            </div>
          </section>

          <div className="mb-5 rounded-3xl bg-gradient-to-r from-teal-300/40 to-purple-300/40 p-[1px]">
            <section className="glass-card rounded-3xl p-5" data-active="true">
              <div className="mb-3 flex items-center gap-2">
                <span className="emoji-premium emoji-premium-icon emoji-premium-muted text-2xl">
                  {weatherEmoji}
                </span>
                <h2 className="text-lg font-semibold">Today in your city</h2>
              </div>
              <p className="text-sm text-zinc-300">
                {cityEvent?.title ? cityEvent.title : "No city event active right now."}
              </p>
              <p className="mt-2 text-sm text-zinc-400">{tasksRemaining} tasks remaining today</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/tasks")}
                  className="glass-card min-h-11 rounded-xl px-3 text-sm font-semibold text-zinc-100"
                >
                  Start Tasks
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/city")}
                  className="glass-card min-h-11 rounded-xl px-3 text-sm font-semibold text-zinc-100"
                >
                  Open City
                </button>
              </div>
            </section>
          </div>

          <DailyMissionCard />
          <StreakShieldCard />

          <div className="mb-5">
            <DailyForge />
          </div>

          <section className="glass-card mb-5 rounded-3xl p-5">
            <h2 className="mb-3 text-lg font-semibold">Recent Badges</h2>
            <BadgeDisplay compact={true} />
          </section>

          <div className="glass-card mb-5 overflow-x-auto rounded-2xl">
            <div className="flex min-w-[560px]">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive ? "text-teal-200" : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    {tab.label}
                    {isActive && <span className="absolute inset-x-6 bottom-0 h-0.5 rounded-full bg-teal-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="glass-card min-h-[420px] rounded-3xl p-5" data-active="true">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="mb-4 text-lg font-semibold">Score Breakdown</h2>
                  <div className="space-y-4">
                    <ProgressBar
                      label="Completion Rate"
                      value={scoreData.breakdown.completionRate}
                      max={40}
                      color="bg-gradient-to-r from-teal-300 to-cyan-300"
                    />
                    <ProgressBar
                      label="Streak Strength"
                      value={scoreData.breakdown.streakStrength}
                      max={35}
                      color="bg-gradient-to-r from-amber-300 to-rose-300"
                    />
                    <ProgressBar
                      label="Weekly Consistency"
                      value={scoreData.breakdown.weeklyConsistency}
                      max={15}
                      color="bg-gradient-to-r from-emerald-300 to-teal-300"
                    />
                    <ProgressBar
                      label="Improvement Trend"
                      value={scoreData.breakdown.improvementTrend}
                      max={10}
                      color="bg-gradient-to-r from-purple-300 to-fuchsia-300"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="mb-4 text-lg font-semibold">Momentum Calendar</h2>
                  <div className="grid grid-cols-7 gap-2">
                    {momentumData.map((day, idx) => {
                      const config = STATUS_CONFIG[day.status];
                      return (
                        <div
                          key={`${day.date}-${day.day}`}
                          className="relative"
                          onMouseEnter={() => setHoveredDay(idx)}
                          onMouseLeave={() => setHoveredDay(null)}
                        >
                          <div
                            className={`flex aspect-square cursor-pointer items-center justify-center rounded-lg text-lg transition-spring hover:-translate-y-0.5 ${config.cellClass}`}
                          >
                            <span className="emoji-premium emoji-premium-inline">{config.emoji}</span>
                          </div>

                          {hoveredDay === idx && (
                            <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 p-2 text-xs whitespace-nowrap">
                              <p className="font-semibold text-zinc-100">{day.date}</p>
                              {day.score !== null ? (
                                <p className="text-zinc-400">Score: {day.score}/100</p>
                              ) : (
                                <p className="text-zinc-500">{config.label}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "report" && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Last 21 Days</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <SummaryCard label="Exceptional" value={momentumSummary.exceptional} tone="text-amber-300" />
                  <SummaryCard label="Perfect" value={momentumSummary.perfect} tone="text-emerald-300" />
                  <SummaryCard label="Struggled" value={momentumSummary.struggled} tone="text-yellow-300" />
                  <SummaryCard label="Missed" value={momentumSummary.missed} tone="text-rose-300" />
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <SummaryCard label="Tracked Tasks" value={tasks.length} />
                  <SummaryCard label="Completed Today" value={completedToday} />
                  <SummaryCard label="Best Streak" value={bestStreak} />
                  <SummaryCard
                    label="Completion Rate"
                    value={`${Math.round((completedToday / (tasks.length || 1)) * 100)}%`}
                  />
                  <SummaryCard label="Grade" value={scoreData.grade} />
                  <SummaryCard label="Score" value={`${scoreData.totalScore}/100`} />
                </div>

                {showNewBest ? (
                  <p className="mt-3 text-sm text-amber-300">
                    <span className="emoji-premium emoji-premium-inline emoji-premium-amber mr-1">{"\u{1F525}"}</span>
                    New personal best!
                  </p>
                ) : currentStreak > 0 && currentStreak < bestEverStreak ? (
                  <p className="mt-3 text-sm text-zinc-500">
                    <span className="emoji-premium emoji-premium-inline emoji-premium-muted mr-1">{"\u{1F47B}"}</span>
                    Your best: {bestEverStreak} days - {ghostGap} days away
                  </p>
                ) : null}
              </div>
            )}

            {activeTab === "forge" && (
              <div className="mx-auto max-w-xl">
                <DailyForge />
              </div>
            )}

            {activeTab === "badges" && <BadgeDisplay compact={false} />}

            {activeTab === "guide" && (
              <div className="max-h-[56vh] overflow-y-auto pr-1">
                <XPGuide inline={true} currentLevel={levelInfo.level} tasks={tasks} />
              </div>
            )}
          </section>
        </div>
      </div>

      <BottomNav />

      {milestoneToCelebrate && (
        <MilestoneCelebration
          milestone={milestoneToCelebrate}
          onClose={() => setMilestoneToCelebrate(checkMilestones(tasks))}
        />
      )}

      <XPGuide
        isOpen={showXPGuide}
        onClose={() => setShowXPGuide(false)}
        currentLevel={levelInfo.level}
        tasks={tasks}
      />
    </>
  );
}

function SummaryCard({ label, value, tone = "text-zinc-100" }) {
  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <p className="text-xs text-zinc-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

