"use client";

export const HABIT_TEMPLATES = [
  {
    id: "morning-routine",
    name: "Morning Routine",
    emoji: "🌅",
    category: "Lifestyle",
    difficulty: "Starter",
    description: "Start your day with structure and energy.",
    tasks: [
      { name: "Wake 7am", emoji: "⏰" },
      { name: "Drink water", emoji: "💧" },
      { name: "Stretch", emoji: "🤸" },
      { name: "No phone 30min", emoji: "📵" },
    ],
  },
  {
    id: "fitness-core",
    name: "Fitness Core",
    emoji: "💪",
    category: "Health",
    difficulty: "Moderate",
    description: "Daily movement and recovery fundamentals.",
    tasks: [
      { name: "30min workout", emoji: "🏋️" },
      { name: "10k steps", emoji: "🚶" },
      { name: "Post-workout protein", emoji: "🥤" },
    ],
  },
  {
    id: "deep-work",
    name: "Deep Work",
    emoji: "🧠",
    category: "Focus",
    difficulty: "Intense",
    description: "Protect focused output and cut distractions.",
    tasks: [
      { name: "90min focus block", emoji: "🎯" },
      { name: "No social media AM", emoji: "📵" },
      { name: "Evening review", emoji: "📝" },
    ],
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    emoji: "🧘",
    category: "Mind",
    difficulty: "Starter",
    description: "Reset stress and improve emotional clarity.",
    tasks: [
      { name: "10min meditation", emoji: "🧘" },
      { name: "Gratitude journal", emoji: "📔" },
      { name: "Evening walk", emoji: "🌙" },
    ],
  },
  {
    id: "student-grind",
    name: "Student Grind",
    emoji: "🎓",
    category: "Focus",
    difficulty: "Intense",
    description: "Academic system for consistent output.",
    tasks: [
      { name: "Study 2hrs", emoji: "📚" },
      { name: "Flashcard review", emoji: "🃏" },
      { name: "No phone while studying", emoji: "📵" },
    ],
  },
  {
    id: "healthy-living",
    name: "Healthy Living",
    emoji: "🥗",
    category: "Health",
    difficulty: "Moderate",
    description: "Core habits for sleep, hydration, and food quality.",
    tasks: [
      { name: "Sleep by 11pm", emoji: "🌙" },
      { name: "Drink 2L water", emoji: "💧" },
      { name: "Cook one meal", emoji: "🍳" },
    ],
  },
];
