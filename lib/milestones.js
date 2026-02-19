"use client";

import { addXP } from "@/lib/xpSystem";

const CLAIMED_KEY = "streakman_milestones_claimed";

export const MILESTONES = [
  {
    day: 3,
    emoji: "\u{1F331}",
    title: "Habit Forming",
    message: "Three days in. You're building something real.",
    xpBonus: 30,
  },
  {
    day: 7,
    emoji: "\u{1F525}",
    title: "One Full Week",
    message: "Seven days straight. Most people quit by now.",
    xpBonus: 75,
  },
  {
    day: 14,
    emoji: "\u26A1",
    title: "Two Week Warrior",
    message: "Fourteen days. This is becoming who you are.",
    xpBonus: 150,
  },
  {
    day: 30,
    emoji: "\u{1F3C6}",
    title: "One Month Strong",
    message: "Thirty days. You've built a real habit.",
    xpBonus: 300,
  },
  {
    day: 100,
    emoji: "\u{1F31F}",
    title: "Legend",
    message: "One hundred days. Extraordinary.",
    xpBonus: 1000,
  },
];

function getClaimedMilestones() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(CLAIMED_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((day) => Number(day)).filter((day) => Number.isFinite(day));
  } catch {
    return [];
  }
}

function setClaimedMilestones(days) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CLAIMED_KEY, JSON.stringify(days));
}

export function checkMilestones(tasksInput) {
  const tasks = Array.isArray(tasksInput) ? tasksInput : [];
  const highest = Math.max(...tasks.map((task) => Number(task?.streak || 0)), 0);
  const claimed = getClaimedMilestones();

  for (const milestone of MILESTONES) {
    if (highest >= milestone.day && !claimed.includes(milestone.day)) {
      return milestone;
    }
  }

  return null;
}

export function claimMilestone(dayInput) {
  const day = Number(dayInput);
  const milestone = MILESTONES.find((item) => item.day === day);
  if (!milestone) return null;

  const claimed = getClaimedMilestones();
  if (!claimed.includes(day)) {
    setClaimedMilestones([...claimed, day].sort((a, b) => a - b));
    addXP(milestone.xpBonus);
  }

  return milestone;
}
