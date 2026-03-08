export type { UserType, User } from "./User";
export type { ListingStatus, Listing } from "./Listing";
export type { MatchStatus, Match } from "./Match";
export type { RequestStatus, Request } from "./Request";
export type {
  UnitFamily,
  CanonicalUnit,
  NormalizedListing,
  NormalizedRequest,
} from "./Normalization";

export type Notification = {
    id: string;
    message: string;
    time: string;
    read: boolean;
};

export type Order = {
    id: string;
    title: string;
    vendors: string[];
    quantity: string;
    status: "Pending" | "In Transit" | "Delivered" | "Cancelled";
    deliveryTarget: string;
};
