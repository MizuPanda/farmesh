import { NextRequest, NextResponse } from 'next/server';
import { BackboardClient, type MessageResponse } from 'backboard-sdk';
import { handleProposedMatch } from '@/lib/coordinationAgent';
import { getListings, getRequests } from '@/lib/db';
import type { Listing, Match, Request } from '@/types';

/**
 * MODEL SELECTION NOTE:
 * - gemini-2.5-flash: Fast, good for matching logic (current default).
 * - gpt-4o: Most reliable for tool calling. Switch back if Gemini tool calls aren't triggering.
 * - o3-mini: Best for complex multi-constraint reasoning.
 * - claude-3-5-sonnet-20241022: Excellent alternative via Backboard's multi-provider routing.
 *
 * Override via .env.local: MATCHING_MODEL and MATCHING_PROVIDER
 */
const MATCHING_MODEL = process.env.MATCHING_MODEL ?? 'gemini-2.5-flash';
const MATCHING_PROVIDER = process.env.MATCHING_PROVIDER ?? 'google';
type ProposedMatchArgs = Parameters<typeof handleProposedMatch>[0];

const WEIGHT_UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  lb: 453.59237,
  lbs: 453.59237,
  pound: 453.59237,
  pounds: 453.59237,
  oz: 28.349523125,
  ounce: 28.349523125,
  ounces: 28.349523125,
};

const PRODUCT_FAMILIES = [
  ['salad greens', 'baby greens', 'mixed baby greens', 'mixed greens', 'spinach', 'arugula'],
  ['cooking onions', 'yellow onions', 'white onions', 'onions'],
  ['tomatoes', 'roma tomatoes', 'san marzano tomatoes', 'heirloom tomatoes'],
  ['apples', 'gala apples', 'honeycrisp apples', 'ambrosia apples', 'mcintosh apples'],
] as const;

const PRODUCT_FAMILY_LOOKUP = new Map<string, Set<string>>();
for (const family of PRODUCT_FAMILIES) {
  const normalizedFamily = new Set(family.map((name) => normalizeText(name)));
  for (const name of normalizedFamily) {
    PRODUCT_FAMILY_LOOKUP.set(name, normalizedFamily);
  }
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUnit(unit: string): string {
  const normalized = normalizeText(unit);
  if (normalized === 'lbs' || normalized === 'pound' || normalized === 'pounds') return 'lb';
  if (normalized === 'kilogram' || normalized === 'kilograms') return 'kg';
  if (normalized === 'gram' || normalized === 'grams') return 'g';
  if (normalized === 'ounce' || normalized === 'ounces') return 'oz';
  if (normalized === 'cases') return 'case';
  if (normalized === 'bunches') return 'bunch';
  if (normalized === 'trays') return 'tray';
  if (normalized === 'baskets') return 'basket';
  return normalized;
}

function tokenizeProduct(product: string): Set<string> {
  return new Set(
    normalizeText(product)
      .split(' ')
      .filter((token) => token.length >= 3)
  );
}

function evaluateProductCompatibility(listingProduct: string, requestProduct: string): {
  compatible: boolean;
  exact: boolean;
  family: boolean;
  tokenOverlap: number;
} {
  const normalizedListing = normalizeText(listingProduct);
  const normalizedRequest = normalizeText(requestProduct);

  if (!normalizedListing || !normalizedRequest) {
    return { compatible: false, exact: false, family: false, tokenOverlap: 0 };
  }

  if (normalizedListing === normalizedRequest) {
    return { compatible: true, exact: true, family: false, tokenOverlap: 1 };
  }

  const listingFamily = PRODUCT_FAMILY_LOOKUP.get(normalizedListing);
  const familyMatch = !!(listingFamily && listingFamily.has(normalizedRequest));
  if (familyMatch) {
    return { compatible: true, exact: false, family: true, tokenOverlap: 0.7 };
  }

  const listingTokens = tokenizeProduct(normalizedListing);
  const requestTokens = tokenizeProduct(normalizedRequest);
  if (listingTokens.size === 0 || requestTokens.size === 0) {
    return { compatible: false, exact: false, family: false, tokenOverlap: 0 };
  }

  let overlap = 0;
  for (const token of listingTokens) {
    if (requestTokens.has(token)) overlap += 1;
  }
  const tokenOverlap = overlap / Math.min(listingTokens.size, requestTokens.size);

  return {
    compatible: tokenOverlap >= 0.5,
    exact: false,
    family: false,
    tokenOverlap,
  };
}

function convertQuantity(quantity: number, fromUnit: string, toUnit: string): number | null {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);
  if (!normalizedFrom || !normalizedTo) return null;
  if (normalizedFrom === normalizedTo) return quantity;

  const fromWeightFactor = WEIGHT_UNIT_TO_GRAMS[normalizedFrom];
  const toWeightFactor = WEIGHT_UNIT_TO_GRAMS[normalizedTo];
  if (fromWeightFactor && toWeightFactor) {
    return (quantity * fromWeightFactor) / toWeightFactor;
  }

  return null;
}

