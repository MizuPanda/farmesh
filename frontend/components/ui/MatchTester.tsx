'use client';

import { useState } from 'react';

export default function MatchTester() {
  const [listings, setListings] = useState(JSON.stringify([
    { vendorId: "V_001", product: "Organic Apples", quantityAvailable: 500, quality: "Grade A", pricePerUnit: 1.20 },
    { vendorId: "V_002", product: "Carrots", quantityAvailable: 200, quality: "Grade B", pricePerUnit: 0.50 }
  ], null, 2));

  const [requirements, setRequirements] = useState(JSON.stringify([
    { buyerId: "B_101", product: "Organic Apples", desiredQuantity: 100, maxPricePerUnit: 1.50, weightRequirement: "High Priority" }
  ], null, 2));

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown | null>(null);

  const runMatch = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          listings: JSON.parse(listings),
          requirements: JSON.parse(requirements)
        })
      });

      const data = await response.json();
      setResult(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setResult({ error: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Matching Agent Console</h2>
      <p className="text-muted-foreground">Submit standardized listings and weighted requirements to the Backboard AI.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Standardized Listings (JSON)</label>
          <textarea 
            className="w-full h-64 p-3 font-mono text-sm border rounded-md"
            value={listings}
            onChange={(e) => setListings(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Weighted Requirements (JSON)</label>
          <textarea 
            className="w-full h-64 p-3 font-mono text-sm border rounded-md"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>
      </div>

      <button 
        onClick={runMatch}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? 'Executing Core Logic...' : 'Run Matching Agent'}
      </button>

      {result !== null && (
        <div className="mt-8 space-y-4 rounded-lg bg-slate-100 p-6 border">
          <h3 className="text-lg font-semibold">Coordination Agent Output</h3>
          <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-900 border text-slate-50 p-4 rounded-md overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
