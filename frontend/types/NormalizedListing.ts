import type { Listing } from "./Listing";

export type UnitFamily = "weight" | "count";
export type CanonicalUnit = "kg" | "piece";

export type NormalizedListing = Listing & {
    normalizedProduct: string;
    productCategory: string;
    unitFamily: UnitFamily | null;
    canonicalQuantity: number | null;
    canonicalUnit: CanonicalUnit | null;
    canonicalPricePerCanonicalUnit: number | null;
    assumptions: string[];
};
