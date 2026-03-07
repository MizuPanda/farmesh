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
  const listing: Listing = {
    id: `l_${Date.now()}`,
    vendorId: body.vendorId ?? 'f1', // in production, pull from auth session
    rawInput: body.rawInput ?? '',
    product: body.product,
    quantity: Number(body.quantity),
    unit: body.unit ?? 'lb',
    pricePerUnit: Number(body.pricePerUnit),
    status: 'OPEN',
    createdAt: new Date().toISOString().split('T')[0],
    expirationDate: body.expirationDate ?? '',
  };
  const created = await insertListing(listing);
  return NextResponse.json(created, { status: 201 });
}
