"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ShoppingBasket,
  Sprout,
} from "lucide-react";
import type { UserType } from "@/types";
import { login } from "@/app/actions/login";
import { signup } from "@/app/actions/signup";

type Mode = "signin" | "signup";

type LogoNode = {
  x: number;
  y: number;
};

type LogoEdge = {
  from: number;
  to: number;
  delay: number;
  tone: "primary" | "secondary";
};

const FARMESH_MARK_NODES: LogoNode[] = [
  { x: 50, y: 85 }, // stem base
  { x: 50, y: 72 },
  { x: 50, y: 59 },
  { x: 50, y: 47 }, // stem split
  { x: 50, y: 35 }, // top bud
  { x: 44, y: 39 },
  { x: 38, y: 32 },
  { x: 30, y: 39 },
  { x: 35, y: 50 },
  { x: 43, y: 53 },
  { x: 56, y: 39 },
  { x: 62, y: 32 },
  { x: 70, y: 39 },
  { x: 65, y: 50 },
  { x: 57, y: 53 },
  { x: 42, y: 90 }, // ground line
  { x: 58, y: 90 },
];

const FARMESH_MARK_EDGES: LogoEdge[] = [
  { from: 0, to: 1, delay: 0.0, tone: "primary" },
  { from: 1, to: 2, delay: 0.3, tone: "primary" },
  { from: 2, to: 3, delay: 0.6, tone: "primary" },
  { from: 3, to: 4, delay: 0.9, tone: "primary" },
  { from: 3, to: 5, delay: 1.1, tone: "primary" },
  { from: 5, to: 6, delay: 1.3, tone: "primary" },
  { from: 6, to: 7, delay: 1.6, tone: "secondary" },
  { from: 7, to: 8, delay: 1.9, tone: "secondary" },
  { from: 8, to: 9, delay: 2.2, tone: "primary" },
  { from: 9, to: 3, delay: 2.5, tone: "primary" },
  { from: 3, to: 10, delay: 1.1, tone: "primary" },
  { from: 10, to: 11, delay: 1.3, tone: "primary" },
  { from: 11, to: 12, delay: 1.6, tone: "secondary" },
  { from: 12, to: 13, delay: 1.9, tone: "secondary" },
  { from: 13, to: 14, delay: 2.2, tone: "primary" },
  { from: 14, to: 3, delay: 2.5, tone: "primary" },
  { from: 15, to: 0, delay: 2.8, tone: "secondary" },
  { from: 0, to: 16, delay: 3.0, tone: "secondary" },
];

