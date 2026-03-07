import { NextRequest, NextResponse } from 'next/server';
import { BackboardClient, type MessageResponse } from 'backboard-sdk';
import { handleProposedMatch } from '@/lib/coordinationAgent';
import { getListings, getRequests } from '@/lib/db';

/**
 * MODEL SELECTION NOTE:
 * - gpt-4o: Best balance of speed + reasoning for matching logic. Recommended for production.
 * - o3-mini: Better for complex multi-constraint reasoning (pricing, substitutions, quantities).
 *   Use if match quality needs improvement. Slower + costs more.
 * - claude-3-5-sonnet-20241022: Excellent alternative via Backboard's multi-provider routing.
 *
 * Change MATCHING_MODEL below to experiment. gpt-4o is the default.
 */
const MATCHING_MODEL = process.env.MATCHING_MODEL ?? 'gpt-4o';
const MATCHING_PROVIDER = process.env.MATCHING_PROVIDER ?? 'openai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.BACKBOARD_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing BACKBOARD_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    // Allow caller to override listings/requirements, or pull live from DB
    const body = await req.json().catch(() => ({}));
    const listings = body.listings ?? (await getListings()).filter((l) => l.status === 'OPEN');
    const requirements = body.requirements ?? (await getRequests()).filter((r) => r.status === 'OPEN');

    if (listings.length === 0 || requirements.length === 0) {
      return NextResponse.json({ success: false, message: 'No open listings or requests to match.' });
    }

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
3. For EACH valid match found, call the propose_match tool once.
4. Only call propose_match for genuine matches. Do NOT call it for poor matches.
5. Do NOT produce any conversational text — only tool calls.`,
      tools: [proposeMatchTool],
    });

    const thread = await client.createThread(assistant.assistantId);

    const prompt = `
STANDARDIZED LISTINGS (Vendor Supply):
${JSON.stringify(listings, null, 2)}

WEIGHTED REQUIREMENTS (Buyer Demand):
${JSON.stringify(requirements, null, 2)}
`;

    const response = await client.addMessage(thread.threadId, {
      content: prompt,
      llm_provider: MATCHING_PROVIDER,
      model_name: MATCHING_MODEL,
      stream: false,
    }) as MessageResponse;

    const proposedMatches = [];

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

    // Cleanup ephemeral assistant
    try {
      await client.deleteAssistant(assistant.assistantId);
      await client.deleteThread(thread.threadId);
    } catch (_) {}

    return NextResponse.json({
      success: true,
      matchesFound: proposedMatches.length,
      matches: proposedMatches,
    });
  } catch (error: any) {
    console.error('[MatchingAgent] Error:', error);
    return NextResponse.json({ error: error.message ?? 'Internal Server Error' }, { status: 500 });
  }
}
