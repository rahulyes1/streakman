"use client";

export const XP_REWARDS = {
  TASK_COMPLETE: 10,
  EARLY_COMPLETION_BONUS: 5,
  EARLY_BONUS: 5,
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

export const COMBO_MULTIPLIERS = {
  1: 1.0,
  7: 1.2,
  14: 1.5,
  30: 2.0,
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

const XP_TODAY_KEY = "streakman_xp_today";

const SOURCE_FIELD_MAP = {
  task: "taskXP",
  earlyBonus: "earlyBonus",
  allTasks: "allTasksBonus",
  forge: "forgeXP",
  mission: "missionXP",
  milestone: "milestoneXP",
  combo: "comboXP",
  streak: "milestoneXP",
  other: "otherXP",
};

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function createEmptyXPToday(dateKey = getDateKey()) {
  return {
    date: dateKey,
    taskXP: 0,
    earlyBonus: 0,
    allTasksBonus: 0,
    forgeXP: 0,
    missionXP: 0,
    milestoneXP: 0,
    comboXP: 0,
    otherXP: 0,
    total: 0,
  };
}

function normalizeXPToday(raw, expectedDate) {
  if (!raw || typeof raw !== "object") return createEmptyXPToday(expectedDate);
  if (raw.date !== expectedDate) return createEmptyXPToday(expectedDate);

  const normalized = {
    date: expectedDate,
    taskXP: Math.max(0, Number(raw.taskXP) || 0),
    earlyBonus: Math.max(0, Number(raw.earlyBonus) || 0),
    allTasksBonus: Math.max(0, Number(raw.allTasksBonus) || 0),
    forgeXP: Math.max(0, Number(raw.forgeXP) || 0),
    missionXP: Math.max(0, Number(raw.missionXP) || 0),
    milestoneXP: Math.max(0, Number(raw.milestoneXP) || 0),
    comboXP: Math.max(0, Number(raw.comboXP) || 0),
    otherXP: Math.max(0, Number(raw.otherXP) || 0),
    total: 0,
  };

  normalized.total =
    normalized.taskXP +
    normalized.earlyBonus +
    normalized.allTasksBonus +
    normalized.forgeXP +
    normalized.missionXP +
    normalized.milestoneXP +
    normalized.comboXP +
    normalized.otherXP;

  return normalized;
}

function writeXPToday(data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(XP_TODAY_KEY, JSON.stringify(data));
}

function getStoredXP() {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem("streakman_xp") || "0", 10);
}

export function getLevelFromXP(xpInput) {
  const xp = Math.max(0, Number(xpInput) || 0);
  const active =
    LEVEL_THRESHOLDS.find((entry) => xp >= entry.min && xp < entry.max) ||
    LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
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

export function getComboMultiplier(streakInput) {
  const streak = Math.max(0, Number(streakInput) || 0);
  if (streak >= 30) return COMBO_MULTIPLIERS[30];
  if (streak >= 14) return COMBO_MULTIPLIERS[14];
  if (streak >= 7) return COMBO_MULTIPLIERS[7];
  return COMBO_MULTIPLIERS[1];
}

export function getNextComboUpgrade(streakInput) {
  const streak = Math.max(0, Number(streakInput) || 0);
  if (streak === 6) return { day: 7, multiplier: COMBO_MULTIPLIERS[7] };
  if (streak === 13) return { day: 14, multiplier: COMBO_MULTIPLIERS[14] };
  if (streak === 29) return { day: 30, multiplier: COMBO_MULTIPLIERS[30] };
  return null;
}

export function getTimeOfDayMultiplier() {
  const hour = new Date().getHours();

  if (hour >= 6 && hour <= 8) {
    return { multiplier: 1.5, label: "Early Bird \u{1F305}", bonus: "+50%" };
  }

  if (hour >= 9 && hour <= 11) {
    return { multiplier: 1.2, label: "Morning \u2600\uFE0F", bonus: "+20%" };
  }

  if (hour >= 21 && hour <= 23) {
    return { multiplier: 0.9, label: "Late Night \u{1F319}", bonus: "-10%" };
  }

  return { multiplier: 1.0, label: null, bonus: null };
}

export function getXPToday() {
  const dateKey = getDateKey();
  if (typeof window === "undefined") return createEmptyXPToday(dateKey);

  const raw = localStorage.getItem(XP_TODAY_KEY);
  let parsed = null;

  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  const normalized = normalizeXPToday(parsed, dateKey);
  writeXPToday(normalized);
  return normalized;
}

function updateXPToday(amountInput, source = "other") {
  if (typeof window === "undefined") return createEmptyXPToday();

  const amount = Number(amountInput) || 0;
  const field = SOURCE_FIELD_MAP[source] || SOURCE_FIELD_MAP.other;
  const current = getXPToday();
  const nextValue = Math.max(0, (Number(current[field]) || 0) + amount);

  const updated = {
    ...current,
    [field]: nextValue,
  };

  updated.total =
    updated.taskXP +
    updated.earlyBonus +
    updated.allTasksBonus +
    updated.forgeXP +
    updated.missionXP +
    updated.milestoneXP +
    updated.comboXP +
    updated.otherXP;

  writeXPToday(updated);
  return updated;
}

export function addXP(amountInput, source = "other") {
  const amount = Number(amountInput) || 0;

  if (typeof window === "undefined") {
    const newXP = Math.max(0, amount);
    return { newXP, levelUp: false, newLevel: 1 };
  }

  const currentXP = getStoredXP();
  const previousLevel = getLevelFromXP(currentXP).level;
  const newXP = Math.max(0, currentXP + amount);

  localStorage.setItem("streakman_xp", String(newXP));
  updateXPToday(amount, source);

  const newLevel = getLevelFromXP(newXP).level;
  const levelUp = newLevel > previousLevel;

  window.dispatchEvent(new Event("xpUpdated"));

  return { newXP, levelUp, newLevel };
}

export function getXPWithMultipliers(baseXPInput, streakInput) {
  const baseXP = Math.max(0, Number(baseXPInput) || 0);
  const comboMultiplier = getComboMultiplier(streakInput);
  const time = getTimeOfDayMultiplier();
  const comboAdjusted = Math.round(baseXP * comboMultiplier);
  const finalAmount = Math.round(comboAdjusted * time.multiplier);

  return {
    baseXP,
    comboMultiplier,
    timeMultiplier: time.multiplier,
    timeLabel: time.label,
    timeBonus: time.bonus,
    finalAmount,
  };
}

export function getEarlyBonusXP(streakInput) {
  const base = Number(XP_REWARDS.EARLY_BONUS || XP_REWARDS.EARLY_COMPLETION_BONUS || 0);
  return Math.round(base * getComboMultiplier(streakInput));
}

export function getAllTasksBonusXP(streakInput) {
  return Math.round(Number(XP_REWARDS.ALL_TASKS_BONUS || 0) * getComboMultiplier(streakInput));
}

export function getTodayXPSummary() {
  const today = getXPToday();
  const rows = [];

  const config = [
    { key: "taskXP", label: "Tasks completed", emoji: "\u2705" },
    { key: "earlyBonus", label: "Early Bird bonus", emoji: "\u{1F305}" },
    { key: "allTasksBonus", label: "All tasks bonus", emoji: "\u{1F4AF}" },
    { key: "forgeXP", label: "Daily Forge", emoji: "\u{1F525}" },
    { key: "missionXP", label: "Missions", emoji: "\u{1F3AF}" },
    { key: "milestoneXP", label: "Milestones", emoji: "\u{1F3C6}" },
    { key: "comboXP", label: "Combo bonus", emoji: "\u{1F525}" },
    { key: "otherXP", label: "Other XP", emoji: "\u26A1" },
  ];

  config.forEach((item) => {
    const amount = Number(today[item.key]) || 0;
    if (amount > 0) {
      rows.push({ label: item.label, emoji: item.emoji, amount });
    }
  });

  rows.push({
    label: "Total today",
    emoji: "\u26A1",
    amount: Number(today.total) || 0,
    isTotal: true,
  });

  return rows;
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
    addXP(xpAwarded, "streak");
  }

  return { xpAwarded, awards };
}
