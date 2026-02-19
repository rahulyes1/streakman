"use client";

import {
  COMBO_MULTIPLIERS,
  LEVEL_UNLOCKS,
  XP_REWARDS,
  getComboMultiplier,
  getTimeOfDayMultiplier,
  getTodayXPSummary,
  getXPToday,
} from "@/lib/xpSystem";
import { FORGE_TIERS } from "@/lib/dailyForge";
import { MISSION_XP, RECOVERY_MISSION_XP } from "@/lib/dailyMission";
import { MILESTONES } from "@/lib/milestones";

const TODAY_BREAKDOWN_ROWS = [
  { key: "taskXP", label: "Tasks completed", emoji: "\u2705" },
  { key: "earlyBonus", label: "Early Bird bonus", emoji: "\u{1F305}" },
  { key: "allTasksBonus", label: "All tasks bonus", emoji: "\u{1F4AF}" },
  { key: "forgeXP", label: "Daily Forge", emoji: "\u{1F525}" },
  { key: "missionXP", label: "Missions", emoji: "\u{1F3AF}" },
  { key: "milestoneXP", label: "Milestones", emoji: "\u{1F3C6}" },
  { key: "comboXP", label: "Combo bonus", emoji: "\u{1F525}" },
  { key: "otherXP", label: "Other XP", emoji: "\u26A1" },
];

const UNLOCK_ICONS = {
  2: "\u{1F324}\uFE0F",
  3: "\u{1F525}",
  4: "\u{1F4EE}",
  5: "\u{1F3E2}",
  7: "\u{1F3AA}",
  10: "\u{1F451}",
};

const COMBO_ROWS = [
  { id: 1, min: 1, max: 6, multiplier: COMBO_MULTIPLIERS[1], label: "Days 1-6 streak", bonus: "base" },
  { id: 7, min: 7, max: 13, multiplier: COMBO_MULTIPLIERS[7], label: "Days 7-13 streak", bonus: "+20% XP" },
  { id: 14, min: 14, max: 29, multiplier: COMBO_MULTIPLIERS[14], label: "Days 14-29 streak", bonus: "+50% XP" },
  { id: 30, min: 30, max: Infinity, multiplier: COMBO_MULTIPLIERS[30], label: "Days 30+ streak", bonus: "double XP" },
];

