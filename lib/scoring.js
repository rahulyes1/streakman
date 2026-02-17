export function calculateScore(tasks, timeframeDays = 21) {
  if (!tasks || tasks.length === 0) {
    return {
      totalScore: 0,
      breakdown: {
        completionRate: 0,
        streakStrength: 0,
        weeklyConsistency: 0,
        improvementTrend: 0,
      },
      grade: 'Needs Work',
    };
  }

  // Get all completion dates from all tasks
  const allCompletions = [];
  tasks.forEach(task => {
    if (task.completionHistory && task.completionHistory.length > 0) {
      task.completionHistory.forEach((completed, idx) => {
        if (completed) {
          const date = new Date();
          date.setDate(date.getDate() - (6 - idx)); // Last 7 days
          allCompletions.push({
            date: date.toDateString(),
            taskId: task.id
          });
        }
      });
    }
  });

  // 1. COMPLETION RATE (40 points)
  const uniqueDates = [...new Set(allCompletions.map(c => c.date))];
  const completionRate = Math.min((uniqueDates.length / 7) * 40, 40); // Last 7 days

  // 2. STREAK STRENGTH (35 points)

  // A) Longest streak (25 points)
  const longestStreak = Math.max(...tasks.map(t => t.bestStreak || 0), 0);
  let streakBonus = 0;
  if (longestStreak >= 21) streakBonus = 25;
  else if (longestStreak >= 14) streakBonus = 20;
  else if (longestStreak >= 10) streakBonus = 15;
  else if (longestStreak >= 7) streakBonus = 10;
  else if (longestStreak >= 4) streakBonus = 7;
  else if (longestStreak >= 1) streakBonus = 5;

  // B) Average current streak (10 points)
  const activeStreaks = tasks.filter(t => t.streak > 0);
  const avgCurrentStreak = activeStreaks.length > 0
    ? activeStreaks.reduce((sum, t) => sum + t.streak, 0) / activeStreaks.length
    : 0;

  let recoveryScore = 0;
  if (avgCurrentStreak >= 7) recoveryScore = 10;
  else if (avgCurrentStreak >= 5) recoveryScore = 7;
  else if (avgCurrentStreak >= 3) recoveryScore = 5;
  else if (avgCurrentStreak >= 1) recoveryScore = 3;

  const streakStrength = streakBonus + recoveryScore;

  // 3. WEEKLY CONSISTENCY (15 points)
  // Based on how many different days in last 7 days had completions
  const weeklyConsistency = Math.min((uniqueDates.length / 7) * 15, 15);

  // 4. IMPROVEMENT TREND (10 points)
  // Compare number of active tasks vs total tasks
  const activeTasksRatio = activeStreaks.length / tasks.length;
  let improvementTrend = 0;
  if (activeTasksRatio >= 0.9) improvementTrend = 10;
  else if (activeTasksRatio >= 0.7) improvementTrend = 7;
  else if (activeTasksRatio >= 0.5) improvementTrend = 5;
  else if (activeTasksRatio >= 0.3) improvementTrend = 3;

  // TOTAL
  const totalScore = Math.round(
    completionRate + streakStrength + weeklyConsistency + improvementTrend
  );

  return {
    totalScore: Math.min(totalScore, 100),
    breakdown: {
      completionRate: Math.round(completionRate),
      streakStrength: Math.round(streakStrength),
      weeklyConsistency: Math.round(weeklyConsistency),
      improvementTrend: Math.round(improvementTrend),
    },
    grade: getLetterGrade(totalScore),
  };
}

export function getLetterGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 65) return 'C+';
  if (score >= 60) return 'C';
  return 'Needs Work';
}
