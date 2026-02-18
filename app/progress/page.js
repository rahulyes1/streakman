"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import FloatingAddButton from "@/components/FloatingAddButton";
import ProgressBar from "@/components/ProgressBar";
import { initializeDailyReset } from "@/lib/dailyReset";
import { calculateScore } from "@/lib/scoring";

const STATUS_CONFIG = {
  exceptional: { emoji: "\u{1F525}", cellClass: "bg-amber-300/65 text-amber-950", label: "Exceptional" },
  perfect: { emoji: "\u{1F7E2}", cellClass: "bg-emerald-300/65 text-emerald-950", label: "Perfect" },
  struggled: { emoji: "\u{1F7E1}", cellClass: "bg-yellow-300/70 text-yellow-950", label: "Struggled" },
  missed: { emoji: "\u{1F534}", cellClass: "bg-rose-300/70 text-rose-950", label: "Missed" },
  upcoming: { emoji: "\u26AA", cellClass: "bg-white/[0.08] text-zinc-500", label: "Inactive" },
};

function gradeTone(grade) {
  if (grade.startsWith("A")) return "text-emerald-300";
  if (grade.startsWith("B")) return "text-teal-200";
  if (grade.startsWith("C")) return "text-amber-300";
  return "text-rose-300";
}

export default function Progress() {
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [firstUseDate] = useState(() => {
    if (typeof window === "undefined") return null;

    let savedFirstUse = localStorage.getItem("streakman_first_use");
    if (!savedFirstUse) {
      savedFirstUse = new Date().toISOString();
      localStorage.setItem("streakman_first_use", savedFirstUse);
    }

    return new Date(savedFirstUse);
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
      const saved = localStorage.getItem("streakman_tasks");
      if (saved) {
        const parsedTasks = JSON.parse(saved);
        setTasks(parsedTasks);
        setScoreData(calculateScore(parsedTasks));
        return;
      }

      setTasks([]);
      setScoreData({
        totalScore: 0,
        breakdown: {
          completionRate: 0,
          streakStrength: 0,
          weeklyConsistency: 0,
          improvementTrend: 0,
        },
        grade: "Needs Work",
      });
    };

    loadTasks();

    const handleUpdate = () => loadTasks();
    window.addEventListener("tasksUpdated", handleUpdate);
    return () => window.removeEventListener("tasksUpdated", handleUpdate);
  }, []);

  const getMomentumData = () => {
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
  };

  const momentumData = getMomentumData();
  const completedToday = tasks.filter((task) => task.completedToday).length;
  const gradeClass = gradeTone(scoreData.grade);
  const bestStreak = Math.max(...tasks.map((task) => task.bestStreak || 0), 0);

  const momentumSummary = momentumData.reduce(
    (summary, day) => {
      if (day.status === "upcoming") return summary;
      return { ...summary, [day.status]: summary[day.status] + 1 };
    },
    { exceptional: 0, perfect: 0, struggled: 0, missed: 0 }
  );

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "report", label: "21-Day Report" },
    { id: "stats", label: "Stats" },
    { id: "vault", label: "Vault" },
  ];

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 pb-28 pt-6 text-zinc-100">
        <div className="mesh-leak mesh-leak-teal" />
        <div className="mesh-leak mesh-leak-purple" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
            <p className="mt-1 text-sm text-zinc-400">Your consistency trends and scoring depth.</p>
          </header>

          <section className="mb-5 grid grid-cols-3 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-400">Total Score</p>
              <p className="mt-1 text-2xl font-bold">{scoreData.totalScore}</p>
              <p className="text-xs text-zinc-500">/100</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-400">Grade</p>
              <p className={`mt-1 text-2xl font-bold ${gradeClass}`}>{scoreData.grade}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center">
              <p className="text-xs text-zinc-400">Today</p>
              <p className="mt-1 text-2xl font-bold">{completedToday}</p>
              <p className="text-xs text-zinc-500">/{tasks.length} tasks</p>
            </div>
          </section>

          <div className="glass-card mb-5 overflow-x-auto rounded-2xl">
            <div className="flex min-w-[440px]">
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

                  <div className="mt-6 rounded-2xl border border-teal-300/30 bg-gradient-to-r from-teal-300/10 to-purple-300/10 p-5 text-center">
                    <p className="text-sm text-zinc-400">Overall Score</p>
                    <p className="mt-1 text-5xl font-bold">{scoreData.totalScore}/100</p>
                    <p className={`text-xl font-semibold ${gradeClass}`}>{scoreData.grade}</p>
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
                            {config.emoji}
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

                  <div className="mt-4 flex flex-wrap gap-3 text-xs">
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <div key={key} className="flex items-center gap-1 text-zinc-400">
                        <span>{config.emoji}</span>
                        <span>{config.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-purple-300/30 bg-gradient-to-r from-purple-300/10 to-teal-300/10 p-4">
                  <p className="text-sm text-zinc-400">Current Combo</p>
                  <p className="mt-1 text-lg font-bold">{bestStreak} day best streak</p>
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <SummaryCard label="Tracked Tasks" value={tasks.length} />
                <SummaryCard label="Completed Today" value={completedToday} />
                <SummaryCard label="Best Streak" value={bestStreak} />
                <SummaryCard label="Completion Rate" value={`${Math.round((completedToday / (tasks.length || 1)) * 100)}%`} />
                <SummaryCard label="Grade" value={scoreData.grade} tone={gradeClass} />
                <SummaryCard label="Score" value={`${scoreData.totalScore}/100`} />
              </div>
            )}

            {activeTab === "vault" && (
              <div className="flex min-h-[320px] items-center justify-center text-zinc-500">
                Deeper analytics vault is coming soon.
              </div>
            )}
          </section>
        </div>
      </div>

      <FloatingAddButton onClick={() => router.push("/tasks?add=true")} />
      <BottomNav />
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
