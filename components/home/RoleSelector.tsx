"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Sprout, ShoppingCart } from "lucide-react";

export default function RoleSelector() {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
            >
                <Settings className="h-4 w-4" />
                Get Started
            </button>

            {open && (
                <div className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                    <Link
                        href="/farmer"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-green-50"
                        onClick={() => setOpen(false)}
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                            <Sprout className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Continue as Farmer
                            </p>
                            <p className="text-xs text-gray-500">Manage your supply</p>
                        </div>
                    </Link>
                    <Link
                        href="/buyer"
                        className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-amber-50"
                        onClick={() => setOpen(false)}
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                            <ShoppingCart className="h-5 w-5 text-amber-700" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Continue as Buyer
                            </p>
                            <p className="text-xs text-gray-500">Source local produce</p>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    );
}
