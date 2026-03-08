import { ListingStatus } from "./Listing";

export type ProductCategory =
    | "eggs"
    | "dairy"
    | "produce"
    | "meat"
    | "grains"
    | "other";

export type NormalizedListing = {
    id: string;
    vendorId: string;
    rawInput?: string;

    originalProduct: string;
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
