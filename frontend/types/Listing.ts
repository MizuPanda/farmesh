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
};