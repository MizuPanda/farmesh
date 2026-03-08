import { createClient } from '@supabase/supabase-js';
import type { Listing, Match, Request } from '@/types';

type ListingRow = {
  id: string;
  vendor_id: string;
  raw_input: string;
  original_product: string;
  original_price_per_unit: number;
  original_quantity: number;
  original_unit: string;
  status: Listing['status'];
  created_at: string;
  expiration_date: string;
  normalized_product: string | null;
  product_category: string | null;
  canonical_quantity: number | null;
  canonical_unit: string | null;
  canonical_price_per_canonical_unit: number | null;
  assumptions: string[] | null;
};

type RequestRow = {
  id: string;
  buyer_id: string;
  raw_input: string;
  original_product: string;
  original_price_per_unit: number;
  original_quantity: number;
  original_unit: string;
  status: Request['status'];
  created_at: string;
  normalized_product: string | null;
  product_category: string | null;
  canonical_quantity: number | null;
  canonical_unit: string | null;
  canonical_price_per_canonical_unit: number | null;
  needed_date: string | null;
  assumptions: string[] | null;
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

type NormalizationFields = {
  normalizedProduct?: string | null;
  productCategory?: string | null;
  unitFamily?: 'weight' | 'count' | null;
  canonicalQuantity?: number | null;
  canonicalUnit?: 'kg' | 'piece' | null;
  canonicalPricePerCanonicalUnit?: number | null;
  assumptions?: string[] | null;
};

const LISTING_SELECT = [
  'id',
  'vendor_id',
  'raw_input',
  'original_product',
  'original_price_per_unit',
  'original_quantity',
  'original_unit',
  'status',
  'created_at',
  'expiration_date',
  'normalized_product',
  'product_category',
  'canonical_quantity',
  'canonical_unit',
  'canonical_price_per_canonical_unit',
  'assumptions',
].join(',');

const REQUEST_SELECT = [
  'id',
  'buyer_id',
  'raw_input',
  'original_product',
  'original_price_per_unit',
  'original_quantity',
  'original_unit',
  'status',
  'created_at',
  'normalized_product',
  'product_category',
  'canonical_quantity',
  'canonical_unit',
  'canonical_price_per_canonical_unit',
  'needed_date',
  'assumptions',
].join(',');

const MATCH_SELECT = 'id,listing_id,request_id,score,product,reason,status,created_at';

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

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toDbAssumptions(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((entry): entry is string => typeof entry === 'string');
}

function mapListing(row: ListingRow): Listing {
  return {
    id: row.id,
    vendorId: row.vendor_id,
    rawInput: row.raw_input,
    product: row.original_product,
    pricePerUnit: Number(row.original_price_per_unit),
    quantity: Number(row.original_quantity),
    unit: row.original_unit,
    status: row.status,
    createdAt: row.created_at,
    expirationDate: row.expiration_date,
    normalizedProduct: row.normalized_product,
    productCategory: row.product_category,
    canonicalQuantity: toNullableNumber(row.canonical_quantity),
    canonicalUnit: (row.canonical_unit as Listing['canonicalUnit']) ?? null,
    canonicalPricePerCanonicalUnit: toNullableNumber(row.canonical_price_per_canonical_unit),
    assumptions: row.assumptions,
  };
}

function mapRequest(row: RequestRow): Request {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    rawInput: row.raw_input,
    product: row.original_product,
    pricePerUnit: Number(row.original_price_per_unit),
    quantity: Number(row.original_quantity),
    unit: row.original_unit,
    status: row.status,
    createdAt: row.created_at,
    neededDate: row.needed_date,
    normalizedProduct: row.normalized_product,
    productCategory: row.product_category,
    canonicalQuantity: toNullableNumber(row.canonical_quantity),
    canonicalUnit: (row.canonical_unit as Request['canonicalUnit']) ?? null,
    canonicalPricePerCanonicalUnit: toNullableNumber(row.canonical_price_per_canonical_unit),
    assumptions: row.assumptions,
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

function normalizationToDbColumns(fields: NormalizationFields) {
  return {
    normalized_product: fields.normalizedProduct ?? null,
    product_category: fields.productCategory ?? null,
    canonical_quantity: toNullableNumber(fields.canonicalQuantity),
    canonical_unit: fields.canonicalUnit ?? null,
    canonical_price_per_canonical_unit: toNullableNumber(fields.canonicalPricePerCanonicalUnit),
    assumptions: toDbAssumptions(fields.assumptions),
  };
}

export async function getListings(): Promise<Listing[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch listings: ${error.message}`);
  return ((data ?? []) as unknown as ListingRow[]).map(mapListing);
}

export async function getListingsByVendor(vendorId: string): Promise<Listing[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch vendor listings: ${error.message}`);
  return ((data ?? []) as unknown as ListingRow[]).map(mapListing);
}

export async function insertListing(listing: Listing): Promise<Listing> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('listings')
    .insert({
      id: listing.id,
      vendor_id: listing.vendorId,
      raw_input: listing.rawInput,
      original_product: listing.product,
      original_price_per_unit: listing.pricePerUnit,
      original_quantity: listing.quantity,
      original_unit: listing.unit,
      status: listing.status,
      created_at: listing.createdAt,
      expiration_date: listing.expirationDate,
      ...normalizationToDbColumns(listing),
    })
    .select(LISTING_SELECT)
    .single();

  if (error) throw new Error(`Failed to insert listing: ${error.message}`);
  return mapListing(data as unknown as ListingRow);
}

export async function updateListingStatus(id: string, status: Listing['status']): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('listings')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update listing status: ${error.message}`);
}

export async function updateListingNormalization(id: string, fields: NormalizationFields): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('listings')
    .update(normalizationToDbColumns(fields))
    .eq('id', id);

  if (error) throw new Error(`Failed to update listing normalization: ${error.message}`);
}

export async function getRequests(): Promise<Request[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('requests')
    .select(REQUEST_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch requests: ${error.message}`);
  return ((data ?? []) as unknown as RequestRow[]).map(mapRequest);
}

export async function getRequestsByBuyer(buyerId: string): Promise<Request[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('requests')
    .select(REQUEST_SELECT)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Failed to fetch buyer requests: ${error.message}`);
  return ((data ?? []) as unknown as RequestRow[]).map(mapRequest);
}

export async function insertRequest(request: Request): Promise<Request> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('requests')
    .insert({
      id: request.id,
      buyer_id: request.buyerId,
      raw_input: request.rawInput,
      original_product: request.product,
      original_price_per_unit: request.pricePerUnit,
      original_quantity: request.quantity,
      original_unit: request.unit,
      status: request.status,
      created_at: request.createdAt,
      needed_date: request.neededDate ?? null,
      ...normalizationToDbColumns(request),
    })
    .select(REQUEST_SELECT)
    .single();

  if (error) throw new Error(`Failed to insert request: ${error.message}`);
  return mapRequest(data as unknown as RequestRow);
}

export async function updateRequestStatus(id: string, status: Request['status']): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('requests')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update request status: ${error.message}`);
}

export async function updateRequestNormalization(id: string, fields: NormalizationFields): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('requests')
    .update(normalizationToDbColumns(fields))
    .eq('id', id);

  if (error) throw new Error(`Failed to update request normalization: ${error.message}`);
}

export async function getMatches(): Promise<Match[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('matches')
    .select(MATCH_SELECT)
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
    .select(MATCH_SELECT)
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
    .select(MATCH_SELECT)
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
    .select(MATCH_SELECT)
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
