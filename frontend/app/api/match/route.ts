import { NextRequest, NextResponse } from "next/server";
import { runMatchingPipeline } from "@/lib/matchingPipeline";
import type { Listing, Request } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      listings?: Listing[];
      requests?: Request[];
      requirements?: Request[];
    };

    const result = await runMatchingPipeline({
      listings: body.listings,
      requests: body.requests ?? body.requirements,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
