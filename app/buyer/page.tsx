'use client';

import { useState, useEffect, useCallback } from "react";
import { Bell, Plus } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import TabGroup from "@/components/layout/TabGroup";
import PostRequestForm from "@/components/buyer/PostRequestForm";
import BuyerMatchCard from "@/components/buyer/BuyerMatchCard";
import OrderCard from "@/components/buyer/OrderCard";
import { buyerOrders } from "@/data/mockData"; // orders stay mocked for now
import type { Match } from "@/types";

const BUYER_ID = 'b1'; // TODO: replace with auth session user

const tabs = [
  { label: "Orders", value: "orders" },
  { label: "Matches", value: "matches" },
];

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [showPostForm, setShowPostForm] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);

  const fetchMatches = useCallback(async () => {
    const res = await fetch(`/api/matches?buyerId=${BUYER_ID}`);
    setMatches(await res.json());
  }, []);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <DashboardHeader title="Buyer Dashboard">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </button>
          <button
            type="button"
            onClick={() => setShowPostForm(!showPostForm)}
            className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" />
            Post Request
          </button>
        </DashboardHeader>

        {/* Post Request Form */}
        {showPostForm && (
          <div className="mt-6">
            <PostRequestForm
              onClose={() => setShowPostForm(false)}
              onSubmitted={() => { setShowPostForm(false); fetchMatches(); }}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6">
          <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor="amber" />
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "matches" && (
            <div className="grid gap-4">
              {matches.length === 0
                ? <p className="text-sm text-gray-500">No matches yet. Post a request to trigger the Matching Agent.</p>
                : matches.map((match, i) => (
                    <BuyerMatchCard key={match.id} match={match} recommended={i === 0} />
                  ))}
            </div>
          )}
          {activeTab === "orders" && (
            <div className="grid gap-4">
              {buyerOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
