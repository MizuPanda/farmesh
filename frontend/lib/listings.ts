import { createClient } from "@/lib/supabase/client";
import { NormalizedListing } from "@/types/NormalizedListing";

/**
 * Converts form inputs into a NormalizedListing object.
 *
 * - id is set to "" (Supabase generates it via gen_random_uuid())
 * - status defaults to "OPEN"
 * - createdAt is omitted (database generates it)
 * - rawInput holds the optional description
 * - normalizedProduct, productCategory, and assumptions are placeholders
 *   that will be populated by the normalization logic later
 */
export function createListingObject({
    vendorId,
    product,
    quantity,
    unit,
    pricePerUnit,
    expirationDate,
    description,
}: {
    vendorId: string;
    product: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    expirationDate: string;
    description?: string;
}): NormalizedListing {
    return {
        id: "",
        vendorId,
        rawInput: description,
        originalProduct: product,
        normalizedProduct: product,
        productCategory: "other",
        quantity,
        unit,
        pricePerUnit,
        status: "OPEN",
        expirationDate,
        assumptions: [],
    };
}

/**
 * Inserts a NormalizedListing into the Supabase "listings" table.
 *
 * Maps camelCase frontend fields to snake_case database columns.
 * The id and created_at are generated automatically by the database.
 */
export async function insertListing(listing: NormalizedListing) {
    const supabase = createClient();

    const { data, error } = await supabase.from("listings").insert({
        vendor_id: listing.vendorId,
        raw_input: listing.rawInput,
        original_product: listing.originalProduct,
        normalized_product: listing.normalizedProduct,
        product_category: listing.productCategory,
        quantity: listing.quantity,
        unit: listing.unit,
        price_per_unit: listing.pricePerUnit,
        status: listing.status,
        expiration_date: listing.expirationDate,
        assumptions: listing.assumptions,
    });

    if (error) {
        throw new Error(`Failed to insert listing: ${error.message}`);
    }

    return data;
}
