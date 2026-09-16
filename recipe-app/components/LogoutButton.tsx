"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="text-stone-400 hover:text-stone-600 text-sm">
      Odhlásit
    </button>
  );
}