function convertPricePerUnit(pricePerFromUnit: number, fromUnit: string, toUnit: string): number | null {
  if (!Number.isFinite(pricePerFromUnit) || pricePerFromUnit < 0) return null;

  const normalizedFrom = normalizeUnit(fromUnit);
  const normalizedTo = normalizeUnit(toUnit);
  if (!normalizedFrom || !normalizedTo) return null;
  if (normalizedFrom === normalizedTo) return pricePerFromUnit;

  const fromWeightFactor = WEIGHT_UNIT_TO_GRAMS[normalizedFrom];
  const toWeightFactor = WEIGHT_UNIT_TO_GRAMS[normalizedTo];
  if (fromWeightFactor && toWeightFactor) {
    const pricePerGram = pricePerFromUnit / fromWeightFactor;
    return pricePerGram * toWeightFactor;
  }

  return null;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toProposedMatchArgs(value: unknown): ProposedMatchArgs | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;

  const vendorId = toNonEmptyString(candidate.vendorId);
  const buyerId = toNonEmptyString(candidate.buyerId);
  const listingId = toNonEmptyString(candidate.listingId);
  const requestId = toNonEmptyString(candidate.requestId);
  const product = toNonEmptyString(candidate.product);
  const reason = toNonEmptyString(candidate.reason);
  const quantity = toFiniteNumber(candidate.quantity);
  const score = toFiniteNumber(candidate.score);

  if (!vendorId || !buyerId || !listingId || !requestId || !product || !reason) return null;
  if (quantity === null || score === null) return null;
  if (quantity <= 0 || score < 0 || score > 100) return null;

  return {
    vendorId,
    buyerId,
    listingId,
    requestId,
    product,
    quantity,
    score,
    reason,
  };
}

function pairKey(listingId: string, requestId: string): string {
  return `${listingId}::${requestId}`;
}

async function runDeterministicFallback(
  listings: Listing[],
  requirements: Request[],
  seenPairs: Set<string>
): Promise<Match[]> {
  const fallbackMatches: Match[] = [];
  const usedListings = new Set<string>();
  const usedRequests = new Set<string>();

  for (const request of requirements) {
    if (usedRequests.has(request.id)) continue;

    const requestQuantity = Number(request.quantity);
    const requestPricePerUnit = Number(request.pricePerUnit);
    if (!Number.isFinite(requestQuantity) || requestQuantity <= 0) continue;
    if (!Number.isFinite(requestPricePerUnit) || requestPricePerUnit < 0) continue;

    let bestCandidate:
      | {
          listing: Listing;
          score: number;
          matchedQuantity: number;
          reason: string;
        }
      | null = null;

    for (const listing of listings) {
      if (usedListings.has(listing.id)) continue;
      if (seenPairs.has(pairKey(listing.id, request.id))) continue;

      const product = evaluateProductCompatibility(listing.product, request.product);
      if (!product.compatible) continue;

      const listingQuantityInRequestUnit = convertQuantity(listing.quantity, listing.unit, request.unit);
      const listingPriceInRequestUnit = convertPricePerUnit(listing.pricePerUnit, listing.unit, request.unit);
      if (listingQuantityInRequestUnit === null || listingPriceInRequestUnit === null) continue;

      const quantityCoverage = listingQuantityInRequestUnit / requestQuantity;
      if (quantityCoverage < 0.3) continue;

      if (listingPriceInRequestUnit > requestPricePerUnit * 1.2) continue;

      const productScore = product.exact
        ? 100
        : product.family
          ? 88
          : Math.max(70, Math.min(90, product.tokenOverlap * 100));
      const quantityScore = Math.min(100, quantityCoverage * 100);

      let priceScore = 100;
      if (requestPricePerUnit > 0 && listingPriceInRequestUnit > requestPricePerUnit) {
        const overBudgetRatio = (listingPriceInRequestUnit / requestPricePerUnit) - 1;
        priceScore = Math.max(70, 100 - (overBudgetRatio / 0.2) * 30);
      }

      const score = Number((productScore * 0.45 + quantityScore * 0.35 + priceScore * 0.2).toFixed(2));
      if (score < 70) continue;

      const matchedQuantity = Number(Math.min(listingQuantityInRequestUnit, requestQuantity).toFixed(2));
      const reason = `${listing.product} fits ${request.product} with ${Math.round(quantityCoverage * 100)}% quantity coverage at ${listingPriceInRequestUnit.toFixed(2)} per ${request.unit}.`;

      if (!bestCandidate || score > bestCandidate.score) {
        bestCandidate = {
          listing,
          score,
          matchedQuantity,
          reason,
        };
      }
    }

    if (!bestCandidate) continue;

    const args: ProposedMatchArgs = {
      vendorId: bestCandidate.listing.vendorId,
      buyerId: request.buyerId,
      listingId: bestCandidate.listing.id,
      requestId: request.id,
      product: bestCandidate.listing.product,
      quantity: bestCandidate.matchedQuantity,
      score: bestCandidate.score,
      reason: bestCandidate.reason,
    };

    const persistedMatch = await handleProposedMatch(args);
    fallbackMatches.push(persistedMatch);
    seenPairs.add(pairKey(args.listingId, args.requestId));
    usedListings.add(bestCandidate.listing.id);
    usedRequests.add(request.id);
  }

  return fallbackMatches;
}

