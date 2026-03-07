import type { Order } from "@/types";
import StatusBadge from "@/components/layout/StatusBadge";
import { Truck } from "lucide-react";

type OrderCardProps = {
    order: Order;
};

export default function OrderCard({ order }: OrderCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
                <h3 className="text-base font-semibold text-gray-900">{order.title}</h3>
                <StatusBadge status={order.status} />
            </div>

            <div className="mb-3 space-y-1.5 text-sm text-gray-600">
                <p>
                    <span className="font-medium text-gray-700">Vendors:</span>{" "}
                    {order.vendors.join(", ")}
                </p>
                <p>
                    <span className="font-medium text-gray-700">Quantity:</span>{" "}
                    {order.quantity}
                </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Truck className="h-4 w-4" />
                <span>Delivery target: {order.deliveryTarget}</span>
            </div>
        </div>
    );
}
