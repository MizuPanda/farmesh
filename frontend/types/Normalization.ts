import type { Listing } from "./Listing";
import type { Request } from "./Request";

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

export type NormalizedRequest = Request & {
  normalizedProduct: string;
  productCategory: string;
  unitFamily: UnitFamily | null;
  canonicalQuantity: number | null;
  canonicalUnit: CanonicalUnit | null;
  canonicalPricePerCanonicalUnit: number | null;
  assumptions: string[];
};
