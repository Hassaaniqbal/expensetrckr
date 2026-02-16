"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const EVENTS = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"] as const;

export default function InactivityGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    resetTimer();

    for (const event of EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [resetTimer]);

  return <>{children}</>;
}
