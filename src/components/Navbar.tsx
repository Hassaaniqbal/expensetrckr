"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

interface NavbarProps {
  username: string;
}

export default function Navbar({ username }: NavbarProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="bg-primary-700 shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
            <Image src="/logo.png" alt="Expense Tracker" width={36} height={36} className="object-contain" />
          </div>
          <h1 className="text-lg font-bold text-white">Expense Tracker</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-white uppercase">
                {username.charAt(0)}
              </span>
            </div>
            <span className="text-sm text-primary-100 hidden sm:inline">{username}</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3 py-1.5 text-sm text-primary-100 bg-white/10 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {loggingOut ? "..." : "Log out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
