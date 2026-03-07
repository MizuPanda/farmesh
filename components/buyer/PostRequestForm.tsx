import { parsedRequestPreview } from "@/data/mockData";
import { Sparkles } from "lucide-react";

type PostRequestFormProps = {
    onClose: () => void;
};

export default function PostRequestForm({ onClose }: PostRequestFormProps) {
    return (
        <div className="space-y-6">
            {/* Text Input Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">
                    Post New Request
                </h3>
                <textarea
                    rows={4}
                    placeholder="Need 100 lbs of high-quality salad greens, organic preferred, by Friday"
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />

                {/* Optional structured fields */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Product
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Salad Greens"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Quantity needed
                        </label>
                        <input
                            type="number"
                            placeholder="100"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Unit
                        </label>
                        <input
                            type="text"
                            placeholder="lb"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-gray-500">
                            Required by
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Friday"
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-300 focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-end gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" className="rounded accent-amber-600" />
                            Allow substitutions
                        </label>
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <button
                        type="button"
                        className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
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

            {/* AI Interpreted Request */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <h4 className="text-sm font-semibold text-amber-800">
                        AI Interpreted Request
                    </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div>
                        <p className="text-xs text-amber-600">Product</p>
                        <p className="text-sm font-medium text-amber-900">
                            {parsedRequestPreview.product}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-amber-600">Quantity</p>
                        <p className="text-sm font-medium text-amber-900">
                            {parsedRequestPreview.quantity} {parsedRequestPreview.unit}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-amber-600">Required by</p>
                        <p className="text-sm font-medium text-amber-900">
                            {parsedRequestPreview.requiredBy}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-amber-600">Substitutions</p>
                        <p className="text-sm font-medium text-amber-900">
                            {parsedRequestPreview.allowSubstitutions ? "Allowed" : "Not allowed"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
