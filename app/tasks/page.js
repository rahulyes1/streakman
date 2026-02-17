"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import FloatingAddButton from "@/components/FloatingAddButton";

const PREMADE_TASKS = [
  // Morning Routine
  { name: "Morning Workout", emoji: "💪" },
  { name: "Meditation", emoji: "🧘" },
  { name: "Make Bed", emoji: "🛏️" },
  { name: "Drink Water", emoji: "💧" },
  { name: "Cold Shower", emoji: "🚿" },
  { name: "Journaling", emoji: "📔" },

  // Health & Fitness
  { name: "10k Steps", emoji: "🚶" },
  { name: "Gym Session", emoji: "🏋️" },
  { name: "Yoga", emoji: "🧘‍♀️" },
  { name: "Running", emoji: "🏃" },
  { name: "Stretching", emoji: "🤸" },
  { name: "Track Calories", emoji: "🍽️" },

  // Learning
  { name: "Read Book", emoji: "📚" },
  { name: "Learn Language", emoji: "🗣️" },
  { name: "Online Course", emoji: "💻" },
  { name: "Practice Coding", emoji: "👨‍💻" },
  { name: "Watch Tutorial", emoji: "📺" },
  { name: "Study", emoji: "📖" },

  // Productivity
  { name: "Plan Day", emoji: "📅" },
  { name: "Deep Work", emoji: "⚡" },
  { name: "No Social Media", emoji: "📵" },
  { name: "Inbox Zero", emoji: "📧" },
  { name: "Clean Desk", emoji: "🧹" },
  { name: "Review Goals", emoji: "🎯" },

  // Creativity
  { name: "Draw/Paint", emoji: "🎨" },
  { name: "Write", emoji: "✍️" },
  { name: "Play Music", emoji: "🎸" },
  { name: "Photography", emoji: "📷" },
  { name: "Practice Instrument", emoji: "🎹" },

  // Wellness
  { name: "Sleep 8hrs", emoji: "😴" },
  { name: "Gratitude Journal", emoji: "🙏" },
  { name: "No Caffeine PM", emoji: "☕" },
  { name: "Skin Care", emoji: "🧴" },
  { name: "Vitamins", emoji: "💊" },
  { name: "Mindfulness", emoji: "🌸" },

  // Social
  { name: "Call Family", emoji: "👨‍👩‍👧" },
  { name: "Text Friend", emoji: "💬" },
  { name: "Quality Time", emoji: "❤️" },
  { name: "Help Someone", emoji: "🤝" },
];

