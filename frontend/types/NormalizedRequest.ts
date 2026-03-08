import type { Request } from "./Request";
import type { CanonicalUnit, UnitFamily } from "./NormalizedListing";

export type NormalizedRequest = Request & {
    normalizedProduct: string;
    productCategory: string;
    unitFamily: UnitFamily | null;
    canonicalQuantity: number | null;
    canonicalUnit: CanonicalUnit | null;
    canonicalPricePerCanonicalUnit: number | null;
    assumptions: string[];
};
