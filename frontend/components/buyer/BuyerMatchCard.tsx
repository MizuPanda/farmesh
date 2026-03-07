import type { Match } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";
import { Sparkles } from "lucide-react";

type BuyerMatchCardProps = {
    match: Match;
    recommended?: boolean;
};

export default function BuyerMatchCard({
    match,
    recommended = false,
}: BuyerMatchCardProps) {
    const isSplit = match.product.toLowerCase().includes("split");

    return (
        <div
            className="hover-lift border p-6 transition-all duration-400"
            style={{
                borderColor: recommended ? "#fde68a" : "var(--border-soft)",
                backgroundColor: recommended ? "#fffbeb" : "var(--surface-card)",
                borderLeftWidth: recommended ? "3px" : "1px",
                borderLeftColor: recommended ? "#d97706" : "var(--border-soft)",
            }}
        >
            {/* Recommended badge */}
            {recommended && (
                <div className="mb-5 flex w-fit items-center gap-1.5 border border-amber-200 bg-white px-3 py-1">
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-700">
                        Recommended by Farmesh AI
                    </span>
                </div>
            )}

            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
                <h3 className="font-serif text-lg" style={{ color: "var(--foreground)" }}>
                    {match.product}
                </h3>
                <StatusBadge status={match.status} />
            </div>

            {/* Score bar */}
            <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
                        Match score
                    </span>
                    <span className="font-serif text-xl text-amber-700">{match.score}%</span>
                </div>
                <div style={{ height: "2px", backgroundColor: "var(--border-default)" }}>
                    <div
                        className="h-full bg-amber-600 transition-all duration-700"
                        style={{ width: `${match.score}%` }}
                    />
                </div>
            </div>

            {/* Explanation */}
            <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {match.reason}
            </p>

            {/* Vendor details */}
            <div className="mb-5">
                <p className="mb-2 text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
                    Vendor details
                </p>
                <div
                    className="border px-4 py-3 text-sm"
                    style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-base)", color: "var(--text-muted)" }}
                >
                    Listing #{match.listingId} — {match.product}
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                    type="button"
                    className="bg-amber-600 px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-colors duration-300 hover:bg-amber-700"
                >
                    {isSplit ? "Confirm Split Order" : "Confirm Order"}
                </button>
                <button
                    type="button"
                    className="border px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-300"
                    style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}
                >
                    Decline
                </button>
            </div>
        </div>
    );
}
