export type ListingStatus =
    | "OPEN"
    | "MATCHED"
    | "CONFIRMED"
    | "FULFILLED"
    | "EXPIRED";

export type Listing = {
    id: string;
    vendorId: string;
    rawInput?: string;
    product: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    status: ListingStatus;
    createdAt?: string;
    expirationDate: string;

    // Normalized fields persisted in Supabase.
    normalizedProduct?: string | null;
    productCategory?: string | null;
    unitFamily?: "weight" | "count" | null;
    canonicalQuantity?: number | null;
    canonicalUnit?: "kg" | "piece" | null;
    canonicalPricePerCanonicalUnit?: number | null;
    assumptions?: string[];
};
