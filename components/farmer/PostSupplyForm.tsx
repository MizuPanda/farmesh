import { parsedSupplyPreview } from "@/data/mockData";
import { Sparkles } from "lucide-react";

type PostSupplyFormProps = {
    onClose: () => void;
};

export default function PostSupplyForm({ onClose }: PostSupplyFormProps) {
    return (
        <div className="space-y-6">
            {/* Text Input Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Post New Supply
                </h3>
                <textarea
                    rows={4}
                    placeholder="I have 60 lbs of baby greens available this week for bulk sale"
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />

                {/* Optional structured fields */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Product
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Baby Greens"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Quantity
                        </label>
                        <input
                            type="number"
                            placeholder="60"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Unit
                        </label>
                        <input
                            type="text"
                            placeholder="lb"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Price / unit
                        </label>
                        <input
                            type="number"
                            placeholder="4.50"
                            step="0.01"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-green-500 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* AI Parsed Preview */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm font-semibold text-green-800">
                        AI Parsed Preview
                    </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                        <p className="text-xs text-green-600">Product</p>
                        <p className="text-sm font-medium text-green-900">
                            {parsedSupplyPreview.product}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-green-600">Quantity</p>
                        <p className="text-sm font-medium text-green-900">
                            {parsedSupplyPreview.quantity} {parsedSupplyPreview.unit}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-green-600">Unit</p>
                        <p className="text-sm font-medium text-green-900">
                            {parsedSupplyPreview.unit}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-green-600">Price / unit</p>
                        <p className="text-sm font-medium text-green-900">
                            ${parsedSupplyPreview.pricePerUnit.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
