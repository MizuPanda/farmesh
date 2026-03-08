'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

type PostRequestFormProps = {
  buyerId: string;
  onClose: () => void;
  onSubmitted?: () => void;
};

const inputCls = "w-full border px-3 py-2 text-sm font-sans outline-none transition-colors duration-200";
const inputStyle = {
  borderColor: 'var(--border-default)',
  backgroundColor: 'var(--surface-base)',
  color: 'var(--foreground)',
} as const;

export default function PostRequestForm({ buyerId, onClose, onSubmitted }: PostRequestFormProps) {
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
    if (!product || !quantity || !pricePerUnit) {
      alert('Please fill in Product, Quantity, and Max price per unit.');
      return;
    }

    setLoading(true);
    setStatus('submitted');

    try {
      const requestRes = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerId,
          rawInput,
          product,
          quantity,
          unit,
          pricePerUnit,
          requiredBy,
          allowSubstitutions,
        }),
      });

      if (!requestRes.ok) {
        const requestErr = await requestRes.json().catch(() => null);
        throw new Error(requestErr?.error ?? 'Failed to save request');
      }

      setStatus('matching');

      const matchRes = await fetch('/api/match', { method: 'POST' });
      const matchData = await matchRes.json().catch(() => null);
      if (!matchRes.ok) {
        throw new Error(matchData?.error ?? 'Failed to run matching');
      }

      setMatchCount(matchData.matchesFound ?? 0);
      setStatus('done');
      onSubmitted?.();
    } catch (error) {
      console.error(error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border p-6" style={{ borderColor: 'var(--border-soft)', backgroundColor: 'var(--surface-base)' }}>
        <p className="mb-1 text-[11px] font-semibold tracking-[0.25em] uppercase text-amber-700">
          New Request
        </p>
        <h3 className="font-serif mb-4 text-xl" style={{ color: 'var(--foreground)' }}>
          Post New Request
        </h3>

        <textarea
          rows={3}
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
          placeholder="Need 100 lbs of high-quality salad greens, organic preferred, by Friday"
          className="w-full resize-none border px-4 py-3 text-sm font-sans outline-none transition-colors duration-200"
          style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surface-card)', color: 'var(--foreground)' }}
          onFocus={(event) => (event.currentTarget.style.borderColor = '#d97706')}
          onBlur={(event) => (event.currentTarget.style.borderColor = 'var(--border-default)')}
        />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { label: 'Product', type: 'text', placeholder: 'e.g. Salad Greens', value: product, onChange: setProduct },
              { label: 'Quantity needed', type: 'number', placeholder: '100', value: quantity, onChange: setQuantity },
              { label: 'Unit', type: 'text', placeholder: 'lb', value: unit, onChange: setUnit },
              { label: 'Max price / unit', type: 'number', placeholder: '5.20', value: pricePerUnit, onChange: setPricePerUnit },
              { label: 'Needed date', type: 'date', placeholder: '', value: requiredBy, onChange: setRequiredBy },
            ].map(({ label, type, placeholder, value, onChange }) => (
            <div key={label}>
              <label className="mb-1 block text-[11px] font-semibold tracking-[0.12em] uppercase" style={{ color: 'var(--text-muted)' }}>
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={inputCls}
                style={inputStyle}
                onFocus={(event) => (event.currentTarget.style.borderColor = '#d97706')}
                onBlur={(event) => (event.currentTarget.style.borderColor = 'var(--border-default)')}
              />
            </div>
          ))}

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={allowSubstitutions}
                onChange={(event) => setAllowSubstitutions(event.target.checked)}
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
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)' }}
          >
            Cancel
          </button>
        </div>

        {status === 'done' && (
          <p className="mt-3 text-sm font-medium text-amber-700">
            Request posted. Matching Agent found <strong>{matchCount}</strong> match{matchCount !== 1 ? 'es' : ''}.
          </p>
        )}
        {status === 'error' && (
          <p className="mt-3 text-sm text-red-600">Something went wrong. Check your Backboard configuration.</p>
        )}
      </div>

      <div className="border-l-2 border-amber-600 p-5" style={{ backgroundColor: 'var(--surface-base)', borderTopColor: 'transparent', borderRightColor: 'var(--border-soft)', borderBottomColor: 'var(--border-soft)' }}>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-600" />
          <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-amber-700">
            AI Interpreted Request
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: 'Product', value: product || '—' },
              { label: 'Quantity', value: quantity ? `${quantity} ${unit}` : '—' },
              { label: 'Max price', value: pricePerUnit ? `$${Number(pricePerUnit).toFixed(2)} / ${unit}` : '—' },
              { label: 'Needed date', value: requiredBy || '—' },
              { label: 'Substitutions', value: allowSubstitutions ? 'Allowed' : 'Not allowed' },
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
