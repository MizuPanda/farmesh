import { BackboardClient, type MessageResponse } from "backboard-sdk";
import type {
  Listing,
  Request,
  NormalizedListing,
  NormalizedRequest,
} from "@/types";

const NORMALIZATION_MODEL =
  process.env.NORMALIZATION_MODEL ?? process.env.MATCHING_MODEL ?? "gemini-2.5-flash";

const NORMALIZATION_PROVIDER =
  process.env.NORMALIZATION_PROVIDER ??
  process.env.MATCHING_PROVIDER ??
  "google";

const NORMALIZATION_SYSTEM_PROMPT = `
You are the Farmesh Normalization Agent for a local food marketplace.

Your job:
1. Normalize vendor LISTINGS (supply) and buyer REQUESTS (demand) into a canonical representation for matching.
2. Convert messy, human-entered units into consistent canonical units:
   - For WEIGHT: always convert to kilograms ("kg").
   - For COUNT: always convert to individual pieces ("piece").
3. Preserve the original product name in the "product" field (you may do small, safe cleanups like trimming whitespace, fixing screaming case such as "EGGS" -> "eggs", or correcting extremely obvious typos that clearly preserve the meaning), and ADD a separate normalized, nicely-capitalized product name in "normalizedProduct". Also preserve all the other original fields and ADD the canonical fields.

SUPPORTED UNIT FAMILIES
- WEIGHT (unitFamily: "weight"):
  - Input weight units may include: "kg", "kgs", "kilogram", "kilograms", "g", "gram", "grams", "lb", "lbs", "pound", "pounds", "oz", "ounce", "ounces".
  - Canonical unit: "kg".
  - Conversions:
    - 1 lb = 0.453592 kg
    - 1 ounce (oz) = 0.0283495 kg
    - 1000 g = 1 kg
- COUNT (unitFamily: "count"):
  - Input count units may include: "piece", "pieces", "unit", "units", "egg", "eggs", "dozen", "dozens", "crate", "crates", "flat", "flats", "box", "boxes".
  - Canonical unit: "piece".
  - Conversions (guidelines for eggs and similar items):
    - If the raw input clearly refers to dozens of eggs, assume 1 dozen = 12 pieces.
    - If the raw input clearly refers to crates, flats, or boxes AND states how many items per crate/flat/box, use that number.
    - If the raw input mentions crates, flats, or boxes without a clear count, make a reasonable, clearly-described assumption (e.g., 1 crate of eggs = 180 eggs) and record it in "assumptions".

NORMALIZATION RULES
- For each listing and request:
  - Decide whether the quantity + unit describe a WEIGHT or COUNT family.
  - Set unitFamily to "weight" or "count" accordingly. If truly ambiguous, set unitFamily to null and explain why in "assumptions".
  - Compute canonicalQuantity using the conversions above.
  - Set canonicalUnit:
    - "kg" for weight.
    - "piece" for count.
  - Compute canonicalPricePerCanonicalUnit by converting the original pricePerUnit into price per canonical unit.
    - Example (weight): if original is 5.0 USD per "lb", then canonicalPricePerCanonicalUnit is 5.0 / 0.453592 (USD per kg).
    - Example (count): if original is 6.0 USD per "dozen" of eggs, canonicalQuantity for 1 original unit is 12 pieces, so canonicalPricePerCanonicalUnit is 6.0 / 12 (USD per piece).
- Product normalization:
  - normalizedProduct: a clean, machine-friendly string (lowercase, snake_case where helpful) describing the product, e.g., "chicken_egg", "cow_milk", "salad_greens".
  - productCategory: a short, high-level category such as "eggs", "dairy", "produce", "meat", "grain".
  - Use rawInput + product + unit context to infer category.
- Assumptions:
  - Whenever you infer or guess something (like eggs per crate), add a short human-readable note to the "assumptions" array.
  - If you are missing any crucial information to compute canonical values, set canonicalQuantity, canonicalUnit, or canonicalPricePerCanonicalUnit to null and explain why in "assumptions".

OUTPUT CONTRACT
- You will receive a JSON object with:
  {
    "listings": Listing[],
    "requests": Request[]
  }
- Where Listing and Request have the following shapes:
  - Listing:
    {
      "id": string,
      "vendorId": string,
      "rawInput": string,
      "product": string,
      "pricePerUnit": number,
      "quantity": number,
      "unit": string,
      "status": string,
      "createdAt": string,
      "expirationDate": string
    }
  - Request:
    {
      "id": string,
      "buyerId": string,
      "rawInput": string,
      "product": string,
      "pricePerUnit": number,
      "quantity": number,
      "unit": string,
      "status": string,
      "createdAt": string
    }

You MUST respond with a single valid JSON object of the following form and nothing else (no markdown, no commentary):
{
  "normalizedListings": NormalizedListing[],
  "normalizedRequests": NormalizedRequest[]
}

Where:
- NormalizedListing is the original Listing fields PLUS:
  {
    "normalizedProduct": string,
    "productCategory": string,
    "unitFamily": "weight" | "count" | null,
    "canonicalQuantity": number | null,
    "canonicalUnit": "kg" | "piece" | null,
    "canonicalPricePerCanonicalUnit": number | null,
    "assumptions": string[]
  }

- NormalizedRequest is the original Request fields PLUS:
  {
    "normalizedProduct": string,
    "productCategory": string,
    "unitFamily": "weight" | "count" | null,
    "canonicalQuantity": number | null,
    "canonicalUnit": "kg" | "piece" | null,
    "canonicalPricePerCanonicalUnit": number | null,
    "assumptions": string[]
  }

CRITICAL FORMATTING:
- Respond with JSON ONLY (no backticks, no surrounding text).
- Always include ALL fields listed above for every object.
- If a value is unknown or cannot be inferred safely, use null and document in "assumptions".
`;

