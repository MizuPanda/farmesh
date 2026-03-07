"use client";

import React, { useState } from "react";
import { Plus, Package, TrendingUp, Clock } from "lucide-react";
import AppNav from "@/components/layout/AppNav";
import TabGroup from "@/components/layout/TabGroup";
import PostSupplyForm from "@/components/farmer/PostSupplyForm";
import ListingsTable from "@/components/farmer/ListingsTable";
import FarmerMatchCard from "@/components/farmer/FarmerMatchCard";
import { farmerListings, farmerMatches, farmerNotifications } from "@/data/mockData";

const tabs = [
    { label: "Listings", value: "listings" },
    { label: "Matches", value: "matches" },
];

export default function FarmerDashboard() {
    const [activeTab, setActiveTab] = useState("listings");
    const [showPostForm, setShowPostForm] = useState(false);

    const activeCount = farmerListings.filter((l) => l.status === "OPEN").length;
    const matchedCount = farmerListings.filter((l) => l.status === "MATCHED").length;
    const pendingCount = farmerMatches.filter((m) => m.status === "PROPOSED").length;
    const unreadCount = farmerNotifications.filter((n) => !n.read).length;

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
                        onClick={() => setShowPostForm((v) => !v)}
                        className="flex w-fit items-center gap-2 bg-green-600 px-6 py-3 text-xs font-semibold tracking-[0.12em] uppercase text-white transition-all duration-300 hover:bg-green-700"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Post Supply
                    </button>
                </div>

                {/* Stats row */}
                <div className="mb-10 grid grid-cols-3 gap-4 stagger-children">
                    {statCard(<Package className="h-3.5 w-3.5" />, "Active", activeCount, "open listings")}
                    {statCard(<TrendingUp className="h-3.5 w-3.5" />, "Matched", matchedCount, "listings matched")}
                    {statCard(<Clock className="h-3.5 w-3.5" />, "Pending", pendingCount, "match proposals")}
                </div>

                {/* Post Supply form (inline) */}
                {showPostForm && (
                    <div className="mb-10 animate-fade-in-up">
                        <PostSupplyForm onClose={() => setShowPostForm(false)} />
                    </div>
                )}

                {/* Tabs */}
                <TabGroup
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    accentColor="green"
                />

                <div className="mt-6">
                    {activeTab === "listings" && (
                        <ListingsTable listings={farmerListings} />
                    )}

                    {activeTab === "matches" && (
                        <div className="grid gap-4 sm:grid-cols-2 stagger-children">
                            {farmerMatches.map((match) => (
                                <FarmerMatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
