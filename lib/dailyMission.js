"use client";

import { addXP } from "@/lib/xpSystem";

export const DAILY_MISSION_KEY = "streakman_daily_mission";

function todayKey() {
  return new Date().toDateString();
}

function highestStreak(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  return Math.max(...taskList.map((task) => Number(task?.streak || 0)), 0);
}

function countCompleted(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  return taskList.filter((task) => task?.completedToday).length;
}

function createMission(tasks) {
  const taskList = Array.isArray(tasks) ? tasks : [];
  const topStreak = highestStreak(taskList);
  const taskCount = taskList.length;

  if (topStreak >= 7) {
    return {
      id: `mission-${todayKey()}-hard`,
      date: todayKey(),
      title: "Hit 90%+ completion today",
      difficulty: "hard",
      xpReward: 50,
      target: Math.max(1, Math.ceil(taskCount * 0.9)),
      progress: 0,
      completed: false,
    };
  }

  if (topStreak >= 3) {
    return {
      id: `mission-${todayKey()}-streak`,
      date: todayKey(),
      title: "Don't break your streak today",
      difficulty: "medium",
      xpReward: 25,
      target: 1,
      progress: 0,
      completed: false,
    };
  }

  if (taskCount >= 3 && topStreak < 3) {
    return {
      id: `mission-${todayKey()}-build`,
      date: todayKey(),
      title: "Complete 2 tasks today",
      difficulty: "medium",
      xpReward: 25,
      target: 2,
      progress: 0,
      completed: false,
    };
  }

  return {
    id: `mission-${todayKey()}-easy`,
    date: todayKey(),
    title: "Complete any 1 task today",
    difficulty: "easy",
    xpReward: 10,
    target: 1,
    progress: 0,
    completed: false,
  };
}

function readMission() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DAILY_MISSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeMission(mission) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_MISSION_KEY, JSON.stringify(mission));
}

export function generateMission(tasks) {
  const mission = createMission(tasks);
  writeMission(mission);
  return mission;
}

export function getDailyMission(tasks) {
  const existing = readMission();
  if (!existing || existing.date !== todayKey()) {
    return generateMission(tasks);
  }
  return existing;
}

export function checkMissionProgress(tasks) {
  const mission = getDailyMission(tasks);
  const completedCount = countCompleted(tasks);
  const progress = Math.min(completedCount, Number(mission.target || 1));
  const alreadyCompleted = Boolean(mission.completed);
  const nowCompleted = progress >= Number(mission.target || 1);

  const updatedMission = {
    ...mission,
    progress,
    completed: alreadyCompleted || nowCompleted,
  };

  writeMission(updatedMission);

  if (!alreadyCompleted && nowCompleted) {
    const xpEarned = Number(updatedMission.xpReward || 0);
    addXP(xpEarned);
    window.dispatchEvent(new Event("xpUpdated"));
    return { justCompleted: true, xpEarned, mission: updatedMission };
  }

  return { justCompleted: false, xpEarned: 0, mission: updatedMission };
}

export function setRecoveryMissionForToday() {
  const mission = {
    id: `mission-${todayKey()}-recovery`,
    date: todayKey(),
    title: "Complete 1 task today",
    difficulty: "easy",
    xpReward: 30,
    target: 1,
    progress: 0,
    completed: false,
  };
  writeMission(mission);
  return mission;
}
