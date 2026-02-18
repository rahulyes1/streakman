"use client";

import { useEffect, useState } from "react";

const BADGES = [
  {
    id: "first_streak",
    emoji: "\u{1F525}",
    name: "First Flame",
    description: "Complete your first streak day",
    requirement: (stats) => stats.maxStreak >= 1,
  },
  {
    id: "week_warrior",
    emoji: "\u2694\uFE0F",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    requirement: (stats) => stats.maxStreak >= 7,
  },
  {
    id: "fortnight_fighter",
    emoji: "\u{1F6E1}\uFE0F",
    name: "Fortnight Fighter",
    description: "Maintain a 14-day streak",
    requirement: (stats) => stats.maxStreak >= 14,
  },
  {
    id: "monthly_master",
    emoji: "\u{1F451}",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    requirement: (stats) => stats.maxStreak >= 30,
  },
  {
    id: "task_creator",
    emoji: "\u{1F4DD}",
    name: "Task Creator",
    description: "Create 5 different tasks",
    requirement: (stats) => stats.totalTasks >= 5,
  },
  {
    id: "completionist",
    emoji: "\u2705",
    name: "Completionist",
    description: "Complete 50 total tasks",
    requirement: (stats) => stats.totalCompletions >= 50,
  },
  {
    id: "century_club",
    emoji: "\u{1F4AF}",
    name: "Century Club",
    description: "Complete 100 total tasks",
    requirement: (stats) => stats.totalCompletions >= 100,
  },
  {
    id: "xp_novice",
    emoji: "\u2B50",
    name: "XP Novice",
    description: "Earn 500 total XP",
    requirement: (stats) => stats.totalXP >= 500,
  },
  {
    id: "xp_expert",
    emoji: "\u{1F31F}",
    name: "XP Expert",
    description: "Earn 2000 total XP",
    requirement: (stats) => stats.totalXP >= 2000,
  },
  {
    id: "xp_legend",
    emoji: "\u{1F4AB}",
    name: "XP Legend",
    description: "Earn 5000 total XP",
    requirement: (stats) => stats.totalXP >= 5000,
  },
];

export default function BadgeDisplay({ compact = false }) {
  const [stats, setStats] = useState({
    maxStreak: 0,
    totalTasks: 0,
    totalCompletions: 0,
    totalXP: 0,
  });

  useEffect(() => {
    const loadStats = () => {
      const tasks = JSON.parse(localStorage.getItem("streakman_tasks") || "[]");
      const totalXP = parseInt(localStorage.getItem("streakman_xp") || "0", 10);
      const totalCompletions = parseInt(localStorage.getItem("streakman_total_completions") || "0", 10);
      const maxStreak = Math.max(...tasks.map((task) => task.bestStreak || 0), 0);

      setStats({
        maxStreak,
        totalTasks: tasks.length,
        totalCompletions,
        totalXP,
      });
    };

    loadStats();

    const handleUpdate = () => loadStats();
    window.addEventListener("tasksUpdated", handleUpdate);
    window.addEventListener("xpUpdated", handleUpdate);

    return () => {
      window.removeEventListener("tasksUpdated", handleUpdate);
      window.removeEventListener("xpUpdated", handleUpdate);
    };
  }, []);

  const earnedBadges = BADGES.filter((badge) => badge.requirement(stats));
  const nextBadge = BADGES.find((badge) => !badge.requirement(stats));

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {earnedBadges.length === 0 ? (
          <p className="text-sm text-zinc-500">No badges yet. Keep going.</p>
        ) : (
          earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="glass-card flex min-w-[60px] flex-shrink-0 items-center justify-center rounded-lg p-2 text-center"
              title={badge.description}
            >
              <span className="text-2xl">{badge.emoji}</span>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Earned Badges ({earnedBadges.length}/{BADGES.length})
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="glass-card rounded-xl border border-teal-300/30 p-3 text-center transition-spring hover:-translate-y-0.5"
            >
              <span className="mb-2 block text-4xl">{badge.emoji}</span>
              <p className="text-xs font-semibold text-zinc-100">{badge.name}</p>
              <p className="mt-1 text-xs text-zinc-500">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {nextBadge && (
        <div className="glass-card rounded-xl border border-purple-300/30 bg-gradient-to-r from-purple-300/10 to-teal-300/10 p-4">
          <p className="mb-2 text-xs text-zinc-400">Next Badge</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl opacity-60">{nextBadge.emoji}</span>
            <div>
              <p className="font-semibold text-zinc-100">{nextBadge.name}</p>
              <p className="text-sm text-zinc-400">{nextBadge.description}</p>
            </div>
          </div>
        </div>
      )}

      {earnedBadges.length === BADGES.length && (
        <div className="glass-card rounded-xl border border-amber-300/35 bg-gradient-to-r from-amber-300/20 to-rose-300/20 p-4 text-center">
          <p className="mb-2 text-2xl">{"\u{1F3C6}"}</p>
          <p className="text-lg font-bold text-zinc-100">All Badges Earned!</p>
          <p className="mt-1 text-sm text-zinc-400">You&apos;re a true habit master.</p>
        </div>
      )}
    </div>
  );
}
