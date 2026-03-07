'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

type PostRequestFormProps = {
  onClose: () => void;
  onSubmitted?: () => void;
};

// Teammate's UI styling
const inputCls = "w-full border px-3 py-2 text-sm font-sans outline-none transition-colors duration-200";
const inputStyle = { borderColor: "hsl(30 15% 82%)", backgroundColor: "hsl(40 33% 97%)", color: "var(--foreground)" } as const;

export default function PostRequestForm({ onClose, onSubmitted }: PostRequestFormProps) {
  // Our API state
  const [rawInput, setRawInput] = useState('');
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('lb');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [requiredBy, setRequiredBy] = useState('');
  const [allowSubstitutions, setAllowSubstitutions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitted' | 'matching' | 'done' | 'error'>('idle');
  const [matchCount, setMatchCount] = useState(0);

  const handleSubmit = async () => {
    if (!product || !quantity) {
      alert('Please fill in at least Product and Quantity.');
      return;
    }
    setLoading(true);
    setStatus('submitted');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput, product, quantity, unit, pricePerUnit, requiredBy, allowSubstitutions }),
      });
      if (!res.ok) throw new Error('Failed to save request');
      setStatus('matching');
      const matchRes = await fetch('/api/match', { method: 'POST' });
      const matchData = await matchRes.json();
      setMatchCount(matchData.matchesFound ?? 0);
      setStatus('done');
      onSubmitted?.();
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Text Input Card — teammate's styling */}
      <div className="border p-6" style={{ borderColor: "hsl(30 15% 88%)", backgroundColor: "hsl(40 33% 97%)" }}>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.25em] uppercase text-amber-700">
          New Request
        </p>
        <h3 className="font-serif mb-4 text-xl" style={{ color: "var(--foreground)" }}>
          Post New Request
        </h3>

        <textarea
          rows={3}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Need 100 lbs of high-quality salad greens, organic preferred, by Friday"
          className="w-full resize-none border px-4 py-3 text-sm font-sans outline-none transition-colors duration-200"
          style={{ borderColor: "hsl(30 15% 82%)", backgroundColor: "hsl(40 30% 95%)", color: "var(--foreground)" }}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
          onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 82%)")}
        />

        {/* Structured fields */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            { label: "Product", type: "text", placeholder: "e.g. Salad Greens", value: product, onChange: setProduct },
            { label: "Quantity needed", type: "number", placeholder: "100", value: quantity, onChange: setQuantity },
            { label: "Unit", type: "text", placeholder: "lb", value: unit, onChange: setUnit },
            { label: "Required by", type: "text", placeholder: "e.g. Friday", value: requiredBy, onChange: setRequiredBy },
          ].map(({ label, type, placeholder, value, onChange }) => (
            <div key={label}>
              <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: "hsl(30 8% 45%)" }}>
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={inputCls}
                style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#d97706")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "hsl(30 15% 82%)")}
              />
            </div>
          ))}

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm" style={{ color: "hsl(30 8% 40%)" }}>
              <input
                type="checkbox"
                checked={allowSubstitutions}
                onChange={(e) => setAllowSubstitutions(e.target.checked)}
                className="accent-amber-600"
              />
              Allow substitutions
            </label>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 bg-amber-600 px-6 py-2.5 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-colors duration-300 hover:bg-amber-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {status === 'submitted' ? 'Saving...' : status === 'matching' ? 'Matching...' : 'Submit'}
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

        {status === 'done' && (
          <p className="mt-3 text-sm text-amber-700 font-medium">
            ✓ Request posted! Matching Agent found <strong>{matchCount}</strong> match{matchCount !== 1 ? 'es' : ''}. Check your Matches tab.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm text-red-600">Something went wrong. Is your BACKBOARD_API_KEY set?</p>
        )}
      </div>

      {/* AI Interpreted Request — teammate's styling, our live state values */}
      <div className="border-l-2 border-amber-600 p-5" style={{ backgroundColor: "hsl(40 33% 97%)", borderTopColor: "transparent", borderRightColor: "hsl(30 15% 88%)", borderBottomColor: "hsl(30 15% 88%)" }}>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-700">
            AI Interpreted Request
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Product", value: product || '—' },
            { label: "Quantity", value: quantity ? `${quantity} ${unit}` : '—' },
            { label: "Required by", value: requiredBy || '—' },
            { label: "Substitutions", value: allowSubstitutions ? 'Allowed' : 'Not allowed' },
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
