import { parsedSupplyPreview } from "@/data/mockData";
import { Sparkles } from "lucide-react";

type PostSupplyFormProps = {
    onClose: () => void;
};

const inputCls = "w-full border px-3 py-2 text-sm font-sans outline-none transition-colors duration-200";
const inputStyle = { borderColor: "hsl(30 15% 82%)", backgroundColor: "hsl(40 33% 97%)", color: "var(--foreground)" } as const;

export default function PostSupplyForm({ onClose }: PostSupplyFormProps) {
    return (
        <div className="space-y-4">
            {/* Text Input Card */}
            <div className="border p-6" style={{ borderColor: "hsl(30 15% 88%)", backgroundColor: "hsl(40 33% 97%)" }}>
                <p className="mb-1 text-[11px] font-semibold tracking-[0.25em] uppercase text-green-700">
                    New Listing
                </p>
                <h3 className="font-serif mb-4 text-xl" style={{ color: "var(--foreground)" }}>
                    Post New Supply
                </h3>

                <textarea
                    rows={3}
                    placeholder="I have 60 lbs of baby greens available this week for bulk sale"
                    className="w-full resize-none border px-4 py-3 text-sm font-sans outline-none transition-colors duration-200"
                    style={{ borderColor: "hsl(30 15% 82%)", backgroundColor: "hsl(40 30% 95%)", color: "var(--foreground)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 82%)")}
                />

                {/* Structured fields */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {[
                        { label: "Product", type: "text", placeholder: "e.g. Baby Greens" },
                        { label: "Quantity", type: "number", placeholder: "60" },
                        { label: "Unit", type: "text", placeholder: "lb" },
                        { label: "Price / unit", type: "number", placeholder: "4.50" },
                    ].map(({ label, type, placeholder }) => (
                        <div key={label}>
                            <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "hsl(30 8% 45%)" }}>
                                {label}
                            </label>
                            <input
                                type={type}
                                placeholder={placeholder}
                                className={inputCls}
                                style={inputStyle}
                                onFocus={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
                                onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 82%)")}
                            />
                        </div>
                    ))}
                    <div>
                        <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "hsl(30 8% 45%)" }}>
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            className={inputCls}
                            style={inputStyle}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "#16a34a")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 82%)")}
                        />
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <button
                        type="button"
                        className="bg-green-600 px-6 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-colors duration-300 hover:bg-green-700"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="border px-6 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-300"
                        style={{ borderColor: "hsl(30 15% 82%)", color: "hsl(30 8% 40%)" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* AI Parsed Preview */}
            <div className="border-l-2 border-green-600 p-5" style={{ backgroundColor: "hsl(40 33% 97%)", borderTopColor: "transparent", borderRightColor: "hsl(30 15% 88%)", borderBottomColor: "hsl(30 15% 88%)" }}>
                <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-green-600" />
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-green-700">
                        AI Parsed Preview
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Product", value: parsedSupplyPreview.product },
                        { label: "Quantity", value: `${parsedSupplyPreview.quantity} ${parsedSupplyPreview.unit}` },
                        { label: "Unit", value: parsedSupplyPreview.unit },
                        { label: "Price / unit", value: `$${parsedSupplyPreview.pricePerUnit.toFixed(2)}` },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-green-700">{label}</p>
                            <p className="mt-0.5 text-sm font-medium text-green-900">{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
