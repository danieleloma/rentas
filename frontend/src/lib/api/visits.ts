import { supabase } from '@/lib/supabase';
import type { Visit } from '@/types';

const VISIT_QUERY = `
  id, listing_id, renter_id, landlord_id, scheduled_at, end_at,
  viewing_type, status, note, actual_start, actual_end, created_at, updated_at,
  listing:listings ( id, title, address, city ),
  renter:users!renter_id ( id, first_name, last_name, avatar_url ),
  landlord:users!landlord_id ( id, first_name, last_name, avatar_url )
` as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVisit(row: any): Visit {
  return {
    id: row.id,
    listing: {
      id: row.listing?.id ?? row.listing_id,
      title: row.listing?.title ?? '',
      address: row.listing?.address ?? '',
      city: row.listing?.city ?? '',
    },
    renter: {
      id: row.renter?.id ?? row.renter_id,
      firstName: row.renter?.first_name ?? '',
      lastName: row.renter?.last_name ?? '',
      avatarUrl: row.renter?.avatar_url ?? undefined,
    },
    landlord: {
      id: row.landlord?.id ?? row.landlord_id,
      firstName: row.landlord?.first_name ?? '',
      lastName: row.landlord?.last_name ?? '',
      avatarUrl: row.landlord?.avatar_url ?? undefined,
    },
    scheduledAt: row.scheduled_at,
    endAt: row.end_at ?? undefined,
    viewingType: row.viewing_type,
    status: row.status,
    note: row.note ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getVisitsApi(page = 1) {
  const limit = 20;
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('visits')
    .select(VISIT_QUERY, { count: 'exact' })
    .order('scheduled_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    success: true,
    data: (data ?? []).map(mapVisit),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function createVisitApi(payload: {
  listingId: string;
  scheduledAt: string;
  viewingType?: string;
  note?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Look up the listing's landlord
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('landlord_id')
    .eq('id', payload.listingId)
    .single();

  if (listingError) throw new Error(listingError.message);

  const { data, error } = await supabase
    .from('visits')
    .insert({
      id: crypto.randomUUID(),
      listing_id: payload.listingId,
      renter_id: user.id,
      landlord_id: listing.landlord_id,
      scheduled_at: payload.scheduledAt,
      viewing_type: payload.viewingType ?? 'in_person',
      note: payload.note ?? null,
      status: 'pending',
    })
    .select(VISIT_QUERY)
    .single();

  if (error) throw new Error(error.message);
  return mapVisit(data);
}

export async function updateVisitStatusApi(id: string, status: string) {
  const { data, error } = await supabase
    .from('visits')
    .update({ status })
    .eq('id', id)
    .select(VISIT_QUERY)
    .single();

  if (error) throw new Error(error.message);
  return mapVisit(data);
}

export async function cancelVisitApi(id: string) {
  return updateVisitStatusApi(id, 'cancelled');
}
