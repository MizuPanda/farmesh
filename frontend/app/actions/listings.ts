"use server";

import { normalize } from "../../../backend/src/agents/listingNormAgent";
import { NormalizedListing } from "@/types/NormalizedListing";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action: normalizes a listing via the AI agent, then inserts it into
 * the database. Receives a pre-built NormalizedListing (with placeholder
 * normalized fields) from the client component.
 *
 * Flow: NormalizedListing → JSON string → agent normalize() → merge → insert
 */
export async function normalizeAndInsertListing(
    listing: NormalizedListing
): Promise<{ success: boolean; error?: string }> {
    try {
        const jsonString = JSON.stringify(listing);
        const normalized = await normalize(jsonString);

        // Merge agent-returned fields onto the original listing
        const merged: NormalizedListing = {
            ...listing,
            ...(normalized as Partial<NormalizedListing>),
        };

        const supabase = await createClient();

        const { error } = await supabase.from("listings").insert({
            vendor_id: merged.vendorId,
            raw_input: merged.rawInput,
            original_product: merged.originalProduct,
            normalized_product: merged.normalizedProduct,
            product_category: merged.productCategory,
            original_quantity: merged.originalQuantity,
            original_unit: merged.originalUnit,
            original_price_per_unit: merged.originalPricePerUnit,
            canonical_quantity: merged.canonicalQuantity,
            canonical_unit: merged.canonicalUnit,
            canonical_price_per_canonical_unit: merged.canonicalPricePerCanonicalUnit,
            assumptions: merged.assumptions,
            status: merged.status,
            expiration_date: merged.expirationDate,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
    }
}
