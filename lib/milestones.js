"use client";

const CLAIMED_KEY = "streakman_milestones_claimed";

export const MILESTONES = [
  {
    day: 3,
    emoji: "\u{1F331}",
    title: "Habit Forming",
    message: "Three days in. You\'re building something real.",
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
    message: "Thirty days. You\'ve built a real habit.",
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

export function getClaimedMilestones() {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(CLAIMED_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

export function claimMilestone(day) {
  const claimed = getClaimedMilestones();
  if (claimed.includes(day)) return claimed;

  const next = [...claimed, day].sort((a, b) => a - b);
  if (typeof window !== "undefined") {
    localStorage.setItem(CLAIMED_KEY, JSON.stringify(next));
  }
  return next;
}

export function checkMilestones(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  const topCurrentStreak = Math.max(...taskList.map((task) => task.streak || 0), 0);
  const claimed = getClaimedMilestones();

  for (const milestone of MILESTONES) {
    if (topCurrentStreak >= milestone.day && !claimed.includes(milestone.day)) {
      return milestone;
    }
  }

  return null;
}
