"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";

// Mock data for 21 days (3 weeks)
const MOMENTUM_DATA = [
  // Week 1
  { day: 'Mon', date: 'Feb 3', score: 95, status: 'exceptional' },
  { day: 'Tue', date: 'Feb 4', score: 88, status: 'perfect' },
  { day: 'Wed', date: 'Feb 5', score: 72, status: 'struggled' },
  { day: 'Thu', date: 'Feb 6', score: 91, status: 'perfect' },
  { day: 'Fri', date: 'Feb 7', score: 98, status: 'exceptional' },
  { day: 'Sat', date: 'Feb 8', score: 85, status: 'perfect' },
  { day: 'Sun', date: 'Feb 9', score: 45, status: 'missed' },
  // Week 2
  { day: 'Mon', date: 'Feb 10', score: 92, status: 'perfect' },
  { day: 'Tue', date: 'Feb 11', score: 96, status: 'exceptional' },
  { day: 'Wed', date: 'Feb 12', score: 89, status: 'perfect' },
  { day: 'Thu', date: 'Feb 13', score: 30, status: 'missed' },
  { day: 'Fri', date: 'Feb 14', score: 91, status: 'perfect' },
  { day: 'Sat', date: 'Feb 15', score: 87, status: 'perfect' },
  { day: 'Sun', date: 'Feb 16', score: 93, status: 'perfect' },
  // Week 3
  { day: 'Mon', date: 'Feb 17', score: 88, status: 'perfect' },
  { day: 'Tue', date: 'Feb 18', score: 65, status: 'struggled' },
  { day: 'Wed', date: 'Feb 19', score: 94, status: 'perfect' },
  { day: 'Thu', date: 'Feb 20', score: 97, status: 'exceptional' },
  { day: 'Fri', date: 'Feb 21', score: null, status: 'upcoming' },
  { day: 'Sat', date: 'Feb 22', score: null, status: 'upcoming' },
  { day: 'Sun', date: 'Feb 23', score: null, status: 'upcoming' },
];

const STATUS_CONFIG = {
  exceptional: { emoji: '🔥', color: 'bg-[#F59E0B]', label: 'Exceptional' },
  perfect: { emoji: '🟢', color: 'bg-[#34D399]', label: 'Perfect' },
  struggled: { emoji: '🟡', color: 'bg-[#FCD34D]', label: 'Struggled' },
  missed: { emoji: '🔴', color: 'bg-[#EF4444]', label: 'Missed' },
  upcoming: { emoji: '⚪', color: 'bg-[#475569]', label: 'Upcoming' },
};

const PROGRESS_BARS = [
  { label: 'Completion Rate', current: 36, max: 40, color: 'bg-[#34D399]' },
  { label: 'Streak Strength', current: 22, max: 35, color: 'bg-[#60A5FA]' },
  { label: 'Weekly Consistency', current: 14, max: 15, color: 'bg-[#A78BFA]' },
  { label: 'Improvement Trend', current: 9, max: 10, color: 'bg-[#F59E0B]' },
];

export default function Progress() {
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredDay, setHoveredDay] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'report', label: '21-Day Report' },
    { id: 'stats', label: 'Stats' },
    { id: 'vault', label: 'Vault' },
  ];

  function getGrade(score) {
    if (score >= 90) return { grade: 'A+', color: 'text-[#34D399]' };
    if (score >= 80) return { grade: 'A-', color: 'text-[#60A5FA]' };
    if (score >= 70) return { grade: 'B', color: 'text-[#FCD34D]' };
    return { grade: 'C', color: 'text-[#F59E0B]' };
  }

  const weekStats = { avgScore: 87, daysCompleted: 5, totalDays: 7 };
  const gradeInfo = getGrade(weekStats.avgScore);

  return (
    <>
      <div className="min-h-screen bg-[#0F172A] text-[#F1F5F9] px-4 py-6 pb-24">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold mb-6">Progress 📊</h1>

        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">Avg Score</p>
            <p className="text-2xl font-bold">{weekStats.avgScore}</p>
            <p className="text-xs text-[#94A3B8]">/100</p>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">Grade</p>
            <p className={`text-2xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</p>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-[#334155] p-4 text-center">
            <p className="text-xs text-[#94A3B8] mb-1">This Week</p>
            <p className="text-2xl font-bold">{weekStats.daysCompleted}</p>
            <p className="text-xs text-[#94A3B8]">/{weekStats.totalDays} days</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1E293B] rounded-t-2xl border-t border-l border-r border-[#334155] overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[80px] py-3 px-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-[#60A5FA]'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9]'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#60A5FA]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-[#1E293B] rounded-b-2xl border-b border-l border-r border-[#334155] p-5 min-h-[400px]">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Score Breakdown */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
                <div className="space-y-4">
                  {PROGRESS_BARS.map((bar) => {
                    const percentage = Math.round((bar.current / bar.max) * 100);
                    return (
                      <div key={bar.label}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#F1F5F9]">{bar.label}</span>
                          <span className="text-sm text-[#94A3B8]">
                            {bar.current}/{bar.max} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#0F172A] rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full ${bar.color} transition-all duration-500 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Momentum Calendar */}
              <div>
                <h2 className="text-lg font-semibold mb-4">Momentum Calendar</h2>
                <div className="grid grid-cols-7 gap-2">
                  {MOMENTUM_DATA.map((day, idx) => {
                    const config = STATUS_CONFIG[day.status];
                    return (
                      <div
                        key={idx}
                        className="relative"
                        onMouseEnter={() => setHoveredDay(idx)}
                        onMouseLeave={() => setHoveredDay(null)}
                      >
                        <div
                          className={`aspect-square rounded-lg ${config.color} flex items-center justify-center text-2xl cursor-pointer transition-transform hover:scale-110`}
                        >
                          {config.emoji}
                        </div>

                        {/* Tooltip on hover */}
                        {hoveredDay === idx && (
                          <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#0F172A] border border-[#334155] rounded-lg p-2 whitespace-nowrap text-xs shadow-lg">
                            <p className="font-semibold">{day.date}</p>
                            {day.score !== null ? (
                              <p className="text-[#94A3B8]">Score: {day.score}/100</p>
                            ) : (
                              <p className="text-[#94A3B8]">{config.label}</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-3 mt-4 text-xs">
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className="text-lg">{config.emoji}</span>
                      <span className="text-[#94A3B8]">{config.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Combo */}
              <div className="bg-gradient-to-r from-[#60A5FA]/20 to-[#34D399]/20 border border-[#60A5FA]/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#94A3B8] mb-1">Current Combo</p>
                    <p className="text-xl font-bold text-[#F1F5F9]">
                      5 days streak → 1.5x multiplier 🔥
                    </p>
                  </div>
                  <div className="text-4xl">⚡</div>
                </div>
              </div>
            </div>
          ) : (
            // Other tabs
            <div className="flex items-center justify-center h-full">
              <p className="text-[#94A3B8] text-lg">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>

      <BottomNav />
    </>
  );
}
