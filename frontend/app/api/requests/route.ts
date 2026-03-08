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
  if (typeof body.product !== 'string' || body.product.trim().length === 0) {
    return NextResponse.json({ error: 'product is required' }, { status: 400 });
  }

  const quantity = Number(body.quantity);
  const pricePerUnit = Number(body.pricePerUnit ?? 0);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'quantity must be a positive number' }, { status: 400 });
  }
  if (!Number.isFinite(pricePerUnit) || pricePerUnit < 0) {
    return NextResponse.json({ error: 'pricePerUnit must be a non-negative number' }, { status: 400 });
  }

  const rawNeededDate = typeof body.neededDate === 'string'
    ? body.neededDate
    : typeof body.requiredBy === 'string'
      ? body.requiredBy
      : '';
  const parsedNeededDate = rawNeededDate
    ? new Date(rawNeededDate)
    : null;
  const neededDate = parsedNeededDate && !Number.isNaN(parsedNeededDate.getTime())
    ? parsedNeededDate.toISOString()
    : null;

  const request: Request = {
    id: crypto.randomUUID(),
    buyerId: body.buyerId,
    rawInput: body.rawInput ?? '',
    product: body.product.trim(),
    quantity,
    unit: body.unit ?? 'lb',
    pricePerUnit,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    neededDate,
  };
  const created = await insertRequest(request);
  return NextResponse.json(created, { status: 201 });
}
