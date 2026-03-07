type StatusBadgeProps = {
    status: string;
};

const colorMap: Record<string, string> = {
    OPEN: "bg-green-100 text-green-800",
    MATCHED: "bg-blue-100 text-blue-800",
    EXPIRED: "bg-gray-100 text-gray-600",
    PROPOSED: "bg-amber-100 text-amber-800",
    AWAITING_CONFIRMATION: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-50 text-red-600",
    Pending: "bg-amber-100 text-amber-800",
    "In Transit": "bg-blue-100 text-blue-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-50 text-red-600",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
    const colors = colorMap[status] ?? "bg-gray-100 text-gray-600";
    const label = status.replace(/_/g, " ");

    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors}`}
        >
            {label}
        </span>
    );
}
