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
  if (typeof body.buyerId !== 'string' || body.buyerId.length === 0) {
    return NextResponse.json({ error: 'buyerId is required' }, { status: 400 });
  }

  const request: Request = {
    id: crypto.randomUUID(),
    buyerId: body.buyerId,
    rawInput: body.rawInput ?? '',
    product: body.product,
    quantity: Number(body.quantity),
    unit: body.unit ?? 'lb',
    pricePerUnit: Number(body.pricePerUnit ?? 0),
    status: 'OPEN',
    createdAt: new Date().toISOString(),
  };
  const created = await insertRequest(request);
  return NextResponse.json(created, { status: 201 });
}
