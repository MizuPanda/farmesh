import type { Match } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";

type FarmerMatchCardProps = {
    match: Match;
};

export default function FarmerMatchCard({ match }: FarmerMatchCardProps) {
    return (
        <div
            className="hover-lift flex flex-col border p-6 transition-all duration-400"
            style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-card)" }}
        >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h3 className="font-serif truncate text-lg" style={{ color: "var(--foreground)" }}>
                        {match.product}
                    </h3>
                    <p className="mt-0.5 text-[11px] tracking-[0.1em] uppercase" style={{ color: "var(--text-subtle)" }}>
                        vs. Request #{match.requestId}
                    </p>
                </div>
                <StatusBadge status={match.status} />
            </div>

            {/* Score bar */}
            <div className="mb-5">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-[11px] font-semibold tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>
                        Match score
                    </span>
                    <span className="font-serif text-xl text-green-700">{match.score}%</span>
                </div>
                <div className="h-px w-full" style={{ backgroundColor: "var(--border-default)" }}>
                    <div
                        className="h-full bg-green-600 transition-all duration-700"
                        style={{ width: `${match.score}%`, height: "2px" }}
                    />
                </div>
            </div>

            {/* Explanation */}
            <p className="mb-5 flex-1 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {match.reason}
            </p>

            {/* Your contribution */}
            <div
                className="mb-5 border-l-2 border-green-600 px-4 py-3"
                style={{ backgroundColor: "var(--surface-base)" }}
            >
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-green-700">
                    Your contribution
                </p>
                <p className="mt-1 text-sm" style={{ color: "var(--foreground)" }}>
                    Listing #{match.listingId} — {match.product}
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                    type="button"
                    className="bg-green-600 px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-colors duration-300 hover:bg-green-700"
                >
                    Accept
                </button>
                <button
                    type="button"
                    className="border px-5 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-300"
                    style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
