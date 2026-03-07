import type { Request } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";

type RequestsTableProps = {
    requests: Request[];
};

export default function RequestsTable({ requests }: RequestsTableProps) {
    return (
        <div className="overflow-x-auto border" style={{ borderColor: "hsl(30 15% 88%)" }}>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b" style={{ borderColor: "hsl(30 15% 88%)", backgroundColor: "hsl(35 25% 93%)" }}>
                        {["Product", "Quantity", "Budget / unit", "Posted", "Status"].map((h) => (
                            <th
                                key={h}
                                className="px-5 py-3 text-[11px] font-semibold tracking-[0.15em] uppercase"
                                style={{ color: "hsl(30 8% 45%)" }}
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
                            style={{ borderColor: "hsl(30 15% 92%)", backgroundColor: "hsl(40 33% 97%)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(40 30% 95%)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(40 33% 97%)")}
                        >
                            <td className="px-5 py-4 font-medium" style={{ color: "var(--foreground)" }}>
                                {request.product}
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "hsl(30 8% 40%)" }}>
                                {request.quantity} {request.unit}
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "hsl(30 8% 40%)" }}>
                                ${request.pricePerUnit.toFixed(2)} / {request.unit}
                            </td>
                            <td className="px-5 py-4 text-sm" style={{ color: "hsl(30 8% 55%)" }}>
                                {request.createdAt}
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
