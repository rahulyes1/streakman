"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const SPRING = { type: "spring", stiffness: 400, damping: 30 };

export default function FloatingAddButton({ onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={SPRING}
      className="glass-card fixed bottom-[calc(76px+env(safe-area-inset-bottom))] left-auto right-4 z-[90] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-300/35 to-teal-400/15 text-teal-50 shadow-[0_18px_42px_rgba(20,184,166,0.45)] pointer-events-auto sm:right-6"
      data-active="true"
      aria-label="Add task"
    >
      <Plus className="h-6 w-6" strokeWidth={2.6} />
    </motion.button>
  );
}

