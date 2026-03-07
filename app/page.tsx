"use client";

import { Sprout } from "lucide-react";
import RoleSelector from "@/components/home/RoleSelector";
import LoginForm from "@/components/home/LoginForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* App Bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-100">
            <Sprout className="h-5 w-5 text-green-700" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Farmesh
          </h1>
        </div>
        <RoleSelector />
      </header>

      {/* Main Content — Login Form */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col items-center">
          <p className="mb-2 text-sm font-medium text-green-700">
            The AI coordination layer for local food systems
          </p>
          <p className="mb-8 max-w-xs text-center text-sm leading-relaxed text-gray-500">
            Farmesh connects local farmers and wholesale buyers using AI to
            match supply with demand — reducing waste, saving time, and
            strengthening local food networks.
          </p>
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
