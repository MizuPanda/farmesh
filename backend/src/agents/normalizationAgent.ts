import { BackboardClient, type MessageResponse } from "backboard-sdk";
import type {
  Listing,
  Request,
  NormalizedListing,
  NormalizedRequest,
  CanonicalUnit,
  UnitFamily,
} from "@/types";

const NORMALIZATION_MODEL =
  process.env.NORMALIZATION_MODEL ?? process.env.MATCHING_MODEL ?? "gemini-2.5-flash";

const NORMALIZATION_PROVIDER =
  process.env.NORMALIZATION_PROVIDER ?? process.env.MATCHING_PROVIDER ?? "google";

const NORMALIZATION_SYSTEM_PROMPT = `
You are the Farmesh Normalization Agent for a local food marketplace.

Your job:
1. Normalize vendor LISTINGS (supply) and buyer REQUESTS (demand) into a canonical representation for matching.
2. Convert messy, human-entered units into consistent canonical units:
   - For WEIGHT: always convert to kilograms ("kg").
   - For COUNT: always convert to individual pieces ("piece").
3. Preserve the original product name in the "product" field and provide additional normalized fields.

SUPPORTED UNIT FAMILIES
- WEIGHT (unitFamily: "weight"):
  - Input units can include: "kg", "kgs", "kilogram", "kilograms", "g", "gram", "grams", "lb", "lbs", "pound", "pounds", "oz", "ounce", "ounces".
  - Canonical unit: "kg".
  - Conversions:
    - 1 lb = 0.453592 kg
    - 1 ounce (oz) = 0.0283495 kg
    - 1000 g = 1 kg
- COUNT (unitFamily: "count"):
  - Input units can include: "piece", "pieces", "unit", "units", "egg", "eggs", "dozen", "dozens", "crate", "crates", "flat", "flats", "box", "boxes".
  - Canonical unit: "piece".

NORMALIZATION RULES
- For each listing and request:
  - Determine unitFamily: "weight", "count", or null if ambiguous.
  - Compute canonicalQuantity.
  - Set canonicalUnit:
    - "kg" for weight.
    - "piece" for count.
  - Compute canonicalPricePerCanonicalUnit (price per canonical unit).
- Product normalization:
  - normalizedProduct: clean display-friendly product string.
  - productCategory: short category like "produce", "dairy", "meat", "eggs", "grain".
- Assumptions:
  - If any inference/guess is made, include it in assumptions.
  - If missing critical info, return null for unavailable canonical fields and explain in assumptions.

OUTPUT CONTRACT
Respond with valid JSON only:
{
  "normalizedListings": NormalizedListing[],
  "normalizedRequests": NormalizedRequest[]
}

CRITICAL FORMATTING:
- JSON only (no markdown, no surrounding prose).
- Always include all normalized fields for each object.
- Use null for unknown values and explain in assumptions.
`;

type NormalizationResult = {
  normalizedListings: unknown[];
  normalizedRequests: unknown[];
};

function toNullableNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function toUnitFamily(value: unknown): UnitFamily | null {
  if (value === "weight" || value === "count") return value;
  return null;
}

function toCanonicalUnit(value: unknown): CanonicalUnit | null {
  if (value === "kg" || value === "piece") return value;
  return null;
}

