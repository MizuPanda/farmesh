import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  deleteMatchById,
  getMatchByIdWithDetails,
  hasActiveMatchesForListing,
  hasActiveMatchesForRequest,
  updateListingStatus,
  updateMatchStatus,
  updateRequestStatus,
} from "@/lib/db";
import type { MatchStatus } from "@/types";

const VALID_MATCH_STATUSES: MatchStatus[] = [
  "PROPOSED",
  "AWAITING_CONFIRMATION",
  "CONFIRMED",
  "REJECTED",
];

function isValidMatchStatus(value: string): value is MatchStatus {
  return VALID_MATCH_STATUSES.includes(value as MatchStatus);
}

function isAuthorizedForMatch(userId: string, match: NonNullable<Awaited<ReturnType<typeof getMatchByIdWithDetails>>>) {
  const vendorId = match.listing?.vendorId;
  const buyerId = match.request?.buyerId;
  return userId === vendorId || userId === buyerId;
}

async function resolveAuthorizedMatch(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) } as const;
  }

  const match = await getMatchByIdWithDetails(id);
  if (!match) {
    return { error: NextResponse.json({ error: "Match not found" }, { status: 404 }) } as const;
  }

  if (!isAuthorizedForMatch(user.id, match)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) } as const;
  }

  return { user, match } as const;
}

async function reconcileStatuses(listingId: string, requestId: string) {
  const [hasListingMatch, hasRequestMatch] = await Promise.all([
    hasActiveMatchesForListing(listingId),
    hasActiveMatchesForRequest(requestId),
  ]);

  await Promise.all([
    updateListingStatus(listingId, hasListingMatch ? "MATCHED" : "OPEN"),
    updateRequestStatus(requestId, hasRequestMatch ? "MATCHED" : "OPEN"),
  ]);
}

// PATCH /api/matches/[id]  { status: "CONFIRMED" | "REJECTED" | ... }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await resolveAuthorizedMatch(id);
    if ("error" in authResult) return authResult.error;

    const body = (await req.json().catch(() => ({}))) as { status?: string };
    const status = body.status;

    if (typeof status !== "string" || !isValidMatchStatus(status)) {
      return NextResponse.json({ error: "Invalid match status" }, { status: 400 });
    }

    await updateMatchStatus(id, status);
    const listingId = authResult.match.listingId;
    const requestId = authResult.match.requestId;
    if (status === "REJECTED") {
      await reconcileStatuses(listingId, requestId);
    }

    return NextResponse.json({ success: true, matchId: id, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/matches/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await resolveAuthorizedMatch(id);
    if ("error" in authResult) return authResult.error;

    const listingId = authResult.match.listingId;
    const requestId = authResult.match.requestId;

    await deleteMatchById(id);
    await reconcileStatuses(listingId, requestId);

    return NextResponse.json({ success: true, matchId: id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
