import { BackboardClient } from 'backboard-sdk';
import { Match } from '@/types';
import { insertMatch, updateListingStatus, updateRequestStatus } from '@/lib/db';

/**
 * Coordination Agent — receives a proposed match from the Backboard Matching Agent.
 * Currently persists to data/store.json.
 * TO SWAP TO SUPABASE: update lib/db.ts — this file stays the same.
 */
async function sendMatchFeedbackToBackboard(match: Match, args: {
  vendorId: string;
  buyerId: string;
  listingId: string;
  requestId: string;
  product: string;
  quantity: number;
  score: number;
  reason: string;
}) {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) return;

  try {
    const client = new BackboardClient({ apiKey });

    const assistant = await client.createAssistant({
      name: 'Farmesh Match Feedback Agent',
      system_prompt: `You are the Farmesh Match Feedback Agent.

Your only job is to store and recall match outcomes between vendors and buyers for future normalization and matching.

Every message you receive will be a short summary of a proposed match. Use memory to remember:
- Which vendor and buyer were involved.
- What product, quantity, and units were proposed.
- The model's score and reason.
- The current status of the match (e.g., PROPOSED).

You do not need to respond with anything structured; a brief acknowledgement is enough. The important part is that the information is stored in memory for future use.`,
    });

    const thread = await client.createThread(assistant.assistantId);

    const content = [
      `Match ID: ${match.id}`,
      `Vendor ID: ${args.vendorId}, Buyer ID: ${args.buyerId}`,
      `Listing ID: ${args.listingId}, Request ID: ${args.requestId}`,
      `Product: ${args.product}`,
      `Quantity: ${args.quantity}`,
      `Score: ${args.score}`,
      `Reason: ${args.reason}`,
      `Status: ${match.status}`,
      `CreatedAt: ${match.createdAt}`,
    ].join('\n');

    await client.addMessage(thread.threadId, {
      content,
      llm_provider: 'google',
      model_name: 'gemini-2.5-flash',
      memory: 'Auto',
      stream: false,
    });
  } catch (error) {
    console.warn('[CoordinationAgent] Failed to send match feedback to Backboard:', error);
  }
}

export async function handleProposedMatch(args: {
  vendorId: string;
  buyerId: string;
  listingId: string;
  requestId: string;
  product: string;
  quantity: number;
  score: number;
  reason: string;
}): Promise<Match> {
  const match: Match = {
    id: `m_${Date.now()}`,
    listingId: args.listingId,
    requestId: args.requestId,
    score: args.score,
    product: args.product,
    reason: args.reason,
    status: 'PROPOSED',
    createdAt: new Date().toISOString().split('T')[0],
  };

  await insertMatch(match);
  await updateListingStatus(args.listingId, 'MATCHED');
  await updateRequestStatus(args.requestId, 'MATCHED');

  console.log('[CoordinationAgent] Match proposed and persisted:', match.id);
  void sendMatchFeedbackToBackboard(match, args);
  return match;
}
