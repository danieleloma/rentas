import { supabase } from '@/lib/supabase';
import type { Listing, ListingImage, PaginationMeta } from '@/types';
import { demoListings } from '@/lib/mock/listings';

const LISTING_QUERY = `
  id, title, description, property_type, address, city, state, zip_code,
  latitude, longitude, bedrooms, bathrooms, square_footage, monthly_rent,
  deposit, available_from, amenities, status, verification_status, is_featured, virtual_tour_url,
  lease_duration, pet_policy, smoking_policy, views_count, created_at, updated_at,
  landlord:users!landlord_id ( id, first_name, last_name, avatar_url, phone ),
  images:listing_images ( id, url, thumbnail_url, position, is_virtual_tour, created_at )
` as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListing(row: any): Listing {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    propertyType: row.property_type,
    address: row.address,
    city: row.city,
    state: row.state ?? undefined,
    zipCode: row.zip_code ?? undefined,
    latitude: row.latitude != null ? Number(row.latitude) : undefined,
    longitude: row.longitude != null ? Number(row.longitude) : undefined,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms != null ? Number(row.bathrooms) : undefined,
    squareFootage: row.square_footage ?? undefined,
    monthlyRent: Number(row.monthly_rent),
    deposit: row.deposit != null ? Number(row.deposit) : undefined,
    availableFrom: row.available_from ?? undefined,
    amenities: row.amenities ?? [],
    status: row.status,
    verificationStatus: row.verification_status ?? 'unverified',
    isFeatured: row.is_featured,
    virtualTourUrl: row.virtual_tour_url ?? undefined,
    viewsCount: row.views_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    landlord: row.landlord
      ? {
          id: row.landlord.id,
          firstName: row.landlord.first_name,
          lastName: row.landlord.last_name,
          avatarUrl: row.landlord.avatar_url ?? undefined,
          phone: row.landlord.phone ?? undefined,
        }
      : { id: '', firstName: '', lastName: '' },
    images: (row.images ?? [])
      .sort((a: { position: number }, b: { position: number }) => a.position - b.position)
      .map((img: { id: string; url: string; thumbnail_url?: string; position: number; is_virtual_tour: boolean }) => ({
        id: img.id,
        url: img.url,
        thumbnailUrl: img.thumbnail_url ?? undefined,
        position: img.position,
        isVirtualTour: img.is_virtual_tour,
      })),
  };
}

interface ListingFilters {
  page?: number;
  limit?: number;
  city?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  keyword?: string;
}

export async function getListingsApi(filters: ListingFilters = {}) {
  const page = Number(filters.page ?? 1);
  const limit = Number(filters.limit ?? 20);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  try {
    let query = supabase
      .from('listings')
      .select(LISTING_QUERY, { count: 'exact' })
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (filters.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters.propertyType) query = query.eq('property_type', filters.propertyType);
    if (filters.bedrooms) query = query.eq('bedrooms', filters.bedrooms);
    if (filters.bathrooms) query = query.gte('bathrooms', filters.bathrooms);
    if (filters.minPrice) query = query.gte('monthly_rent', filters.minPrice);
    if (filters.maxPrice) query = query.lte('monthly_rent', filters.maxPrice);
    if (filters.amenities?.length) {
      query = query.contains('amenities', filters.amenities);
    }
    if (filters.keyword) {
      query = query.or(
        `title.ilike.%${filters.keyword}%,description.ilike.%${filters.keyword}%,address.ilike.%${filters.keyword}%`,
      );
    }

    const { data, error, count } = await query;
    if (error) throw error;

    const total = count ?? 0;
    const meta: PaginationMeta = { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
    return { success: true, data: (data ?? []).map(mapListing), meta };
  } catch {
    const paged = demoListings.slice(from, from + limit);
    const meta: PaginationMeta = {
      page,
      limit,
      total: demoListings.length,
      totalPages: Math.max(1, Math.ceil(demoListings.length / limit)),
    };
    return { success: true, data: paged, meta };
  }
}

export async function getListingByIdApi(id: string): Promise<Listing | null> {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select(LISTING_QUERY)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Increment views asynchronously — don't block render
    supabase.rpc('increment_listing_views', { p_listing_id: id }).then(() => {});

    return mapListing(data);
  } catch {
    return demoListings.find((l) => l.id === id) ?? null;
  }
}

