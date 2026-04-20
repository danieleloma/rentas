import { supabase } from '@/lib/supabase';
import type { Mover, MoverBooking } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMover(row: any): Mover {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    logoUrl: row.logo_url ?? undefined,
    description: row.description ?? undefined,
    serviceArea: Array.isArray(row.service_area) ? row.service_area : [],
    services: Array.isArray(row.services) ? row.services : [],
    hourlyRate: row.hourly_rate ? Number(row.hourly_rate) : undefined,
    fixedPrice: row.fixed_price ? Number(row.fixed_price) : undefined,
    insuranceCoverage: row.insurance_coverage ? Number(row.insurance_coverage) : undefined,
    isVerified: row.is_verified,
    isActive: row.is_active,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBooking(row: any): MoverBooking {
  return {
    id: row.id,
    moverId: row.mover_id,
    renterId: row.renter_id,
    listingId: row.listing_id ?? undefined,
    pickupAddress: row.pickup_address,
    dropoffAddress: row.dropoff_address,
    scheduledDate: row.scheduled_date,
    services: Array.isArray(row.services) ? row.services : [],
    estimatedPrice: Number(row.estimated_price),
    finalPrice: row.final_price ? Number(row.final_price) : undefined,
    status: row.status,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    mover: row.mover
      ? { id: row.mover.id, companyName: row.mover.company_name, logoUrl: row.mover.logo_url }
      : undefined,
  };
}

export async function getMoversApi(city?: string, page = 1) {
  const limit = 20;
  const from = (page - 1) * limit;

  let query = supabase
    .from('movers')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('is_verified', { ascending: false })
    .range(from, from + limit - 1);

  if (city) {
    query = query.contains('service_area', [city]);
  }

  const { data, error, count } = await query;

  if (error) {
    const { demoMovers } = await import('@/lib/mock/movers');
    const filtered = city
      ? demoMovers.filter((m) => m.serviceArea.includes(city))
      : demoMovers;
    return { data: filtered, meta: { page: 1, limit: filtered.length, total: filtered.length, totalPages: 1 } };
  }

  const total = count ?? 0;
  return {
    data: (data ?? []).map(mapMover),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getMoverByIdApi(moverId: string) {
  const { data, error } = await supabase
    .from('movers')
    .select('*, user:users!user_id(id, first_name, last_name, phone, avatar_url)')
    .eq('id', moverId)
    .single();

  if (error) throw new Error(error.message);
  return mapMover(data);
}

export interface BookMoverPayload {
  moverId: string;
  pickupAddress: string;
  dropoffAddress: string;
  scheduledDate: string;
  services: string[];
  estimatedPrice: number;
  note?: string;
  listingId?: string;
}

export async function bookMoverApi(payload: BookMoverPayload): Promise<MoverBooking> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('mover_bookings')
    .insert({
      mover_id: payload.moverId,
      renter_id: session.user.id,
      listing_id: payload.listingId ?? null,
      pickup_address: payload.pickupAddress,
      dropoff_address: payload.dropoffAddress,
      scheduled_date: payload.scheduledDate,
      time_window_start: '08:00:00',
      time_window_end: '18:00:00',
      services: payload.services,
      estimated_price: payload.estimatedPrice,
      note: payload.note ?? null,
      status: 'requested',
    })
    .select('*, mover:movers!mover_id(id, company_name, logo_url)')
    .single();

  if (error) throw new Error(error.message);
  return mapBooking(data);
}

export async function getMyMoverBookingsApi(page = 1) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const limit = 20;
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('mover_bookings')
    .select('*, mover:movers!mover_id(id, company_name, logo_url)', { count: 'exact' })
    .eq('renter_id', session.user.id)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map(mapBooking),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}
