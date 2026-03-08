"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { getUser } from "@/lib/auth";
import { createRequestObject } from "@/lib/requests";
import { normalizeAndInsertRequest } from "@/app/actions/requests";
import LoadingOverlay from "@/components/common/LoadingOverlay";

type PostRequestFormProps = {
  buyerId?: string;
  onClose: () => void;
  onSubmitted?: () => void | Promise<void>;
};

const inputCls =
  "w-full border px-3 py-2 text-sm font-sans outline-none transition-colors duration-200";
const inputStyle = {
  borderColor: "var(--border-default)",
  backgroundColor: "var(--surface-base)",
  color: "var(--foreground)",
} as const;

export default function PostRequestForm({ buyerId, onClose, onSubmitted }: PostRequestFormProps) {
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState("");
  const [neededDate, setNeededDate] = useState("");
  const [description, setDescription] = useState("");
  const [allowSubstitutions, setAllowSubstitutions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await getUser();
      const resolvedBuyerId = buyerId ?? user?.id;

      if (!resolvedBuyerId) {
        setError("You must be logged in to post a request.");
        return;
      }

      const request = createRequestObject({
        buyerId: resolvedBuyerId,
        product,
        quantity: Number(quantity),
        unit,
        pricePerUnit: Number(pricePerUnit),
        neededDate,
        description: description || undefined,
      });

      const result = await normalizeAndInsertRequest(request);

      if (!result.success) {
        setError(result.error ?? "Failed to create request.");
        return;
      }

      window.dispatchEvent(new Event("farmesh:data-updated"));
      await onSubmitted?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none border px-4 py-3 text-sm font-sans outline-none transition-colors duration-200"
            style={{ borderColor: "var(--border-default)", backgroundColor: "var(--surface-card)", color: "var(--foreground)" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
          />

          {/* Structured fields */}
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text-muted)" }}>
                Product
              </label>
              <input
                type="text"
                placeholder="e.g. Salad Greens"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text-muted)" }}>
                Quantity needed
              </label>
              <input
                type="number"
                placeholder="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text-muted)" }}>
                Unit
              </label>
              <input
                type="text"
                placeholder="lb"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text-muted)" }}>
                Price per unit
              </label>
              <input
                type="number"
                placeholder="5.00"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--text-muted)" }}>
                Required by
              </label>
              <input
                type="date"
                value={neededDate}
                onChange={(e) => setNeededDate(e.target.value)}
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                <input
                  type="checkbox"
                  className="accent-amber-600"
                  checked={allowSubstitutions}
                  onChange={(e) => setAllowSubstitutions(e.target.checked)}
                />
                Allow substitutions
              </label>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-amber-600 px-6 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-colors duration-300 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="border px-6 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase transition-colors duration-300 disabled:opacity-50"
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
              { label: "Product", value: product || "—" },
              { label: "Quantity", value: quantity ? `${quantity} ${unit}` : "—" },
              { label: "Required by", value: neededDate || "—" },
              { label: "Substitutions", value: allowSubstitutions ? "Allowed" : "Not allowed" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-amber-700">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-amber-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <LoadingOverlay
        open={isSubmitting}
        title="Creating Request"
        message="Normalizing your request and checking for matches."
        accentColor="amber"
      />
    </>
  );
}
