import { createClient } from "@/lib/supabase/client";
import { NormalizedRequest } from "@/types/NormalizedRequest";

/**
 * Converts form inputs into a NormalizedRequest object.
 *
 * - id is set to "" (Supabase generates it via gen_random_uuid())
 * - status defaults to "OPEN"
 * - createdAt is omitted (database generates it)
 * - rawInput holds the optional description
 * - normalizedProduct, productCategory, canonical fields, and assumptions
 *   are placeholders that will be populated by the normalization logic later
 */
export function createRequestObject({
    buyerId,
    product,
    quantity,
    unit,
    pricePerUnit,
    neededDate,
    description,
}: {
    buyerId: string;
    product: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    neededDate: string;
    description?: string;
}): NormalizedRequest {
    return {
        id: "",
        buyerId,
        rawInput: description,
        originalProduct: product,
        normalizedProduct: product,
        productCategory: "other",
        originalQuantity: quantity,
        originalUnit: unit,
        originalPricePerUnit: pricePerUnit,
        canonicalQuantity: quantity,
        canonicalUnit: unit,
        canonicalPricePerCanonicalUnit: pricePerUnit,
        assumptions: [],
        status: "OPEN",
        neededDate,
    };
}

/**
 * Inserts a NormalizedRequest into the Supabase "requests" table.
 *
 * Maps camelCase frontend fields to snake_case database columns.
 * The id and created_at are generated automatically by the database.
 */
export async function insertRequest(request: NormalizedRequest) {
    const supabase = createClient();

    const { data, error } = await supabase.from("requests").insert({
        buyer_id: request.buyerId,
        raw_input: request.rawInput,
        original_product: request.originalProduct,
        normalized_product: request.normalizedProduct,
        product_category: request.productCategory,
        original_quantity: request.originalQuantity,
        original_unit: request.originalUnit,
        original_price_per_unit: request.originalPricePerUnit,
        canonical_quantity: request.canonicalQuantity,
        canonical_unit: request.canonicalUnit,
        canonical_price_per_canonical_unit: request.canonicalPricePerCanonicalUnit,
        assumptions: request.assumptions,
        status: request.status,
        needed_date: request.neededDate,
    });

    if (error) {
        throw new Error(`Failed to insert request: ${error.message}`);
    }

    return data;
}
