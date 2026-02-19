"use client";

function difficultyTone(difficulty) {
  if (difficulty === "Starter") return "text-emerald-300";
  if (difficulty === "Moderate") return "text-amber-300";
  return "text-rose-300";
}

export default function TemplateCard({ template, onSelect }) {
  const previewTasks = template.tasks.slice(0, 3);
  const remaining = Math.max(0, template.tasks.length - previewTasks.length);

  return (
    <article
      className="glass-card rounded-2xl p-4 transition-spring hover:-translate-y-0.5 hover:border hover:border-teal-300/45"
      data-active="true"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl">{template.emoji}</p>
          <h3 className="mt-1 text-sm font-semibold text-zinc-100">{template.name}</h3>
        </div>
        <span className={`text-xs font-semibold ${difficultyTone(template.difficulty)}`}>
          {template.difficulty}
        </span>
      </div>

      <ul className="space-y-1 text-xs text-zinc-400">
        {previewTasks.map((task) => (
          <li key={`${template.id}-${task.name}`}>
            {task.emoji} {task.name}
          </li>
        ))}
      </ul>

      {remaining > 0 && <p className="mt-2 text-xs text-zinc-500">+{remaining} more</p>}

      <button
        type="button"
        onClick={() => onSelect?.(template)}
        className="glass-card mt-4 min-h-11 w-full rounded-xl bg-teal-300/12 px-3 text-sm font-semibold text-zinc-100"
      >
        Add Pack
      </button>
    </article>
  );
}
