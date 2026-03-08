import type { Listing } from "./Listing";
import type { Request } from "./Request";

export type UnitFamily = "weight" | "count";

export type CanonicalUnit = "kg" | "piece";

export type NormalizedListing = Listing & {
  /**
   * Normalized, human-friendly product name for display,
   * with words capitalized (e.g., "Chicken Egg", "Salad Greens").
   * The original product string is kept in the inherited `product` field.
   */
  normalizedProduct: string;

  /**
   * High-level category for matching (e.g., "eggs", "dairy", "produce").
   */
  productCategory: string;

  /**
   * Interpreted unit family for this listing.
   * - "weight" for kg / lb / oz / g
   * - "count" for pieces, eggs, dozens, crates, etc.
   */
  unitFamily: UnitFamily | null;

  /**
   * Quantity converted into the canonical unit for its family.
   * - For weight: kilograms
   * - For count: single pieces
   */
  canonicalQuantity: number | null;

  /**
   * Canonical unit corresponding to canonicalQuantity.
   * - "kg" for weight
   * - "piece" for count
   */
  canonicalUnit: CanonicalUnit | null;

  /**
   * Price normalized into price per canonical unit.
   * - e.g., price per kg, price per piece
   */
  canonicalPricePerCanonicalUnit: number | null;

  /**
   * Any assumptions or inferences the Normalization Agent had to make.
   * Example: "Assumed 12 eggs per dozen".
   */
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

