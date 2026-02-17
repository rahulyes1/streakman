"use client";

import { useState, useEffect } from "react";

const BADGES = [
  {
    id: "first_streak",
    emoji: "🔥",
    name: "First Flame",
    description: "Complete your first streak day",
    requirement: (stats) => stats.maxStreak >= 1,
  },
  {
    id: "week_warrior",
    emoji: "⚔️",
    name: "Week Warrior",
    description: "Maintain a 7-day streak",
    requirement: (stats) => stats.maxStreak >= 7,
  },
  {
    id: "fortnight_fighter",
    emoji: "🛡️",
    name: "Fortnight Fighter",
    description: "Maintain a 14-day streak",
    requirement: (stats) => stats.maxStreak >= 14,
  },
  {
    id: "monthly_master",
    emoji: "👑",
    name: "Monthly Master",
    description: "Maintain a 30-day streak",
    requirement: (stats) => stats.maxStreak >= 30,
  },
  {
    id: "task_creator",
    emoji: "📝",
    name: "Task Creator",
    description: "Create 5 different tasks",
    requirement: (stats) => stats.totalTasks >= 5,
  },
  {
    id: "completionist",
    emoji: "✅",
    name: "Completionist",
    description: "Complete 50 total tasks",
    requirement: (stats) => stats.totalCompletions >= 50,
  },
  {
    id: "century_club",
    emoji: "💯",
    name: "Century Club",
    description: "Complete 100 total tasks",
    requirement: (stats) => stats.totalCompletions >= 100,
  },
  {
    id: "xp_novice",
    emoji: "⭐",
    name: "XP Novice",
    description: "Earn 500 total XP",
    requirement: (stats) => stats.totalXP >= 500,
  },
  {
    id: "xp_expert",
    emoji: "🌟",
    name: "XP Expert",
    description: "Earn 2000 total XP",
    requirement: (stats) => stats.totalXP >= 2000,
  },
  {
    id: "xp_legend",
    emoji: "💫",
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
      const totalXP = parseInt(localStorage.getItem("streakman_xp") || "0");
      const totalCompletions = parseInt(localStorage.getItem("streakman_total_completions") || "0");

      const maxStreak = Math.max(...tasks.map((t) => t.bestStreak || 0), 0);
      const totalTasks = tasks.length;

      setStats({
        maxStreak,
        totalTasks,
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
          <p className="text-sm text-[#64748B]">No badges yet - keep going!</p>
        ) : (
          earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex-shrink-0 bg-[#1E293B] border border-[#334155] rounded-lg p-2 text-center min-w-[60px]"
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
      {/* Earned Badges */}
      <div>
        <h3 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wide">
          Earned Badges ({earnedBadges.length}/{BADGES.length})
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-[#1E293B] border border-[#60A5FA] rounded-xl p-3 text-center hover:scale-105 transition-transform"
            >
              <span className="text-4xl mb-2 block">{badge.emoji}</span>
              <p className="text-xs font-semibold text-[#F1F5F9]">{badge.name}</p>
              <p className="text-xs text-[#64748B] mt-1">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Badge */}
      {nextBadge && (
        <div className="bg-gradient-to-r from-[#60A5FA]/10 to-[#34D399]/10 border border-[#60A5FA]/30 rounded-xl p-4">
          <p className="text-xs text-[#94A3B8] mb-2">Next Badge</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl opacity-50">{nextBadge.emoji}</span>
            <div>
              <p className="font-semibold">{nextBadge.name}</p>
              <p className="text-sm text-[#94A3B8]">{nextBadge.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* All Badges Earned */}
      {earnedBadges.length === BADGES.length && (
        <div className="bg-gradient-to-r from-[#F59E0B]/20 to-[#EF4444]/20 border border-[#F59E0B] rounded-xl p-4 text-center">
          <p className="text-2xl mb-2">🏆</p>
          <p className="font-bold text-lg">All Badges Earned!</p>
          <p className="text-sm text-[#94A3B8] mt-1">You're a true habit master!</p>
        </div>
      )}
    </div>
  );
}
