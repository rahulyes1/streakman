"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BadgeDisplay from "@/components/BadgeDisplay";
import BottomNav from "@/components/BottomNav";
import ComebackScreen from "@/components/ComebackScreen";
import DailyMissionCard from "@/components/DailyMissionCard";
import DailySpin from "@/components/DailySpin";
import MilestoneCelebration from "@/components/MilestoneCelebration";
import StreakShieldCard from "@/components/StreakShieldCard";
import { checkMilestones } from "@/lib/milestones";
import { setRecoveryMissionForToday } from "@/lib/dailyMission";
import { initializeDailyReset } from "@/lib/dailyReset";
import { calculateScore } from "@/lib/scoring";

function gradeTone(grade) {
  if (grade.startsWith("A")) return "text-emerald-300";
  if (grade.startsWith("B")) return "text-teal-200";
  if (grade.startsWith("C")) return "text-amber-300";
  return "text-rose-300";
}

function getDaysSince(lastDateString, todayDate) {
  if (!lastDateString) return 0;

  const lastDate = new Date(lastDateString);
  if (Number.isNaN(lastDate.getTime())) return 0;

  const today = new Date(todayDate);
  lastDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diff = today.getTime() - lastDate.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function getInitialComebackState() {
  if (typeof window === "undefined") {
    return { show: false, daysSince: 0 };
  }

  const today = new Date();
  const todayString = today.toDateString();
  const lastActive = localStorage.getItem("streakman_last_active");
  const daysSince = getDaysSince(lastActive, today);

  const storedTasks = localStorage.getItem("streakman_tasks");
  let parsedTasks = [];
  if (storedTasks) {
    try {
      const parsed = JSON.parse(storedTasks);
      if (Array.isArray(parsed)) parsedTasks = parsed;
    } catch {
      parsedTasks = [];
    }
  }

  const shouldShow = daysSince >= 3 && parsedTasks.length > 0;
  if (shouldShow) {
    setRecoveryMissionForToday();
  }

  localStorage.setItem("streakman_last_active", todayString);
  return { show: shouldShow, daysSince };
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

export default function Home() {
  const [comebackState, setComebackState] = useState(getInitialComebackState);
  const [tasks, setTasks] = useState(readStoredTasks);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [currentHour, setCurrentHour] = useState(null);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [freezeTokens, setFreezeTokens] = useState(0);
  const [milestoneToCelebrate, setMilestoneToCelebrate] = useState(() =>
    checkMilestones(readStoredTasks())
  );
  const showComeback = comebackState.show;
  const comebackDaysSince = comebackState.daysSince;
  const router = useRouter();

  useEffect(() => {
    const hasVisitedHome = sessionStorage.getItem("visited_home");
    if (!hasVisitedHome) {
      sessionStorage.setItem("visited_home", "true");
      router.push("/tasks");
    }
  }, [router]);

  useEffect(() => {
    initializeDailyReset();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      const parsed = readStoredTasks();
      setTasks(parsed);
      setMilestoneToCelebrate(checkMilestones(parsed));
    };

    window.addEventListener("tasksUpdated", handleUpdate);
    return () => window.removeEventListener("tasksUpdated", handleUpdate);
  }, []);

  const completedToday = tasks.filter((task) => task.completedToday).length;
  const currentStreak = Math.max(...tasks.map((task) => task.streak || 0), 0);
  const scoreData = tasks.length
    ? calculateScore(tasks)
    : {
        totalScore: 0,
        grade: "",
        breakdown: null,
      };
  const totalScore = scoreData.totalScore;
  const grade = scoreData.grade;
  const scoreBreakdown = scoreData.breakdown;

  useEffect(() => {
    const loadXP = () => {
      const saved = localStorage.getItem("streakman_xp");
      const xp = parseInt(saved || "0", 10);
      setTotalXP(xp);
      setLevel(Math.floor(xp / 100) + 1);
    };

    loadXP();

    const handleUpdate = () => loadXP();
    window.addEventListener("xpUpdated", handleUpdate);
    return () => window.removeEventListener("xpUpdated", handleUpdate);
  }, []);

  useEffect(() => {
    const loadTokens = () => {
      const tokens = parseInt(localStorage.getItem("streakman_freeze_tokens") || "0", 10);
      setFreezeTokens(tokens);
    };

    loadTokens();

    const handleUpdate = () => loadTokens();
    window.addEventListener("tokensUpdated", handleUpdate);
    return () => window.removeEventListener("tokensUpdated", handleUpdate);
  }, []);

  useEffect(() => {
    const updateHour = () => setCurrentHour(new Date().getHours());
    const bootstrapTimer = window.setTimeout(updateHour, 0);
    const timer = window.setInterval(updateHour, 60000);

    return () => {
      window.clearTimeout(bootstrapTimer);
      window.clearInterval(timer);
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning \u{1F44B}";
    if (hour < 18) return "Good Afternoon \u{1F44B}";
    return "Good Evening \u{1F44B}";
  };

  const getMotivation = () => {
    if (completedToday === 0) {
      return "No tasks completed yet today. Let\'s start your first win.";
    }
    if (completedToday === 1) {
      return "1 task completed today. Keep moving.";
    }
    return `${completedToday} tasks completed today. You\'re in rhythm.`;
  };

  const getImprovementSuggestions = () => {
    if (!scoreBreakdown) return [];

    const suggestions = [];

    if (scoreBreakdown.completionRate < 30) {
      suggestions.push({
        area: "Daily Consistency",
        current: scoreBreakdown.completionRate,
        max: 40,
        tip: "Complete tasks on more days this week to boost completion rate.",
      });
    }

    if (scoreBreakdown.streakStrength < 25) {
      suggestions.push({
        area: "Streak Building",
        current: scoreBreakdown.streakStrength,
        max: 35,
        tip: "Build longer streaks by completing tasks on back-to-back days.",
      });
    }

    if (scoreBreakdown.weeklyConsistency < 10) {
      suggestions.push({
        area: "Weekly Activity",
        current: scoreBreakdown.weeklyConsistency,
        max: 15,
        tip: "Try to stay active through all days of the week.",
      });
    }

    if (scoreBreakdown.improvementTrend < 7) {
      suggestions.push({
        area: "Task Momentum",
        current: scoreBreakdown.improvementTrend,
        max: 10,
        tip: "Keep more tasks active with current streaks to improve trend.",
      });
    }

    return suggestions;
  };

  const improvementSuggestions = getImprovementSuggestions();
  const breatheClass =
    completedToday >= tasks.length && tasks.length > 0
      ? ""
      : currentHour >= 21
      ? "streak-breathe-fast"
      : "streak-breathe-slow";

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 pb-28 pt-6 text-zinc-100">
        <div className="mesh-leak mesh-leak-teal" />
        <div className="mesh-leak mesh-leak-purple" />

        <div className="relative z-10 mx-auto max-w-2xl">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Marks</h1>
            <p className="mt-1 text-sm text-zinc-400">{getGreeting()}</p>
          </header>

          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-xs text-zinc-400">Streak</p>
              <p className={`mt-1 text-2xl font-bold ${breatheClass}`}>{currentStreak}</p>
              <p className="text-xs text-amber-300">{"\u{1F525}"}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowScoreDetails((current) => !current)}
              className="glass-card rounded-2xl p-3 text-center transition-spring hover:-translate-y-0.5"
            >
              <p className="text-xs text-zinc-400">Score</p>
              <p className="mt-1 text-2xl font-bold">{totalScore}</p>
              <p className={`text-xs ${gradeTone(grade)}`}>{grade || "-"}</p>
            </button>
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-xs text-zinc-400">Level</p>
              <p className="mt-1 text-2xl font-bold">{level}</p>
              <p className="text-xs text-purple-200">{"\u2B50"}</p>
            </div>
            <div className="glass-card rounded-2xl p-3 text-center">
              <p className="text-xs text-zinc-400">Tokens</p>
              <p className="mt-1 text-2xl font-bold">{freezeTokens}</p>
              <p className="text-xs text-teal-200">{"\u{1F48E}"}</p>
            </div>
          </div>

          {showScoreDetails && scoreBreakdown && (
            <section className="glass-card mb-6 rounded-3xl p-5 animate-slideDown" data-active="true">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Score Breakdown</h2>
                <span className="text-2xl font-bold text-teal-200">{totalScore}/100</span>
              </div>

              <div className="space-y-3">
                <MetricLine
                  label="Completion Rate"
                  value={scoreBreakdown.completionRate}
                  max={40}
                  fillClass="from-teal-300 to-cyan-300"
                />
                <MetricLine
                  label="Streak Strength"
                  value={scoreBreakdown.streakStrength}
                  max={35}
                  fillClass="from-amber-300 to-rose-300"
                />
                <MetricLine
                  label="Weekly Consistency"
                  value={scoreBreakdown.weeklyConsistency}
                  max={15}
                  fillClass="from-emerald-300 to-teal-300"
                />
                <MetricLine
                  label="Improvement Trend"
                  value={scoreBreakdown.improvementTrend}
                  max={10}
                  fillClass="from-purple-300 to-fuchsia-300"
                />
              </div>

              {improvementSuggestions.length > 0 ? (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-teal-200">How to Improve</h3>
                  <div className="space-y-2">
                    {improvementSuggestions.map((suggestion) => (
                      <div key={suggestion.area} className="rounded-xl bg-white/[0.03] p-3">
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="font-semibold text-zinc-100">{suggestion.area}</span>
                          <span className="text-zinc-400">
                            {suggestion.current}/{suggestion.max}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">{suggestion.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 border-t border-white/10 pt-4 text-center">
                  <p className="text-sm text-emerald-300">Perfect score range. Keep this momentum.</p>
                </div>
              )}
            </section>
          )}

          <DailyMissionCard />
          <StreakShieldCard />

          <div className="glass-card mb-6 rounded-2xl border border-teal-300/30 bg-gradient-to-r from-teal-300/10 to-purple-300/10 p-5 text-center">
            <p className="text-base font-medium">{getMotivation()}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-zinc-400">Active Tasks</span>
                <span className="text-xl">{"\u{1F4DD}"}</span>
              </div>
              <p className="text-3xl font-bold">{tasks.length}</p>
              <p className="mt-1 text-xs text-zinc-500">Total tasks tracked</p>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-zinc-400">XP Earned</span>
                <span className="text-xl">{"\u2B50"}</span>
              </div>
              <p className="text-3xl font-bold">{totalXP}</p>
              <p className="mt-1 text-xs text-zinc-500">Lifetime XP</p>
            </div>
          </div>

          <div className="mb-6">
            <DailySpin />
          </div>

          <section className="glass-card rounded-3xl p-5">
            <h3 className="mb-3 text-lg font-semibold">Recent Badges</h3>
            <BadgeDisplay compact={true} />
          </section>
        </div>
      </div>

      {showComeback && (
        <ComebackScreen
          xp={totalXP}
          level={level}
          daysSince={comebackDaysSince}
          onClose={() =>
            setComebackState((current) => ({
              ...current,
              show: false,
            }))
          }
        />
      )}

      {milestoneToCelebrate && (
        <MilestoneCelebration
          milestone={milestoneToCelebrate}
          onClose={() => setMilestoneToCelebrate(checkMilestones(tasks))}
        />
      )}

      <BottomNav />
    </>
  );
}

function MetricLine({ label, value, max, fillClass }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-400">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${fillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
