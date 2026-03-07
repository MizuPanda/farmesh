import { NextRequest, NextResponse } from 'next/server';
import { insertRequest, getRequests, getRequestsByBuyer } from '@/lib/db';
import { Request } from '@/types';

// GET /api/requests?buyerId=b1
export async function GET(req: NextRequest) {
  const buyerId = req.nextUrl.searchParams.get('buyerId');
  const requests = buyerId
    ? await getRequestsByBuyer(buyerId)
    : await getRequests();
  return NextResponse.json(requests);
}

// POST /api/requests
export async function POST(req: NextRequest) {
  const body = await req.json();
  const request: Request = {
    id: `r_${Date.now()}`,
    buyerId: body.buyerId ?? 'b1', // in production, pull from auth session
    rawInput: body.rawInput ?? '',
    product: body.product,
    quantity: Number(body.quantity),
    unit: body.unit ?? 'lb',
    pricePerUnit: Number(body.pricePerUnit ?? 0),
    status: 'OPEN',
    createdAt: new Date().toISOString().split('T')[0],
  };
  const created = await insertRequest(request);
  return NextResponse.json(created, { status: 201 });
}
