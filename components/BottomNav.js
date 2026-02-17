"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/progress", icon: "📊", label: "Progress" },
  { href: "/tasks", icon: "📝", label: "Tasks" },
  { href: "/social", icon: "👥", label: "Social" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

function BottomNavContent() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-[#334155] z-40">
      <div className="flex items-center justify-around h-[70px] max-w-2xl mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isTasksButton = item.href === "/tasks";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg transition-all ${
                isTasksButton
                  ? `px-4 py-2 ${isActive ? "text-white bg-[#60A5FA] scale-110" : "text-[#94A3B8] hover:text-[#F1F5F9]"}`
                  : `px-3 py-2 ${isActive ? "text-[#60A5FA] scale-105" : "text-[#94A3B8] hover:text-[#F1F5F9]"}`
              }`}
            >
              <span className={isTasksButton ? "text-3xl" : "text-2xl"}>{item.icon}</span>
              <span className={`font-medium ${isTasksButton ? "text-sm" : "text-xs"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense fallback={
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-[#334155] z-40 h-[70px]" />
    }>
      <BottomNavContent />
    </Suspense>
  );
}
