import { NextRequest, NextResponse } from 'next/server';
import { getMatches, getMatchesByVendor, getMatchesByBuyer } from '@/lib/db';

// GET /api/matches?vendorId=f1  OR  ?buyerId=b1  OR  no params (all)
export async function GET(req: NextRequest) {
  const vendorId = req.nextUrl.searchParams.get('vendorId');
  const buyerId = req.nextUrl.searchParams.get('buyerId');

  if (vendorId) {
    return NextResponse.json(await getMatchesByVendor(vendorId));
  }
  if (buyerId) {
    return NextResponse.json(await getMatchesByBuyer(buyerId));
  }
  return NextResponse.json(await getMatches());
}
