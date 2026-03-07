import { parsedRequestPreview } from "@/data/mockData";
import { Sparkles } from "lucide-react";

type PostRequestFormProps = {
    onClose: () => void;
};

const inputCls = "w-full border px-3 py-2 text-sm font-sans outline-none transition-colors duration-200";
const inputStyle = { borderColor: "var(--border-default)", backgroundColor: "var(--surface-base)", color: "var(--foreground)" } as const;

export default function PostRequestForm({ onClose }: PostRequestFormProps) {
    return (
        <div className="space-y-4">
            {/* Text Input Card */}
            <div className="border p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-base)" }}>
                <p className="mb-1 text-[11px] font-semibold tracking-[0.25em] uppercase text-amber-700">
                    New Request
                </p>
                <h3 className="font-serif mb-4 text-xl" style={{ color: "var(--foreground)" }}>
                    Post New Request
                </h3>

                <textarea
                    rows={3}
                    placeholder="Need 100 lbs of high-quality salad greens, organic preferred, by Friday"
                    className="w-full resize-none border px-4 py-3 text-sm font-sans outline-none transition-colors duration-200"
                    style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-card)", color: "var(--foreground)" }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                />

                {/* Structured fields */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {[
                        { label: "Product", type: "text", placeholder: "e.g. Salad Greens" },
                        { label: "Quantity needed", type: "number", placeholder: "100" },
                        { label: "Unit", type: "text", placeholder: "lb" },
                        { label: "Required by", type: "text", placeholder: "e.g. Friday" },
                    ].map(({ label, type, placeholder }) => (
                        <div key={label}>
                            <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text-muted)" }}>
                                {label}
                            </label>
                            <input
                                type={type}
                                placeholder={placeholder}
                                className={inputCls}
                                style={inputStyle}
                                onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
                                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                            />
                        </div>
                    ))}

                    <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                            <input type="checkbox" className="accent-amber-600" />
                            Allow substitutions
                        </label>
                    </div>
                </div>

                <div className="mt-5 flex gap-2">
                    <button
                        type="button"
                        className="bg-amber-600 px-6 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-colors duration-300 hover:bg-amber-700"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="border px-6 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-300"
                        style={{ borderColor: "var(--border-default)", color: "var(--text-muted)" }}
                    >
                        Cancel
                    </button>
                </div>
            </div>

            {/* AI Interpreted Request */}
            <div className="border-l-2 border-amber-600 p-5" style={{ backgroundColor: "var(--surface-base)", borderTopColor: "transparent", borderRightColor: "var(--border-soft)", borderBottomColor: "var(--border-soft)" }}>
                <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-700">
                        AI Interpreted Request
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                        { label: "Product", value: parsedRequestPreview.product },
                        { label: "Quantity", value: `${parsedRequestPreview.quantity} ${parsedRequestPreview.unit}` },
                        { label: "Required by", value: parsedRequestPreview.requiredBy },
                        { label: "Substitutions", value: parsedRequestPreview.allowSubstitutions ? "Allowed" : "Not allowed" },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-amber-700">{label}</p>
                            <p className="mt-0.5 text-sm font-medium text-amber-900">{value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
