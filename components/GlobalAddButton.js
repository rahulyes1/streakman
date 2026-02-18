"use client";

import { usePathname, useRouter } from "next/navigation";
import FloatingAddButton from "@/components/FloatingAddButton";

export default function GlobalAddButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/signin") return null;

  return (
    <FloatingAddButton
      onClick={() => {
        if (pathname === "/tasks") {
          const nextParams = new URLSearchParams(window.location.search);
          nextParams.set("add", "true");
          nextParams.set("src", "fab");

          router.push(`/tasks?${nextParams.toString()}`, { scroll: false });
          window.dispatchEvent(new Event("openAddTaskModal"));
          return;
        }

        router.push("/tasks?add=true&src=fab");
      }}
    />
  );
}