function readTasksFromStorage() {
  if (typeof window === "undefined") return [];
  const saved = localStorage.getItem("streakman_tasks");
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatSignedXP(amount) {
  return `${amount >= 0 ? "+" : ""}${amount} XP`;
}

function getCompletionRate(tasks) {
  const total = tasks.length;
  if (!total) return 0;
  const completed = tasks.filter((task) => Boolean(task?.completedToday)).length;
  return Math.round((completed / total) * 100);
}

function getTomorrowTierFromRate(rate) {
  if (rate <= 0) return "none";
  if (rate <= 49) return "stone";
  if (rate <= 74) return "iron";
  if (rate <= 89) return "gold";
  return "diamond";
}

function SectionHeader({ tone, children }) {
  return (
    <h3 className={`mt-5 mb-2 px-1 text-xs font-semibold uppercase tracking-wider ${tone}`}>{children}</h3>
  );
}

function StandardRow({ emoji, label, value, tone = "text-teal-300", extraClass = "" }) {
  return (
    <div className={`border-b border-white/[0.04] last:border-b-0 ${extraClass}`}>
      <div className="flex items-center justify-between rounded-xl p-3 transition hover:bg-white/[0.02]">
        <div className="flex items-center gap-2 text-sm text-zinc-100">
          <span className="emoji-premium emoji-premium-inline">{emoji}</span>
          <span>{label}</span>
        </div>
        <span className={`text-sm font-bold ${tone}`}>{value}</span>
      </div>
    </div>
  );
}

function TodayXPCard({ inline }) {
  const today = getXPToday();
  const summary = getTodayXPSummary();
  const show = inline || today.total > 0;

  if (!show) return null;

  const rows = inline
    ? TODAY_BREAKDOWN_ROWS.map((item) => ({
        ...item,
        amount: Number(today[item.key] || 0),
      }))
    : summary.filter((item) => !item.isTotal);

  return (
    <div className="glass-card mb-5 rounded-2xl p-4" data-active="true">
      <p className="text-sm font-semibold text-teal-300">
        \u26A1 {inline ? "Today's XP Breakdown" : "Earned Today"}
      </p>
      <div className="mt-3">
        {rows.map((row) => (
          <div key={`${row.label}-${row.emoji}`} className="border-b border-white/[0.04] last:border-b-0">
            <div className="flex items-center justify-between rounded-xl p-3 transition hover:bg-white/[0.02]">
              <div className="flex items-center gap-2 text-sm text-zinc-300">
                <span className="emoji-premium emoji-premium-inline">{row.emoji}</span>
                <span>{row.label}</span>
              </div>
              <span className={`text-sm font-bold ${row.amount > 0 ? "text-teal-300" : "text-zinc-600"}`}>
                {formatSignedXP(row.amount)}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between rounded-xl p-3">
          <span className="text-sm font-bold text-zinc-100">Total today</span>
          <span className={`text-sm font-bold ${today.total > 0 ? "text-teal-300" : "text-zinc-100"}`}>
            {formatSignedXP(today.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

function EveryDaySection() {
  return (
    <>
      <SectionHeader tone="text-teal-300">Every Day</SectionHeader>
      <div>
        <StandardRow emoji="\u2705" label="Complete a task" value={formatSignedXP(XP_REWARDS.TASK_COMPLETE)} />
        <StandardRow
          emoji="\u{1F305}"
          label="Complete before noon"
          value={formatSignedXP(XP_REWARDS.EARLY_BONUS)}
        />
        <StandardRow
          emoji="\u{1F4AF}"
          label="Complete ALL tasks"
          value={formatSignedXP(XP_REWARDS.ALL_TASKS_BONUS)}
        />
        <StandardRow
          emoji="\u{1FAA8}"
          label="Forge: Stone"
          value={`+${FORGE_TIERS.stone.xpMin}-${FORGE_TIERS.stone.xpMax} XP`}
        />
        <StandardRow
          emoji="\u2699\uFE0F"
          label="Forge: Iron"
          value={`+${FORGE_TIERS.iron.xpMin}-${FORGE_TIERS.iron.xpMax} XP`}
        />
        <StandardRow
          emoji="\u{1F525}"
          label="Forge: Gold"
          value={`+${FORGE_TIERS.gold.xpMin}-${FORGE_TIERS.gold.xpMax} XP`}
        />
        <StandardRow
          emoji="\u{1F48E}"
          label="Forge: Diamond"
          value={`+${FORGE_TIERS.diamond.xpMin}-${FORGE_TIERS.diamond.xpMax} XP`}
        />
      </div>
    </>
  );
}

function MultipliersSection({ currentStreak }) {
  const time = getTimeOfDayMultiplier();
  const activeMultiplier = getComboMultiplier(currentStreak);

  return (
    <>
      <SectionHeader tone="text-amber-300">Active Multipliers</SectionHeader>
      <div>
        <StandardRow
          emoji="\u23F0"
          label="Time of day"
          value={time.label ? `${time.label} ${time.bonus}` : "Base XP (noon-6pm)"}
          tone={time.label ? "text-teal-300" : "text-zinc-500"}
        />

        {COMBO_ROWS.map((row) => {
          const isActive = currentStreak >= row.min && currentStreak <= row.max;
          const isPast = row.max !== Infinity && currentStreak > row.max;
          const isFuture = currentStreak < row.min;

          return (
            <div
              key={row.id}
              className={`border-b border-white/[0.04] last:border-b-0 ${
                isActive ? "rounded-xl border border-teal-300/30" : ""
              } ${isFuture ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between rounded-xl p-3 transition hover:bg-white/[0.02]">
                <div className="flex items-center gap-2 text-sm text-zinc-100">
                  <span className="emoji-premium emoji-premium-inline">{"\u{1F525}"}</span>
                  <span>{row.label}</span>
                  {isPast ? <span className="text-emerald-300">\u2713</span> : null}
                  {isActive ? (
                    <span className="rounded-full bg-teal-300/15 px-2 py-0.5 text-[10px] font-semibold text-teal-200">Active</span>
                  ) : null}
                </div>
                <span className={`text-sm font-bold ${isActive ? "text-teal-300" : "text-zinc-300"}`}>
                  x{row.multiplier.toFixed(1)} {row.bonus ? `(${row.bonus})` : ""}
                </span>
              </div>
            </div>
          );
        })}

        <div className="mt-2 px-1 text-xs text-zinc-500">Current combo: x{activeMultiplier.toFixed(1)}</div>
      </div>
    </>
  );
}

function StreakMilestoneSection() {
  const milestoneMap = MILESTONES.reduce((acc, milestone) => {
    acc[milestone.day] = milestone;
    return acc;
  }, {});

  const rows = [
    { day: 7, emoji: milestoneMap[7]?.emoji || "\u{1F331}", amount: XP_REWARDS.STREAK_7_DAYS },
    { day: 14, emoji: milestoneMap[14]?.emoji || "\u26A1", amount: XP_REWARDS.STREAK_14_DAYS },
    { day: 30, emoji: milestoneMap[30]?.emoji || "\u{1F3C6}", amount: XP_REWARDS.STREAK_30_DAYS },
    { day: 100, emoji: milestoneMap[100]?.emoji || "\u{1F31F}", amount: milestoneMap[100]?.xpBonus || 0 },
  ];

  return (
    <>
      <SectionHeader tone="text-amber-300">Streak Milestones</SectionHeader>
      <div>
        {rows.map((row) => (
          <StandardRow
            key={row.day}
            emoji={row.emoji}
            label={`${row.day}-day streak`}
            value={formatSignedXP(row.amount)}
          />
        ))}
      </div>
      <p className="mt-2 px-1 text-xs text-zinc-500">Awarded once per habit per milestone</p>
    </>
  );
}

function MissionsAndSpecialSection() {
  return (
    <>
      <SectionHeader tone="text-purple-300">Missions &amp; Special</SectionHeader>
      <div>
        <StandardRow emoji="\u{1F3AF}" label="Mission: Easy" value={formatSignedXP(MISSION_XP.easy)} />
        <StandardRow emoji="\u{1F3AF}" label="Mission: Medium" value={formatSignedXP(MISSION_XP.medium)} />
        <StandardRow emoji="\u{1F3AF}" label="Mission: Hard" value={formatSignedXP(MISSION_XP.hard)} />
        <StandardRow
          emoji="\u{1F44B}"
          label="First completion"
          value={formatSignedXP(XP_REWARDS.FIRST_EVER_COMPLETION)}
        />
        <StandardRow emoji="\u{1F504}" label="Comeback recovery" value={formatSignedXP(RECOVERY_MISSION_XP)} />
      </div>
    </>
  );
}

function LevelUnlockSection({ currentLevel }) {
  const levels = [2, 3, 4, 5, 7, 10];

  return (
    <>
      <SectionHeader tone="text-emerald-300">Level Unlocks</SectionHeader>
      <div>
        {levels.map((level) => {
          const unlocked = currentLevel > level;
          const isCurrent = currentLevel === level;
          const isNext = currentLevel + 1 === level;

          return (
            <div
              key={level}
              className={`border-b border-white/[0.04] last:border-b-0 ${
                isCurrent ? "rounded-xl border border-teal-300/35" : ""
              } ${!unlocked && !isCurrent && !isNext ? "opacity-40" : ""}`}
            >
              <div className="flex items-center justify-between rounded-xl p-3 transition hover:bg-white/[0.02]">
                <div className="flex items-center gap-2 text-sm text-zinc-100">
                  {unlocked ? <span className="text-emerald-300">\u2713</span> : null}
                  {!unlocked && !isCurrent && !isNext ? (
                    <span className="text-zinc-500">{"\u{1F512}"}</span>
                  ) : null}
                  <span className="font-semibold">Lv.{level}</span>
                  <span>{LEVEL_UNLOCKS[level]}</span>
                  <span className="emoji-premium emoji-premium-inline">{UNLOCK_ICONS[level] || "\u2728"}</span>
                </div>
                <div className="text-xs">
                  {isCurrent ? (
                    <span className="rounded-full bg-teal-300/15 px-2 py-0.5 text-teal-200">\u2190 You are here</span>
                  ) : null}
                  {isNext ? <span className="text-teal-300">Next unlock</span> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function ForgeTiersSection({ tasks }) {
  const completionRate = getCompletionRate(tasks);
  const tomorrowTier = getTomorrowTierFromRate(completionRate);
  const tierConfig = FORGE_TIERS[tomorrowTier] || FORGE_TIERS.none;

  return (
    <>
      <SectionHeader tone="text-amber-300">Forge Tiers</SectionHeader>
      <p className="mb-2 px-1 text-xs text-zinc-400">Tomorrow&apos;s forge tier = today&apos;s completion rate</p>
      <div>
        <StandardRow emoji="\u26D4" label="0% completed \u2192 No Forge" value="No reward" tone="text-zinc-500" />
        <StandardRow
          emoji="\u{1FAA8}"
          label="1-49% done \u2192 Stone"
          value={`+${FORGE_TIERS.stone.xpMin}-${FORGE_TIERS.stone.xpMax} XP`}
        />
        <StandardRow
          emoji="\u2699\uFE0F"
          label="50-74% done \u2192 Iron"
          value={`+${FORGE_TIERS.iron.xpMin}-${FORGE_TIERS.iron.xpMax} XP`}
        />
        <StandardRow
          emoji="\u{1F525}"
          label="75-89% done \u2192 Gold"
          value={`+${FORGE_TIERS.gold.xpMin}-${FORGE_TIERS.gold.xpMax} XP`}
        />
        <StandardRow
          emoji="\u{1F48E}"
          label="90-100% done \u2192 Diamond"
          value={`+${FORGE_TIERS.diamond.xpMin}-${FORGE_TIERS.diamond.xpMax} XP`}
        />
      </div>
      <p className="mt-2 px-1 text-sm text-zinc-300">
        Today: {completionRate}% \u2192 Tomorrow: <span className="font-semibold text-teal-300">{tierConfig.label}</span>
      </p>
    </>
  );
}

function XPGuideContent({ currentLevel, tasks, inline }) {
  const taskList = Array.isArray(tasks) && tasks.length ? tasks : readTasksFromStorage();
  const currentStreak = Math.max(...taskList.map((task) => Number(task?.streak || 0)), 0);

  return (
    <div>
      <TodayXPCard inline={inline} />
      <EveryDaySection />
      <MultipliersSection currentStreak={currentStreak} />
      <StreakMilestoneSection />
      <MissionsAndSpecialSection />
      <LevelUnlockSection currentLevel={currentLevel} />
      <ForgeTiersSection tasks={taskList} />
    </div>
  );
}

export default function XPGuide({ isOpen = false, onClose, currentLevel = 1, inline = false, tasks = [] }) {
  if (inline) {
    return <XPGuideContent currentLevel={currentLevel} tasks={tasks} inline={true} />;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60" onClick={onClose}>
      <div
        className="glass-card fixed inset-x-0 bottom-0 z-[81] max-h-[82vh] overflow-y-auto rounded-t-3xl border-t border-white/[0.08] bg-[#0B0B0B] pb-8 animate-modalSlideUp"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mt-3 mb-4 h-1 w-10 rounded-full bg-zinc-600" />

        <div className="px-4 pb-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100">How to Earn XP</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center text-zinc-400"
              aria-label="Close XP guide"
            >
              \u00D7
            </button>
          </div>
          <p className="mb-4 text-sm text-zinc-400">Every action fills your level bar</p>

          <XPGuideContent currentLevel={currentLevel} tasks={tasks} inline={false} />
        </div>
      </div>
    </div>
  );
}
