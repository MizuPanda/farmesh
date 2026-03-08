import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  deleteMatchesByRequestId,
  deleteRequestById,
  getRequestById,
  hasActiveMatchesForListing,
  updateListingStatus,
} from "@/lib/db";

// DELETE /api/requests/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const request = await getRequestById(id);
    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (request.buyerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const removed = await deleteMatchesByRequestId(id);
    await Promise.all(
      removed.listingIds.map(async (listingId) => {
        const hasActive = await hasActiveMatchesForListing(listingId);
        await updateListingStatus(listingId, hasActive ? "MATCHED" : "OPEN");
      })
    );
    await deleteRequestById(id);

    return NextResponse.json({
      success: true,
      removedMatches: removed.count,
      requestId: id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
