'use client';

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Plus, Package, TrendingUp, Clock } from "lucide-react";
import AppNav from "@/components/layout/AppNav";
import TabGroup from "@/components/layout/TabGroup";
import PostSupplyForm from "@/components/farmer/PostSupplyForm";
import ListingsTable from "@/components/farmer/ListingsTable";
import FarmerMatchCard from "@/components/farmer/FarmerMatchCard";
import { farmerNotifications } from "@/data/mockData";
import type { Listing, Match } from "@/types";

const VENDOR_ID = "f1"; // TODO: replace with auth session user

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
    try {
      const [listingsRes, matchesRes] = await Promise.all([
        fetch(`/api/listings?vendorId=${VENDOR_ID}`),
        fetch(`/api/matches?vendorId=${VENDOR_ID}`),
      ]);

      const nextListings: Listing[] = listingsRes.ok ? await listingsRes.json() : [];
      const nextMatches: Match[] = matchesRes.ok ? await matchesRes.json() : [];

      setListings(nextListings);
      setMatches(nextMatches);
    } catch (error) {
      console.error("Failed to load farmer data", error);
      setListings([]);
      setMatches([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, [fetchData]);

  const activeCount = listings.filter((listing) => listing.status === "OPEN").length;
  const matchedCount = listings.filter((listing) => listing.status === "MATCHED").length;
  const pendingCount = matches.filter((match) => match.status === "PROPOSED").length;
  const unreadCount = farmerNotifications.filter((notification) => !notification.read).length;

  const statCard = (icon: ReactNode, label: string, value: number, sub: string) => (
    <div
      className="hover-lift border p-6"
      style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--surface-card)" }}
    >
      <div
        className="mb-4 flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {icon}
        {label}
      </div>
      <p className="font-serif text-4xl" style={{ color: "var(--foreground)" }}>{value}</p>
      <p className="mt-1 text-xs" style={{ color: "var(--text-subtle)" }}>{sub}</p>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <AppNav unreadCount={unreadCount} />

      <div className="mx-auto max-w-6xl px-6 py-10 lg:px-12">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
          <div>
            <p className="mb-1 text-[11px] font-semibold tracking-[0.3em] uppercase text-green-600">
              Supply Management
            </p>
            <h1 className="font-serif text-3xl md:text-4xl" style={{ color: "var(--foreground)" }}>
              Farmer Dashboard
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Manage your harvest listings and review matches from Canadian restaurants and grocers
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPostForm((value) => !value)}
            className="flex w-fit items-center gap-2 bg-green-600 px-6 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:bg-green-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Post Supply
          </button>
        </div>

        <div className="mb-10 grid grid-cols-3 gap-4 stagger-children">
          {statCard(<Package className="h-3.5 w-3.5" />, "Active", activeCount, "open listings")}
          {statCard(<TrendingUp className="h-3.5 w-3.5" />, "Matched", matchedCount, "listings matched")}
          {statCard(<Clock className="h-3.5 w-3.5" />, "Pending", pendingCount, "match proposals")}
        </div>

        {showPostForm && (
          <div className="mb-10 animate-fade-in-up">
            <PostSupplyForm
              onClose={() => setShowPostForm(false)}
              onSubmitted={() => {
                setShowPostForm(false);
                void fetchData();
              }}
            />
          </div>
        )}

        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          accentColor="green"
        />

        <div className="mt-6">
          {activeTab === "listings" && (
            listings.length === 0
              ? <p className="text-sm" style={{ color: "var(--text-muted)" }}>No listings yet. Post a supply listing to start matching.</p>
              : <ListingsTable listings={listings} />
          )}

          {activeTab === "matches" && (
            <div className="grid gap-4 sm:grid-cols-2 stagger-children">
              {matches.length === 0
                ? <p className="text-sm" style={{ color: "var(--text-muted)" }}>No matches yet. Post a supply listing to trigger the Matching Agent.</p>
                : matches.map((match) => <FarmerMatchCard key={match.id} match={match} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
