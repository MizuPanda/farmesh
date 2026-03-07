import { createClient } from '@supabase/supabase-js';
import type { Listing, Match, Request } from '@/types';

type ListingRow = {
  id: string;
  vendor_id: string;
  raw_input: string;
  product: string;
  price_per_unit: number;
  quantity: number;
  unit: string;
  status: Listing['status'];
  created_at: string;
  expiration_date: string;
};

type RequestRow = {
  id: string;
  buyer_id: string;
  raw_input: string;
  product: string;
  price_per_unit: number;
  quantity: number;
  unit: string;
  status: Request['status'];
  created_at: string;
};

type MatchRow = {
  id: string;
  listing_id: string;
  request_id: string;
  score: number;
  product: string;
  reason: string;
  status: Match['status'];
  created_at: string;
};

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in frontend/.env.local');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function mapListing(row: ListingRow): Listing {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    rawInput: row.raw_input,
    product: row.product,
    pricePerUnit: Number(row.price_per_unit),
    quantity: Number(row.quantity),
    unit: row.unit,
    status: row.status,
    createdAt: row.created_at,
    expirationDate: row.expiration_date,
  };
}

function mapRequest(row: RequestRow): Request {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    rawInput: row.raw_input,
    product: row.product,
    pricePerUnit: Number(row.price_per_unit),
    quantity: Number(row.quantity),
    unit: row.unit,
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapMatch(row: MatchRow): Match {
  return {
    id: row.id,
    listingId: row.listing_id,
    requestId: row.request_id,
    score: Number(row.score),
    product: row.product,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function getListings(): Promise<Listing[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('listings')
    .select('id,vendor_id,raw_input,product,price_per_unit,quantity,unit,status,created_at,expiration_date')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch listings: ${error.message}`);
  return ((data ?? []) as ListingRow[]).map(mapListing);
}

export async function getListingsByVendor(vendorId: string): Promise<Listing[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('listings')
    .select('id,vendor_id,raw_input,product,price_per_unit,quantity,unit,status,created_at,expiration_date')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch vendor listings: ${error.message}`);
  return ((data ?? []) as ListingRow[]).map(mapListing);
}

export async function insertListing(listing: Listing): Promise<Listing> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('listings')
    .insert({
      id: listing.id,
      vendor_id: listing.vendorId,
      raw_input: listing.rawInput,
      product: listing.product,
      price_per_unit: listing.pricePerUnit,
      quantity: listing.quantity,
      unit: listing.unit,
      status: listing.status,
      created_at: listing.createdAt,
      expiration_date: listing.expirationDate,
    })
    .select('id,vendor_id,raw_input,product,price_per_unit,quantity,unit,status,created_at,expiration_date')
    .single();

  if (error) throw new Error(`Failed to insert listing: ${error.message}`);
  return mapListing(data as ListingRow);
}

export async function updateListingStatus(id: string, status: Listing['status']): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update listing status: ${error.message}`);
}

export async function getRequests(): Promise<Request[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('requests')
    .select('id,buyer_id,raw_input,product,price_per_unit,quantity,unit,status,created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch requests: ${error.message}`);
  return ((data ?? []) as RequestRow[]).map(mapRequest);
}

export async function getRequestsByBuyer(buyerId: string): Promise<Request[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('requests')
    .select('id,buyer_id,raw_input,product,price_per_unit,quantity,unit,status,created_at')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch buyer requests: ${error.message}`);
  return ((data ?? []) as RequestRow[]).map(mapRequest);
}

export async function insertRequest(request: Request): Promise<Request> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('requests')
    .insert({
      id: request.id,
      buyer_id: request.buyerId,
      raw_input: request.rawInput,
      product: request.product,
      price_per_unit: request.pricePerUnit,
      quantity: request.quantity,
      unit: request.unit,
      status: request.status,
      created_at: request.createdAt,
    })
    .select('id,buyer_id,raw_input,product,price_per_unit,quantity,unit,status,created_at')
    .single();

  if (error) throw new Error(`Failed to insert request: ${error.message}`);
  return mapRequest(data as RequestRow);
}

export async function updateRequestStatus(id: string, status: Request['status']): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update request status: ${error.message}`);
}

export async function getMatches(): Promise<Match[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('matches')
    .select('id,listing_id,request_id,score,product,reason,status,created_at')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch matches: ${error.message}`);
  return ((data ?? []) as MatchRow[]).map(mapMatch);
}

export async function getMatchesByVendor(vendorId: string): Promise<Match[]> {
  const supabase = getSupabaseAdminClient();

  const { data: listingRows, error: listingError } = await supabase
    .from('listings')
    .select('id')
    .eq('vendor_id', vendorId);

  if (listingError) throw new Error(`Failed to fetch vendor listings for matches: ${listingError.message}`);

  const listingIds = (listingRows ?? []).map((row) => row.id as string);
  if (listingIds.length === 0) return [];

  const { data, error } = await supabase
    .from('matches')
    .select('id,listing_id,request_id,score,product,reason,status,created_at')
    .in('listing_id', listingIds)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch vendor matches: ${error.message}`);
  return ((data ?? []) as MatchRow[]).map(mapMatch);
}

export async function getMatchesByBuyer(buyerId: string): Promise<Match[]> {
  const supabase = getSupabaseAdminClient();

  const { data: requestRows, error: requestError } = await supabase
    .from('requests')
    .select('id')
    .eq('buyer_id', buyerId);

  if (requestError) throw new Error(`Failed to fetch buyer requests for matches: ${requestError.message}`);

  const requestIds = (requestRows ?? []).map((row) => row.id as string);
  if (requestIds.length === 0) return [];

  const { data, error } = await supabase
    .from('matches')
    .select('id,listing_id,request_id,score,product,reason,status,created_at')
    .in('request_id', requestIds)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch buyer matches: ${error.message}`);
  return ((data ?? []) as MatchRow[]).map(mapMatch);
}

export async function insertMatch(match: Match): Promise<Match> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('matches')
    .insert({
      id: match.id,
      listing_id: match.listingId,
      request_id: match.requestId,
      score: match.score,
      product: match.product,
      reason: match.reason,
      status: match.status,
      created_at: match.createdAt,
    })
    .select('id,listing_id,request_id,score,product,reason,status,created_at')
    .single();

  if (error) throw new Error(`Failed to insert match: ${error.message}`);
  return mapMatch(data as MatchRow);
}

export async function updateMatchStatus(id: string, status: Match['status']): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update match status: ${error.message}`);
}
