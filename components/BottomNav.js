"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "📊", label: "Marks progress" },
  { href: "/progress", icon: "📈", label: "Progress" },
  { href: "/tasks/add", icon: "➕", label: "Add", isAddButton: true },
  { href: "/tasks", icon: "📝", label: "Tasks" },
];

function BottomNavContent() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-[#334155] z-40 animate-slideUp">
      <div className="flex items-center justify-around h-[70px] max-w-2xl mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const isAddButton = item.isAddButton;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-lg transition-spring hover:scale-105 active:scale-95 ${
                isAddButton
                  ? `px-5 py-3 bg-[#60A5FA] text-white rounded-full shadow-lg hover:shadow-xl hover:bg-[#3B82F6] hover:shadow-[0_0_20px_rgba(96,165,250,0.5)]`
                  : `px-3 py-2 ${isActive ? "text-[#60A5FA] scale-105" : "text-[#94A3B8] hover:text-[#F1F5F9]"}`
              }`}
            >
              <span className={isAddButton ? "text-4xl" : "text-2xl"}>{item.icon}</span>
              <span className={`font-medium ${isAddButton ? "text-sm" : "text-xs"}`}>{item.label}</span>
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
