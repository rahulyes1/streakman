"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesColumn, ListTodo, Settings, TrendingUp } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", Icon: ChartNoAxesColumn, label: "Marks" },
  { href: "/tasks", Icon: ListTodo, label: "Tasks" },
  { href: "/progress", Icon: TrendingUp, label: "Progress" },
  { href: "/settings", Icon: Settings, label: "Settings" },
];

function BottomNavContent() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/45 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-2xl items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-11 min-w-[68px] flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-xs font-medium transition-spring ${
                isActive
                  ? "text-teal-200"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              <item.Icon className="h-5 w-5" strokeWidth={2.2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function BottomNav() {
  return (
    <Suspense
      fallback={<nav className="fixed bottom-0 left-0 right-0 z-40 h-[72px] bg-black/70" />}
    >
      <BottomNavContent />
    </Suspense>
  );
}

