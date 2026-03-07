"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sprout, Bell, LogOut } from "lucide-react";
import { getUser } from "@/lib/auth";
import { signout } from "@/app/actions/signout";
import type { User } from "@/types";

type AppNavProps = {
  unreadCount?: number;
};

export default function AppNav({ unreadCount = 0 }: AppNavProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  const handleSignOut = async () => {
    await signout();
  };

  const isFarmer = user?.type === "farmer";

  return (
    <header
      className="sticky top-0 z-50 border-b transition-all duration-500"
      style={{
        borderColor: "var(--border-soft)",
        backgroundColor: "hsl(40 33% 97% / 0.96)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center bg-green-600">
            <Sprout className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-serif text-xl tracking-tight" style={{ color: "var(--foreground)" }}>
            Farmesh
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden items-center gap-3 sm:flex">
              <span className="max-w-[180px] truncate text-xs" style={{ color: "var(--text-muted)" }}>
                {user.businessName || user.email}
              </span>
              <span
                className="border px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.15em] uppercase"
                style={{
                  borderColor: isFarmer ? "#bbf7d0" : "#fde68a",
                  backgroundColor: isFarmer ? "#f0fdf4" : "#fffbeb",
                  color: isFarmer ? "#166534" : "#92400e",
                }}
              >
                {user.type}
              </span>
            </div>
          )}

          <button
            type="button"
            className="relative p-2 transition-colors duration-300"
            style={{ color: "var(--text-subtle)" }}
            aria-label="Notifications"
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-subtle)")}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 transition-colors duration-300"
            style={{ color: "var(--text-subtle)" }}
            aria-label="Sign out"
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-subtle)")}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
