import { NextRequest, NextResponse } from 'next/server';
import { insertListing, getListings, getListingsByVendor } from '@/lib/db';
import { Listing } from '@/types';

// GET /api/listings?vendorId=f1
export async function GET(req: NextRequest) {
  const vendorId = req.nextUrl.searchParams.get('vendorId');
  const listings = vendorId
    ? await getListingsByVendor(vendorId)
    : await getListings();
  return NextResponse.json(listings);
}

// POST /api/listings
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (typeof body.vendorId !== 'string' || body.vendorId.length === 0) {
    return NextResponse.json({ error: 'vendorId is required' }, { status: 400 });
  }
  if (typeof body.product !== 'string' || body.product.trim().length === 0) {
    return NextResponse.json({ error: 'product is required' }, { status: 400 });
  }

  const quantity = Number(body.quantity);
  const pricePerUnit = Number(body.pricePerUnit);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return NextResponse.json({ error: 'quantity must be a positive number' }, { status: 400 });
  }
  if (!Number.isFinite(pricePerUnit) || pricePerUnit < 0) {
    return NextResponse.json({ error: 'pricePerUnit must be a non-negative number' }, { status: 400 });
  }

  const listing: Listing = {
    id: crypto.randomUUID(),
    vendorId: body.vendorId,
    rawInput: body.rawInput ?? '',
    product: body.product.trim(),
    quantity,
    unit: body.unit ?? 'lb',
    pricePerUnit,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    expirationDate: body.expirationDate
      ? new Date(body.expirationDate).toISOString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  const created = await insertListing(listing);
  return NextResponse.json(created, { status: 201 });
}
