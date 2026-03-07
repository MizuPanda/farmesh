"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Sprout, ShoppingBasket, ArrowLeft } from "lucide-react";
import type { UserType } from "@/types";
import { signup } from "@/app/actions/signup";
import { login } from "@/app/actions/login";

type Mode = "signin" | "signup";

function AuthForm() {
  const searchParams = useSearchParams();

  const initialRole: UserType =
    searchParams.get("role") === "buyer" ? "buyer" : "farmer";

  const [role, setRole] = useState<UserType>(initialRole);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const result = await login({ email, password });
        if (result?.error) {
          setError(result.error);
        }
      } else {
        const result = await signup({
          name,
          email,
          password,
          type: role,
          businessName,
          phone,
        });
        if (result?.error) {
          setError(result.error);
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFarmer = role === "farmer";

  const inputBase =
    "w-full border px-4 py-2.5 text-sm font-sans outline-none transition-colors duration-200";

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--surface-muted)" }}>

      {/* Nav */}
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--border-soft)", backgroundColor: "hsl(40 33% 97% / 0.96)", backdropFilter: "blur(8px)" }}
      >
        <Link
          href="/"
          className="link-underline flex items-center gap-1.5 text-xs tracking-[0.15em] uppercase transition-colors duration-300"
          style={{ color: "var(--text-muted)" }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center bg-green-600">
            <Sprout className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-serif text-lg tracking-tight" style={{ color: "var(--foreground)" }}>
            Farmesh
          </span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm animate-fade-in-up">

          {/* Page heading */}
          <p className="mb-1 text-[11px] font-semibold tracking-[0.3em] uppercase" style={{ color: "var(--text-muted)" }}>
            Welcome to Farmesh
          </p>
          <h1 className="font-serif mb-8 text-3xl" style={{ color: "var(--foreground)" }}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>

          {/* Role selector */}
          <div className="mb-7">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase" style={{ color: "var(--text-muted)" }}>
              I am a
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole("farmer")}
                className="flex items-center gap-2.5 border px-4 py-3 text-sm font-medium transition-all duration-300"
                style={{
                  borderColor: isFarmer ? "#16a34a" : "var(--border-soft)",
                  backgroundColor: isFarmer ? "#f0fdf4" : "var(--surface-base)",
                  color: isFarmer ? "#166534" : "var(--text-muted)",
                }}
              >
                <Sprout className="h-4 w-4" style={{ color: isFarmer ? "#16a34a" : "var(--text-faint)" }} />
                Farmer
              </button>
              <button
                type="button"
                onClick={() => setRole("buyer")}
                className="flex items-center gap-2.5 border px-4 py-3 text-sm font-medium transition-all duration-300"
                style={{
                  borderColor: !isFarmer ? "#d97706" : "var(--border-soft)",
                  backgroundColor: !isFarmer ? "#fffbeb" : "var(--surface-base)",
                  color: !isFarmer ? "#92400e" : "var(--text-muted)",
                }}
              >
                <ShoppingBasket className="h-4 w-4" style={{ color: !isFarmer ? "#d97706" : "var(--text-faint)" }} />
                Buyer
              </button>
            </div>
          </div>

          {/* Mode toggle */}
          <div
            className="mb-7 flex border p-1"
            style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-base)" }}
          >
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 py-2 text-xs font-semibold tracking-[0.1em] uppercase transition-all duration-200"
                style={{
                  backgroundColor: mode === m ? "var(--foreground)" : "transparent",
                  color: mode === m ? "var(--surface-base)" : "var(--text-muted)",
                }}
              >
                {m === "signin" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — signup only */}
            {mode === "signup" && (
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "hsl(30 8% 45%)" }}>
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className={inputBase}
                  style={{ borderColor: "hsl(30 15% 88%)", backgroundColor: "hsl(40 33% 97%)", color: "var(--foreground)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 55%)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 88%)")}
                />
              </div>
            )}

            {/* Business Name — signup only */}
            {mode === "signup" && (
              <div>
                <label htmlFor="businessName" className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
                  {isFarmer ? "Farm name" : "Business / org name"}
                  <span className="ml-1 font-normal tracking-normal normal-case" style={{ color: "var(--text-faint)" }}>(optional)</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={isFarmer ? "e.g. Green Acres Farm" : "e.g. The Local Kitchen"}
                  className={inputBase}
                  style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-base)", color: "var(--foreground)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-soft)")}
                />
              </div>
            )}

            {/* Phone — signup only */}
            {mode === "signup" && (
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "hsl(30 8% 45%)" }}>
                  Phone Number
                  <span className="ml-1 font-normal tracking-normal normal-case" style={{ color: "hsl(30 8% 65%)" }}>(optional)</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                  className={inputBase}
                  style={{ borderColor: "hsl(30 15% 88%)", backgroundColor: "hsl(40 33% 97%)", color: "var(--foreground)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 55%)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 88%)")}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputBase}
                style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-base)", color: "var(--foreground)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-soft)")}
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputBase}
                style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-base)", color: "var(--foreground)" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-soft)")}
              />
            </div>

            {error && (
              <p className="border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-xs font-semibold tracking-[0.15em] uppercase text-white transition-all duration-300 disabled:opacity-60"
              style={{ backgroundColor: isFarmer ? "#16a34a" : "#d97706" }}
            >
              {loading
                ? "Just a moment…"
                : mode === "signin"
                  ? `Sign in as ${role}`
                  : `Create ${role} account`}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

// useSearchParams requires Suspense boundary in Next.js App Router
export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
