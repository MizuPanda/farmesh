import type { Listing, NormalizedListing } from "@/types";
import { insertListing as insertListingRecord } from "@/lib/db";

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
        originalQuantity: quantity,
        originalUnit: unit,
        originalPricePerUnit: pricePerUnit,
        canonicalQuantity: quantity,
        canonicalUnit: unit,
        canonicalPricePerCanonicalUnit: pricePerUnit,
        assumptions: [],
        status: "OPEN",
        expirationDate,
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
        original_quantity: listing.originalQuantity,
        original_unit: listing.originalUnit,
        original_price_per_unit: listing.originalPricePerUnit,
        canonical_quantity: listing.canonicalQuantity,
        canonical_unit: listing.canonicalUnit,
        canonical_price_per_canonical_unit: listing.canonicalPricePerCanonicalUnit,
        assumptions: listing.assumptions,
        status: listing.status,
        expiration_date: listing.expirationDate,
    });

    if (error) {
        throw new Error(`Failed to insert listing: ${error.message}`);
    }

    return data;
}
