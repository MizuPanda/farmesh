export type UserType = "Farmer" | "Buyer";

export type User = {
    id: string;
    name: string;
    email: string;
    type: UserType;
    businessName: string;
};
