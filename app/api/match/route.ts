import { NextRequest, NextResponse } from 'next/server';
import { BackboardClient, type MessageResponse } from 'backboard-sdk';
import { handleProposedMatch } from '@/lib/coordinationAgent';
import { getListings, getRequests } from '@/lib/db';
import { normalizeForMatching } from '@/lib/normalizationAgent';

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

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.BACKBOARD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing BACKBOARD_API_KEY in .env.local' },
        { status: 500 }
      );
    }

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

    const { listings: normalizedListings, requests: normalizedRequirements } =
      await normalizeForMatching({ listings, requests: requirements });

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

    const prompt = `
STANDARDIZED LISTINGS (Vendor Supply):
${JSON.stringify(normalizedListings, null, 2)}

WEIGHTED REQUIREMENTS (Buyer Demand):
${JSON.stringify(normalizedRequirements, null, 2)}
`;

    const response = await client.addMessage(thread.threadId, {
      content: prompt,
      llm_provider: MATCHING_PROVIDER,
      model_name: MATCHING_MODEL,
      stream: false,
    }) as MessageResponse;

    // Debug: log full response shape so we can diagnose model behaviour
    console.log('[MatchingAgent] status:', response.status);
    console.log('[MatchingAgent] toolCalls:', JSON.stringify(response.toolCalls ?? null));
    console.log('[MatchingAgent] content:', response.content?.slice(0, 500));

    const proposedMatches = [];

    // ── Path A: Model called the tool (OpenAI, Claude, some Gemini configs) ──
    if (response.status === 'REQUIRES_ACTION' && response.toolCalls) {
      const toolOutputs = [];

      for (const tc of response.toolCalls) {
        if (tc.function.name === 'propose_match') {
          const args = tc.function.parsedArguments as any;
          const match = await handleProposedMatch(args);
          proposedMatches.push(match);
          toolOutputs.push({ tool_call_id: tc.id, output: JSON.stringify({ success: true, matchId: match.id }) });
        }
      }

      await client.submitToolOutputs(thread.threadId, response.runId!, toolOutputs);
    }

    // ── Path B: Model returned text instead of a tool call (Gemini fallback) ──
    // Parse whatever JSON the model produced directly from its text response.
    if (proposedMatches.length === 0 && response.content) {
      try {
        // Strip markdown code fences if present
        const cleaned = response.content
          .replace(/```json\s*/gi, '')
          .replace(/```\s*/gi, '')
          .trim();

        // Find the first [...] array in the response
        const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          const parsed: any[] = JSON.parse(arrayMatch[0]);
          for (const args of parsed) {
            if (args.vendorId && args.buyerId && args.listingId && args.requestId) {
              const match = await handleProposedMatch(args);
              proposedMatches.push(match);
            }
          }
          if (proposedMatches.length > 0) {
            console.log('[MatchingAgent] Used text-fallback parser, found', proposedMatches.length, 'match(es)');
          }
        }
      } catch (e) {
        console.warn('[MatchingAgent] Text-fallback parse failed:', e);
      }
    }

    // Cleanup ephemeral assistant
    try {
      await client.deleteAssistant(assistant.assistantId);
      await client.deleteThread(thread.threadId);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      matchesFound: proposedMatches.length,
      matches: proposedMatches,
      debug: {
        model: MATCHING_MODEL,
        provider: MATCHING_PROVIDER,
        responseStatus: response.status,
        hadToolCalls: !!(response.toolCalls?.length),
        usedTextFallback: proposedMatches.length > 0 && !response.toolCalls?.length,
      }
    });
  } catch (error: any) {
    console.error('[MatchingAgent] Error:', error);
    return NextResponse.json({ error: error.message ?? 'Internal Server Error' }, { status: 500 });
  }
}
