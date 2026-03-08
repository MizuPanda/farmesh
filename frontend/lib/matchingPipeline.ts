import {
  coordinateProposedMatch,
  type CoordinationFrontendEvent,
} from "@backend/agents/coordinationAgent";
import { proposeMatches } from "@backend/agents/matchingAgent";
import { normalizeForMatching } from "@backend/agents/normalizationAgent";
import {
  getListings,
  getMatches,
  getRequests,
  updateListingNormalization,
  updateRequestNormalization,
} from "@/lib/db";
import type {
  Listing,
  Match,
  NormalizedListing,
  NormalizedRequest,
  Request,
} from "@/types";

function toNormalizedListing(listing: Listing): NormalizedListing {
  return {
    ...listing,
    normalizedProduct: listing.normalizedProduct ?? listing.product,
    productCategory: listing.productCategory ?? "EMPTY",
    unitFamily: listing.unitFamily ?? null,
    canonicalQuantity: listing.canonicalQuantity ?? null,
    canonicalUnit: listing.canonicalUnit ?? null,
    canonicalPricePerCanonicalUnit: listing.canonicalPricePerCanonicalUnit ?? null,
    assumptions: listing.assumptions ?? [],
  };
}

function toNormalizedRequest(request: Request): NormalizedRequest {
  return {
    ...request,
    normalizedProduct: request.normalizedProduct ?? request.product,
    productCategory: request.productCategory ?? "EMPTY",
    unitFamily: request.unitFamily ?? null,
    canonicalQuantity: request.canonicalQuantity ?? null,
    canonicalUnit: request.canonicalUnit ?? null,
    canonicalPricePerCanonicalUnit: request.canonicalPricePerCanonicalUnit ?? null,
    assumptions: request.assumptions ?? [],
  };
}

export type MatchingPipelineResult = {
  success: boolean;
  matchesFound: number;
  matches: Match[];
  coordinationEvents: CoordinationFrontendEvent[];
  message?: string;
  debug: {
    normalizationError: string | null;
    llmError: string | null;
    model: string;
    provider: string;
    responseStatus: string | null;
    hadToolCalls: boolean;
    usedTextFallback: boolean;
    usedDeterministicFallback: boolean;
  };
};

export async function runMatchingPipeline(params?: {
  listings?: Listing[];
  requests?: Request[];
}): Promise<MatchingPipelineResult> {
  const listings = (params?.listings ?? (await getListings())).filter(
    (listing) => listing.status === "OPEN"
  );
  const requests = (params?.requests ?? (await getRequests())).filter(
    (request) => request.status === "OPEN"
  );

  if (listings.length === 0 || requests.length === 0) {
    return {
      success: true,
      matchesFound: 0,
      matches: [],
      coordinationEvents: [],
      message: "No open listings or requests to match.",
      debug: {
        normalizationError: null,
        llmError: null,
        model: process.env.MATCHING_MODEL ?? "gemini-2.5-flash",
        provider: process.env.MATCHING_PROVIDER ?? "google",
        responseStatus: null,
        hadToolCalls: false,
        usedTextFallback: false,
        usedDeterministicFallback: false,
      },
    };
  }

  let normalizedListings = listings.map(toNormalizedListing);
  let normalizedRequests = requests.map(toNormalizedRequest);
  let normalizationError: string | null = null;

  try {
    const normalized = await normalizeForMatching({
      listings,
      requests,
    });

    normalizedListings = normalized.listings;
    normalizedRequests = normalized.requests;

    await Promise.allSettled([
      ...normalizedListings.map((listing) =>
        updateListingNormalization(listing.id, {
          normalizedProduct: listing.normalizedProduct,
          productCategory: listing.productCategory,
          canonicalQuantity: listing.canonicalQuantity,
          canonicalUnit: listing.canonicalUnit,
          canonicalPricePerCanonicalUnit: listing.canonicalPricePerCanonicalUnit,
          assumptions: listing.assumptions,
        })
      ),
      ...normalizedRequests.map((request) =>
        updateRequestNormalization(request.id, {
          normalizedProduct: request.normalizedProduct,
          productCategory: request.productCategory,
          canonicalQuantity: request.canonicalQuantity,
          canonicalUnit: request.canonicalUnit,
          canonicalPricePerCanonicalUnit: request.canonicalPricePerCanonicalUnit,
          assumptions: request.assumptions,
        })
      ),
    ]);
  } catch (error) {
    normalizationError =
      error instanceof Error ? error.message : "Normalization failed";
  }

  const existingMatches = await getMatches();
  const existingPairs = new Set(
    existingMatches.map((match) => `${match.listingId}::${match.requestId}`)
  );

  const matching = await proposeMatches({
    listings: normalizedListings,
    requests: normalizedRequests,
    existingPairs,
  });

  const listingById = new Map(normalizedListings.map((listing) => [listing.id, listing]));
  const requestById = new Map(normalizedRequests.map((request) => [request.id, request]));

  const usedListingIds = new Set<string>();
  const usedRequestIds = new Set<string>();
  const persistedMatches: Match[] = [];
  const coordinationEvents: CoordinationFrontendEvent[] = [];

  for (const proposed of matching.matches) {
    const listing = listingById.get(proposed.listingId);
    const request = requestById.get(proposed.requestId);

    if (!listing || !request) continue;
    if (usedListingIds.has(listing.id) || usedRequestIds.has(request.id)) continue;

    const key = `${listing.id}::${request.id}`;
    if (existingPairs.has(key)) continue;

    const quantity = Number.isFinite(proposed.quantity) && proposed.quantity > 0
      ? proposed.quantity
      : Math.min(listing.canonicalQuantity ?? listing.quantity, request.canonicalQuantity ?? request.quantity);

    const coordinated = await coordinateProposedMatch({
      vendorId: listing.vendorId,
      buyerId: request.buyerId,
      listingId: listing.id,
      requestId: request.id,
      product: proposed.product || listing.normalizedProduct || listing.product,
      quantity,
      score: proposed.score,
      reason: proposed.reason,
    });

    persistedMatches.push(coordinated.match);
    coordinationEvents.push(coordinated.frontendEvent);
    usedListingIds.add(listing.id);
    usedRequestIds.add(request.id);
    existingPairs.add(key);
  }

  return {
    success: true,
    matchesFound: persistedMatches.length,
    matches: persistedMatches,
    coordinationEvents,
    debug: {
      ...matching.debug,
      normalizationError,
    },
  };
}
