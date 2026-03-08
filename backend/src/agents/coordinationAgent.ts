import { BackboardClient } from "backboard-sdk";
import { insertMatch, updateListingStatus, updateRequestStatus } from "@/lib/db";
import type { Match } from "@/types";

const COORDINATION_FEEDBACK_MODEL =
  process.env.COORDINATION_FEEDBACK_MODEL ??
  process.env.MATCHING_MODEL ??
  "gemini-2.5-flash";

const COORDINATION_FEEDBACK_PROVIDER =
  process.env.COORDINATION_FEEDBACK_PROVIDER ??
  process.env.MATCHING_PROVIDER ??
  "google";

export type CoordinationFrontendEvent = {
  matchId: string;
  vendorId: string;
  buyerId: string;
  listingId: string;
  requestId: string;
  product: string;
  quantity: number;
  score: number;
  status: Match["status"];
  createdAt: string;
  summary: string;
};

function buildFrontendEvent(
  match: Match,
  args: {
    vendorId: string;
    buyerId: string;
    listingId: string;
    requestId: string;
    product: string;
    quantity: number;
    score: number;
    reason: string;
  }
): CoordinationFrontendEvent {
  return {
    matchId: match.id,
    vendorId: args.vendorId,
    buyerId: args.buyerId,
    listingId: args.listingId,
    requestId: args.requestId,
    product: args.product,
    quantity: args.quantity,
    score: args.score,
    status: match.status,
    createdAt: match.createdAt,
    summary: `Proposed ${args.product} (${args.quantity}) at ${Math.round(args.score)}% score.`,
  };
}

async function sendMatchFeedbackToBackboard(
  match: Match,
  args: {
    vendorId: string;
    buyerId: string;
    listingId: string;
    requestId: string;
    product: string;
    quantity: number;
    score: number;
    reason: string;
  }
) {
  const apiKey = process.env.BACKBOARD_API_KEY;
  if (!apiKey) return;

  const client = new BackboardClient({ apiKey });

  let assistantId: string | null = null;
  let threadId: string | null = null;

  try {
    const assistant = await client.createAssistant({
      name: "Farmesh Match Feedback Agent",
      system_prompt: `You are the Farmesh Match Feedback Agent.

Your only job is to store and recall match outcomes between vendors and buyers for future normalization and matching.

Every message you receive will be a summary of a proposed match. Use memory to remember:
- Which vendor and buyer were involved.
- What product and quantity were proposed.
- The score and reason.
- The status of the match.

Keep responses short. Memory retention is the priority.`,
    });
    assistantId = assistant.assistantId;

    const thread = await client.createThread(assistant.assistantId);
    threadId = thread.threadId;

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
    ].join("\n");

    await client.addMessage(thread.threadId, {
      content,
      llm_provider: COORDINATION_FEEDBACK_PROVIDER,
      model_name: COORDINATION_FEEDBACK_MODEL,
      memory: "Auto",
      stream: false,
    });
  } catch (error) {
    console.warn("[CoordinationAgent] Failed to send match feedback to Backboard:", error);
  } finally {
    try {
      if (assistantId) {
        await client.deleteAssistant(assistantId);
      }
      if (threadId) {
        await client.deleteThread(threadId);
      }
    } catch {
      // Best-effort cleanup only.
    }
  }
}

/**
 * Coordination Agent — persists proposed matches and advances listing/request status.
 */
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
  const coordinated = await coordinateProposedMatch(args);
  return coordinated.match;
}

export async function coordinateProposedMatch(args: {
  vendorId: string;
  buyerId: string;
  listingId: string;
  requestId: string;
  product: string;
  quantity: number;
  score: number;
  reason: string;
}): Promise<{
  match: Match;
  frontendEvent: CoordinationFrontendEvent;
}> {
  const match: Match = {
    id: crypto.randomUUID(),
    listingId: args.listingId,
    requestId: args.requestId,
    score: args.score,
    product: args.product,
    reason: args.reason,
    status: "PROPOSED",
    createdAt: new Date().toISOString(),
  };

  const insertedMatch = await insertMatch(match);
  await updateListingStatus(args.listingId, "MATCHED");
  await updateRequestStatus(args.requestId, "MATCHED");

  void sendMatchFeedbackToBackboard(insertedMatch, args);

  return {
    match: insertedMatch,
    frontendEvent: buildFrontendEvent(insertedMatch, args),
  };
}
