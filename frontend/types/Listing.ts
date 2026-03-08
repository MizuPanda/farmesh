export type ListingStatus = "OPEN" | "MATCHED" | "EXPIRED";

export type Listing = {
    id: string;
    vendorId: string;
    rawInput: string;
    product: string;
    pricePerUnit: number;
    quantity: number;
    unit: string;
    status: ListingStatus;
    createdAt: string;
    expirationDate: string;
    normalizedProduct?: string | null;
    productCategory?: string | null;
    unitFamily?: "weight" | "count" | null;
    canonicalQuantity?: number | null;
    canonicalUnit?: "kg" | "piece" | null;
    canonicalPricePerCanonicalUnit?: number | null;
    assumptions?: string[] | null;
};
