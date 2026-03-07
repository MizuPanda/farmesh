import type { Listing } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";

type ListingsTableProps = {
    listings: Listing[];
};

export default function ListingsTable({ listings }: ListingsTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-5 py-3 font-semibold text-gray-600">Product</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Quantity</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Price</th>
                        <th className="px-5 py-3 font-semibold text-gray-600">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {listings.map((listing) => (
                        <tr
                            key={listing.id}
                            className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                        >
                            <td className="px-5 py-4 font-medium text-gray-900">
                                {listing.product}
                            </td>
                            <td className="px-5 py-4 text-gray-600">
                                {listing.quantity} {listing.unit}
                            </td>
                            <td className="px-5 py-4 text-gray-600">
                                ${listing.pricePerUnit.toFixed(2)} / {listing.unit}
                            </td>
                            <td className="px-5 py-4">
                                <StatusBadge status={listing.status} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
