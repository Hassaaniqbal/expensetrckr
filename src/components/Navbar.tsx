"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
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
