"use client";

import React, { useState } from "react";
import { Plus, ShoppingCart, Sparkles, Truck } from "lucide-react";
import AppNav from "@/components/layout/AppNav";
import TabGroup from "@/components/layout/TabGroup";
import PostRequestForm from "@/components/buyer/PostRequestForm";
import RequestsTable from "@/components/buyer/RequestsTable";
import BuyerMatchCard from "@/components/buyer/BuyerMatchCard";
import OrderCard from "@/components/buyer/OrderCard";
import {
    buyerMatches,
    buyerOrders,
    buyerRequests,
    buyerNotifications,
} from "@/data/mockData";

const tabs = [
    { label: "Requests", value: "requests" },
    { label: "Matches", value: "matches" },
    { label: "Orders", value: "orders" },
];

export default function BuyerDashboard() {
    const [activeTab, setActiveTab] = useState("requests");
    const [showPostForm, setShowPostForm] = useState(false);

    const openCount = buyerRequests.filter((r) => r.status === "OPEN").length;
    const proposedCount = buyerMatches.filter((m) => m.status === "PROPOSED").length;
    const inTransitCount = buyerOrders.filter((o) => o.status === "In Transit").length;
    const unreadCount = buyerNotifications.filter((n) => !n.read).length;

    const statCard = (icon: React.ReactNode, label: string, value: number, sub: string) => (
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
                {/* Page header */}
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
                    <button
                        type="button"
                        onClick={() => setShowPostForm((v) => !v)}
                        className="flex w-fit items-center gap-2 bg-amber-600 px-6 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:bg-amber-700"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Post Request
                    </button>
                </div>

                {/* Stats row */}
                <div className="mb-10 grid grid-cols-3 gap-4 stagger-children">
                    {statCard(<ShoppingCart className="h-3.5 w-3.5" />, "Requests", openCount, "open requests")}
                    {statCard(<Sparkles className="h-3.5 w-3.5" />, "Matches", proposedCount, "pending review")}
                    {statCard(<Truck className="h-3.5 w-3.5" />, "In Transit", inTransitCount, "active orders")}
                </div>

                {/* Post Request form (inline) */}
                {showPostForm && (
                    <div className="mb-10 animate-fade-in-up">
                        <PostRequestForm onClose={() => setShowPostForm(false)} />
                    </div>
                )}

                {/* Tabs */}
                <TabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    accentColor="amber"
                />

                <div className="mt-6">
                    {activeTab === "requests" && (
                        <RequestsTable requests={buyerRequests} />
                    )}

                    {activeTab === "matches" && (
                        <div className="grid gap-4 stagger-children">
                            {buyerMatches.map((match, i) => (
                                <BuyerMatchCard
                                    key={match.id}
                                    match={match}
                                    recommended={i === 0}
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
