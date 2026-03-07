type StatusBadgeProps = {
    status: string;
};

type StyleMap = Record<string, { border: string; bg: string; color: string }>;

const styleMap: StyleMap = {
    OPEN:                   { border: "#bbf7d0", bg: "#f0fdf4", color: "#166534" },
    MATCHED:                { border: "#bfdbfe", bg: "#eff6ff", color: "#1d4ed8" },
    EXPIRED:                { border: "hsl(30 15% 82%)", bg: "hsl(35 25% 93%)", color: "hsl(30 8% 45%)" },
    PROPOSED:               { border: "#fde68a", bg: "#fffbeb", color: "#92400e" },
    AWAITING_CONFIRMATION:  { border: "#fde68a", bg: "#fffbeb", color: "#92400e" },
    CONFIRMED:              { border: "#bbf7d0", bg: "#f0fdf4", color: "#166534" },
    REJECTED:               { border: "#fecaca", bg: "#fef2f2", color: "#dc2626" },
    Pending:                { border: "#fde68a", bg: "#fffbeb", color: "#92400e" },
    "In Transit":           { border: "#bfdbfe", bg: "#eff6ff", color: "#1d4ed8" },
    Delivered:              { border: "#bbf7d0", bg: "#f0fdf4", color: "#166534" },
    Cancelled:              { border: "#fecaca", bg: "#fef2f2", color: "#dc2626" },
};

const fallback = { border: "hsl(30 15% 82%)", bg: "hsl(35 25% 93%)", color: "hsl(30 8% 45%)" };

export default function StatusBadge({ status }: StatusBadgeProps) {
    const s = styleMap[status] ?? fallback;
    const label = status.replace(/_/g, " ");

    return (
        <span
            className="inline-block border px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase"
            style={{ borderColor: s.border, backgroundColor: s.bg, color: s.color }}
        >
            {label}
        </span>
    );
}
