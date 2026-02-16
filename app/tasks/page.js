"use client";

import { useState } from "react";

const TASK_LIBRARY = {
  fitness: [
    { id: "lib_workout", name: "Morning Workout", emoji: "🏃", description: "Daily exercise routine", difficulties: { easy: "10-min walk", normal: "30-min workout", hard: "45-min + stretching", extreme: "1-hour + meal prep" } },
    { id: "lib_water", name: "Drink Water", emoji: "💧", description: "Stay hydrated throughout day", difficulties: { easy: "4 glasses", normal: "8 glasses", hard: "10 glasses", extreme: "12 glasses + track" } },
    { id: "lib_steps", name: "10,000 Steps", emoji: "🚶", description: "Daily step goal", difficulties: { easy: "5k steps", normal: "10k steps", hard: "12k steps", extreme: "15k+ steps" } },
    { id: "lib_yoga", name: "Yoga/Stretching", emoji: "🧘", description: "Flexibility and mobility", difficulties: { easy: "5min", normal: "15min", hard: "30min", extreme: "45min + meditation" } },
    { id: "lib_meals", name: "Healthy Meals", emoji: "🥗", description: "Nutritious eating", difficulties: { easy: "1 healthy meal", normal: "2 meals", hard: "All meals", extreme: "Meal prep week" } },
    { id: "lib_sleep", name: "Sleep 8 Hours", emoji: "😴", description: "Quality rest", difficulties: { easy: "6hrs", normal: "7hrs", hard: "8hrs", extreme: "9hrs + routine" } },
    { id: "lib_nojunk", name: "No Junk Food", emoji: "🚫", description: "Avoid processed foods", difficulties: { easy: "1 snack max", normal: "None", hard: "None + no sugar", extreme: "Clean eating" } },
    { id: "lib_vitamins", name: "Vitamins/Supplements", emoji: "💊", description: "Daily nutrition support", difficulties: { easy: "Remember once", normal: "Daily", hard: "All meals", extreme: "Track nutrition" } },
  ],
  learning: [
    { id: "lib_reading", name: "Reading", emoji: "📚", description: "Read books or articles", difficulties: { easy: "5 pages or 10min", normal: "30 minutes", hard: "45 minutes", extreme: "1+ hour with notes" } },
    { id: "lib_skill", name: "Learn New Skill", emoji: "🎓", description: "Practice new ability", difficulties: { easy: "10min", normal: "30min", hard: "1hr", extreme: "2hr + project" } },
    { id: "lib_journal", name: "Writing/Journaling", emoji: "✍️", description: "Daily reflection", difficulties: { easy: "5 minutes", normal: "15 minutes", hard: "30 minutes", extreme: "1 hour deep writing" } },
    { id: "lib_study", name: "Study/Focus Work", emoji: "💼", description: "Concentrated learning", difficulties: { easy: "25min pomodoro", normal: "2 pomodoros", hard: "4 pomodoros", extreme: "6+ pomodoros" } },
    { id: "lib_language", name: "Learn Language", emoji: "🌍", description: "Practice foreign language", difficulties: { easy: "5min app", normal: "20min practice", hard: "45min + conversation", extreme: "1hr immersion" } },
    { id: "lib_course", name: "Online Course", emoji: "🎥", description: "Structured learning", difficulties: { easy: "Watch 1 video", normal: "30min lesson", hard: "Complete module", extreme: "Quiz + practice" } },
  ],
  mindfulness: [
    { id: "lib_meditation", name: "Meditation", emoji: "🧘", description: "Mindfulness practice", difficulties: { easy: "3 minutes", normal: "10 minutes", hard: "20 minutes", extreme: "30min + journaling" } },
    { id: "lib_gratitude", name: "Gratitude Practice", emoji: "🙏", description: "Count your blessings", difficulties: { easy: "1 thing", normal: "3 things", hard: "5 things + why", extreme: "10 things + reflection" } },
    { id: "lib_nosocial", name: "No Social Media", emoji: "📵", description: "Digital detox", difficulties: { easy: "1hr break", normal: "3hr break", hard: "6hr break", extreme: "Full day" } },
    { id: "lib_breathwork", name: "Breathwork", emoji: "🫁", description: "Breathing exercises", difficulties: { easy: "5 breaths", normal: "5min", hard: "10min", extreme: "20min + cold shower" } },
    { id: "lib_affirmations", name: "Affirmations", emoji: "💭", description: "Positive self-talk", difficulties: { easy: "Read once", normal: "3 times", hard: "Write own", extreme: "Record + listen" } },
  ],
  household: [
    { id: "lib_clean", name: "Clean/Organize", emoji: "🧹", description: "Maintain living space", difficulties: { easy: "Make bed", normal: "Tidy room", hard: "Deep clean area", extreme: "Full organization" } },
    { id: "lib_plants", name: "Water Plants", emoji: "🌱", description: "Care for greenery", difficulties: { easy: "Indoor plants", normal: "All plants", hard: "Check soil", extreme: "Water + fertilize + prune" } },
    { id: "lib_cook", name: "Cook Meal", emoji: "🍳", description: "Prepare food at home", difficulties: { easy: "Simple meal", normal: "Home-cooked", hard: "New recipe", extreme: "Meal prep week" } },
    { id: "lib_wake", name: "Early Wake", emoji: "🌅", description: "Start day early", difficulties: { easy: "Before 8am", normal: "Before 7am", hard: "Before 6am", extreme: "Before 5am" } },
    { id: "lib_laundry", name: "Laundry/Dishes", emoji: "🧺", description: "Household chores", difficulties: { easy: "One load", normal: "All pending", hard: "Fold + put away", extreme: "Deep clean" } },
    { id: "lib_plan", name: "Plan Tomorrow", emoji: "📅", description: "Daily planning", difficulties: { easy: "Mental check", normal: "Write 3 tasks", hard: "Full schedule", extreme: "Week planning" } },
  ],
  creative: [
    { id: "lib_instrument", name: "Practice Instrument", emoji: "🎸", description: "Musical practice", difficulties: { easy: "10min", normal: "30min", hard: "1hr", extreme: "2hr + new song" } },
    { id: "lib_art", name: "Draw/Paint", emoji: "🎨", description: "Visual art creation", difficulties: { easy: "Sketch", normal: "30min", hard: "1hr piece", extreme: "Complete artwork" } },
    { id: "lib_photo", name: "Photography", emoji: "📷", description: "Capture moments", difficulties: { easy: "5 photos", normal: "20 photos", hard: "Photo walk 1hr", extreme: "Edit + post series" } },
    { id: "lib_writing", name: "Creative Writing", emoji: "✍️", description: "Write stories", difficulties: { easy: "100 words", normal: "500 words", hard: "1000 words", extreme: "Full chapter" } },
    { id: "lib_craft", name: "Craft/DIY", emoji: "🛠️", description: "Hands-on projects", difficulties: { easy: "15min", normal: "30min project", hard: "1hr work", extreme: "Complete project" } },
  ],
  social: [
    { id: "lib_call", name: "Call Family/Friend", emoji: "☎️", description: "Stay connected", difficulties: { easy: "Text check-in", normal: "10min call", hard: "30min call", extreme: "Video + quality time" } },
    { id: "lib_kindness", name: "Acts of Kindness", emoji: "💝", description: "Help others", difficulties: { easy: "1 kind act", normal: "3 acts", hard: "5 acts", extreme: "Volunteer" } },
    { id: "lib_partner", name: "Quality Time Partner", emoji: "❤️", description: "Nurture relationship", difficulties: { easy: "15min together", normal: "30min activity", hard: "1hr date", extreme: "Special experience" } },
    { id: "lib_network", name: "Network/Connect", emoji: "🤝", description: "Build relationships", difficulties: { easy: "1 message", normal: "Coffee chat", hard: "Attend event", extreme: "Host gathering" } },
  ],
  finance: [
    { id: "lib_expenses", name: "Track Expenses", emoji: "💰", description: "Monitor spending", difficulties: { easy: "Note spending", normal: "Log all", hard: "Budget review", extreme: "Full audit" } },
    { id: "lib_sideproject", name: "Side Project", emoji: "💻", description: "Work on goals", difficulties: { easy: "15min", normal: "1hr", hard: "2hr", extreme: "4hr deep work" } },
    { id: "lib_nobuy", name: "No Impulse Buy", emoji: "🛒", description: "Mindful spending", difficulties: { easy: "Delay 1 purchase", normal: "None today", hard: "List needs only", extreme: "Week freeze" } },
  ],
  environment: [
    { id: "lib_eco", name: "Eco Choice", emoji: "♻️", description: "Sustainable living", difficulties: { easy: "Reusable bag", normal: "No single-use plastic", hard: "Bike vs drive", extreme: "Zero waste day" } },
    { id: "lib_recycle", name: "Recycle/Compost", emoji: "🗑️", description: "Waste management", difficulties: { easy: "Recycle", normal: "Recycle + compost", hard: "Sort all", extreme: "Audit waste" } },
    { id: "lib_watercons", name: "Water Conservation", emoji: "💧", description: "Save water", difficulties: { easy: "Shorter shower", normal: "Fix leaks", hard: "Collect greywater", extreme: "Track all use" } },
  ],
};

