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

    quantity: number;
    unit: string;
    pricePerUnit: number;

    status: ListingStatus;

    createdAt?: string;
    expirationDate: string;

    assumptions: string[];
};
