export type ListingStatus =
    | "open"
    | "matched"
    | "expired";

export type Listing = {
    id: string;
    vendorId: string;
    rawInput: string;
    product: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    status: ListingStatus;
    createdAt: string;
    expirationDate: string;
};