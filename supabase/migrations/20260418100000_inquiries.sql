-- Inquiries submitted by visitors/renters about a listing (no auth required)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_landlord ON inquiries(landlord_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_listing  ON inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created  ON inquiries(created_at DESC);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (including unauthenticated) can submit an inquiry
CREATE POLICY "inquiries_insert_public"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Landlords can read their own inquiries; admins can read all
CREATE POLICY "inquiries_select_landlord"
  ON inquiries FOR SELECT
  USING (landlord_id = auth.uid());