export async function createListingApi(payload: Record<string, unknown>): Promise<Listing> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('listings')
    .insert({
      landlord_id: user.id,
      title: payload.title,
      description: payload.description || null,
      property_type: payload.propertyType,
      address: payload.address,
      city: payload.city,
      state: payload.state || null,
      zip_code: payload.zipCode || null,
      latitude: payload.latitude ?? null,
      longitude: payload.longitude ?? null,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms ?? null,
      square_footage: payload.squareFootage ?? null,
      monthly_rent: payload.monthlyRent,
      deposit: payload.deposit ?? null,
      available_from: payload.availableFrom || null,
      amenities: payload.amenities ?? [],
      virtual_tour_url: payload.virtualTourUrl || null,
      lease_duration: payload.leaseDuration || null,
      pet_policy: payload.petPolicy || null,
      smoking_policy: payload.smokingPolicy || null,
    })
    .select(LISTING_QUERY)
    .single();

  if (error) throw new Error(error.message);
  return mapListing(data);
}

export async function updateListingApi(id: string, payload: Record<string, unknown>): Promise<Listing> {
  const { data, error } = await supabase
    .from('listings')
    .update({
      title: payload.title,
      description: payload.description || null,
      property_type: payload.propertyType,
      address: payload.address,
      city: payload.city,
      state: payload.state || null,
      zip_code: payload.zipCode || null,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms ?? null,
      square_footage: payload.squareFootage ?? null,
      monthly_rent: payload.monthlyRent,
      deposit: payload.deposit ?? null,
      available_from: payload.availableFrom || null,
      amenities: payload.amenities ?? [],
      virtual_tour_url: payload.virtualTourUrl || null,
      lease_duration: payload.leaseDuration || null,
      pet_policy: payload.petPolicy || null,
      smoking_policy: payload.smokingPolicy || null,
    })
    .eq('id', id)
    .select(LISTING_QUERY)
    .single();

  if (error) throw new Error(error.message);
  return mapListing(data);
}

export async function deleteListingApi(id: string) {
  const { error } = await supabase.from('listings').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function toggleFavoriteApi(listingId: string) {
  const { data, error } = await supabase.rpc('toggle_favorite', {
    p_listing_id: listingId,
    p_user_id: (await supabase.auth.getUser()).data.user?.id,
  });
  if (error) throw new Error(error.message);
  return { favorited: data as boolean };
}

export async function getFavoritesApi(page = 1) {
  const limit = 20;
  const from = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from('favorites')
    .select(`listing:listings ( ${LISTING_QUERY} )`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    success: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: (data ?? []).map((f: any) => mapListing(f.listing)).filter(Boolean),
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function uploadListingImageApi(
  listingId: string,
  file: File,
  isVirtualTour = false,
): Promise<ListingImage> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${listingId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('listing-media')
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const { data: urlData } = supabase.storage.from('listing-media').getPublicUrl(path);

  // Determine next position
  const { data: existing } = await supabase
    .from('listing_images')
    .select('position')
    .eq('listing_id', listingId)
    .order('position', { ascending: false })
    .limit(1);

  const position = existing?.length ? (existing[0].position as number) + 1 : 0;

  const { data, error } = await supabase
    .from('listing_images')
    .insert({
      id: crypto.randomUUID(),
      listing_id: listingId,
      url: urlData.publicUrl,
      position,
      is_virtual_tour: isVirtualTour,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    url: data.url,
    thumbnailUrl: data.thumbnail_url ?? undefined,
    position: data.position,
    isVirtualTour: data.is_virtual_tour,
  };
}
