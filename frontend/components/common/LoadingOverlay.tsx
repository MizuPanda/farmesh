"use client";

type LoadingOverlayProps = {
  open: boolean;
  title: string;
  message?: string;
  accentColor?: "green" | "amber";
};

export default function LoadingOverlay({
  open,
  title,
  message,
  accentColor = "green",
}: LoadingOverlayProps) {
  if (!open) return null;

  const accentHex = accentColor === "green" ? "#16a34a" : "#d97706";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4">
      <div
        className="w-full max-w-md border p-6 shadow-xl"
        style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-card)" }}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-r-transparent"
            style={{ borderColor: accentHex, borderRightColor: "transparent" }}
            aria-hidden
          />
          <div>
            <h3 className="font-serif text-2xl" style={{ color: "var(--foreground)" }}>
              {title}
            </h3>
            {message && (
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
