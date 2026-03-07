/**
 * lib/db.ts — Data layer adapter
 *
 * This file is the single source of truth for all data access.
 * Currently backed by a local JSON file at data/store.json.
 *
 * TO SWAP TO SUPABASE:
 *   1. Install: npm install @supabase/supabase-js
 *   2. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local
 *   3. Replace each function body with the appropriate Supabase query.
 *      The function signatures stay the same — no calling code needs to change.
 */

import fs from 'fs';
import path from 'path';
import { Listing, Match, Request } from '@/types';

// ─── JSON File Store (replace this block with Supabase client init) ───────────

const STORE_PATH = path.join(process.cwd(), 'data', 'store.json');

type Store = {
  listings: Listing[];
  requests: Request[];
  matches: Match[];
};

function readStore(): Store {
  const raw = fs.readFileSync(STORE_PATH, 'utf-8');
  return JSON.parse(raw) as Store;
}

function writeStore(store: Store): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── Listings ─────────────────────────────────────────────────────────────────

export async function getListings(): Promise<Listing[]> {
  // SUPABASE: const { data } = await supabase.from('listings').select('*'); return data ?? [];
  return readStore().listings;
}

export async function getListingsByVendor(vendorId: string): Promise<Listing[]> {
  // SUPABASE: const { data } = await supabase.from('listings').select('*').eq('vendorId', vendorId); return data ?? [];
  return readStore().listings.filter((l) => l.vendorId === vendorId);
}

export async function insertListing(listing: Listing): Promise<Listing> {
  // SUPABASE: const { data } = await supabase.from('listings').insert(listing).select().single(); return data;
  const store = readStore();
  store.listings.push(listing);
  writeStore(store);
  return listing;
}

export async function updateListingStatus(id: string, status: Listing['status']): Promise<void> {
  // SUPABASE: await supabase.from('listings').update({ status }).eq('id', id);
  const store = readStore();
  const listing = store.listings.find((l) => l.id === id);
  if (listing) listing.status = status;
  writeStore(store);
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export async function getRequests(): Promise<Request[]> {
  // SUPABASE: const { data } = await supabase.from('requests').select('*'); return data ?? [];
  return readStore().requests;
}

export async function getRequestsByBuyer(buyerId: string): Promise<Request[]> {
  // SUPABASE: const { data } = await supabase.from('requests').select('*').eq('buyerId', buyerId); return data ?? [];
  return readStore().requests.filter((r) => r.buyerId === buyerId);
}

export async function insertRequest(request: Request): Promise<Request> {
  // SUPABASE: const { data } = await supabase.from('requests').insert(request).select().single(); return data;
  const store = readStore();
  store.requests.push(request);
  writeStore(store);
  return request;
}

export async function updateRequestStatus(id: string, status: Request['status']): Promise<void> {
  // SUPABASE: await supabase.from('requests').update({ status }).eq('id', id);
  const store = readStore();
  const request = store.requests.find((r) => r.id === id);
  if (request) request.status = status;
  writeStore(store);
}

// ─── Matches ──────────────────────────────────────────────────────────────────

export async function getMatches(): Promise<Match[]> {
  // SUPABASE: const { data } = await supabase.from('matches').select('*'); return data ?? [];
  return readStore().matches;
}

export async function getMatchesByVendor(vendorId: string): Promise<Match[]> {
  // SUPABASE: const { data } = await supabase.from('matches').select('*').eq('vendorId', vendorId); return data ?? [];
  const store = readStore();
  const vendorListingIds = store.listings
    .filter((l) => l.vendorId === vendorId)
    .map((l) => l.id);
  return store.matches.filter((m) => vendorListingIds.includes(m.listingId));
}

export async function getMatchesByBuyer(buyerId: string): Promise<Match[]> {
  // SUPABASE: const { data } = await supabase.from('matches').select('*').eq('buyerId', buyerId); return data ?? [];
  const store = readStore();
  const buyerRequestIds = store.requests
    .filter((r) => r.buyerId === buyerId)
    .map((r) => r.id);
  return store.matches.filter((m) => buyerRequestIds.includes(m.requestId));
}

export async function insertMatch(match: Match): Promise<Match> {
  // SUPABASE: const { data } = await supabase.from('matches').insert(match).select().single(); return data;
  const store = readStore();
  store.matches.push(match);
  writeStore(store);
  return match;
}

export async function updateMatchStatus(id: string, status: Match['status']): Promise<void> {
  // SUPABASE: await supabase.from('matches').update({ status }).eq('id', id);
  const store = readStore();
  const match = store.matches.find((m) => m.id === id);
  if (match) match.status = status;
  writeStore(store);
}
