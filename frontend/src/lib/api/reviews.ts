import { supabase } from '@/lib/supabase';
import type { Review } from '@/types';

const REVIEW_QUERY = `
  id, listing_id, renter_id, overall_rating, neighborhood_rating, noise_rating,
  maintenance_rating, amenities_rating, comment, pros, cons,
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
