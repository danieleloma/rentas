import { supabase } from '@/lib/supabase';
import { DEMO_INQUIRIES } from '@/lib/demo-data';

export interface InquiryPayload {
  listingId: string;
  landlordId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface Inquiry {
  id: string;
  listingId: string;
  landlordId: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: string;
  listing?: { id: string; title: string };
}

export async function submitInquiryApi(payload: InquiryPayload): Promise<void> {
  const { error } = await supabase.from('inquiries').insert({
    listing_id: payload.listingId,
    landlord_id: payload.landlordId,
    name: payload.name,
    email: payload.email,
    phone: payload.phone || null,
    message: payload.message,
  });
  if (error) throw new Error(error.message);
}

export async function getInquiriesApi(): Promise<Inquiry[]> {
  const { data, error } = await supabase
    .from('inquiries')
    .select(`
      id, listing_id, landlord_id, name, email, phone, message, created_at,
      listing:listings ( id, title )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((row: any) => ({
    id: row.id,
    listingId: row.listing_id,
    landlordId: row.landlord_id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    message: row.message,
    createdAt: row.created_at,
    listing: row.listing ?? undefined,
  }));

  return rows.length > 0 ? rows : DEMO_INQUIRIES;
}