export async function POST(req: NextRequest) {
  try {
    console.log('[MatchingAgent] POST /api/match called');

    // Allow caller to override listings/requirements, or pull live from DB
    const body = await req.json().catch(() => ({}));
    const listings = body.listings ?? (await getListings()).filter((l) => l.status === 'OPEN');
    const requirements = body.requirements ?? (await getRequests()).filter((r) => r.status === 'OPEN');

    console.log('[MatchingAgent] open listings:', listings.length, '| open requests:', requirements.length);

    if (listings.length === 0 || requirements.length === 0) {
      console.log('[MatchingAgent] Early exit — no open listings or requests');
      return NextResponse.json({ success: false, message: 'No open listings or requests to match.' });
    }

    const proposedMatches: Match[] = [];
    const seenPairs = new Set<string>();
    let response: MessageResponse | null = null;
    let usedTextFallback = false;
    let usedDeterministicFallback = false;
    let llmError: string | null = null;

    const persistMatchIfValid = async (value: unknown): Promise<boolean> => {
      const args = toProposedMatchArgs(value);
      if (!args) return false;

      const key = pairKey(args.listingId, args.requestId);
      if (seenPairs.has(key)) return false;

      const persistedMatch = await handleProposedMatch(args);
      proposedMatches.push(persistedMatch);
      seenPairs.add(key);
      return true;
    };

    const apiKey = process.env.BACKBOARD_API_KEY;
    if (apiKey) {
      const client = new BackboardClient({ apiKey });

      // Tool the Matching Agent can call when it finds a strong match
      const proposeMatchTool = {
        type: 'function',
        function: {
          name: 'propose_match',
          description: 'Propose a specific match between a vendor listing and a buyer request.',
          parameters: {
            type: 'object',
            properties: {
              vendorId:   { type: 'string', description: 'The vendorId from the matched listing' },
              buyerId:    { type: 'string', description: 'The buyerId from the matched request' },
              listingId:  { type: 'string', description: 'The id of the matched listing' },
              requestId:  { type: 'string', description: 'The id of the matched request' },
              product:    { type: 'string', description: 'The product being matched' },
              quantity:   { type: 'number', description: 'Quantity that can be fulfilled (min of listing qty and request qty)' },
              score:      { type: 'number', description: 'Match confidence score 0-100 based on product similarity, quantity coverage, price fit, and any constraints' },
              reason:     { type: 'string', description: 'A 1-2 sentence human-readable explanation of why this is a good match, for display in the UI' },
            },
            required: ['vendorId', 'buyerId', 'listingId', 'requestId', 'product', 'quantity', 'score', 'reason'],
          },
        },
      };

      const assistant = await client.createAssistant({
        name: 'Farmesh Matching Agent',
        system_prompt: `You are the Farmesh Matching Agent — the core fulfillment engine for a local food marketplace.

Your job:
1. Analyze the Standardized Listings (vendor supply) and Weighted Requirements (buyer demand).
2. Find all high-quality matches (score >= 70) based on:
   - Product name overlap or semantic similarity (e.g. "salad greens" ↔ "baby greens" is VALID)
   - Quantity: listing must supply at least 30% of the request
   - Price: listing pricePerUnit should not exceed buyer pricePerUnit by more than 20%
   - Allow product substitutions unless the buyer has specified otherwise
3. For EACH valid match found, call the propose_match function/tool.
4. Only call propose_match for genuine matches. Do NOT call it for poor matches.
5. If the tool is unavailable, respond ONLY with a JSON array of match objects with the exact fields:
   vendorId, buyerId, listingId, requestId, product, quantity, score, reason.
   No markdown, no explanation — raw JSON array only.`,
        tools: [proposeMatchTool],
      });

      const thread = await client.createThread(assistant.assistantId);

      try {
        const prompt = `
STANDARDIZED LISTINGS (Vendor Supply):
${JSON.stringify(listings, null, 2)}

WEIGHTED REQUIREMENTS (Buyer Demand):
${JSON.stringify(requirements, null, 2)}
`;

        response = await client.addMessage(thread.threadId, {
          content: prompt,
          llm_provider: MATCHING_PROVIDER,
          model_name: MATCHING_MODEL,
          stream: false,
        }) as MessageResponse;

        // Debug: log full response shape so we can diagnose model behaviour
        console.log('[MatchingAgent] status:', response.status);
        console.log('[MatchingAgent] toolCalls:', JSON.stringify(response.toolCalls ?? null));
        console.log('[MatchingAgent] content:', response.content?.slice(0, 500));

        // Path A: model called the tool.
        if (response.toolCalls?.length) {
          const toolOutputs: Array<{ tool_call_id: string; output: string }> = [];

          for (const tc of response.toolCalls) {
            if (tc.function.name !== 'propose_match') continue;
            try {
              const persisted = await persistMatchIfValid(tc.function.parsedArguments);
              if (persisted) {
                toolOutputs.push({ tool_call_id: tc.id, output: JSON.stringify({ success: true }) });
              } else {
                toolOutputs.push({ tool_call_id: tc.id, output: JSON.stringify({ success: false, error: 'Invalid arguments' }) });
              }
            } catch (toolError) {
              console.error('[MatchingAgent] Tool-call persistence error:', toolError);
              toolOutputs.push({ tool_call_id: tc.id, output: JSON.stringify({ success: false, error: 'Persistence failed' }) });
            }
          }

          if (response.runId && toolOutputs.length > 0) {
            try {
              await client.submitToolOutputs(thread.threadId, response.runId, toolOutputs);
            } catch (submitError) {
              console.warn('[MatchingAgent] submitToolOutputs failed:', submitError);
            }
          }
        }

        // Path B: model returned text instead of a tool call.
        if (proposedMatches.length === 0 && response.content) {
          try {
            const cleaned = response.content
              .replace(/```json\s*/gi, '')
              .replace(/```\s*/gi, '')
              .trim();

            const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
            if (arrayMatch) {
              const parsed = JSON.parse(arrayMatch[0]) as unknown;
              if (Array.isArray(parsed)) {
                for (const entry of parsed) {
                  await persistMatchIfValid(entry);
                }
              }
              if (proposedMatches.length > 0) {
                usedTextFallback = true;
                console.log('[MatchingAgent] Used text-fallback parser, found', proposedMatches.length, 'match(es)');
              }
            }
          } catch (e) {
            console.warn('[MatchingAgent] Text-fallback parse failed:', e);
          }
        }
      } catch (error) {
        llmError = error instanceof Error ? error.message : 'Unknown matching model error';
        console.error('[MatchingAgent] LLM error:', error);
      } finally {
        try {
          await client.deleteAssistant(assistant.assistantId);
          await client.deleteThread(thread.threadId);
        } catch {}
      }
    } else {
      llmError = 'Missing BACKBOARD_API_KEY in frontend/.env.local';
    }

    if (proposedMatches.length === 0) {
      const deterministicMatches = await runDeterministicFallback(listings, requirements, seenPairs);
      if (deterministicMatches.length > 0) {
        proposedMatches.push(...deterministicMatches);
        usedDeterministicFallback = true;
        console.log('[MatchingAgent] Used deterministic fallback, found', deterministicMatches.length, 'match(es)');
      }
    }

    return NextResponse.json({
      success: true,
      matchesFound: proposedMatches.length,
      matches: proposedMatches,
      debug: {
        model: MATCHING_MODEL,
        provider: MATCHING_PROVIDER,
        responseStatus: response?.status ?? null,
        hadToolCalls: !!(response?.toolCalls?.length),
        usedTextFallback,
        usedDeterministicFallback,
        llmError,
      }
    });
  } catch (error: unknown) {
    console.error('[MatchingAgent] Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
