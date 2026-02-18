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
      className="glass-card fixed bottom-[88px] right-5 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-300/15 text-teal-100"
      aria-label="Add task"
    >
      <Plus className="h-6 w-6" strokeWidth={2.6} />
    </motion.button>
  );
}

