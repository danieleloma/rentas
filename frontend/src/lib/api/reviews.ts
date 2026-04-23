import { supabase } from '@/lib/supabase';
import type { Review, ReviewTag } from '@/types';

const REVIEW_QUERY = `
  id, listing_id, renter_id, overall_rating, neighborhood_rating, noise_rating,
  maintenance_rating, amenities_rating, comment, pros, cons, tags,
  landlord_response, response_at, is_verified, created_at,
  renter:users!renter_id ( id, first_name, last_name, avatar_url )
` as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReview(row: any): Review {
  return {
    id: row.id,
    listingId: row.listing_id,
    renterId: row.renter_id,
    overallRating: row.overall_rating,
    neighborhoodRating: row.neighborhood_rating ?? undefined,
    noiseRating: row.noise_rating ?? undefined,
    maintenanceRating: row.maintenance_rating ?? undefined,
    amenitiesRating: row.amenities_rating ?? undefined,
    comment: row.comment,
    pros: row.pros ?? [],
    cons: row.cons ?? [],
    tags: (row.tags ?? []) as ReviewTag[],
    landlordResponse: row.landlord_response ?? undefined,
    responseAt: row.response_at ?? undefined,
    isVerified: row.is_verified,
    createdAt: row.created_at,
    renter: row.renter
      ? {
          id: row.renter.id,
          firstName: row.renter.first_name,
          lastName: row.renter.last_name,
          avatarUrl: row.renter.avatar_url ?? undefined,
        }
      : undefined,
  };
}

export async function getListingReviewsApi(listingId: string, page = 1) {
  const limit = 10;
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('reviews')
    .select(REVIEW_QUERY, { count: 'exact' })
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map(mapReview),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

interface CreateReviewPayload {
  overallRating: number;
  comment: string;
  tags?: ReviewTag[];
  pros?: string[];
  cons?: string[];
  neighborhoodRating?: number;
  noiseRating?: number;
}

export async function createReviewApi(listingId: string, payload: CreateReviewPayload) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      listing_id: listingId,
      renter_id: session.user.id,
      overall_rating: payload.overallRating,
      comment: payload.comment,
      tags: payload.tags ?? [],
      pros: payload.pros ?? [],
      cons: payload.cons ?? [],
      neighborhood_rating: payload.neighborhoodRating ?? null,
      noise_rating: payload.noiseRating ?? null,
    })
    .select(REVIEW_QUERY)
    .single();

  if (error) throw new Error(error.message);
  return mapReview(data);
}

export async function respondToReviewApi(reviewId: string, response: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .update({ landlord_response: response, response_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select(REVIEW_QUERY)
    .single();

  if (error) throw new Error(error.message);
  return mapReview(data);
}

export async function flagReviewApi(reviewId: string, reason: string, notes?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase.from('review_flags').insert({
    review_id: reviewId,
    reporter_id: session.user.id,
    reason,
    notes: notes ?? null,
    status: 'pending',
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function createReportApi(listingId: string, category: string, description?: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { error } = await supabase.from('reports').insert({
    listing_id: listingId,
    reporter_id: session.user.id,
    category,
    description: description ?? null,
    evidence_urls: [],
    status: 'new',
  });

  if (error) throw new Error(error.message);
  return { success: true };
}
