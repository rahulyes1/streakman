"use client";

import { usePathname, useRouter } from "next/navigation";
import FloatingAddButton from "@/components/FloatingAddButton";

export default function GlobalAddButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/signin") return null;

  return <FloatingAddButton onClick={() => router.push("/tasks?add=true")} />;
}
