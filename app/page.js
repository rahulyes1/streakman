"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import FloatingAddButton from "@/components/FloatingAddButton";
import BadgeDisplay from "@/components/BadgeDisplay";
import DailySpin from "@/components/DailySpin";
import LevelUpNotification from "@/components/LevelUpNotification";
import { useRouter } from "next/navigation";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [freezeTokens, setFreezeTokens] = useState(0);
  const router = useRouter();

  // Load tasks from localStorage
  useEffect(() => {
    const loadTasks = () => {
      const saved = localStorage.getItem('streakman_tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    };

    loadTasks();

    // Listen for task updates
    const handleUpdate = () => loadTasks();
    window.addEventListener('tasksUpdated', handleUpdate);
    return () => window.removeEventListener('tasksUpdated', handleUpdate);
  }, []);

  // Calculate stats
  const completedToday = tasks.filter(t => t.completedToday).length;
  const currentStreak = Math.max(...tasks.map(t => t.streak), 0);

  // Calculate today's score
  useEffect(() => {
    const score = completedToday * 40;
    setTotalScore(score);
  }, [completedToday]);

  // Load XP and calculate level
  useEffect(() => {
    const loadXP = () => {
      const saved = localStorage.getItem('streakman_xp');
      if (saved) {
        const xp = parseInt(saved);
        setTotalXP(xp);

        // Calculate level (every 100 XP = 1 level)
        const newLevel = Math.floor(xp / 100) + 1;
        const oldLevel = level;

        if (newLevel > oldLevel) {
          setLevel(newLevel);
          setShowLevelUp(newLevel);
        } else {
          setLevel(newLevel);
        }
      }
    };

    loadXP();

    const handleUpdate = () => loadXP();
    window.addEventListener('xpUpdated', handleUpdate);
    return () => window.removeEventListener('xpUpdated', handleUpdate);
  }, [level]);

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning! 👋";
    if (hour < 18) return "Good Afternoon! 👋";
    return "Good Evening! 👋";
  };

  const getMotivation = () => {
    if (completedToday === 0) {
      return "No tasks completed yet today. Let's get started! 💪";
    }
    if (completedToday === 1) {
      return "1 task completed today. Keep it up! 🌟";
    }
    return `${completedToday} tasks completed today. You're crushing it! 🔥`;
  };

  return (
    <>
      <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">Streak Manager 🔥</h1>
            <p className="text-2xl text-[#94A3B8]">{getGreeting()}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2 mb-8">
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-3 text-center">
              <p className="text-xs text-[#94A3B8] mb-1">Streak</p>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-[#94A3B8]">🔥</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-3 text-center">
              <p className="text-xs text-[#94A3B8] mb-1">Score</p>
              <p className="text-2xl font-bold">{totalScore}</p>
              <p className="text-xs text-[#94A3B8]">/100</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-3 text-center">
              <p className="text-xs text-[#94A3B8] mb-1">Level</p>
              <p className="text-2xl font-bold">{level}</p>
              <p className="text-xs text-[#94A3B8]">⭐</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-3 text-center">
              <p className="text-xs text-[#94A3B8] mb-1">Tokens</p>
              <p className="text-2xl font-bold">{freezeTokens}</p>
              <p className="text-xs text-[#94A3B8]">💎</p>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-[#60A5FA]/10 to-[#34D399]/10 border border-[#60A5FA]/30 rounded-2xl p-6 text-center mb-8">
            <p className="text-lg font-medium">{getMotivation()}</p>
          </div>

          {/* Daily Spin */}
          <div className="mb-8">
            <DailySpin />
          </div>

          {/* Badges Section */}
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-5">
            <h3 className="text-lg font-semibold mb-3">Recent Badges</h3>
            <BadgeDisplay compact={true} />
          </div>
        </div>
      </div>

      {/* Level Up Notification */}
      {showLevelUp && (
        <LevelUpNotification
          level={showLevelUp}
          onClose={() => setShowLevelUp(false)}
        />
      )}

      <FloatingAddButton onClick={() => router.push('/tasks?add=true')} />
      <BottomNav />
    </>
  );
}