function FarmeshMarkVisual({ isFarmer }: { isFarmer: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setSize({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const palette = isFarmer
      ? {
          line: "rgba(22, 163, 74, 0.62)",
          lineSoft: "rgba(22, 163, 74, 0.34)",
          pulse: "rgba(22, 163, 74, 0.95)",
          pulseGlow: "rgba(22, 163, 74, 0.18)",
          nodeBorder: "rgba(22, 163, 74, 0.65)",
        }
      : {
          line: "rgba(217, 119, 6, 0.62)",
          lineSoft: "rgba(217, 119, 6, 0.34)",
          pulse: "rgba(217, 119, 6, 0.95)",
          pulseGlow: "rgba(217, 119, 6, 0.18)",
          nodeBorder: "rgba(217, 119, 6, 0.65)",
        };

    const points = FARMESH_MARK_NODES.map((node) => ({
      x: (node.x / 100) * size.width,
      y: (node.y / 100) * size.height,
    }));

    const startAt = performance.now();
    let requestId = 0;

    const draw = (now: number) => {
      const elapsedSeconds = (now - startAt) / 1000;
      context.clearRect(0, 0, size.width, size.height);

      const paperGradient = context.createLinearGradient(0, 0, size.width, size.height);
      paperGradient.addColorStop(0, "hsl(39 35% 98%)");
      paperGradient.addColorStop(0.5, "hsl(36 30% 94%)");
      paperGradient.addColorStop(1, "hsl(33 25% 91%)");
      context.fillStyle = paperGradient;
      context.fillRect(0, 0, size.width, size.height);

      for (let i = 0; i < 140; i += 1) {
        const x = ((i * 37) % 100) / 100 * size.width;
        const y = ((i * 53 + 11) % 100) / 100 * size.height;
        const radius = i % 3 === 0 ? 1 : 0.7;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = "rgba(80, 62, 48, 0.08)";
        context.fill();
      }

      context.lineCap = "round";
      context.lineJoin = "round";

      FARMESH_MARK_EDGES.forEach((edge) => {
        const start = points[edge.from];
        const end = points[edge.to];
        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
        context.lineWidth = edge.tone === "primary" ? 2.2 : 1.5;
        context.strokeStyle = edge.tone === "primary" ? palette.line : palette.lineSoft;
        context.stroke();
      });

      FARMESH_MARK_EDGES.forEach((edge) => {
        const phase = ((elapsedSeconds - edge.delay) % 5.5 + 5.5) % 5.5;
        if (phase > 1.7) return;
        const progress = phase / 1.7;
        const start = points[edge.from];
        const end = points[edge.to];
        const currentX = start.x + (end.x - start.x) * progress;
        const currentY = start.y + (end.y - start.y) * progress;

        context.beginPath();
        context.moveTo(start.x, start.y);
        context.lineTo(currentX, currentY);
        context.lineWidth = 2.4;
        context.strokeStyle = palette.pulse;
        context.stroke();

        context.beginPath();
        context.arc(currentX, currentY, 3.1, 0, Math.PI * 2);
        context.fillStyle = palette.pulse;
        context.fill();

        context.beginPath();
        context.arc(currentX, currentY, 7.2, 0, Math.PI * 2);
        context.fillStyle = palette.pulseGlow;
        context.fill();
      });

      points.forEach((node) => {
        context.beginPath();
        context.arc(node.x, node.y, 2.8, 0, Math.PI * 2);
        context.fillStyle = "hsl(41 35% 96%)";
        context.fill();

        context.beginPath();
        context.arc(node.x, node.y, 2.8, 0, Math.PI * 2);
        context.strokeStyle = palette.nodeBorder;
        context.lineWidth = 1.1;
        context.stroke();
      });

      requestId = window.requestAnimationFrame(draw);
    };

    requestId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(requestId);
  }, [isFarmer, size.height, size.width]);

  return (
    <div className="relative h-full w-full overflow-hidden border" style={{ borderColor: "var(--border-soft)" }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 120% at 10% 0%, hsl(40 35% 98%) 0%, hsl(37 30% 94%) 60%, hsl(32 25% 91%) 100%)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/[0.06] via-transparent to-transparent" />
    </div>
  );
}

export default function TravelConnectSignin() {
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
  const [showPassword, setShowPassword] = useState(false);

  const isFarmer = role === "farmer";
  const accent = isFarmer
    ? {
        solid: "#16a34a",
        soft: "#f0fdf4",
        text: "#166534",
        border: "#bbf7d0",
      }
    : {
        solid: "#d97706",
        soft: "#fffbeb",
        text: "#92400e",
        border: "#fde68a",
      };

  const inputBase =
    "w-full border px-4 py-2.5 text-sm font-sans outline-none transition-colors duration-200";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        const result = await login({ email, password });
        if (result?.error) setError(result.error);
      } else {
        const result = await signup({
          name,
          email,
          password,
          type: role,
          businessName,
          phone,
        });
        if (result?.error) setError(result.error);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-8 md:px-8"
      style={{
        background: "linear-gradient(150deg, hsl(40 34% 97%) 0%, hsl(36 26% 93%) 100%)",
      }}
    >
      <header className="mx-auto mb-8 flex w-full max-w-6xl items-center justify-between">
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
          <span
            className="font-serif text-lg tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            Farmesh
          </span>
        </Link>
      </header>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="grid w-full overflow-hidden border bg-[var(--surface-base)] shadow-[0_20px_60px_-30px_rgba(50,40,30,0.35)] lg:grid-cols-[1.1fr_1fr]"
          style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-base)" }}
        >
          <div className="relative hidden min-h-[680px] border-r p-9 lg:block" style={{ borderColor: "var(--border-soft)" }}>
            <div className="mb-8">
              <p
                className="mb-3 text-[11px] font-semibold tracking-[0.28em] uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                Farmesh mark
              </p>
              <h2 className="font-serif text-4xl leading-[1.05]" style={{ color: "var(--foreground)" }}>
                Built for local
                <br />
                food connections
              </h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--text-subtle)" }}>
                The connected lines and nodes draw the Farmesh sprout, representing growers and buyers linked through one shared market.
              </p>
            </div>

            <div className="relative h-[420px]">
              <FarmeshMarkVisual isFarmer={isFarmer} />
            </div>

            <div className="mt-8 border p-4 text-sm leading-relaxed" style={{ borderColor: accent.border, backgroundColor: accent.soft, color: accent.text }}>
              {isFarmer
                ? "Farmer accounts can post inventory and review matched buyers."
                : "Buyer accounts can post requests and review ranked farm matches."}
            </div>

            <div className="pointer-events-none absolute inset-x-9 bottom-9 flex items-center justify-between text-[11px] font-semibold tracking-[0.2em] uppercase" style={{ color: "var(--text-faint)" }}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="inline-flex items-center gap-2"
              >
                {isFarmer ? (
                  <Sprout className="h-3.5 w-3.5" style={{ color: "#16a34a" }} />
                ) : (
                  <ShoppingBasket className="h-3.5 w-3.5" style={{ color: "#d97706" }} />
                )}
                {isFarmer ? "Farmer mode" : "Buyer mode"}
              </motion.div>
              <motion.p
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
              >
                Canadian farm-to-business network
              </motion.p>
            </div>
          </div>

          <div className="min-h-[680px] p-7 sm:p-10 md:p-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
            >
              <p
                className="mb-2 text-[11px] font-semibold tracking-[0.28em] uppercase"
                style={{ color: "var(--text-muted)" }}
              >
                {mode === "signin" ? "Sign in" : "Create account"}
              </p>
              <h1 className="font-serif text-4xl leading-tight" style={{ color: "var(--foreground)" }}>
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {mode === "signin"
                  ? "Sign in to continue to your Farmesh dashboard."
                  : "Set up your role and start matching local supply and demand."}
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("farmer")}
                  className="flex items-center justify-center gap-2 border px-4 py-3 text-sm font-medium transition-all duration-200"
                  style={{
                    borderColor: isFarmer ? "#16a34a" : "var(--border-soft)",
                    backgroundColor: isFarmer ? "#f0fdf4" : "var(--surface-card)",
                    color: isFarmer ? "#166534" : "var(--text-muted)",
                  }}
                >
                  <Sprout className="h-4 w-4" />
                  Farmer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className="flex items-center justify-center gap-2 border px-4 py-3 text-sm font-medium transition-all duration-200"
                  style={{
                    borderColor: !isFarmer ? "#d97706" : "var(--border-soft)",
                    backgroundColor: !isFarmer ? "#fffbeb" : "var(--surface-card)",
                    color: !isFarmer ? "#92400e" : "var(--text-muted)",
                  }}
                >
                  <ShoppingBasket className="h-4 w-4" />
                  Buyer
                </button>
              </div>

              <div className="mt-7 flex gap-6 border-b pb-2" style={{ borderColor: "var(--border-soft)" }}>
                {(["signin", "signup"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className="border-b-2 pb-2 text-xs font-semibold tracking-[0.14em] uppercase transition-colors duration-200"
                    style={{
                      borderColor: mode === value ? accent.solid : "transparent",
                      color: mode === value ? "var(--foreground)" : "var(--text-muted)",
                    }}
                  >
                    {value === "signin" ? "Sign in" : "Create account"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <AnimatePresence initial={false}>
                  {mode === "signup" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      <div>
                        <label
                          htmlFor="name"
                          className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          placeholder="John Doe"
                          className={inputBase}
                          style={{
                            borderColor: "var(--border-subtle)",
                            backgroundColor: "var(--surface-base)",
                            color: "var(--foreground)",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="businessName"
                          className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {isFarmer ? "Farm Name" : "Business Name"}
                          <span
                            className="ml-1 font-normal tracking-normal normal-case"
                            style={{ color: "var(--text-faint)" }}
                          >
                            (optional)
                          </span>
                        </label>
                        <input
                          id="businessName"
                          type="text"
                          value={businessName}
                          onChange={(event) => setBusinessName(event.target.value)}
                          placeholder={isFarmer ? "e.g. Green Acres Farm" : "e.g. Local Kitchen"}
                          className={inputBase}
                          style={{
                            borderColor: "var(--border-subtle)",
                            backgroundColor: "var(--surface-base)",
                            color: "var(--foreground)",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Phone
                          <span
                            className="ml-1 font-normal tracking-normal normal-case"
                            style={{ color: "var(--text-faint)" }}
                          >
                            (optional)
                          </span>
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="(555) 123-4567"
                          className={inputBase}
                          style={{
                            borderColor: "var(--border-subtle)",
                            backgroundColor: "var(--surface-base)",
                            color: "var(--foreground)",
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={inputBase}
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-base)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-[11px] font-semibold tracking-[0.15em] uppercase"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className={`${inputBase} pr-11`}
                      style={{
                        borderColor: "var(--border-subtle)",
                        backgroundColor: "var(--surface-base)",
                        color: "var(--foreground)",
                      }}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3"
                      style={{ color: "var(--text-subtle)" }}
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.99 }}
                  whileHover={{ filter: "brightness(0.96)" }}
                  className="w-full px-4 py-3 text-xs font-semibold tracking-[0.15em] uppercase text-white transition-colors duration-200 disabled:opacity-60"
                  style={{ backgroundColor: accent.solid }}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading
                      ? "Just a moment…"
                      : mode === "signin"
                        ? `Sign in as ${role}`
                        : `Create ${role} account`}
                    {!loading && <ArrowRight className="h-3.5 w-3.5" />}
                  </span>
                </motion.button>

                <p className="pt-1 text-center text-sm" style={{ color: "var(--text-subtle)" }}>
                  {mode === "signin" ? "Need an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="font-semibold transition-colors duration-200"
                    style={{ color: accent.text }}
                  >
                    {mode === "signin" ? "Create one" : "Sign in"}
                  </button>
                </p>
              </form>

              <div
                className="mt-7 border p-3 text-sm"
                style={{
                  borderColor: accent.border,
                  backgroundColor: accent.soft,
                  color: accent.text,
                }}
              >
                {isFarmer
                  ? "Farmer accounts post supply and review buyer matches."
                  : "Buyer accounts post requests and confirm vendor matches."}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
