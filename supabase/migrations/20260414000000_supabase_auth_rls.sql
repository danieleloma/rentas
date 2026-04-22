-- ─── 1. Schema fixes ────────────────────────────────────────────────────────

-- Add columns missing from the initial migration
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS lease_duration VARCHAR(50),
  ADD COLUMN IF NOT EXISTS pet_policy     VARCHAR(20),
  ADD COLUMN IF NOT EXISTS smoking_policy VARCHAR(20);

-- Make password_hash nullable — Supabase Auth owns passwords now
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN password_hash SET DEFAULT '';

-- Give updated_at a server-side default so inserts don't fail
ALTER TABLE public.users    ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.listings ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.visits   ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.movers   ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.mover_bookings ALTER COLUMN updated_at SET DEFAULT now();

-- ─── 2. Auto-update updated_at on every row change ───────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'users_updated_at') THEN
    CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'listings_updated_at') THEN
    CREATE TRIGGER listings_updated_at BEFORE UPDATE ON public.listings
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'visits_updated_at') THEN
    CREATE TRIGGER visits_updated_at BEFORE UPDATE ON public.visits
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
  END IF;
END $$;

-- ─── 3. Auth trigger: create public profile on Supabase Auth signup ──────────

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (
    id, email, first_name, last_name, phone, role,
    email_verified, password_hash, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',  ''),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'renter'),
    NEW.email_confirmed_at IS NOT NULL,
    '',  -- not used; Supabase Auth owns the credential
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- Sync email_verified when the user confirms their email
CREATE OR REPLACE FUNCTION public.handle_auth_email_confirmed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.users SET email_verified = true, updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_email_confirmed();

-- ─── 4. Helper RPC: increment listing views atomically ──────────────────────

CREATE OR REPLACE FUNCTION public.increment_listing_views(p_listing_id UUID)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE public.listings SET views_count = views_count + 1 WHERE id = p_listing_id;
$$;

-- Helper RPC: toggle favorite (upsert / delete)
CREATE OR REPLACE FUNCTION public.toggle_favorite(p_user_id UUID, p_listing_id UUID)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.favorites
    WHERE user_id = p_user_id AND listing_id = p_listing_id
  ) INTO v_exists;

  IF v_exists THEN
    DELETE FROM public.favorites WHERE user_id = p_user_id AND listing_id = p_listing_id;
    RETURN false;
  ELSE
    INSERT INTO public.favorites (id, user_id, listing_id, created_at)
    VALUES (gen_random_uuid(), p_user_id, p_listing_id, now());
    RETURN true;
  END IF;
END;
$$;

-- ─── 5. Row Level Security ───────────────────────────────────────────────────

ALTER TABLE public.users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mover_bookings ENABLE ROW LEVEL SECURITY;

-- users
CREATE POLICY "users_select_all"  ON public.users FOR SELECT USING (true);
CREATE POLICY "users_update_own"  ON public.users FOR UPDATE USING (auth.uid() = id);

-- listings
CREATE POLICY "listings_select" ON public.listings
  FOR SELECT USING (status = 'active' OR landlord_id = auth.uid());

CREATE POLICY "listings_insert" ON public.listings
  FOR INSERT WITH CHECK (
    auth.uid() = landlord_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('landlord','admin'))
  );

CREATE POLICY "listings_update" ON public.listings
  FOR UPDATE USING (
    auth.uid() = landlord_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('landlord','admin'))
  );

CREATE POLICY "listings_delete" ON public.listings
  FOR DELETE USING (
    auth.uid() = landlord_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('landlord','admin'))
  );

-- listing_images
CREATE POLICY "listing_images_select" ON public.listing_images FOR SELECT USING (true);

CREATE POLICY "listing_images_insert" ON public.listing_images
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND landlord_id = auth.uid())
  );

CREATE POLICY "listing_images_delete" ON public.listing_images
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND landlord_id = auth.uid())
  );

-- conversations
CREATE POLICY "conversations_select" ON public.conversations
  FOR SELECT USING (participant_one_id = auth.uid() OR participant_two_id = auth.uid());

CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT WITH CHECK (participant_one_id = auth.uid() OR participant_two_id = auth.uid());

-- messages
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c WHERE c.id = conversation_id
        AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c WHERE c.id = conversation_id
        AND (c.participant_one_id = auth.uid() OR c.participant_two_id = auth.uid())
    )
  );

-- visits
CREATE POLICY "visits_select" ON public.visits
  FOR SELECT USING (renter_id = auth.uid() OR landlord_id = auth.uid());

CREATE POLICY "visits_insert" ON public.visits
  FOR INSERT WITH CHECK (renter_id = auth.uid());

CREATE POLICY "visits_update" ON public.visits
  FOR UPDATE USING (renter_id = auth.uid() OR landlord_id = auth.uid());

-- reviews
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews
  FOR INSERT WITH CHECK (renter_id = auth.uid());

-- favorites
CREATE POLICY "favorites_select" ON public.favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "favorites_insert" ON public.favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "favorites_delete" ON public.favorites FOR DELETE USING (user_id = auth.uid());

-- movers
CREATE POLICY "movers_select" ON public.movers
  FOR SELECT USING (is_active = true OR user_id = auth.uid());

-- mover_bookings
CREATE POLICY "mover_bookings_select" ON public.mover_bookings
  FOR SELECT USING (
    renter_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.movers WHERE id = mover_id AND user_id = auth.uid())
  );

-- reports
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());
