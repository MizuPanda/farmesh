import type { Match } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";
import { TrendingUp } from "lucide-react";

type FarmerMatchCardProps = {
    match: Match;
};

export default function FarmerMatchCard({ match }: FarmerMatchCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-3 flex items-start justify-between">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">
                        {match.product}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                        Request #{match.requestId}
                    </p>
                </div>
                <StatusBadge status={match.status} />
            </div>

            {/* Score */}
            <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">
                    {match.score}% match score
                </span>
            </div>

            {/* Explanation */}
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
                {match.reason}
            </p>

            {/* Your contribution */}
            <div className="mb-4 rounded-lg bg-green-50 px-4 py-3">
                <p className="text-xs font-medium text-green-700">
                    Your Contribution
                </p>
                <p className="mt-1 text-sm text-green-900">
                    Listing #{match.listingId} — {match.product}
                </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <button
                    type="button"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                    Accept Interest
                </button>
                <button
                    type="button"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
