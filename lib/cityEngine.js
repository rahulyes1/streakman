"use client";

export const BUILDING_KEYWORDS = {
  gym: ["workout", "exercise", "gym", "fitness", "run", "steps"],
  library: ["study", "read", "book", "learn", "course"],
  home: ["sleep", "wake", "morning", "water", "stretch"],
  office: ["work", "meeting", "email", "project", "focus"],
  cafe: ["meditate", "journal", "breathe", "gratitude"],
  default: [],
};

export const BUILDING_EMOJIS = {
  gym: "\u{1F3CB}\uFE0F",
  library: "\u{1F4DA}",
  home: "\u{1F3E0}",
  office: "\u{1F3E2}",
  cafe: "\u2615",
  default: "\u{1F3D7}\uFE0F",
};

export const BUILDING_LEVELS = [
  { level: 1, streakMin: 0, size: "small", floors: 1 },
  { level: 2, streakMin: 7, size: "medium", floors: 2 },
  { level: 3, streakMin: 14, size: "large", floors: 3 },
  { level: 4, streakMin: 30, size: "landmark", floors: 4 },
  { level: 5, streakMin: 60, size: "iconic", floors: 5 },
];

export const NEIGHBORHOODS = [
  {
    id: "business",
    name: "Business District",
    emoji: "\u{1F3E2}",
    requiredStreak: 30,
    description: "Towers unlock at a 30-day streak",
    slots: 4,
  },
  {
    id: "park",
    name: "The Park",
    emoji: "\u{1F333}",
    requiredStreak: 60,
    description: "Nature unlocks at a 60-day streak",
    slots: 3,
  },
  {
    id: "landmark",
    name: "City Landmark",
    emoji: "\u{1F31F}",
    requiredStreak: 100,
    description: "Your legacy building at 100 days",
    slots: 1,
  },
];

export const CITY_EVENTS = [
  { id: "festival", emoji: "\u{1F3AA}", title: "Street Festival", description: "Complete all tasks today for +200 population", reward: 200, rewardType: "population" },
  { id: "power", emoji: "\u26A1", title: "Power Surge", description: "First task before 9am gives 3x XP today", reward: 3, rewardType: "xp_multiplier" },
  { id: "storm", emoji: "\u{1F327}\uFE0F", title: "Storm Warning", description: "Use a freeze token now or risk a building level tonight", reward: 1, rewardType: "safety" },
  { id: "boom", emoji: "\u{1F3D7}\uFE0F", title: "Construction Boom", description: "Add one habit today for an instant building", reward: 1, rewardType: "building" },
  { id: "market", emoji: "\u{1F4B0}", title: "Night Market", description: "Complete 2 tasks after 8pm for bonus XP", reward: 40, rewardType: "xp" },
  { id: "clean", emoji: "\u{1F9F9}", title: "City Cleanup", description: "Finish one overdue habit to brighten your blocks", reward: 25, rewardType: "xp" },
  { id: "solar", emoji: "\u{1F506}", title: "Solar Boost", description: "Morning completions add +15 XP each today", reward: 15, rewardType: "xp" },
  { id: "parade", emoji: "\u{1F389}", title: "Victory Parade", description: "Hit 90% completion for +300 population", reward: 300, rewardType: "population" },
  { id: "rail", emoji: "\u{1F687}", title: "Transit Expansion", description: "Complete any 3 tasks to unlock faster growth", reward: 60, rewardType: "xp" },
  { id: "garden", emoji: "\u{1F33F}", title: "Garden Weekend", description: "Keep streak alive today for a calm weather buff", reward: 1, rewardType: "weather" },
  { id: "mentor", emoji: "\u{1F9D1}\u200D\u{1F3EB}", title: "Mentor Visit", description: "Finish your hardest habit first for bonus XP", reward: 35, rewardType: "xp" },
  { id: "bridge", emoji: "\u{1F309}", title: "Bridge Project", description: "Complete all pinned tasks to boost city morale", reward: 120, rewardType: "population" },
  { id: "harvest", emoji: "\u{1F33E}", title: "Harvest Day", description: "Any streak above 7 days grants extra XP today", reward: 50, rewardType: "xp" },
  { id: "lantern", emoji: "\u{1F3EE}\uFE0F", title: "Lantern Night", description: "Complete one evening task to light the skyline", reward: 20, rewardType: "xp" },
  { id: "marathon", emoji: "\u{1F3C3}", title: "City Marathon", description: "Complete one fitness habit for a growth burst", reward: 80, rewardType: "population" },
  { id: "focus", emoji: "\u{1F4BB}", title: "Focus Protocol", description: "Finish your deep work habit before noon", reward: 30, rewardType: "xp" },
  { id: "festival2", emoji: "\u{1F38A}", title: "Neighborhood Fair", description: "Complete all tasks for a badge spotlight", reward: 1, rewardType: "badge" },
  { id: "observatory", emoji: "\u{1F52D}", title: "Observatory Open", description: "Track a perfect day to gain +150 population", reward: 150, rewardType: "population" },
  { id: "cafeweek", emoji: "\u2615", title: "Cafe Week", description: "Mindfulness habits grant +20 XP each today", reward: 20, rewardType: "xp" },
  { id: "legacy", emoji: "\u{1F3DB}\uFE0F", title: "Legacy Blueprint", description: "Hold your best streak to prepare the landmark", reward: 100, rewardType: "xp" },
];

export function getBuildingType(taskNameInput) {
  const taskName = String(taskNameInput || "").toLowerCase();

  for (const [type, keywords] of Object.entries(BUILDING_KEYWORDS)) {
    if (type === "default") continue;
    if (keywords.some((keyword) => taskName.includes(keyword))) {
      return type;
    }
  }

  return "default";
}

export function getBuildingLevel(streakInput) {
  const streak = Math.max(0, Number(streakInput) || 0);
  let resolvedLevel = 1;

  for (const entry of BUILDING_LEVELS) {
    if (streak >= entry.streakMin) {
      resolvedLevel = entry.level;
    }
  }

  return resolvedLevel;
}

export function getBuildingState(task) {
  const streak = Number(task?.streak || 0);
  const completedToday = Boolean(task?.completedToday);

  if (!completedToday && streak === 0) return "dark";
  if (streak >= 30 && completedToday) return "landmark";
  if (streak >= 14 && completedToday) return "thriving";
  if (streak >= 7 && streak <= 13 && completedToday) return "active";
  if (streak >= 1 && streak <= 6) return "new";
  return "dark";
}

export function getCityWeather(totalScoreInput) {
  const totalScore = Number(totalScoreInput) || 0;
  if (totalScore >= 75) return "sunny";
  if (totalScore >= 50) return "cloudy";
  if (totalScore >= 25) return "overcast";
  return "rain";
}

export function getPopulation(xpInput) {
  const xp = Math.max(0, Number(xpInput) || 0);
  return Math.floor(xp / 10);
}

export function getBestStreak(tasksInput) {
  const tasks = Array.isArray(tasksInput) ? tasksInput : [];
  return Math.max(...tasks.map((task) => Number(task?.bestStreak || 0)), 0);
}

function seededIndex(dateKey, max) {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i += 1) {
    hash = (hash << 5) - hash + dateKey.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

export function generateDailyEvent(dateInput = new Date()) {
  const date = new Date(dateInput);
  const dayKey = date.toDateString();
  const index = seededIndex(dayKey, CITY_EVENTS.length);
  return CITY_EVENTS[index];
}
