"use client";

import { useMemo, useState } from "react";
import { XP_REWARDS } from "@/lib/xpSystem";

function buildTaskObject(taskItem, index) {
  const baseId = Date.now() + index;
  return {
    id: `${baseId}-${Math.random().toString(16).slice(2, 8)}`,
    name: taskItem.name,
    emoji: taskItem.emoji || "📝",
    streak: 0,
    completedToday: false,
    completionHistory: Array(7).fill(false),
    bestStreak: 0,
    createdAt: new Date().toISOString(),
    pinned: false,
    completedAt: null,
    lastCompletedDate: null,
    freezeProtected: false,
    goalType: "none",
    goalValue: "",
    goalUnit: "",
  };
}

export default function TemplatePreviewModal({ template, onClose, onAdded }) {
  const [selectedMap, setSelectedMap] = useState(() => {
    const initial = {};
    (template?.tasks || []).forEach((task) => {
      initial[task.name] = true;
    });
    return initial;
  });

  const selectedTasks = useMemo(
    () => (template?.tasks || []).filter((task) => selectedMap[task.name]),
    [selectedMap, template]
  );
  const xpPreview = selectedTasks.length * XP_REWARDS.TASK_COMPLETE;

  if (!template) return null;

  const addSelectedTasks = () => {
    const saved = localStorage.getItem("streakman_tasks");
    let existing = [];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        existing = Array.isArray(parsed) ? parsed : [];
      } catch {
        existing = [];
      }
    }

    const createdTasks = selectedTasks.map((task, index) => buildTaskObject(task, index));
    const merged = [...existing, ...createdTasks];

    localStorage.setItem("streakman_tasks", JSON.stringify(merged));
    window.dispatchEvent(new Event("tasksUpdated"));
    onAdded?.(createdTasks.length);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-0 px-4 pb-6" onClick={(event) => event.stopPropagation()}>
        <div className="glass-card mx-auto w-full max-w-lg rounded-3xl p-5 animate-modalSlideUp" data-active="true">
          <div className="mb-4 flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl">{template.emoji}</p>
              <h3 className="mt-1 text-xl font-semibold">{template.name}</h3>
              <p className="text-sm text-zinc-400">{template.description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="glass-card flex h-11 w-11 items-center justify-center rounded-xl text-zinc-300"
              aria-label="Close template preview"
            >
              x
            </button>
          </div>

          <div className="space-y-2">
            {template.tasks.map((task) => {
              const selected = Boolean(selectedMap[task.name]);
              return (
                <label
                  key={`${template.id}-${task.name}`}
                  className="glass-card flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-sm"
                >
                  <span>
                    {task.emoji} {task.name}
                  </span>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() =>
                      setSelectedMap((current) => ({
                        ...current,
                        [task.name]: !selected,
                      }))
                    }
                    className="h-4 w-4 accent-teal-300"
                  />
                </label>
              );
            })}
          </div>

          <p className="mt-4 text-sm text-zinc-400">This pack earns up to +{xpPreview} XP/day</p>

          <button
            type="button"
            onClick={addSelectedTasks}
            disabled={selectedTasks.length === 0}
            className={`glass-card mt-4 min-h-11 w-full rounded-xl px-4 text-sm font-semibold ${
              selectedTasks.length === 0
                ? "cursor-not-allowed text-zinc-500"
                : "bg-teal-300/15 text-teal-200"
            }`}
          >
            Add Selected Tasks
          </button>
        </div>
      </div>
    </div>
  );
}
