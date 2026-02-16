"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TaskCard from "@/components/TaskCard";
import CustomizeModal from "@/components/CustomizeModal";
import XPBar from "@/components/XPBar";
import BadgeDisplay from "@/components/BadgeDisplay";
import DailySpin from "@/components/DailySpin";

const DEFAULT_TASKS = [
  {
    id: "1",
    name: "Morning Workout",
    emoji: "🏃",
    streak: 0,
    completedToday: false,
    selectedDifficulty: "normal",
    customized: false,
    freezeProtected: false,
    difficulties: {
      easy: { label: "Light effort", points: 20, customLabel: "10-min walk" },
      normal: { label: "Normal effort", points: 40, customLabel: "30-min workout" },
      hard: { label: "High effort", points: 60, customLabel: "45-min + stretching" },
      extreme: { label: "Max effort", points: 80, customLabel: "1-hour + meal prep" }
    }
  },
  {
    id: "2",
    name: "Drink Water",
    emoji: "💧",
    streak: 0,
    completedToday: false,
    selectedDifficulty: "normal",
    customized: false,
    freezeProtected: false,
    difficulties: {
      easy: { label: "Light effort", points: 20, customLabel: "4 glasses" },
      normal: { label: "Normal effort", points: 40, customLabel: "8 glasses" },
      hard: { label: "High effort", points: 60, customLabel: "10 glasses" },
      extreme: { label: "Max effort", points: 80, customLabel: "12 glasses + track" }
    }
  },
  {
    id: "3",
    name: "Reading",
    emoji: "📚",
    streak: 0,
    completedToday: false,
    selectedDifficulty: "normal",
    customized: false,
    freezeProtected: false,
    difficulties: {
      easy: { label: "Light effort", points: 20, customLabel: "5 pages or 10min" },
      normal: { label: "Normal effort", points: 40, customLabel: "30 minutes" },
      hard: { label: "High effort", points: 60, customLabel: "45 minutes" },
      extreme: { label: "Max effort", points: 80, customLabel: "1+ hour with notes" }
    }
  },
  {
    id: "4",
    name: "Meditation",
    emoji: "🧘",
    streak: 0,
    completedToday: false,
    selectedDifficulty: "normal",
    customized: false,
    freezeProtected: false,
    difficulties: {
      easy: { label: "Light effort", points: 20, customLabel: "3 minutes" },
      normal: { label: "Normal effort", points: 40, customLabel: "10 minutes" },
      hard: { label: "High effort", points: 60, customLabel: "20 minutes" },
      extreme: { label: "Max effort", points: 80, customLabel: "30min + journaling" }
    }
  },
  {
    id: "5",
    name: "Journaling",
    emoji: "✍️",
    streak: 0,
    completedToday: false,
    selectedDifficulty: "normal",
    customized: false,
    freezeProtected: false,
    difficulties: {
      easy: { label: "Light effort", points: 20, customLabel: "5 minutes" },
      normal: { label: "Normal effort", points: 40, customLabel: "15 minutes" },
      hard: { label: "High effort", points: 60, customLabel: "30 minutes" },
      extreme: { label: "Max effort", points: 80, customLabel: "1 hour deep writing" }
    }
  }
];

