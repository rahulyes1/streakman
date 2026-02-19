"use client";

export const XP_REWARDS = {
  TASK_COMPLETE: 10,
  EARLY_COMPLETION_BONUS: 5,
  ALL_TASKS_BONUS: 25,
  STREAK_7_DAYS: 50,
  STREAK_14_DAYS: 100,
  STREAK_30_DAYS: 200,
  DAILY_FORGE_BASE: {
    stone: 10,
    iron: 20,
    gold: 40,
    diamond: 70,
  },
  FIRST_EVER_COMPLETION: 50,
};

export const LEVEL_THRESHOLDS = [
  { level: 1, min: 0, max: 100 },
  { level: 2, min: 100, max: 250 },
  { level: 3, min: 250, max: 500 },
  { level: 4, min: 500, max: 900 },
  { level: 5, min: 900, max: 1400 },
  { level: 6, min: 1400, max: 2000 },
  { level: 7, min: 2000, max: 2800 },
  { level: 8, min: 2800, max: 3800 },
  { level: 9, min: 3800, max: 5000 },
  { level: 10, min: 5000, max: Infinity },
];

export const LEVEL_UNLOCKS = {
  2: "City weather system",
  3: "Daily Forge unlocks",
  4: "City postcards unlock",
  5: "Business District neighbourhood",
  7: "Seasonal events",
  10: "Prestige available",
};

function getStoredXP() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("streakman_xp") || "0", 10);
}

export function getLevelFromXP(xpInput) {
  const xp = Math.max(0, Number(xpInput) || 0);
  const active = LEVEL_THRESHOLDS.find((entry) => xp >= entry.min && xp < entry.max) || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const next = LEVEL_THRESHOLDS.find((entry) => entry.level === active.level + 1) || null;

  if (!next) {
    return {
      level: active.level,
      current: xp,
      next: null,
      percentage: 100,
      xpToNext: 0,
    };
  }

  const span = next.min - active.min;
  const progressed = Math.max(0, xp - active.min);
  const percentage = span > 0 ? Math.min(100, Math.round((progressed / span) * 100)) : 100;

  return {
    level: active.level,
    current: xp,
    next: next.level,
    percentage,
    xpToNext: Math.max(0, next.min - xp),
  };
}

export function addXP(amountInput) {
  if (typeof window === "undefined") {
    return { newXP: Math.max(0, Number(amountInput) || 0), levelUp: false, newLevel: 1 };
  }

  const amount = Math.max(0, Number(amountInput) || 0);
  const currentXP = getStoredXP();
  const previousLevel = getLevelFromXP(currentXP).level;
  const newXP = currentXP + amount;

  localStorage.setItem("streakman_xp", String(newXP));

  const newLevel = getLevelFromXP(newXP).level;
  const levelUp = newLevel > previousLevel;

  window.dispatchEvent(new Event("xpUpdated"));

  return { newXP, levelUp, newLevel };
}

export function checkStreakMilestoneXP(tasksInput) {
  if (typeof window === "undefined") return { xpAwarded: 0, awards: [] };

  const tasks = Array.isArray(tasksInput) ? tasksInput : [];
  const saved = localStorage.getItem("streakman_milestone_xp_claimed");
  let claimed = {};
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        claimed = parsed;
      }
    } catch {
      claimed = {};
    }
  }
  const updates = { ...claimed };
  const awards = [];

  for (const task of tasks) {
    if (!task?.id) continue;
    const taskClaims = Array.isArray(updates[task.id]) ? updates[task.id] : [];
    const streak = Number(task.streak || 0);

    const milestones = [
      { day: 7, reward: XP_REWARDS.STREAK_7_DAYS },
      { day: 14, reward: XP_REWARDS.STREAK_14_DAYS },
      { day: 30, reward: XP_REWARDS.STREAK_30_DAYS },
    ];

    for (const milestone of milestones) {
      if (streak < milestone.day || taskClaims.includes(milestone.day)) continue;
      taskClaims.push(milestone.day);
      awards.push({
        taskId: task.id,
        taskName: task.name || "Task",
        milestone: milestone.day,
        xp: milestone.reward,
      });
    }

    updates[task.id] = taskClaims.sort((a, b) => a - b);
  }

  localStorage.setItem("streakman_milestone_xp_claimed", JSON.stringify(updates));

  const xpAwarded = awards.reduce((sum, award) => sum + award.xp, 0);
  if (xpAwarded > 0) {
    addXP(xpAwarded);
  }

  return { xpAwarded, awards };
}
