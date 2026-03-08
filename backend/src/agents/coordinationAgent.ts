import { Match } from '@/types';
import { insertMatch, updateListingStatus, updateRequestStatus } from '@/lib/db';

/**
 * Coordination Agent — receives a proposed match from the Backboard Matching Agent.
 * Persistence is handled in lib/db.ts (currently Supabase-backed).
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
  const match: Match = {
    id: crypto.randomUUID(),
    listingId: args.listingId,
    requestId: args.requestId,
    score: args.score,
    product: args.product,
    reason: args.reason,
    status: 'PROPOSED',
    createdAt: new Date().toISOString(),
  };

  await insertMatch(match);
  await updateListingStatus(args.listingId, 'MATCHED');
  await updateRequestStatus(args.requestId, 'MATCHED');

  console.log('[CoordinationAgent] Match proposed and persisted:', match.id);
  return match;
}
