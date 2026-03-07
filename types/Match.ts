export type MatchStatus =
    | "PROPOSED"
    | "AWAITING_CONFIRMATION"
    | "CONFIRMED"
    | "REJECTED";

export type Match = {
    id: string;
    listingId: string;
    requestId: string;
    score: number;
    product: string;
    reason: string;
    status: MatchStatus;
    createdAt: string;
};
