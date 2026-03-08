import type { Listing } from "./Listing";

export type UnitFamily = "weight" | "count";
export type CanonicalUnit = "kg" | "piece";

export type NormalizedListing = Listing & {
    normalizedProduct: string;
    productCategory: ProductCategory;

    originalQuantity: number;
    originalUnit: string;
    originalPricePerUnit: number;

    canonicalQuantity: number;
    canonicalUnit: string;
    canonicalPricePerCanonicalUnit: number;

    assumptions: string[];

    status: ListingStatus;

    createdAt?: string;
    expirationDate: string;
};