export default function Home() {
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [totalScore, setTotalScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [freezeTokens, setFreezeTokens] = useState(2);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showProTipBanner, setShowProTipBanner] = useState(true);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [completionCount, setCompletionCount] = useState(0);
  const [xpPopup, setXpPopup] = useState(null);
  const [levelUpNotification, setLevelUpNotification] = useState(null);
  const [canSpin, setCanSpin] = useState(false);

  const currentStreak = Math.max(...tasks.map(t => t.streak), 0);

  // Check if daily spin is available
  useEffect(() => {
    const lastSpinDate = localStorage.getItem('lastSpinDate');
    const today = new Date().toDateString();
    setCanSpin(!lastSpinDate || lastSpinDate !== today);
  }, []);

  // Check for level up when XP changes
  useEffect(() => {
    const newLevel = Math.floor(totalXP / 1000) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      setLevelUpNotification(newLevel);
      setTimeout(() => setLevelUpNotification(null), 3000);
    }
  }, [totalXP, level]);

  // Check for encouragement after 3 completions with defaults
  useEffect(() => {
    const hasCustomized = tasks.some(t => t.customized);
    if (!hasCustomized && completionCount >= 3 && !showEncouragement) {
      setShowEncouragement(true);
    }
  }, [completionCount, tasks, showEncouragement]);

  // Auto-dismiss pro tip banner after 3 days
  useEffect(() => {
    const dismissedDate = localStorage.getItem('proTipDismissed');
    if (dismissedDate) {
      const daysSince = Math.floor((Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24));
      if (daysSince < 3) {
        setShowProTipBanner(false);
      }
    }
  }, []);

  function handleTaskAction(taskId, points, newDifficulty) {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;

      // If newDifficulty is provided, just update selection
      if (newDifficulty && points === 0) {
        return { ...task, selectedDifficulty: newDifficulty };
      }

      // Mark as complete
      if (!task.completedToday) {
        setTotalScore(prev => prev + points);
        setTotalXP(prev => prev + points);
        setCompletionCount(prev => prev + 1);

        // Show XP popup
        setXpPopup(points);
        setTimeout(() => setXpPopup(null), 2000);

        return {
          ...task,
          streak: task.streak + 1,
          completedToday: true
        };
      }

      return task;
    }));
  }

  function handleCustomize(task) {
    setSelectedTask(task);
  }

  function handleSaveCustomization(taskId, customLabels) {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id !== taskId) return task;

      const hasAnyCustomLabel = Object.values(customLabels).some(label => label && label.trim());

      return {
        ...task,
        customized: hasAnyCustomLabel,
        difficulties: {
          easy: { ...task.difficulties.easy, customLabel: customLabels.easy || task.difficulties.easy.customLabel },
          normal: { ...task.difficulties.normal, customLabel: customLabels.normal || task.difficulties.normal.customLabel },
          hard: { ...task.difficulties.hard, customLabel: customLabels.hard || task.difficulties.hard.customLabel },
          extreme: { ...task.difficulties.extreme, customLabel: customLabels.extreme || task.difficulties.extreme.customLabel }
        }
      };
    }));
  }

  function dismissProTip() {
    setShowProTipBanner(false);
    localStorage.setItem('proTipDismissed', Date.now().toString());
  }

  function handleCustomizeNow() {
    setShowEncouragement(false);
    // Open first non-customized task
    const taskToCustomize = tasks.find(t => !t.customized);
    if (taskToCustomize) {
      setSelectedTask(taskToCustomize);
    }
  }

  function handleSpin(reward) {
    if (reward.type === 'xp') {
      setTotalXP(prev => prev + reward.value);
    } else if (reward.type === 'token') {
      setFreezeTokens(prev => prev + reward.value);
    }

    // Mark spin as used for today
    localStorage.setItem('lastSpinDate', new Date().toDateString());
    setCanSpin(false);
  }

  function handleFreeze(taskId) {
    if (freezeTokens <= 0) {
      alert("No freeze tokens available!");
      return;
    }

    setTasks(prevTasks => prevTasks.map(task =>
      task.id === taskId ? { ...task, freezeProtected: true } : task
    ));
    setFreezeTokens(prev => prev - 1);

    // Show confirmation
    setXpPopup("🛡️ Streak Protected!");
    setTimeout(() => setXpPopup(null), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] px-4 py-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-1">Streak Manager 🔥</h1>
              <p className="text-2xl">Good Morning! 👋</p>
            </div>
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] px-4 py-2 text-center">
              <p className="text-xs text-[#94A3B8] mb-1">Freeze Tokens</p>
              <p className="text-xl font-bold">💎 {freezeTokens}</p>
            </div>
          </div>

          {/* Pro Tip Banner */}
          {showProTipBanner && (
            <div className="bg-[#60A5FA]/10 border border-[#60A5FA]/30 rounded-xl p-4">
              <p className="text-sm text-[#60A5FA] mb-3">
                💡 Pro tip: Tap ⚙️ on any task to make difficulty levels personal to you
              </p>
              <button
                onClick={dismissProTip}
                className="text-xs font-semibold text-[#60A5FA] hover:text-[#3B82F6] transition-colors"
              >
                Got it!
              </button>
            </div>
          )}

          {/* Encouragement Tip */}
          {showEncouragement && (
            <div className="bg-[#34D399]/10 border border-[#34D399]/30 rounded-xl p-4">
              <p className="text-sm text-[#34D399] mb-3">
                💡 Want better tracking? Customize difficulty levels to match your goals. Tap ⚙️ on any task.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowEncouragement(false)}
                  className="text-xs font-semibold text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleCustomizeNow}
                  className="text-xs font-semibold text-[#34D399] hover:text-[#10B981] transition-colors"
                >
                  Customize Now
                </button>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">Current Streak</p>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-sm text-[#94A3B8]">days 🔥</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">Today's Score</p>
              <p className="text-2xl font-bold">{totalScore}</p>
              <p className="text-sm text-[#94A3B8]">/100</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
              <p className="text-sm text-[#94A3B8] mb-1">Total XP</p>
              <p className="text-2xl font-bold">{totalXP}</p>
            </div>
          </div>

          {/* XP Bar */}
          <XPBar currentXP={totalXP} level={level} />

          {/* Task Cards - Show max 3 */}
          <div className="space-y-4">
            {tasks.slice(0, 3).map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onComplete={handleTaskAction}
                onCustomize={handleCustomize}
                onFreeze={handleFreeze}
              />
            ))}
          </div>

          {/* View All Tasks Link */}
          {tasks.length > 3 && (
            <Link
              href="/tasks"
              className="block text-center text-[#60A5FA] hover:text-[#3B82F6] font-semibold transition-colors"
            >
              View All Tasks →
            </Link>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <BadgeDisplay />
          <DailySpin canSpin={canSpin} onSpin={handleSpin} />
        </div>
      </div>

      {/* XP Popup */}
      {xpPopup && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fadeIn">
          <div className="bg-[#60A5FA] text-white px-6 py-4 rounded-2xl font-bold text-2xl shadow-2xl">
            +{xpPopup} XP ✨
          </div>
        </div>
      )}

      {/* Level Up Notification */}
      {levelUpNotification && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-fadeIn">
          <div className="bg-gradient-to-r from-[#F59E0B] to-[#EF4444] text-white px-8 py-6 rounded-2xl font-bold text-3xl shadow-2xl text-center">
            <div className="text-5xl mb-2">🎉</div>
            <div>Level Up!</div>
            <div className="text-xl mt-2">You're now Level {levelUpNotification}</div>
          </div>
        </div>
      )}

      {/* Customize Modal */}
      {selectedTask && (
        <CustomizeModal
          task={selectedTask}
          onSave={handleSaveCustomization}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