type NormalizationResult = {
  normalizedListings: NormalizedListing[];
  normalizedRequests: NormalizedRequest[];
};

function buildFallbackListings(listings: Listing[]): NormalizedListing[] {
  return listings.map((l) => ({
    ...l,
    normalizedProduct: l.product,
    productCategory: "",
    unitFamily: null,
    canonicalQuantity: null,
    canonicalUnit: null,
    canonicalPricePerCanonicalUnit: null,
    assumptions: ["Normalization agent failed. Using original quantity, unit, and pricePerUnit."],
  }));
}

function buildFallbackRequests(requests: Request[]): NormalizedRequest[] {
  return requests.map((r) => ({
    ...r,
    normalizedProduct: r.product,
    productCategory: "",
    unitFamily: null,
    canonicalQuantity: null,
    canonicalUnit: null,
    canonicalPricePerCanonicalUnit: null,
    assumptions: ["Normalization agent failed. Using original quantity, unit, and pricePerUnit."],
  }));
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

export async function normalizeForMatching(params: {
  listings: Listing[];
  requests: Request[];
}): Promise<{
  listings: NormalizedListing[];
  requests: NormalizedRequest[];
}> {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) {
    throw new Error("Missing BACKBOARD_API_KEY in .env.local");
  }

  const client = new BackboardClient({ apiKey });

  const assistant = await client.createAssistant({
    name: "Farmesh Normalization Agent",
    system_prompt: NORMALIZATION_SYSTEM_PROMPT,
  });

  const thread = await client.createThread(assistant.assistantId);

  const input = {
    listings: params.listings,
    requests: params.requests,
  };

  const response = (await client.addMessage(thread.threadId, {
    content: JSON.stringify(input),
    llm_provider: NORMALIZATION_PROVIDER,
    model_name: NORMALIZATION_MODEL,
    stream: false,
  })) as MessageResponse;

  let normalizedListings: NormalizedListing[] = buildFallbackListings(
    params.listings
  );
  let normalizedRequests: NormalizedRequest[] = buildFallbackRequests(
    params.requests
  );

  try {
    if (response.content) {
      const jsonText = extractJsonObject(response.content);
      const parsed = JSON.parse(jsonText) as Partial<NormalizationResult>;

      if (Array.isArray(parsed.normalizedListings)) {
        normalizedListings = parsed.normalizedListings as NormalizedListing[];
      }
      if (Array.isArray(parsed.normalizedRequests)) {
        normalizedRequests = parsed.normalizedRequests as NormalizedRequest[];
      }
    }
  } catch (error) {
    console.warn("[NormalizationAgent] Failed to parse response:", error);
  }

  try {
    await client.deleteAssistant(assistant.assistantId);
    await client.deleteThread(thread.threadId);
  } catch {
    // Best-effort cleanup only.
  }

  return {
    listings: normalizedListings,
    requests: normalizedRequests,
  };
}

