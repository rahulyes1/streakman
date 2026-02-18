/**
 * Test script for daily reset mechanism
 * Run with: node test-reset.js
 */

// Mock localStorage for Node.js environment
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  clear() {
    this.data = {};
  }
};

// Mock window.dispatchEvent
const window = {
  dispatchEvent(event) {
    console.log(`Event dispatched: ${event.type || event}`);
  }
};

// Import and adapt the reset logic
function getDaysBetween(dateStr1, dateStr2) {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function performDailyReset(lastResetDate, today) {
  const tasksJson = localStorage.getItem('streakman_tasks');
  if (!tasksJson) return;

  const tasks = JSON.parse(tasksJson);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const daysMissed = lastResetDate ? getDaysBetween(lastResetDate, today) : 1;

  console.log(`\n📅 Performing reset: ${daysMissed} day(s) passed`);
  console.log(`Last reset: ${lastResetDate || 'Never'}`);
  console.log(`Today: ${today}\n`);

  const updatedTasks = tasks.map(task => {
    console.log(`\n🔄 Processing: ${task.emoji} ${task.name}`);
    console.log(`  - Completed today: ${task.completedToday}`);
    console.log(`  - Current streak: ${task.streak}`);
    console.log(`  - Last completed: ${task.lastCompletedDate || 'Never'}`);
    console.log(`  - Freeze protected: ${task.freezeProtected}`);

    const updatedTask = {
      ...task,
      completedToday: false,
    };

    const wasCompletedYesterday = task.lastCompletedDate === yesterdayStr;

    if (task.freezeProtected) {
      console.log(`  ✅ Freeze protected - keeping streak ${task.streak}`);
      updatedTask.freezeProtected = false;
    } else if (!wasCompletedYesterday && task.streak > 0) {
      updatedTask.streak = Math.max(0, task.streak - daysMissed);
      console.log(`  ❌ Not completed yesterday - streak decreased: ${task.streak} → ${updatedTask.streak}`);
    } else if (wasCompletedYesterday) {
      console.log(`  ✅ Completed yesterday - streak maintained: ${task.streak}`);
    }

    if (task.completionHistory && task.completionHistory.length > 0) {
      const history = [...task.completionHistory];
      if (daysMissed === 1) {
        history.shift();
        history.push(wasCompletedYesterday);
      } else {
        for (let i = 0; i < daysMissed && history.length > 0; i++) {
          history.shift();
          history.push(i === daysMissed - 1 ? wasCompletedYesterday : false);
        }
      }
      updatedTask.completionHistory = history;
    }

    return updatedTask;
  });

  localStorage.setItem('streakman_tasks', JSON.stringify(updatedTasks));
  window.dispatchEvent(new Event('tasksUpdated'));

  console.log(`\n✅ Reset complete!\n`);
  return updatedTasks;
}

// Test Cases
console.log('🧪 TESTING DAILY RESET MECHANISM\n');
console.log('='.repeat(60));

// Test 1: Normal case - 1 day passed, task completed yesterday
console.log('\n📋 TEST 1: Task completed yesterday');
console.log('-'.repeat(60));
localStorage.clear();

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

localStorage.setItem('streakman_tasks', JSON.stringify([
  {
    id: 1,
    name: 'Morning Workout',
    emoji: '💪',
    completedToday: true,
    streak: 5,
    lastCompletedDate: yesterday.toDateString(),
    freezeProtected: false,
    completionHistory: [false, false, true, true, true, true, true]
  }
]));

performDailyReset(yesterday.toDateString(), new Date().toDateString());

// Test 2: Task NOT completed yesterday
console.log('\n📋 TEST 2: Task NOT completed yesterday (should lose streak)');
console.log('-'.repeat(60));
localStorage.clear();

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

localStorage.setItem('streakman_tasks', JSON.stringify([
  {
    id: 2,
    name: 'Reading',
    emoji: '📚',
    completedToday: false,
    streak: 7,
    lastCompletedDate: twoDaysAgo.toDateString(),
    freezeProtected: false,
    completionHistory: [false, false, true, true, true, true, false]
  }
]));

performDailyReset(yesterday.toDateString(), new Date().toDateString());

// Test 3: Freeze-protected task
console.log('\n📋 TEST 3: Freeze-protected task (should keep streak)');
console.log('-'.repeat(60));
localStorage.clear();

localStorage.setItem('streakman_tasks', JSON.stringify([
  {
    id: 3,
    name: 'Meditation',
    emoji: '🧘',
    completedToday: false,
    streak: 10,
    lastCompletedDate: twoDaysAgo.toDateString(),
    freezeProtected: true,
    completionHistory: [true, true, true, true, true, true, false]
  }
]));

performDailyReset(yesterday.toDateString(), new Date().toDateString());

// Test 4: Multiple days missed
console.log('\n📋 TEST 4: Multiple days missed (3 days)');
console.log('-'.repeat(60));
localStorage.clear();

const threeDaysAgo = new Date();
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

localStorage.setItem('streakman_tasks', JSON.stringify([
  {
    id: 4,
    name: 'Journaling',
    emoji: '📔',
    completedToday: false,
    streak: 15,
    lastCompletedDate: threeDaysAgo.toDateString(),
    freezeProtected: false,
    completionHistory: [true, true, true, true, true, true, true]
  }
]));

performDailyReset(threeDaysAgo.toDateString(), new Date().toDateString());

console.log('\n' + '='.repeat(60));
console.log('✅ ALL TESTS COMPLETED\n');
