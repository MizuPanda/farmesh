export type RequestStatus =
    | "OPEN"
    | "MATCHED"
    | "CONFIRMED"
    | "FULFILLED";

export type Request = {
    id: string;
    buyerId: string;
    rawInput?: string;
    product: string;
    pricePerUnit: number;
    quantity: number;
    unit: string;
    status: RequestStatus;
    createdAt?: string;
    neededDate?: string;

    // Normalized fields persisted in Supabase.
    normalizedProduct?: string | null;
    productCategory?: string | null;
    unitFamily?: "weight" | "count" | null;
    canonicalQuantity?: number | null;
    canonicalUnit?: "kg" | "piece" | null;
    canonicalPricePerCanonicalUnit?: number | null;
    assumptions?: string[];
};