function TasksContent() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({ name: "", emoji: "📝" });
  const [freezeTokens, setFreezeTokens] = useState(0);

  // Load tasks
  useEffect(() => {
    const loadTasks = () => {
      const saved = localStorage.getItem('streakman_tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    };

    loadTasks();

    // Listen for updates
    const handleUpdate = () => loadTasks();
    window.addEventListener('tasksUpdated', handleUpdate);
    return () => window.removeEventListener('tasksUpdated', handleUpdate);
  }, []);

  // Load freeze tokens
  useEffect(() => {
    const loadTokens = () => {
      const tokens = parseInt(localStorage.getItem('streakman_freeze_tokens') || '0');
      setFreezeTokens(tokens);
    };

    loadTokens();

    const handleUpdate = () => loadTokens();
    window.addEventListener('tokensUpdated', handleUpdate);
    return () => window.removeEventListener('tokensUpdated', handleUpdate);
  }, []);

  // Check if should open add modal from URL
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddModal(true);
    }
  }, [searchParams]);

  // Save tasks to localStorage
  const saveTasks = (updatedTasks) => {
    localStorage.setItem('streakman_tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    window.dispatchEvent(new Event('tasksUpdated'));
  };

  // Add new task
  const handleAddTask = () => {
    if (!newTask.name.trim()) return;

    const task = {
      id: Date.now().toString(),
      name: newTask.name.trim(),
      emoji: newTask.emoji,
      pinned: false,
      streak: 0,
      bestStreak: 0,
      completedToday: false,
      lastCompletedDate: null,
      completionHistory: Array(7).fill(false),
      freezeProtected: false,
    };

    saveTasks([...tasks, task]);
    setNewTask({ name: "", emoji: "📝" });
    setShowAddModal(false);
  };

  // Toggle pin
  const togglePin = (taskId) => {
    const pinnedCount = tasks.filter(t => t.pinned).length;
    const task = tasks.find(t => t.id === taskId);

    if (!task.pinned && pinnedCount >= 5) {
      alert("Maximum 5 pinned tasks allowed");
      return;
    }

    const updated = tasks.map(t =>
      t.id === taskId ? { ...t, pinned: !t.pinned } : t
    );
    saveTasks(updated);
  };

  // Complete task
  const completeTask = (taskId) => {
    const updated = tasks.map(task => {
      if (task.id !== taskId || task.completedToday) return task;

      const newStreak = task.streak + 1;
      const newBestStreak = Math.max(newStreak, task.bestStreak);

      // Update XP
      const currentXP = parseInt(localStorage.getItem('streakman_xp') || '0');
      localStorage.setItem('streakman_xp', (currentXP + 40).toString());
      window.dispatchEvent(new Event('xpUpdated'));

      // Update total completions
      const totalCompletions = parseInt(localStorage.getItem('streakman_total_completions') || '0');
      localStorage.setItem('streakman_total_completions', (totalCompletions + 1).toString());

      // Update completion history
      const history = [...task.completionHistory];
      history.shift();
      history.push(true);

      return {
        ...task,
        completedToday: true,
        streak: newStreak,
        bestStreak: newBestStreak,
        lastCompletedDate: new Date().toDateString(),
        completionHistory: history,
      };
    });

    saveTasks(updated);
  };

  // Archive task
  const archiveTask = (taskId) => {
    if (window.confirm("Archive this task? You can restore it later.")) {
      const updated = tasks.filter(t => t.id !== taskId);
      saveTasks(updated);
      setSelectedTask(null);
    }
  };

  // Freeze/Unfreeze task
  const toggleFreeze = (taskId) => {
    const task = tasks.find(t => t.id === taskId);

    if (!task.freezeProtected) {
      // Activate freeze
      if (freezeTokens <= 0) {
        alert("No freeze tokens available! Earn them from the Daily Spin.");
        return;
      }

      const updated = tasks.map(t =>
        t.id === taskId ? { ...t, freezeProtected: true } : t
      );
      saveTasks(updated);

      // Deduct token
      const newTokens = freezeTokens - 1;
      localStorage.setItem('streakman_freeze_tokens', newTokens.toString());
      setFreezeTokens(newTokens);
      window.dispatchEvent(new Event('tokensUpdated'));

      setSelectedTask({ ...task, freezeProtected: true });
    } else {
      // Deactivate freeze (refund token)
      const updated = tasks.map(t =>
        t.id === taskId ? { ...t, freezeProtected: false } : t
      );
      saveTasks(updated);

      const newTokens = freezeTokens + 1;
      localStorage.setItem('streakman_freeze_tokens', newTokens.toString());
      setFreezeTokens(newTokens);
      window.dispatchEvent(new Event('tokensUpdated'));

      setSelectedTask({ ...task, freezeProtected: false });
    }
  };

  // Edit task
  const [editingTask, setEditingTask] = useState(null);

  const saveEdit = () => {
    if (!editingTask.name.trim()) return;

    const updated = tasks.map(t =>
      t.id === editingTask.id
        ? { ...t, name: editingTask.name, emoji: editingTask.emoji }
        : t
    );
    saveTasks(updated);
    setEditingTask(null);
    setSelectedTask(tasks.find(t => t.id === editingTask.id));
  };

  const pinnedTasks = tasks.filter(t => t.pinned);
  const unpinnedTasks = tasks.filter(t => !t.pinned);

  return (
    <>
      <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">My Streaks</h1>
            <div className="flex items-center gap-2">
              <div className="bg-[#60A5FA] text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                💎 {freezeTokens}
              </div>
              <div className="bg-[#60A5FA] text-white text-sm font-bold px-3 py-1 rounded-full">
                {tasks.length}
              </div>
            </div>
          </div>

          {tasks.length === 0 ? (
            /* Empty State */
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-xl text-[#94A3B8] mb-2">No streaks yet!</p>
              <p className="text-[#64748B]">Tap + to create one</p>
            </div>
          ) : (
            <>
              {/* Pinned Tasks */}
              {pinnedTasks.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wide">
                    Pinned
                  </h2>
                  <div className="space-y-2">
                    {pinnedTasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onTogglePin={togglePin}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Tasks */}
              {unpinnedTasks.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wide">
                    All Tasks
                  </h2>
                  <div className="space-y-2">
                    {unpinnedTasks.map(task => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        onTogglePin={togglePin}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && !editingTask && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] w-full max-w-md">
            {/* Header */}
            <div className="p-6 border-b border-[#334155]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{selectedTask.emoji}</span>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTask.name}</h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-[#94A3B8] hover:text-[#F1F5F9] text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Streak Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0F172A] rounded-lg p-3 text-center">
                  <p className="text-xs text-[#94A3B8] mb-1">Current Streak</p>
                  <p className="text-2xl font-bold">
                    {selectedTask.streak} {selectedTask.streak >= 7 && "🔥"}
                  </p>
                </div>
                <div className="bg-[#0F172A] rounded-lg p-3 text-center">
                  <p className="text-xs text-[#94A3B8] mb-1">Best Streak</p>
                  <p className="text-2xl font-bold">{selectedTask.bestStreak}</p>
                </div>
              </div>
            </div>

            {/* Completion History */}
            <div className="p-6 border-b border-[#334155]">
              <p className="text-sm text-[#94A3B8] mb-3">Last 7 Days</p>
              <div className="flex gap-2">
                {selectedTask.completionHistory.map((completed, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-12 rounded-lg flex items-center justify-center ${
                      completed ? "bg-[#34D399]" : "bg-[#0F172A]"
                    }`}
                  >
                    <span className="text-2xl">{completed ? "✅" : "❌"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 space-y-3">
              {!selectedTask.completedToday ? (
                <button
                  onClick={() => {
                    completeTask(selectedTask.id);
                    setSelectedTask({
                      ...selectedTask,
                      completedToday: true,
                      streak: selectedTask.streak + 1,
                    });
                  }}
                  className="w-full py-3 rounded-xl font-semibold bg-[#60A5FA] text-white hover:bg-[#3B82F6] transition-colors"
                >
                  Mark Complete
                </button>
              ) : (
                <div className="w-full py-3 rounded-xl font-semibold bg-[#34D399] text-white text-center">
                  ✅ Completed!
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setEditingTask(selectedTask)}
                  className="py-2 rounded-lg font-medium bg-[#0F172A] text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  ⚙️ Edit
                </button>
                <button
                  onClick={() => togglePin(selectedTask.id)}
                  className={`py-2 rounded-lg font-medium transition-colors ${
                    selectedTask.pinned
                      ? "bg-[#60A5FA] text-white"
                      : "bg-[#0F172A] text-[#94A3B8] hover:text-[#F1F5F9]"
                  }`}
                >
                  📌 {selectedTask.pinned ? "Unpin" : "Pin"}
                </button>
              </div>

              <button
                onClick={() => toggleFreeze(selectedTask.id)}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  selectedTask.freezeProtected
                    ? "bg-[#34D399] text-white"
                    : "bg-[#0F172A] text-[#94A3B8] hover:text-[#F1F5F9] border border-[#334155]"
                }`}
              >
                💎 {selectedTask.freezeProtected ? "Protected" : `Freeze (${freezeTokens} tokens)`}
              </button>

              <button
                onClick={() => archiveTask(selectedTask.id)}
                className="w-full py-2 rounded-lg font-medium bg-[#0F172A] text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
              >
                🗑️ Archive Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Edit Task</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Emoji</label>
                <input
                  type="text"
                  value={editingTask.emoji}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, emoji: e.target.value })
                  }
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-2xl text-center"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Task Name</label>
                <input
                  type="text"
                  value={editingTask.name}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, name: e.target.value })
                  }
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2"
                  placeholder="Enter task name"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingTask(null)}
                className="flex-1 py-3 rounded-xl font-semibold bg-[#0F172A] text-[#94A3B8] hover:border-[#60A5FA] border border-[#334155] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-3 rounded-xl font-semibold bg-[#60A5FA] text-white hover:bg-[#3B82F6] transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] w-full max-w-md p-6 my-8">
            <h2 className="text-xl font-bold mb-4">New Streak</h2>

            {/* Pre-made Tasks Library */}
            <div className="mb-6">
              <p className="text-sm text-[#94A3B8] mb-3">Quick Add:</p>
              <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                {PREMADE_TASKS.map((task, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewTask({ name: task.name, emoji: task.emoji });
                    }}
                    className="bg-[#0F172A] border border-[#334155] rounded-lg p-2 text-left hover:border-[#60A5FA] transition-colors"
                  >
                    <span className="text-xl mr-2">{task.emoji}</span>
                    <span className="text-xs">{task.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#334155] pt-4 mb-4">
              <p className="text-sm text-[#94A3B8] mb-3">Or create custom:</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Emoji</label>
                <input
                  type="text"
                  value={newTask.emoji}
                  onChange={(e) =>
                    setNewTask({ ...newTask, emoji: e.target.value })
                  }
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-2xl text-center"
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Task Name</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) =>
                    setNewTask({ ...newTask, name: e.target.value })
                  }
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2"
                  placeholder="e.g., Morning Workout"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTask({ name: "", emoji: "📝" });
                }}
                className="flex-1 py-3 rounded-xl font-semibold bg-[#0F172A] text-[#94A3B8] hover:border-[#60A5FA] border border-[#334155] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="flex-1 py-3 rounded-xl font-semibold bg-[#60A5FA] text-white hover:bg-[#3B82F6] transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <FloatingAddButton onClick={() => setShowAddModal(true)} />
      <BottomNav />
    </>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <p className="text-[#94A3B8] text-lg">Loading...</p>
      </div>
    }>
      <TasksContent />
    </Suspense>
  );
}

// Task Row Component
function TaskRow({ task, onTogglePin, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#1E293B] rounded-xl border p-4 cursor-pointer transition-all hover:border-[#60A5FA]/50 ${
        task.completedToday
          ? "border-[#34D399] shadow-lg shadow-[#34D399]/20"
          : "border-[#334155]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{task.emoji}</span>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{task.name}</h3>
            {task.freezeProtected && (
              <span className="text-xs px-2 py-0.5 bg-[#34D399]/20 text-[#34D399] rounded-full border border-[#34D399]/30">
                💎
              </span>
            )}
          </div>
          <p className="text-sm text-[#94A3B8]">
            🔥 {task.streak} {task.streak === 1 ? "day" : "days"}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(task.id);
          }}
          className={`text-xl transition-colors ${
            task.pinned ? "text-[#60A5FA]" : "text-[#94A3B8]"
          }`}
        >
          📌
        </button>
      </div>
    </div>
  );
}
