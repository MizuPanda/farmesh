"use client";

import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import TabGroup from "@/components/layout/TabGroup";
import PostSupplyForm from "@/components/farmer/PostSupplyForm";
import ListingsTable from "@/components/farmer/ListingsTable";
import FarmerMatchCard from "@/components/farmer/FarmerMatchCard";
import { farmerListings, farmerMatches } from "@/data/mockData";

const tabs = [
    { label: "Listings", value: "listings" },
    { label: "Matches", value: "matches" },
];

export default function FarmerDashboard() {
    const [activeTab, setActiveTab] = useState("listings");
    const [showPostForm, setShowPostForm] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                {/* Header */}
                <DashboardHeader title="Farmer Dashboard">
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
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4" />
                        Post Supply
                    </button>
                </DashboardHeader>

                {/* Post Supply Form */}
                {showPostForm && (
                    <div className="mt-6">
                        <PostSupplyForm onClose={() => setShowPostForm(false)} />
                    </div>
                )}

                {/* Tabs */}
                <div className="mt-6">
                    <TabGroup
                        tabs={tabs}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        accentColor="green"
                    />
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === "listings" && (
                        <ListingsTable listings={farmerListings} />
                    )}

                    {activeTab === "matches" && (
                        <div className="grid gap-4 sm:grid-cols-2">
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
