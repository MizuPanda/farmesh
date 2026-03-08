import { RequestStatus } from "./Request";
import { ProductCategory } from "./NormalizedListing";

export type NormalizedRequest = {
    id: string;
    buyerId: string;
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

    status: RequestStatus;

    createdAt?: string;
    neededDate: string;
};
