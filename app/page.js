"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/BottomNav";
import FloatingAddButton from "@/components/FloatingAddButton";
import BadgeDisplay from "@/components/BadgeDisplay";
import DailySpin from "@/components/DailySpin";
import LevelUpNotification from "@/components/LevelUpNotification";
import { useRouter } from "next/navigation";
import { calculateScore } from "@/lib/scoring";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [totalScore, setTotalScore] = useState(0);
  const [grade, setGrade] = useState('');
  const [scoreBreakdown, setScoreBreakdown] = useState(null);
  const [showScoreDetails, setShowScoreDetails] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [freezeTokens, setFreezeTokens] = useState(0);
  const router = useRouter();

  // Redirect to tasks page on initial load
  useEffect(() => {
    const hasVisitedHome = sessionStorage.getItem('visited_home');
    if (!hasVisitedHome) {
      sessionStorage.setItem('visited_home', 'true');
      router.push('/tasks');
    }
  }, [router]);

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

  // Calculate real score using algorithm
  useEffect(() => {
    if (tasks.length > 0) {
      const result = calculateScore(tasks);
      setTotalScore(result.totalScore);
      setGrade(result.grade);
      setScoreBreakdown(result.breakdown);
    } else {
      setTotalScore(0);
      setGrade('');
      setScoreBreakdown(null);
    }
  }, [tasks]);

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

  const getImprovementSuggestions = () => {
    if (!scoreBreakdown) return [];
    const suggestions = [];

    // Completion Rate (max 40)
    if (scoreBreakdown.completionRate < 30) {
      suggestions.push({
        area: "Daily Consistency",
        current: scoreBreakdown.completionRate,
        max: 40,
        tip: "Complete tasks on more days this week to boost your completion rate"
      });
    }

    // Streak Strength (max 35)
    if (scoreBreakdown.streakStrength < 25) {
      suggestions.push({
        area: "Streak Building",
        current: scoreBreakdown.streakStrength,
        max: 35,
        tip: "Build longer streaks by completing tasks consecutively each day"
      });
    }

    // Weekly Consistency (max 15)
    if (scoreBreakdown.weeklyConsistency < 10) {
      suggestions.push({
        area: "Weekly Activity",
        current: scoreBreakdown.weeklyConsistency,
        max: 15,
        tip: "Try to be active every day of the week for maximum consistency"
      });
    }

    // Improvement Trend (max 10)
    if (scoreBreakdown.improvementTrend < 7) {
      suggestions.push({
        area: "Task Momentum",
        current: scoreBreakdown.improvementTrend,
        max: 10,
        tip: "Keep more tasks active with ongoing streaks to improve your trend"
      });
    }

    return suggestions;
  };

  return (
    <>
      <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] px-4 py-6 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Settings Button - Top Right */}
          <button
            onClick={() => router.push('/settings')}
            className="fixed top-4 right-4 z-50 bg-[#1E293B] border border-[#334155] rounded-lg p-2 hover:bg-[#334155] transition-spring hover:scale-110 active:scale-95 shadow-lg animate-scaleIn"
            title="Settings"
          >
            <span className="text-lg">⚙️</span>
          </button>

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
            <div
              onClick={() => setShowScoreDetails(!showScoreDetails)}
              className="bg-[#1E293B] rounded-2xl border border-[#334155] p-3 text-center cursor-pointer hover:bg-[#334155] transition-spring hover:scale-105 active:scale-95 hover:shadow-lg"
            >
              <p className="text-xs text-[#94A3B8] mb-1">Score</p>
              <p className="text-2xl font-bold">{totalScore}</p>
              <p className="text-xs text-[#94A3B8]">/100 {grade}</p>
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

          {/* Score Details Expandable Section */}
          {showScoreDetails && scoreBreakdown && (
            <div className="bg-[#1E293B] rounded-2xl border border-[#60A5FA]/50 p-5 mb-8 animate-slideDown shadow-lg shadow-[#60A5FA]/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                <span>Score Breakdown</span>
                <span className="text-2xl font-bold text-[#60A5FA]">{totalScore}/100</span>
              </h3>

              <div className="space-y-3 mb-5">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#94A3B8]">Completion Rate</span>
                    <span className="text-sm font-semibold">{scoreBreakdown.completionRate}/40</span>
                  </div>
                  <div className="w-full bg-[#0F172A] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] h-2 rounded-full transition-all"
                      style={{ width: `${(scoreBreakdown.completionRate / 40) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#94A3B8]">Streak Strength</span>
                    <span className="text-sm font-semibold">{scoreBreakdown.streakStrength}/35</span>
                  </div>
                  <div className="w-full bg-[#0F172A] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#F59E0B] to-[#EF4444] h-2 rounded-full transition-all"
                      style={{ width: `${(scoreBreakdown.streakStrength / 35) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#94A3B8]">Weekly Consistency</span>
                    <span className="text-sm font-semibold">{scoreBreakdown.weeklyConsistency}/15</span>
                  </div>
                  <div className="w-full bg-[#0F172A] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#34D399] to-[#10B981] h-2 rounded-full transition-all"
                      style={{ width: `${(scoreBreakdown.weeklyConsistency / 15) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-[#94A3B8]">Improvement Trend</span>
                    <span className="text-sm font-semibold">{scoreBreakdown.improvementTrend}/10</span>
                  </div>
                  <div className="w-full bg-[#0F172A] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] h-2 rounded-full transition-all"
                      style={{ width: `${(scoreBreakdown.improvementTrend / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Improvement Suggestions */}
              {getImprovementSuggestions().length > 0 && (
                <div className="border-t border-[#334155] pt-4">
                  <h4 className="text-sm font-semibold mb-3 text-[#60A5FA]">💡 How to Improve</h4>
                  <div className="space-y-2">
                    {getImprovementSuggestions().map((suggestion, idx) => (
                      <div key={idx} className="bg-[#0F172A] rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-semibold text-[#F1F5F9]">{suggestion.area}</span>
                          <span className="text-xs text-[#94A3B8]">{suggestion.current}/{suggestion.max}</span>
                        </div>
                        <p className="text-xs text-[#94A3B8]">{suggestion.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {getImprovementSuggestions().length === 0 && (
                <div className="border-t border-[#334155] pt-4 text-center">
                  <p className="text-sm text-[#34D399]">🎉 Perfect score! Keep it up!</p>
                </div>
              )}
            </div>
          )}

          {/* Motivational Message */}
          <div className="bg-gradient-to-r from-[#60A5FA]/10 to-[#34D399]/10 border border-[#60A5FA]/30 rounded-2xl p-6 text-center mb-6">
            <p className="text-lg font-medium">{getMotivation()}</p>
          </div>

          {/* Quick Stats Widgets */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#94A3B8]">Active Tasks</span>
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-3xl font-bold">{tasks.length}</p>
              <p className="text-xs text-[#64748B] mt-1">Total tasks tracked</p>
            </div>
            <div className="bg-[#1E293B] rounded-xl border border-[#334155] p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#94A3B8]">Completed</span>
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-3xl font-bold">{completedToday}</p>
              <p className="text-xs text-[#64748B] mt-1">Tasks done today</p>
            </div>
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