function toStringOrFallback(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function mergeListing(base: Listing, value: unknown): NormalizedListing {
  const candidate = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  return {
    ...base,
    normalizedProduct: toStringOrFallback(candidate.normalizedProduct, base.product),
    productCategory: toStringOrFallback(candidate.productCategory, ""),
    unitFamily: toUnitFamily(candidate.unitFamily),
    canonicalQuantity: toNullableNumber(candidate.canonicalQuantity),
    canonicalUnit: toCanonicalUnit(candidate.canonicalUnit),
    canonicalPricePerCanonicalUnit: toNullableNumber(candidate.canonicalPricePerCanonicalUnit),
    assumptions: toStringArray(candidate.assumptions),
  };
}

function mergeRequest(base: Request, value: unknown): NormalizedRequest {
  const candidate = (typeof value === "object" && value !== null ? value : {}) as Record<string, unknown>;
  return {
    ...base,
    normalizedProduct: toStringOrFallback(candidate.normalizedProduct, base.product),
    productCategory: toStringOrFallback(candidate.productCategory, ""),
    unitFamily: toUnitFamily(candidate.unitFamily),
    canonicalQuantity: toNullableNumber(candidate.canonicalQuantity),
    canonicalUnit: toCanonicalUnit(candidate.canonicalUnit),
    canonicalPricePerCanonicalUnit: toNullableNumber(candidate.canonicalPricePerCanonicalUnit),
    assumptions: toStringArray(candidate.assumptions),
  };
}

function extractJsonObject(content: string): string {
  const cleaned = content
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Normalization agent response did not contain a JSON object.");
  }

  return cleaned.slice(firstBrace, lastBrace + 1);
}

function getFallbackListings(listings: Listing[]): NormalizedListing[] {
  return listings.map((listing) => ({
    ...listing,
    normalizedProduct: listing.product,
    productCategory: "",
    unitFamily: null,
    canonicalQuantity: null,
    canonicalUnit: null,
    canonicalPricePerCanonicalUnit: null,
    assumptions: ["Normalization agent fallback used."],
  }));
}

function getFallbackRequests(requests: Request[]): NormalizedRequest[] {
  return requests.map((request) => ({
    ...request,
    normalizedProduct: request.product,
    productCategory: "",
    unitFamily: null,
    canonicalQuantity: null,
    canonicalUnit: null,
    canonicalPricePerCanonicalUnit: null,
    assumptions: ["Normalization agent fallback used."],
  }));
}

export async function normalizeForMatching(params: {
  listings: Listing[];
  requests: Request[];
}): Promise<{
  listings: NormalizedListing[];
  requests: NormalizedRequest[];
}> {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) {
    throw new Error("Missing BACKBOARD_API_KEY in frontend/.env.local");
  }

  const client = new BackboardClient({ apiKey });
  const assistant = await client.createAssistant({
    name: "Farmesh Normalization Agent",
    system_prompt: NORMALIZATION_SYSTEM_PROMPT,
  });
  const thread = await client.createThread(assistant.assistantId);

  const fallbackListings = getFallbackListings(params.listings);
  const fallbackRequests = getFallbackRequests(params.requests);

  let normalizedListings = fallbackListings;
  let normalizedRequests = fallbackRequests;

  try {
    const response = (await client.addMessage(thread.threadId, {
      content: JSON.stringify({
        listings: params.listings,
        requests: params.requests,
      }),
      llm_provider: NORMALIZATION_PROVIDER,
      model_name: NORMALIZATION_MODEL,
      stream: false,
    })) as MessageResponse;

    if (response.content) {
      const jsonText = extractJsonObject(response.content);
      const parsed = JSON.parse(jsonText) as Partial<NormalizationResult>;

      if (Array.isArray(parsed.normalizedListings)) {
        normalizedListings = params.listings.map((listing, index) =>
          mergeListing(listing, parsed.normalizedListings?.[index])
        );
      }

      if (Array.isArray(parsed.normalizedRequests)) {
        normalizedRequests = params.requests.map((request, index) =>
          mergeRequest(request, parsed.normalizedRequests?.[index])
        );
      }
    }
  } catch (error) {
    console.warn("[NormalizationAgent] Failed to normalize, using fallback:", error);
  } finally {
    try {
      await client.deleteAssistant(assistant.assistantId);
      await client.deleteThread(thread.threadId);
    } catch {
      // Best-effort cleanup only.
    }
  }

  return {
    listings: normalizedListings,
    requests: normalizedRequests,
  };
}
