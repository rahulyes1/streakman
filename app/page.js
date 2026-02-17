"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import FloatingAddButton from "@/components/FloatingAddButton";
import { useRouter } from "next/navigation";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
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

  // Load XP from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('streakman_xp');
    if (saved) {
      setTotalXP(parseInt(saved));
    }
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
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
              <p className="text-xs text-[#94A3B8] mb-2">Current Streak</p>
              <p className="text-3xl font-bold">{currentStreak}</p>
              <p className="text-sm text-[#94A3B8] mt-1">days 🔥</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
              <p className="text-xs text-[#94A3B8] mb-2">Today's Score</p>
              <p className="text-3xl font-bold">{totalScore}</p>
              <p className="text-sm text-[#94A3B8] mt-1">/100</p>
            </div>
            <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
              <p className="text-xs text-[#94A3B8] mb-2">Total XP</p>
              <p className="text-3xl font-bold">{totalXP}</p>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-[#60A5FA]/10 to-[#34D399]/10 border border-[#60A5FA]/30 rounded-2xl p-6 text-center">
            <p className="text-lg font-medium">{getMotivation()}</p>
          </div>

          {/* Empty Space with Subtle Pattern */}
          <div className="mt-12 text-center">
            <div className="opacity-20">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-[#94A3B8]">Track your streaks in the Tasks tab</p>
            </div>
          </div>
        </div>
      </div>

      <FloatingAddButton onClick={() => router.push('/tasks?add=true')} />
      <BottomNav />
    </>
  );
}
