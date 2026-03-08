'use client';

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Plus, Package, TrendingUp, Clock, Sparkles } from "lucide-react";
import AppNav from "@/components/layout/AppNav";
import TabGroup from "@/components/layout/TabGroup";
import PostSupplyForm from "@/components/farmer/PostSupplyForm";
import ListingsTable from "@/components/farmer/ListingsTable";
import FarmerMatchCard from "@/components/farmer/FarmerMatchCard";
import { farmerNotifications } from "@/data/mockData";
import { getUser } from "@backend/auth/getUser";
import type { Listing, Match } from "@/types";

const tabs = [
  { label: "Listings", value: "listings" },
  { label: "Matches", value: "matches" },
];

export default function FarmerDashboard() {
  const [activeTab, setActiveTab] = useState("listings");
  const [showPostForm, setShowPostForm] = useState(false);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isRunningMatch, setIsRunningMatch] = useState(false);
  const [matchRunMessage, setMatchRunMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getUser().then((user) => {
      if (!mounted) return;
      setVendorId(user?.type === "farmer" ? user.id : null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!vendorId) {
      setListings([]);
      setMatches([]);
      return;
    }

    try {
      const [listingsRes, matchesRes] = await Promise.all([
        fetch(`/api/listings?vendorId=${vendorId}`),
        fetch(`/api/matches?vendorId=${vendorId}`),
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
  }, [vendorId]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const runMatching = useCallback(async () => {
    setIsRunningMatch(true);
    setMatchRunMessage(null);

    try {
      const response = await fetch("/api/match", { method: "POST" });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMatchRunMessage(payload?.error ?? "Failed to run matching.");
        return;
      }

      const matchesFound = Number(payload?.matchesFound ?? 0);
      if (matchesFound > 0) {
        setMatchRunMessage(`Matching run complete: ${matchesFound} match${matchesFound === 1 ? "" : "es"} found.`);
      } else {
        setMatchRunMessage(payload?.message ?? "No new matches found for current OPEN listings/requests.");
      }

      await fetchData();
    } catch (error) {
      console.error("Failed to run matching", error);
      setMatchRunMessage("Failed to run matching.");
    } finally {
      setIsRunningMatch(false);
    }
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
          <div className="flex w-fit items-center gap-2">
            <button
              type="button"
              onClick={() => void runMatching()}
              disabled={!vendorId || isRunningMatch}
              className="flex items-center gap-2 border border-green-600 px-5 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-green-700 transition-all duration-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isRunningMatch ? "Running..." : "Run Matching"}
            </button>
            <button
              type="button"
              onClick={() => setShowPostForm((value) => !value)}
              disabled={!vendorId}
              className="flex items-center gap-2 bg-green-600 px-6 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Supply
            </button>
          </div>
        </div>

        {matchRunMessage && (
          <p className="mb-8 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {matchRunMessage}
          </p>
        )}

        <div className="mb-10 grid grid-cols-3 gap-4 stagger-children">
          {statCard(<Package className="h-3.5 w-3.5" />, "Active", activeCount, "open listings")}
          {statCard(<TrendingUp className="h-3.5 w-3.5" />, "Matched", matchedCount, "listings matched")}
          {statCard(<Clock className="h-3.5 w-3.5" />, "Pending", pendingCount, "match proposals")}
        </div>

        {showPostForm && vendorId && (
          <div className="mb-10 animate-fade-in-up">
            <PostSupplyForm
              vendorId={vendorId}
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
