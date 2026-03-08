import type { NormalizedListing, NormalizedRequest } from "@/types";

export type ProposedAgentMatch = {
  vendorId: string;
  buyerId: string;
  listingId: string;
  requestId: string;
  product: string;
  quantity: number;
  score: number;
  reason: string;
};

export async function proposeMatches(params: {
  listings: NormalizedListing[];
  requests: NormalizedRequest[];
}): Promise<ProposedAgentMatch[]> {
  void params;
  // Matching logic will be implemented in this agent.
  return [];
}