const CATEGORIES = [
  { id: "fitness", label: "Fitness", icon: "🏃" },
  { id: "learning", label: "Learning", icon: "🎓" },
  { id: "mindfulness", label: "Mindfulness", icon: "🧘" },
  { id: "household", label: "Household", icon: "🧹" },
  { id: "creative", label: "Creative", icon: "🎨" },
  { id: "social", label: "Social", icon: "❤️" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "environment", label: "Environment", icon: "♻️" },
];

export default function TasksPage() {
  const [activeTasks, setActiveTasks] = useState([]);
  const [archivedTasks, setArchivedTasks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("fitness");
  const [showLibrary, setShowLibrary] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showToast, setShowToast] = useState(null);
  const [customTask, setCustomTask] = useState({
    name: "",
    emoji: "🎯",
    category: "fitness",
    useDefaults: true,
    difficulties: { easy: "", normal: "", hard: "", extreme: "" }
  });

  function addTaskToActive(libraryTask) {
    if (activeTasks.length >= 8) {
      setShowToast("⚠️ You can track up to 8 streaks at once. Archive a task to add more.");
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    const newTask = {
      id: `active_${Date.now()}`,
      name: libraryTask.name,
      emoji: libraryTask.emoji,
      streak: 0,
      score: 0,
      category: activeCategory,
      customized: false,
      difficulties: {
        easy: { label: "Light effort", points: 20, customLabel: libraryTask.difficulties.easy },
        normal: { label: "Normal effort", points: 40, customLabel: libraryTask.difficulties.normal },
        hard: { label: "High effort", points: 60, customLabel: libraryTask.difficulties.hard },
        extreme: { label: "Max effort", points: 80, customLabel: libraryTask.difficulties.extreme }
      }
    };

    setActiveTasks([...activeTasks, newTask]);
    setShowToast("✅ Added! Tap ⚙️ to customize");
    setTimeout(() => setShowToast(null), 2000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function archiveTask(taskId) {
    const task = activeTasks.find(t => t.id === taskId);
    if (task) {
      setArchivedTasks([...archivedTasks, task]);
      setActiveTasks(activeTasks.filter(t => t.id !== taskId));
    }
  }

  function restoreTask(taskId) {
    if (activeTasks.length >= 8) {
      setShowToast("⚠️ You can track up to 8 streaks at once. Archive another task first.");
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    const task = archivedTasks.find(t => t.id === taskId);
    if (task) {
      setActiveTasks([...activeTasks, task]);
      setArchivedTasks(archivedTasks.filter(t => t.id !== taskId));
    }
  }

  function createCustomTask() {
    if (!customTask.name.trim()) {
      setShowToast("⚠️ Please enter a task name");
      setTimeout(() => setShowToast(null), 2000);
      return;
    }

    if (activeTasks.length >= 8) {
      setShowToast("⚠️ You can track up to 8 streaks at once. Archive a task to add more.");
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    const newTask = {
      id: `custom_${Date.now()}`,
      name: customTask.name,
      emoji: customTask.emoji,
      streak: 0,
      score: 0,
      category: customTask.category,
      customized: !customTask.useDefaults,
      difficulties: {
        easy: {
          label: "Light effort",
          points: 20,
          customLabel: customTask.useDefaults ? null : (customTask.difficulties.easy || null)
        },
        normal: {
          label: "Normal effort",
          points: 40,
          customLabel: customTask.useDefaults ? null : (customTask.difficulties.normal || null)
        },
        hard: {
          label: "High effort",
          points: 60,
          customLabel: customTask.useDefaults ? null : (customTask.difficulties.hard || null)
        },
        extreme: {
          label: "Max effort",
          points: 80,
          customLabel: customTask.useDefaults ? null : (customTask.difficulties.extreme || null)
        }
      }
    };

    setActiveTasks([...activeTasks, newTask]);
    setShowCreateModal(false);
    setCustomTask({
      name: "",
      emoji: "🎯",
      category: "fitness",
      useDefaults: true,
      difficulties: { easy: "", normal: "", hard: "", extreme: "" }
    });
    setShowToast("✅ Custom task created!");
    setTimeout(() => setShowToast(null), 2000);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const filteredLibrary = searchQuery
    ? Object.entries(TASK_LIBRARY).reduce((acc, [category, tasks]) => {
        const filtered = tasks.filter(task =>
          task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) acc[category] = filtered;
        return acc;
      }, {})
    : { [activeCategory]: TASK_LIBRARY[activeCategory] };

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] px-4 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Manage Your Streaks</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#60A5FA] to-[#34D399] text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
          >
            + Create Custom Task
          </button>
        </div>

        {/* Active Tasks Section */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Active Tasks ({activeTasks.length}/8)
          </h2>

          {activeTasks.length === 0 ? (
            <p className="text-[#94A3B8] text-center py-8">
              No active tasks yet. Add tasks from the library below.
            </p>
          ) : (
            <div className="space-y-3">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#0F172A] rounded-xl p-4 flex items-center justify-between gap-4 border border-[#334155] hover:border-[#60A5FA]/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-3xl">{task.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{task.name}</h3>
                      <p className="text-sm text-[#94A3B8]">
                        Streak: {task.streak} days • Score: {task.score}/100
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="text-[#94A3B8] hover:text-[#60A5FA] transition-colors p-2"
                      title="Customize"
                    >
                      ⚙️
                    </button>
                    <button
                      onClick={() => archiveTask(task.id)}
                      className="text-[#94A3B8] hover:text-[#EF4444] transition-colors p-2"
                      title="Archive"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Archived Tasks Section */}
        {archivedTasks.length > 0 && (
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5 mb-6">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="w-full flex items-center justify-between text-lg font-semibold mb-4"
            >
              <span>Archived Tasks ({archivedTasks.length})</span>
              <span>{showArchived ? '▼' : '▶'}</span>
            </button>

            {showArchived && (
              <div className="space-y-3">
                {archivedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#0F172A] rounded-xl p-4 flex items-center justify-between gap-4 border border-[#334155] opacity-60"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-3xl">{task.emoji}</span>
                      <div>
                        <h3 className="font-semibold">{task.name}</h3>
                        <p className="text-sm text-[#94A3B8]">
                          Final Streak: {task.streak} days
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => restoreTask(task.id)}
                      className="text-sm bg-[#60A5FA] text-white px-4 py-2 rounded-lg hover:bg-[#3B82F6] transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Task Library */}
        <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="w-full flex items-center justify-between text-xl font-semibold mb-4"
          >
            <span>Browse Task Library</span>
            <span>{showLibrary ? '▼' : '▶'}</span>
          </button>

          {showLibrary && (
            <>
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F172A] border border-[#334155] rounded-xl px-4 py-3 mb-4 text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#60A5FA] transition-colors"
              />

              {/* Category Tabs */}
              {!searchQuery && (
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                        activeCategory === cat.id
                          ? "bg-[#60A5FA] text-white"
                          : "bg-[#0F172A] text-[#94A3B8] hover:text-[#F1F5F9]"
                      }`}
                    >
                      {cat.icon} {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Task Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(filteredLibrary).map(([category, tasks]) =>
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-[#0F172A] rounded-xl p-4 border border-[#334155] hover:border-[#60A5FA]/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{task.emoji}</span>
                        <h3 className="font-semibold">{task.name}</h3>
                      </div>
                      <p className="text-sm text-[#94A3B8] mb-3">
                        {task.description}
                      </p>
                      <p className="text-xs text-[#64748B] mb-3">
                        e.g., {task.difficulties.easy} | {task.difficulties.normal} | {task.difficulties.hard} | {task.difficulties.extreme}
                      </p>
                      <button
                        onClick={() => addTaskToActive(task)}
                        className="w-full bg-[#60A5FA] text-white py-2 rounded-lg font-semibold hover:bg-[#3B82F6] transition-colors"
                      >
                        + Add to Active
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create Custom Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[#1E293B] border-b border-[#334155] p-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Create Custom Task</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] text-2xl"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {/* Task Name */}
              <div>
                <label className="block text-sm font-medium mb-2">Task Name</label>
                <input
                  type="text"
                  value={customTask.name}
                  onChange={(e) => setCustomTask({ ...customTask, name: e.target.value })}
                  placeholder="Enter task name"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#60A5FA]"
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm font-medium mb-2">Emoji</label>
                <input
                  type="text"
                  value={customTask.emoji}
                  onChange={(e) => setCustomTask({ ...customTask, emoji: e.target.value })}
                  placeholder="🎯"
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#60A5FA]"
                  maxLength={2}
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={customTask.category}
                  onChange={(e) => setCustomTask({ ...customTask, category: e.target.value })}
                  className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] focus:outline-none focus:border-[#60A5FA]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Use Defaults Toggle */}
              <div className="bg-[#0F172A] rounded-lg p-4 border border-[#334155]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customTask.useDefaults}
                    onChange={(e) => setCustomTask({ ...customTask, useDefaults: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Use Smart Defaults</span>
                </label>
              </div>

              {/* Custom Difficulties */}
              {!customTask.useDefaults && (
                <div className="space-y-3">
                  <p className="text-sm text-[#94A3B8]">
                    💡 Leave blank to use generic effort levels
                  </p>
                  {["easy", "normal", "hard", "extreme"].map((diff, idx) => (
                    <div key={diff}>
                      <label className="block text-sm font-medium mb-2 capitalize">
                        {diff} ({[20, 40, 60, 80][idx]}pts)
                      </label>
                      <input
                        type="text"
                        value={customTask.difficulties[diff]}
                        onChange={(e) =>
                          setCustomTask({
                            ...customTask,
                            difficulties: { ...customTask.difficulties, [diff]: e.target.value }
                          })
                        }
                        placeholder={`e.g., Your ${diff} goal`}
                        className="w-full bg-[#0F172A] border border-[#334155] rounded-lg px-3 py-2 text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#60A5FA]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[#1E293B] border-t border-[#334155] p-5 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 rounded-xl font-semibold bg-[#0F172A] text-[#94A3B8] border border-[#334155] hover:border-[#60A5FA] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createCustomTask}
                className="flex-1 py-3 rounded-xl font-semibold bg-[#60A5FA] text-white hover:bg-[#3B82F6] transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-[#1E293B] border border-[#334155] rounded-xl px-6 py-3 shadow-2xl">
            <p className="text-sm font-medium">{showToast}</p>
          </div>
        </div>
      )}
    </div>
  );
}
