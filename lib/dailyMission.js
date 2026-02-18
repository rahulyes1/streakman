"use client";

export const DAILY_MISSION_KEY = "streakman_daily_mission";

function todayString() {
  return new Date().toDateString();
}

function readTasks() {
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

function highestStreak(tasks) {
  return Math.max(...tasks.map((task) => task.streak || 0), 0);
}

function completedCount(tasks) {
  return tasks.filter((task) => task.completedToday).length;
}

function normalizeMission(mission) {
  return {
    id: mission.id || `mission-${mission.date}`,
    date: mission.date || todayString(),
    title: mission.title || "Complete any 1 task today",
    difficulty: mission.difficulty || "easy",
    rewardXp: Number.isFinite(Number(mission.rewardXp)) ? Number(mission.rewardXp) : 10,
    targetType: mission.targetType || "complete_n",
    targetCount: Math.max(1, Number.isFinite(Number(mission.targetCount)) ? Number(mission.targetCount) : 1),
    claimed: Boolean(mission.claimed),
    completed: Boolean(mission.completed),
    source: mission.source || "auto",
  };
}

function saveMission(mission) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_MISSION_KEY, JSON.stringify(normalizeMission(mission)));
}

function readMission() {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(DAILY_MISSION_KEY);
  if (!saved) return null;

  try {
    return normalizeMission(JSON.parse(saved));
  } catch {
    return null;
  }
}

function createMission(tasks) {
  const taskCount = tasks.length;
  const topStreak = highestStreak(tasks);

  if (topStreak >= 7) {
    return {
      id: `mission-${todayString()}-hard`,
      date: todayString(),
      title: "Hit exceptional status — complete 90%+ of tasks",
      difficulty: "hard",
      rewardXp: 50,
      targetType: "complete_n",
      targetCount: Math.max(1, Math.ceil(taskCount * 0.9)),
      completed: false,
      claimed: false,
      source: "auto",
    };
  }

  if (topStreak >= 3) {
    return {
      id: `mission-${todayString()}-streak`,
      date: todayString(),
      title: "Don\'t break your streak today",
      difficulty: "medium",
      rewardXp: 25,
      targetType: "complete_n",
      targetCount: 1,
      completed: false,
      claimed: false,
      source: "auto",
    };
  }

  if (taskCount <= 2) {
    return {
      id: `mission-${todayString()}-easy`,
      date: todayString(),
      title: "Complete any 1 task today",
      difficulty: "easy",
      rewardXp: 10,
      targetType: "complete_n",
      targetCount: 1,
      completed: false,
      claimed: false,
      source: "auto",
    };
  }

  return {
    id: `mission-${todayString()}-medium`,
    date: todayString(),
    title: "Complete any 2 tasks today",
    difficulty: "medium",
    rewardXp: 25,
    targetType: "complete_n",
    targetCount: 2,
    completed: false,
    claimed: false,
    source: "auto",
  };
}

export function setRecoveryMissionForToday() {
  const mission = {
    id: `mission-${todayString()}-recovery`,
    date: todayString(),
    title: "Complete 1 task today",
    difficulty: "easy",
    rewardXp: 30,
    targetType: "complete_n",
    targetCount: 1,
    completed: false,
    claimed: false,
    source: "recovery",
  };

  saveMission(mission);
  return mission;
}

export function getOrCreateDailyMission(tasksInput) {
  const tasks = Array.isArray(tasksInput) ? tasksInput : readTasks();
  const current = readMission();

  if (current && current.date === todayString()) {
    return current;
  }

  const mission = createMission(tasks);
  saveMission(mission);
  return mission;
}

export function getMissionProgress(mission, tasksInput) {
  const tasks = Array.isArray(tasksInput) ? tasksInput : readTasks();
  const current = normalizeMission(mission || getOrCreateDailyMission(tasks));
  const done = completedCount(tasks);
  const target = Math.max(1, current.targetCount);
  const value = Math.min(done, target);
  const completed = done >= target;

  return {
    value,
    target,
    completed,
    ratio: Math.min((value / target) * 100, 100),
    completedCount: done,
  };
}

export function claimDailyMissionReward(mission) {
  const current = normalizeMission(mission);
  if (current.claimed) return current;
  if (typeof window === "undefined") return current;

  const xp = parseInt(localStorage.getItem("streakman_xp") || "0", 10);
  localStorage.setItem("streakman_xp", String(xp + current.rewardXp));
  window.dispatchEvent(new Event("xpUpdated"));

  const updated = {
    ...current,
    completed: true,
    claimed: true,
  };

  saveMission(updated);
  return updated;
}

export function updateDailyMission(mission) {
  const normalized = normalizeMission(mission);
  saveMission(normalized);
  return normalized;
}
