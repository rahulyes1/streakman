"use client";

function canVibrate() {
  return (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    "vibrate" in navigator
  );
}

export function taskComplete() {
  if (!canVibrate()) return;
  navigator.vibrate([40, 30, 40]);
}

export function allTasksComplete() {
  if (!canVibrate()) return;
  navigator.vibrate([40, 30, 40, 30, 80, 50, 120]);
}

export function streakMilestone() {
  if (!canVibrate()) return;
  navigator.vibrate([30, 20, 30, 20, 30, 20, 200]);
}
