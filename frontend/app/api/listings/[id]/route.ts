import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  deleteListingById,
  deleteMatchesByListingId,
  getListingById,
  hasActiveMatchesForRequest,
  updateRequestStatus,
} from "@/lib/db";

// DELETE /api/listings/[id]
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

    const listing = await getListingById(id);
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.vendorId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const removed = await deleteMatchesByListingId(id);
    await Promise.all(
      removed.requestIds.map(async (requestId) => {
        const hasActive = await hasActiveMatchesForRequest(requestId);
        await updateRequestStatus(requestId, hasActive ? "MATCHED" : "OPEN");
      })
    );
    await deleteListingById(id);

    return NextResponse.json({
      success: true,
      removedMatches: removed.count,
      listingId: id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
