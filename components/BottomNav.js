"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/progress", icon: "📊", label: "Progress" },
  { href: "/tasks", icon: "📝", label: "Tasks" },
  { href: "/social", icon: "👥", label: "Social" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1E293B] border-t border-[#334155] z-40">
      <div className="flex items-center justify-around h-[70px] max-w-2xl mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive
                  ? "text-[#60A5FA] scale-105"
                  : "text-[#94A3B8] hover:text-[#F1F5F9]"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
