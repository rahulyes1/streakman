"use client";

export default function ComebackScreen({ xp, level, daysSince, onClose }) {
  if (!daysSince || daysSince < 3) return null;

  return (
    <div className="fixed inset-0 z-[75] overflow-hidden bg-[#0B0B0B] px-4 py-8 text-zinc-100">
      <div className="mesh-leak mesh-leak-teal" />
      <div className="mesh-leak mesh-leak-purple" />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-2xl items-center justify-center">
        <div className="glass-card w-full rounded-3xl border border-teal-300/25 p-6 sm:p-8" data-active="true">
          <h2 className="text-3xl font-bold tracking-tight">{"\u{1F44B}"} Welcome back</h2>
          <p className="mt-2 text-zinc-300">You were away for {daysSince} days. That&apos;s okay.</p>

          <div className="mt-5 space-y-2 text-sm text-zinc-300">
            <p>{"\u2705"} {xp} XP intact</p>
            <p>{"\u2705"} Level {level} intact</p>
            <p>{"\u2705"} Streak history intact</p>
          </div>

          <div className="mt-6 rounded-2xl border border-teal-300/30 bg-gradient-to-r from-teal-300/12 to-emerald-300/12 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-400">Recovery Mission</p>
            <p className="mt-1 text-base font-semibold text-zinc-100">Complete 1 task today</p>
            <p className="mt-1 text-sm text-teal-200">+30 XP reward</p>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose?.();
              window.dispatchEvent(new Event("tasksUpdated"));
            }}
            className="glass-card mt-6 min-h-11 w-full rounded-xl bg-gradient-to-r from-teal-300/25 to-emerald-300/20 px-4 text-sm font-semibold text-zinc-100"
          >
            Let&apos;s Go
          </button>
        </div>
      </div>
    </div>
  );
}
