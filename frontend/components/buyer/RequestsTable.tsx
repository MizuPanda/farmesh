import type { Request } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";

type RequestsTableProps = {
    requests: Request[];
};

export default function RequestsTable({ requests }: RequestsTableProps) {
    const formatDate = (value?: string) => {
        if (!value) return "—";
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString();
    };

    return (
        <div className="overflow-x-auto border" style={{ borderColor: "var(--border-soft)" }}>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-muted)" }}>
                        {["Product", "Quantity", "Budget / unit", "Posted", "Status"].map((h) => (
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
                    {requests.map((request) => (
                        <tr
                            key={request.id}
                            className="border-b last:border-0 transition-colors duration-200"
                            style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-base)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-card)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--surface-base)")}
                        >
                            <td className="px-5 py-4 font-medium" style={{ color: "var(--foreground)" }}>
                                {request.product}
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
                                {request.quantity} {request.unit}
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "var(--text-muted)" }}>
                                ${request.pricePerUnit.toFixed(2)} / {request.unit}
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "var(--text-subtle)" }}>
                                {formatDate(request.createdAt)}
                            </td>
                            <td className="px-5 py-4">
                                <StatusBadge status={request.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
