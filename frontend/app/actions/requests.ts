"use server";

import { normalize } from "../../../backend/src/agents/requestNormAgent";
import { NormalizedRequest } from "@/types/NormalizedRequest";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action: normalizes a request via the AI agent, then inserts it into
 * the database. Receives a pre-built NormalizedRequest (with placeholder
 * normalized fields) from the client component.
 *
 * Flow: NormalizedRequest → JSON string → agent normalize() → merge → insert
 */
export async function normalizeAndInsertRequest(
    request: NormalizedRequest
): Promise<{ success: boolean; error?: string }> {
    try {
        const jsonString = JSON.stringify(request);
        const normalized = await normalize(jsonString);

        // Merge agent-returned fields onto the original request
        const merged: NormalizedRequest = {
            ...request,
            ...(normalized as Partial<NormalizedRequest>),
        };

        const supabase = await createClient();

        const { error } = await supabase.from("requests").insert({
            buyer_id: merged.buyerId,
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
            needed_date: merged.neededDate,
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
