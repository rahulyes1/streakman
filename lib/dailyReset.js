/**
 * Daily Reset System for Streakman
 * Handles automatic task reset at midnight and streak management
 */

export function checkAndPerformDailyReset() {
  const today = new Date().toDateString();
  const lastResetDate = localStorage.getItem('streakman_last_reset_date');

  // If it's a new day, perform reset
  if (lastResetDate !== today) {
    performDailyReset(lastResetDate, today);
    localStorage.setItem('streakman_last_reset_date', today);
    return true; // Reset was performed
  }

  return false; // No reset needed
}

function performDailyReset(lastResetDate, today) {
  const tasksJson = localStorage.getItem('streakman_tasks');
  if (!tasksJson) return;

  const tasks = JSON.parse(tasksJson);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  // Calculate how many days were missed
  const daysMissed = lastResetDate ? getDaysBetween(lastResetDate, today) : 1;

  const updatedTasks = tasks.map(task => {
    // Reset completedToday for all tasks
    const updatedTask = {
      ...task,
      completedToday: false,
    };

    // Check if task was completed yesterday
    const wasCompletedYesterday = task.lastCompletedDate === yesterdayStr;

    // Handle streak logic
    if (task.freezeProtected) {
      // Frozen tasks keep their streak and lose freeze protection
      updatedTask.freezeProtected = false;
    } else if (!wasCompletedYesterday && task.streak > 0) {
      // Task wasn't completed yesterday and has an active streak
      // Decrease streak by the number of days missed
      updatedTask.streak = Math.max(0, task.streak - daysMissed);
    }

    // Update completion history - shift left and add false for new day
    if (task.completionHistory && task.completionHistory.length > 0) {
      const history = [...task.completionHistory];

      if (daysMissed === 1) {
        // Normal case: just one day passed
        history.shift();
        history.push(wasCompletedYesterday);
      } else {
        // Multiple days missed - fill with false values
        for (let i = 0; i < daysMissed && history.length > 0; i++) {
          history.shift();
          history.push(i === daysMissed - 1 ? wasCompletedYesterday : false);
        }
      }

      updatedTask.completionHistory = history;
    }

    return updatedTask;
  });

  // Save updated tasks
  localStorage.setItem('streakman_tasks', JSON.stringify(updatedTasks));

  // Trigger update event
  window.dispatchEvent(new Event('tasksUpdated'));

  console.log(`✅ Daily reset performed! ${daysMissed} day(s) passed since last reset.`);
}

function getDaysBetween(dateStr1, dateStr2) {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);

  // Reset time to midnight for accurate day calculation
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Initialize the reset system
 * Should be called when the app loads
 */
export function initializeDailyReset() {
  const lastResetDate = localStorage.getItem('streakman_last_reset_date');

  // If no reset date exists, set it to today (first time user)
  if (!lastResetDate) {
    const today = new Date().toDateString();
    localStorage.setItem('streakman_last_reset_date', today);
    console.log('🎯 Daily reset system initialized!');
    return;
  }

  // Check and perform reset if needed
  const resetPerformed = checkAndPerformDailyReset();

  if (resetPerformed) {
    console.log('🌅 Good morning! Tasks have been reset for a new day.');
  }
}

/**
 * Get information about the reset system
 */
export function getResetInfo() {
  const lastResetDate = localStorage.getItem('streakman_last_reset_date');
  const today = new Date().toDateString();

  return {
    lastResetDate,
    today,
    needsReset: lastResetDate !== today,
    resetTime: '00:00 (Midnight)',
  };
}
