'use client';

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Plus, ShoppingCart, Sparkles, Truck } from "lucide-react";
import AppNav from "@/components/layout/AppNav";
import TabGroup from "@/components/layout/TabGroup";
import PostRequestForm from "@/components/buyer/PostRequestForm";
import RequestsTable from "@/components/buyer/RequestsTable";
import BuyerMatchCard from "@/components/buyer/BuyerMatchCard";
import OrderCard from "@/components/buyer/OrderCard";
import { buyerOrders, buyerNotifications } from "@/data/mockData";
import { getUser } from "@backend/auth/getUser";
import type { Match, Request } from "@/types";

const tabs = [
  { label: "Requests", value: "requests" },
  { label: "Matches", value: "matches" },
  { label: "Orders", value: "orders" },
];

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState("requests");
  const [showPostForm, setShowPostForm] = useState(false);
  const [buyerId, setBuyerId] = useState<string | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isRunningMatch, setIsRunningMatch] = useState(false);
  const [matchRunMessage, setMatchRunMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    getUser().then((user) => {
      if (!mounted) return;
      setBuyerId(user?.type === "buyer" ? user.id : null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!buyerId) {
      setRequests([]);
      setMatches([]);
      return;
    }

    try {
      const [requestsRes, matchesRes] = await Promise.all([
        fetch(`/api/requests?buyerId=${buyerId}`),
        fetch(`/api/matches?buyerId=${buyerId}`),
      ]);

      const nextRequests: Request[] = requestsRes.ok ? await requestsRes.json() : [];
      const nextMatches: Match[] = matchesRes.ok ? await matchesRes.json() : [];

      setRequests(nextRequests);
      setMatches(nextMatches);
    } catch (error) {
      console.error("Failed to load buyer data", error);
      setRequests([]);
      setMatches([]);
    }
  }, [buyerId]);

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

  const openCount = requests.filter((request) => request.status === "OPEN").length;
  const proposedCount = matches.filter((match) => match.status === "PROPOSED").length;
  const inTransitCount = buyerOrders.filter((order) => order.status === "In Transit").length;
  const unreadCount = buyerNotifications.filter((notification) => !notification.read).length;

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
            <p className="mb-1 text-[11px] font-semibold tracking-[0.3em] uppercase text-amber-600">
              Procurement Hub
            </p>
            <h1 className="font-serif text-3xl md:text-4xl" style={{ color: "var(--foreground)" }}>
              Buyer Dashboard
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Post sourcing needs, review local Canadian farm matches, and track your orders
            </p>
          </div>
          <div className="flex w-fit items-center gap-2">
            <button
              type="button"
              onClick={() => void runMatching()}
              disabled={!buyerId || isRunningMatch}
              className="flex items-center gap-2 border border-amber-600 px-5 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-amber-700 transition-all duration-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isRunningMatch ? "Running..." : "Run Matching"}
            </button>
            <button
              type="button"
              onClick={() => setShowPostForm((value) => !value)}
              disabled={!buyerId}
              className="flex items-center gap-2 bg-amber-600 px-6 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Request
            </button>
          </div>
        </div>

        {matchRunMessage && (
          <p className="mb-8 text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {matchRunMessage}
          </p>
        )}

        <div className="mb-10 grid grid-cols-3 gap-4 stagger-children">
          {statCard(<ShoppingCart className="h-3.5 w-3.5" />, "Requests", openCount, "open requests")}
          {statCard(<Sparkles className="h-3.5 w-3.5" />, "Matches", proposedCount, "pending review")}
          {statCard(<Truck className="h-3.5 w-3.5" />, "In Transit", inTransitCount, "active orders")}
        </div>

        {showPostForm && buyerId && (
          <div className="mb-10 animate-fade-in-up">
            <PostRequestForm
              buyerId={buyerId}
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
          accentColor="amber"
        />

        <div className="mt-6">
          {activeTab === "requests" && (
            requests.length === 0
              ? <p className="text-sm" style={{ color: "var(--text-muted)" }}>No open requests yet.</p>
              : <RequestsTable requests={requests} />
          )}

          {activeTab === "matches" && (
            <div className="grid gap-4 stagger-children">
              {matches.length === 0
                ? <p className="text-sm" style={{ color: "var(--text-muted)" }}>No matches yet. Post a request to trigger the Matching Agent.</p>
                : matches.map((match, index) => (
                    <BuyerMatchCard
                      key={match.id}
                      match={match}
                      recommended={index === 0}
                    />
                  ))}
            </div>
          )}

          {activeTab === "orders" && (
            <div className="grid gap-4 stagger-children">
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
