import { NextRequest, NextResponse } from 'next/server';
import { updateMatchStatus } from '@/lib/db';
import { MatchStatus } from '@/types';

// PATCH /api/matches/[id]  { status: "CONFIRMED" | "REJECTED" | ... }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const status: MatchStatus = body.status;
  await updateMatchStatus(id, status);
  return NextResponse.json({ success: true });
}
