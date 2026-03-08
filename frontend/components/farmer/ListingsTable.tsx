import type { Listing } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";

type ListingsTableProps = {
    listings: Listing[];
};

export default function ListingsTable({ listings }: ListingsTableProps) {
    const formatDate = (value?: string) => {
        if (!value) return "—";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString();
    };

    return (
        <div
            className="overflow-x-auto border"
            style={{ borderColor: "var(--border-soft)" }}
        >
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-muted)" }}>
                        {["Product", "Quantity", "Price", "Expires", "Status"].map((h) => (
                            <th
                                key={h}
                                className="px-5 py-3 text-[11px] font-semibold tracking-[0.15em] uppercase"
                                style={{ color: "var(--text-muted)" }}
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {listings.map((listing) => {
                        const isExpired = listing.status === "EXPIRED";
                        return (
                            <tr
                                key={listing.id}
                                className="border-b last:border-0 transition-colors duration-200"
                                style={{
                                    borderColor: "var(--border-subtle)",
                                    opacity: isExpired ? 0.68 : 1,
                                    backgroundColor: "var(--surface-base)",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-card)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-base)")}
                            >
                                <td className="px-5 py-4 font-medium" style={{ color: "var(--foreground)" }}>
                                    {listing.product}
                                </td>
                                <td className="px-5 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
                                    {listing.quantity} {listing.unit}
                                </td>
                                <td className="px-5 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
                                    ${listing.pricePerUnit.toFixed(2)} / {listing.unit}
                                </td>
                                <td className="px-5 py-4 text-sm" style={{ color: "var(--text-subtle)" }}>
                                    {formatDate(listing.expirationDate)}
                                </td>
                                <td className="px-5 py-4">
                                    <StatusBadge status={listing.status} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
