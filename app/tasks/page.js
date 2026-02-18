"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  Check,
  Flame,
  Gem,
  MoreHorizontal,
  Pin,
  PinOff,
  Sparkles,
  X,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CompletionParticles from "@/components/CompletionParticles";
import { initializeDailyReset } from "@/lib/dailyReset";
import { allTasksComplete, taskComplete } from "@/lib/haptics";

const SPRING = { type: "spring", stiffness: 400, damping: 30 };

const PREMADE_TASKS = [
  { name: "Morning Workout", emoji: "\u{1F4AA}" },
  { name: "Meditation", emoji: "\u{1F9D8}" },
  { name: "Read Book", emoji: "\u{1F4DA}" },
  { name: "Plan Day", emoji: "\u{1F5D3}\uFE0F" },
  { name: "10k Steps", emoji: "\u{1F6B6}" },
  { name: "Deep Work", emoji: "\u{26A1}" },
  { name: "Journal", emoji: "\u{1F4D4}" },
  { name: "Drink Water", emoji: "\u{1F4A7}" },
  { name: "Stretching", emoji: "\u{1F938}" },
  { name: "Track Calories", emoji: "\u{1F37D}\uFE0F" },
  { name: "No Social Media", emoji: "\u{1F4F5}" },
  { name: "Sleep 8hrs", emoji: "\u{1F634}" },
];

const EMPTY_TASK = {
  name: "",
  emoji: "\u{1F4DD}",
  goalType: "none",
  goalValue: "",
  goalUnit: "",
};

function sortTasks(items) {
  return [...items].sort((a, b) => {
    const completedDelta = Number(a.completedToday) - Number(b.completedToday);
    if (completedDelta !== 0) return completedDelta;
    return (a.completedAt || 0) - (b.completedAt || 0);
  });
}

function formatGoal(task) {
  if (!task.goalType || task.goalType === "none" || !task.goalValue) return "";
  if (task.goalType === "intensity") return `Goal: ${task.goalValue}`;
  if (task.goalUnit) return `Goal: ${task.goalValue} ${task.goalUnit}`;
  return `Goal: ${task.goalValue}`;
}

function TasksContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState(EMPTY_TASK);
  const [freezeTokens, setFreezeTokens] = useState(0);
  const [popTaskId, setPopTaskId] = useState(null);
  const [burst, setBurst] = useState(null);
  const openFromQuery = searchParams.get("add") === "true";
  const isAddModalOpen = showAddModal || openFromQuery;
  const now = new Date();
  const isLateNight = now.getHours() === 23 && now.getMinutes() >= 40;
  const hasIncompleteTasks = tasks.some((task) => !task.completedToday);
  const lateNightMode = isLateNight && hasIncompleteTasks;

  useEffect(() => {
    initializeDailyReset();
  }, []);

  useEffect(() => {
    const loadTasks = () => {
      const saved = localStorage.getItem("streakman_tasks");
      if (saved) {
        const parsed = JSON.parse(saved);
        setTasks(parsed);
        return;
      }
      setTasks([]);
    };

    loadTasks();

    const handleUpdate = () => loadTasks();
    window.addEventListener("tasksUpdated", handleUpdate);
    return () => window.removeEventListener("tasksUpdated", handleUpdate);
  }, []);

  useEffect(() => {
    const loadTokens = () => {
      const tokens = parseInt(localStorage.getItem("streakman_freeze_tokens") || "0", 10);
      setFreezeTokens(tokens);
    };

    loadTokens();

    const handleUpdate = () => loadTokens();
    window.addEventListener("tokensUpdated", handleUpdate);
    return () => window.removeEventListener("tokensUpdated", handleUpdate);
  }, []);

  useEffect(() => {
    const openModal = () => setShowAddModal(true);
    window.addEventListener("openAddTaskModal", openModal);

    return () => window.removeEventListener("openAddTaskModal", openModal);
  }, []);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  const pinnedTasks = useMemo(() => sortTasks(tasks.filter((task) => task.pinned)), [tasks]);
  const unpinnedTasks = useMemo(() => sortTasks(tasks.filter((task) => !task.pinned)), [tasks]);

  const saveTasks = (updatedTasks, onBeforeDispatch) => {
    localStorage.setItem("streakman_tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    onBeforeDispatch?.(updatedTasks);
    window.dispatchEvent(new Event("tasksUpdated"));
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setNewTask(EMPTY_TASK);
    if (!openFromQuery) return;

    const url = new URL(window.location.href);
    url.searchParams.delete("add");
    url.searchParams.delete("src");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  };

  const handleAddTask = () => {
    const cleanName = newTask.name.trim();
    if (!cleanName) return;

    const task = {
      id: Date.now().toString(),
      name: cleanName,
      emoji: newTask.emoji || "\u{1F4DD}",
      pinned: false,
      streak: 0,
      bestStreak: 0,
      completedToday: false,
      completedAt: null,
      lastCompletedDate: null,
      completionHistory: Array(7).fill(false),
      freezeProtected: false,
      goalType: newTask.goalType,
      goalValue: newTask.goalValue,
      goalUnit: newTask.goalUnit,
    };

    saveTasks([...tasks, task]);
    closeAddModal();
  };

  const renameTask = (taskId, nextName) => {
    const cleanName = nextName.trim();
    if (!cleanName) return;

    const updated = tasks.map((task) =>
      task.id === taskId ? { ...task, name: cleanName } : task
    );
    saveTasks(updated);
  };

  const togglePin = (taskId) => {
    const pinnedCount = tasks.filter((task) => task.pinned).length;
    const task = tasks.find((item) => item.id === taskId);

    if (!task) return;
    if (!task.pinned && pinnedCount >= 5) {
      alert("Maximum 5 pinned tasks allowed");
      return;
    }

    const updated = tasks.map((item) =>
      item.id === taskId ? { ...item, pinned: !item.pinned } : item
    );
    saveTasks(updated);
  };

  const completeTask = (taskId) => {
    let completedNow = false;

    const updated = tasks.map((task) => {
      if (task.id !== taskId) return task;

      if (task.completedToday) {
        const newStreak = Math.max(0, task.streak - 1);

        const currentXP = parseInt(localStorage.getItem("streakman_xp") || "0", 10);
        localStorage.setItem("streakman_xp", Math.max(0, currentXP - 40).toString());
        window.dispatchEvent(new Event("xpUpdated"));

        const totalCompletions = parseInt(
          localStorage.getItem("streakman_total_completions") || "0",
          10
        );
        localStorage.setItem(
          "streakman_total_completions",
          Math.max(0, totalCompletions - 1).toString()
        );

        const history = [...task.completionHistory];
        history.pop();
        history.unshift(false);

        return {
          ...task,
          completedToday: false,
          completedAt: null,
          streak: newStreak,
          lastCompletedDate: null,
          completionHistory: history,
        };
      }

      completedNow = true;
      const newStreak = task.streak + 1;
      const newBestStreak = Math.max(newStreak, task.bestStreak);

      const currentXP = parseInt(localStorage.getItem("streakman_xp") || "0", 10);
      localStorage.setItem("streakman_xp", (currentXP + 40).toString());
      window.dispatchEvent(new Event("xpUpdated"));

      const totalCompletions = parseInt(
        localStorage.getItem("streakman_total_completions") || "0",
        10
      );
      localStorage.setItem("streakman_total_completions", (totalCompletions + 1).toString());

      const history = [...task.completionHistory];
      history.shift();
      history.push(true);

      return {
        ...task,
        completedToday: true,
        completedAt: Date.now(),
        streak: newStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: new Date().toDateString(),
        completionHistory: history,
      };
    });

    saveTasks(updated, (nextTasks) => {
      if (!completedNow) return;

      const completedCount = nextTasks.filter((task) => task.completedToday).length;
      if (nextTasks.length > 0 && completedCount === nextTasks.length) {
        allTasksComplete();
      } else {
        taskComplete();
      }
    });

    if (completedNow) {
      setPopTaskId(taskId);
      window.setTimeout(() => {
        setPopTaskId((current) => (current === taskId ? null : current));
      }, 420);
    }
  };

  const toggleFreeze = (taskId) => {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    if (!task.freezeProtected) {
      if (freezeTokens <= 0) {
        alert("No freeze tokens available. Earn them from the Daily Spin.");
        return;
      }

      const updated = tasks.map((item) =>
        item.id === taskId ? { ...item, freezeProtected: true } : item
      );
      saveTasks(updated);

      const nextTokens = freezeTokens - 1;
      localStorage.setItem("streakman_freeze_tokens", nextTokens.toString());
      setFreezeTokens(nextTokens);
      window.dispatchEvent(new Event("tokensUpdated"));
      return;
    }

    const updated = tasks.map((item) =>
      item.id === taskId ? { ...item, freezeProtected: false } : item
    );
    saveTasks(updated);

    const nextTokens = freezeTokens + 1;
    localStorage.setItem("streakman_freeze_tokens", nextTokens.toString());
    setFreezeTokens(nextTokens);
    window.dispatchEvent(new Event("tokensUpdated"));
  };

  const archiveTask = (taskId) => {
    if (!window.confirm("Archive this task?")) return;
    const updated = tasks.filter((task) => task.id !== taskId);
    saveTasks(updated);
    setSelectedTaskId(null);
  };

  const handleCompletionPress = (event, taskId) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setBurst({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });

    completeTask(taskId);

    window.setTimeout(() => {
      setBurst(null);
    }, 300);
  };

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 pb-28 pt-6 text-zinc-100">
        <div className="mesh-leak mesh-leak-teal" />
        <div className="mesh-leak mesh-leak-purple" />
        {lateNightMode && <div className="mesh-leak mesh-leak-warm" />}

        <div className="relative z-10 mx-auto max-w-2xl">
          <motion.header
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING}
            className="mb-6 flex items-start justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Streaks</h1>
              <p className="mt-1 text-sm text-zinc-400">
                Fast habits, clean flow, zero-friction check-ins.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="glass-card flex min-h-11 items-center gap-2 rounded-full px-3">
                <Gem className="h-4 w-4 text-teal-300" />
                <span className="text-sm font-semibold">{freezeTokens}</span>
              </div>
              <div className="glass-card flex min-h-11 items-center gap-2 rounded-full px-3">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span className="text-sm font-semibold">{tasks.length}</span>
              </div>
            </div>
          </motion.header>

          {tasks.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <TaskSection
                title="Pinned"
                tasks={pinnedTasks}
                lateNightMode={lateNightMode}
                popTaskId={popTaskId}
                onCompletionPress={handleCompletionPress}
                onOpenDetails={setSelectedTaskId}
                onRename={renameTask}
                onTogglePin={togglePin}
              />
              <TaskSection
                title="All Tasks"
                tasks={unpinnedTasks}
                lateNightMode={lateNightMode}
                popTaskId={popTaskId}
                onCompletionPress={handleCompletionPress}
                onOpenDetails={setSelectedTaskId}
                onRename={renameTask}
                onTogglePin={togglePin}
              />
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 px-4 py-6 backdrop-blur-sm"
            onClick={() => setSelectedTaskId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={SPRING}
              onClick={(event) => event.stopPropagation()}
              className="glass-card mx-auto mt-8 w-full max-w-md rounded-3xl p-6"
              data-active="true"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-3xl">
                    {selectedTask.emoji}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold">{selectedTask.name}</h2>
                    <p className="mt-1 text-sm text-zinc-400">7 day momentum tracker</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTaskId(null)}
                  className="glass-card flex h-11 w-11 items-center justify-center rounded-xl"
                  aria-label="Close details"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-3">
                <div className="glass-card rounded-2xl p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Current</p>
                  <p className="mt-1 text-2xl font-bold">{selectedTask.streak}</p>
                </div>
                <div className="glass-card rounded-2xl p-3 text-center">
                  <p className="text-xs uppercase tracking-wide text-zinc-400">Best</p>
                  <p className="mt-1 text-2xl font-bold">{selectedTask.bestStreak}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="mb-2 text-sm text-zinc-400">Last 7 Days</p>
                <div className="grid grid-cols-7 gap-2">
                  {selectedTask.completionHistory.map((completed, index) => (
                    <div
                      key={index}
                      className={`flex h-10 items-center justify-center rounded-lg text-xs font-semibold ${
                        completed ? "bg-emerald-400/20 text-emerald-300" : "bg-white/[0.03] text-zinc-500"
                      }`}
                    >
                      {completed ? "Done" : "Miss"}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={(event) => handleCompletionPress(event, selectedTask.id)}
                  className={`glass-card flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold ${
                    selectedTask.completedToday
                      ? "text-emerald-300"
                      : "text-zinc-100 hover:text-teal-200"
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {selectedTask.completedToday ? "Mark as not done" : "Mark done"}
                </button>
                <button
                  type="button"
                  onClick={() => togglePin(selectedTask.id)}
                  className="glass-card flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold"
                >
                  {selectedTask.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  {selectedTask.pinned ? "Unpin task" : "Pin task"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFreeze(selectedTask.id)}
                  className="glass-card flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold"
                >
                  <Gem className="h-4 w-4 text-teal-300" />
                  {selectedTask.freezeProtected
                    ? "Protection active"
                    : `Freeze (${freezeTokens} token${freezeTokens === 1 ? "" : "s"})`}
                </button>
                <button
                  type="button"
                  onClick={() => archiveTask(selectedTask.id)}
                  className="glass-card flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-rose-300"
                >
                  <Archive className="h-4 w-4" />
                  Archive task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/55 p-4 backdrop-blur-sm"
            onClick={closeAddModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={SPRING}
              onClick={(event) => event.stopPropagation()}
              className="glass-card mx-auto max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl p-5 sm:p-6"
              data-active="true"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">New Streak</h2>
                <button
                  type="button"
                  className="glass-card flex h-11 w-11 items-center justify-center rounded-xl"
                  onClick={closeAddModal}
                  aria-label="Close add modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-5">
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-400">Quick Add</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PREMADE_TASKS.map((task) => (
                    <button
                      type="button"
                      key={task.name}
                      onClick={() => setNewTask((current) => ({ ...current, name: task.name, emoji: task.emoji }))}
                      className="glass-card flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm"
                    >
                      <span>{task.emoji}</span>
                      <span className="truncate">{task.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium">
                  <span className="mb-2 block text-zinc-300">Emoji</span>
                  <input
                    type="text"
                    value={newTask.emoji}
                    onChange={(event) => setNewTask((current) => ({ ...current, emoji: event.target.value }))}
                    className="glass-card h-11 w-full rounded-xl px-3 text-center text-2xl outline-none"
                    maxLength={2}
                  />
                </label>

                <label className="block text-sm font-medium">
                  <span className="mb-2 block text-zinc-300">Task Title</span>
                  <input
                    type="text"
                    value={newTask.name}
                    onChange={(event) => setNewTask((current) => ({ ...current, name: event.target.value }))}
                    className="glass-card h-11 w-full rounded-xl px-3 text-sm outline-none placeholder:text-zinc-500"
                    placeholder="e.g. Morning Workout"
                    autoFocus
                  />
                </label>

                <label className="block text-sm font-medium">
                  <span className="mb-2 block text-zinc-300">Goal (Optional)</span>
                  <select
                    value={newTask.goalType}
                    onChange={(event) =>
                      setNewTask((current) => ({
                        ...current,
                        goalType: event.target.value,
                        goalValue: "",
                        goalUnit: "",
                      }))
                    }
                    className="glass-card h-11 w-full rounded-xl px-3 text-sm outline-none"
                  >
                    <option value="none">No goal</option>
                    <option value="amount">Amount</option>
                    <option value="time">Time</option>
                    <option value="intensity">Intensity</option>
                  </select>
                </label>

                {newTask.goalType === "amount" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={newTask.goalValue}
                      onChange={(event) =>
                        setNewTask((current) => ({ ...current, goalValue: event.target.value }))
                      }
                      className="glass-card h-11 rounded-xl px-3 text-sm outline-none placeholder:text-zinc-500"
                      placeholder="10"
                    />
                    <input
                      type="text"
                      value={newTask.goalUnit}
                      onChange={(event) =>
                        setNewTask((current) => ({ ...current, goalUnit: event.target.value }))
                      }
                      className="glass-card h-11 rounded-xl px-3 text-sm outline-none placeholder:text-zinc-500"
                      placeholder="pages"
                    />
                  </div>
                )}

                {newTask.goalType === "time" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={newTask.goalValue}
                      onChange={(event) =>
                        setNewTask((current) => ({ ...current, goalValue: event.target.value }))
                      }
                      className="glass-card h-11 rounded-xl px-3 text-sm outline-none placeholder:text-zinc-500"
                      placeholder="30"
                    />
                    <select
                      value={newTask.goalUnit}
                      onChange={(event) =>
                        setNewTask((current) => ({ ...current, goalUnit: event.target.value }))
                      }
                      className="glass-card h-11 rounded-xl px-3 text-sm outline-none"
                    >
                      <option value="">Unit</option>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                )}

                {newTask.goalType === "intensity" && (
                  <select
                    value={newTask.goalValue}
                    onChange={(event) =>
                      setNewTask((current) => ({ ...current, goalValue: event.target.value, goalUnit: "" }))
                    }
                    className="glass-card h-11 w-full rounded-xl px-3 text-sm outline-none"
                  >
                    <option value="">Select intensity</option>
                    <option value="Light">Light</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Intense">Intense</option>
                    <option value="Maximum">Maximum</option>
                  </select>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="glass-card min-h-11 rounded-xl px-3 text-sm font-semibold text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="glass-card min-h-11 rounded-xl bg-teal-300/15 px-3 text-sm font-semibold text-teal-200"
                >
                  Create streak
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {burst && (
        <CompletionParticles
          x={burst.x}
          y={burst.y}
          color="#5eead4"
          active={true}
          onComplete={() => setBurst(null)}
        />
      )}

      <BottomNav />
    </>
  );
}

function TaskSection({
  title,
  tasks,
  lateNightMode,
  popTaskId,
  onCompletionPress,
  onOpenDetails,
  onRename,
  onTogglePin,
}) {
  if (!tasks.length) return null;

  return (
    <section className="mb-7">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">{title}</h2>
      <motion.ul layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={
                popTaskId === task.id && task.completedToday
                  ? { opacity: 1, y: 0, scale: [1, 1.05, 1] }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              exit={{ opacity: 0, y: -10 }}
              transition={SPRING}
            >
              <TaskRow
                task={task}
                lateNightMode={lateNightMode}
                onCompletionPress={onCompletionPress}
                onOpenDetails={onOpenDetails}
                onRename={onRename}
                onTogglePin={onTogglePin}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  );
}

function TaskRow({
  task,
  lateNightMode,
  onCompletionPress,
  onOpenDetails,
  onRename,
  onTogglePin,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState("");

  const submitRename = () => {
    const cleanName = draftName.trim();
    if (!cleanName) {
      setDraftName("");
      setIsEditing(false);
      return;
    }
    if (cleanName !== task.name) {
      onRename(task.id, cleanName);
    }
    setDraftName("");
    setIsEditing(false);
  };

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={SPRING}
      className={`glass-card rounded-2xl p-4 ${
        lateNightMode && !task.completedToday ? "task-at-risk" : ""
      }`}
      data-active={task.completedToday ? "true" : "false"}
    >
      <div className="flex items-start gap-3">
        <div className="glass-card flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl">
          {task.emoji}
        </div>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <input
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              onBlur={submitRename}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitRename();
                if (event.key === "Escape") {
                  setDraftName("");
                  setIsEditing(false);
                }
              }}
              className="glass-card h-11 w-full rounded-xl px-3 text-base font-semibold outline-none"
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraftName(task.name);
                setIsEditing(true);
              }}
              className={`flex min-h-11 w-full items-center rounded-xl px-1 text-left text-base font-semibold ${
                task.completedToday ? "text-zinc-400 line-through" : "text-zinc-100"
              }`}
              aria-label={`Edit title for ${task.name}`}
            >
              <span className="truncate">{task.name}</span>
            </button>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1">
              <Flame className="h-3.5 w-3.5 text-amber-300" />
              {task.streak} {task.streak === 1 ? "day" : "days"}
            </span>
            {task.freezeProtected && (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-300/15 px-2 py-1 text-teal-200">
                <Gem className="h-3 w-3" />
                Protected
              </span>
            )}
            {formatGoal(task) && <span>{formatGoal(task)}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          transition={SPRING}
          onClick={(event) => onCompletionPress(event, task.id)}
          className={`glass-card flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 text-sm font-semibold ${
            task.completedToday ? "text-emerald-300" : "text-zinc-100"
          }`}
        >
          <Check className="h-4 w-4" />
          {task.completedToday ? "Done" : "Mark done"}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          transition={SPRING}
          onClick={() => onTogglePin(task.id)}
          className={`glass-card flex h-11 w-11 items-center justify-center rounded-xl ${
            task.pinned ? "text-teal-200" : "text-zinc-300"
          }`}
          aria-label={task.pinned ? "Unpin task" : "Pin task"}
        >
          {task.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          transition={SPRING}
          onClick={() => onOpenDetails(task.id)}
          className="glass-card flex h-11 w-11 items-center justify-center rounded-xl text-zinc-300"
          aria-label="Open details"
        >
          <MoreHorizontal className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.article>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className="glass-card rounded-3xl p-8 text-center"
      data-active="true"
    >
      <div className="mx-auto mb-4 h-40 w-40 text-zinc-500">
        <svg viewBox="0 0 220 220" fill="none" className="h-full w-full">
          <defs>
            <linearGradient id="emptyGlow" x1="0" y1="0" x2="220" y2="220">
              <stop stopColor="#5EEAD4" stopOpacity="0.45" />
              <stop offset="1" stopColor="#A78BFA" stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r="80" stroke="url(#emptyGlow)" strokeWidth="1.5" />
          <rect x="70" y="66" width="80" height="98" rx="16" stroke="url(#emptyGlow)" strokeWidth="1.5" />
          <path d="M86 94h48M86 112h48M86 130h30" stroke="url(#emptyGlow)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="154" cy="152" r="16" fill="url(#emptyGlow)" fillOpacity="0.2" />
          <path d="M148 152l4 4 8-10" stroke="#CCFBF1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="text-xl font-bold">No streaks yet</h2>
      <p className="mt-2 text-sm text-zinc-400">Tap + to create your first habit streak.</p>
    </motion.div>
  );
}

export default function TasksPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0B0B0B] text-zinc-400">
          Loading tasks...
        </div>
      }
    >
      <TasksContent />
    </Suspense>
  );
}

