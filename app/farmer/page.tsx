'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Package, TrendingUp, Clock } from "lucide-react";
import AppNav from "@/components/layout/AppNav";
import TabGroup from "@/components/layout/TabGroup";
import PostSupplyForm from "@/components/farmer/PostSupplyForm";
import ListingsTable from "@/components/farmer/ListingsTable";
import FarmerMatchCard from "@/components/farmer/FarmerMatchCard";
import type { Listing, Match } from "@/types";

const VENDOR_ID = 'f1'; // TODO: replace with auth session user

const tabs = [
  { label: "Listings", value: "listings" },
  { label: "Matches", value: "matches" },
];

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("listings");
  const [showPostForm, setShowPostForm] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const fetchData = useCallback(async () => {
    const [listingsRes, matchesRes] = await Promise.all([
      fetch(`/api/listings?vendorId=${VENDOR_ID}`),
      fetch(`/api/matches?vendorId=${VENDOR_ID}`),
    ]);
    setListings(await listingsRes.json());
    setMatches(await matchesRes.json());
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived stats from live data
  const activeCount = listings.filter((l) => l.status === "OPEN").length;
  const matchedCount = listings.filter((l) => l.status === "MATCHED").length;
  const pendingCount = matches.filter((m) => m.status === "PROPOSED").length;

  const statCard = (icon: React.ReactNode, label: string, value: number, sub: string) => (
    <div
      className="hover-lift border p-6"
      style={{ borderColor: "hsl(30 15% 88%)", backgroundColor: "hsl(40 30% 95%)" }}
    >
      <div
        className="mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase"
        style={{ color: "hsl(30 8% 45%)" }}
      >
        {icon}
        {label}
      </div>
      <p className="font-serif text-4xl" style={{ color: "var(--foreground)" }}>{value}</p>
      <p className="mt-1 text-xs" style={{ color: "hsl(30 8% 55%)" }}>{sub}</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <AppNav unreadCount={0} />

      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-12">
        {/* Page header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
          <div>
            <p className="mb-1 text-[11px] font-semibold tracking-[0.3em] uppercase text-green-600">
              Supply Management
            </p>
            <h1 className="font-serif text-3xl md:text-4xl" style={{ color: "var(--foreground)" }}>
              Farmer Dashboard
            </h1>
            <p className="mt-2 text-sm" style={{ color: "hsl(30 8% 45%)" }}>
              Manage your supply listings and review buyer matches
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPostForm((v) => !v)}
            className="flex w-fit items-center gap-2 bg-green-600 px-6 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:bg-green-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Post Supply
          </button>
        </div>

        {/* Stats row — live from API */}
        <div className="mb-10 grid grid-cols-3 gap-4 stagger-children">
          {statCard(<Package className="h-3.5 w-3.5" />, "Active", activeCount, "open listings")}
          {statCard(<TrendingUp className="h-3.5 w-3.5" />, "Matched", matchedCount, "listings matched")}
          {statCard(<Clock className="h-3.5 w-3.5" />, "Pending", pendingCount, "match proposals")}
        </div>

        {/* Post Supply form */}
        {showPostForm && (
          <div className="mb-10 animate-fade-in-up">
            <PostSupplyForm
              onClose={() => setShowPostForm(false)}
              onSubmitted={() => { setShowPostForm(false); fetchData(); }}
            />
          </div>
        )}

        {/* Tabs */}
        <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} accentColor="green" />

        <div className="mt-6">
          {activeTab === "listings" && (
            <ListingsTable listings={listings} />
          )}
          {activeTab === "matches" && (
            <div className="grid gap-4 sm:grid-cols-2 stagger-children">
              {matches.length === 0
                ? <p className="text-sm" style={{ color: "hsl(30 8% 45%)" }}>No matches yet. Post a supply listing to trigger the Matching Agent.</p>
                : matches.map((match) => <FarmerMatchCard key={match.id} match={match} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
