import type { Match } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";
import { Sparkles, TrendingUp } from "lucide-react";

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
            className={`relative rounded-xl border p-5 shadow-sm transition-shadow hover:shadow-md ${recommended
                    ? "border-amber-300 bg-amber-50/40 ring-1 ring-amber-200"
                    : "border-gray-200 bg-white"
                }`}
        >
            {/* Recommended badge */}
            {recommended && (
                <div className="mb-3 flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 w-fit">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700">
                        Recommended by Farmesh AI
                    </span>
                </div>
            )}

            <div className="mb-3 flex items-start justify-between">
                <h3 className="text-base font-semibold text-gray-900">
                    {match.product}
                </h3>
                <StatusBadge status={match.status} />
            </div>

            {/* Score */}
            <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                    {match.score}% match score
                </span>
            </div>

            {/* Explanation */}
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
                {match.reason}
            </p>

            {/* Vendor line items */}
            <div className="mb-4 space-y-2">
                <p className="text-xs font-medium text-gray-500">Vendor Details</p>
                <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
                    <p>
                        Listing #{match.listingId} — {match.product}
                    </p>
                </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                    type="button"
                    className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                >
                    {isSplit ? "Confirm Split Order" : "Confirm Order"}
                </button>
                <button
                    type="button"
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
