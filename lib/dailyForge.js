"use client";

export const FORGE_TIERS = {
  none: { label: "No Forge", emoji: "", color: "zinc", xpMin: 0, xpMax: 0 },
  stone: { label: "Stone Forge", emoji: "\u{1FAA8}", color: "zinc", xpMin: 5, xpMax: 15 },
  iron: {
    label: "Iron Forge",
    emoji: "\u2699\uFE0F",
    color: "blue",
    xpMin: 15,
    xpMax: 30,
    tokenChance: 0.2,
  },
  gold: {
    label: "Gold Forge",
    emoji: "\u{1F525}",
    color: "amber",
    xpMin: 30,
    xpMax: 60,
    badgeChance: 0.15,
  },
  diamond: {
    label: "Diamond Forge",
    emoji: "\u{1F48E}",
    color: "teal",
    xpMin: 60,
    xpMax: 80,
    rareRewardChance: 0.3,
  },
};

function toDayKey(date = new Date()) {
  return date.toDateString();
}

function hasNoHistory(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  const hasActivity = taskList.some((task) => {
    const history = Array.isArray(task?.completionHistory) ? task.completionHistory : [];
    return Boolean(task?.streak > 0 || task?.bestStreak > 0 || task?.completedToday || history.some(Boolean));
  });

  if (hasActivity) return false;
  if (typeof window === "undefined") return true;
  return !localStorage.getItem("streakman_forge_last_used");
}

export function getYesterdayForgeStats(tasksInput) {
  const tasks = Array.isArray(tasksInput) ? tasksInput : [];
  if (!tasks.length) {
    return { total: 0, completed: 0, percentage: 0 };
  }

  const completed = tasks.filter((task) => Boolean(task?.completionHistory?.[5])).length;
  const percentage = Math.round((completed / tasks.length) * 100);
  return { total: tasks.length, completed, percentage };
}

export function getTodayForgeTier(tasksInput) {
  const tasks = Array.isArray(tasksInput) ? tasksInput : [];
  if (hasNoHistory(tasks)) return "gold";

  const { percentage } = getYesterdayForgeStats(tasks);

  if (percentage === 0) return "none";
  if (percentage <= 49) return "stone";
  if (percentage <= 74) return "iron";
  if (percentage <= 89) return "gold";
  return "diamond";
}

export function getForgeReward(tierInput) {
  const tier = FORGE_TIERS[tierInput] ? tierInput : "none";
  const config = FORGE_TIERS[tier];
  if (!config || config.xpMax <= 0) {
    return { xp: 0, bonusToken: false, bonusMessage: "" };
  }

  const min = Math.min(config.xpMin, config.xpMax);
  const max = Math.max(config.xpMin, config.xpMax);
  const xp = Math.floor(Math.random() * (max - min + 1)) + min;

  let bonusToken = false;
  let bonusMessage = "";

  if (config.tokenChance && Math.random() < config.tokenChance) {
    bonusToken = true;
    bonusMessage = "Bonus reward: +1 Freeze Token";
  }

  if (!bonusMessage && config.badgeChance && Math.random() < config.badgeChance) {
    bonusMessage = "Bonus reward: Badge boost found";
  }

  if (config.rareRewardChance && Math.random() < config.rareRewardChance) {
    bonusToken = true;
    bonusMessage = "Rare reward: +1 Freeze Token";
  }

  return { xp, bonusToken, bonusMessage };
}

export function isForgeAvailable() {
  if (typeof window === "undefined") return false;
  const lastUsed = localStorage.getItem("streakman_forge_last_used");
  return lastUsed !== toDayKey();
}

export function markForgeUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem("streakman_forge_last_used", toDayKey());
}
