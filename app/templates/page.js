"use client";

import { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import { HABIT_TEMPLATES } from "@/lib/habitTemplates";

const CATEGORIES = ["All", "Lifestyle", "Health", "Focus", "Mind"];

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [toast, setToast] = useState("");

  const filteredTemplates = useMemo(() => {
    if (activeCategory === "All") return HABIT_TEMPLATES;
    return HABIT_TEMPLATES.filter((template) => template.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#0B0B0B] px-4 pb-28 pt-6 text-zinc-100">
        <div className="mesh-leak mesh-leak-teal" />
        <div className="mesh-leak mesh-leak-purple" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <header className="mb-5">
            <h1 className="text-3xl font-bold tracking-tight">Habit Templates</h1>
            <p className="mt-1 text-sm text-zinc-400">Add a full habit pack in one tap.</p>
          </header>

          <div className="mb-5 flex flex-wrap gap-2">
            {CATEGORIES.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`glass-card min-h-11 rounded-full px-4 text-sm font-semibold ${
                    active ? "text-teal-200" : "text-zinc-400"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <section className="grid grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={() => setSelectedTemplate(template)}
              />
            ))}
          </section>
        </div>

        {toast && (
          <div className="fixed left-1/2 top-6 z-[60] -translate-x-1/2 rounded-xl border border-emerald-300/45 bg-[#0B0B0B]/90 px-4 py-2 text-sm text-emerald-300">
            {toast}
          </div>
        )}
      </div>

      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onAdded={(count) => {
            setToast(`Added ${count} task${count === 1 ? "" : "s"} from template`);
            window.setTimeout(() => setToast(""), 1800);
          }}
        />
      )}

      <BottomNav />
    </>
  );
}
