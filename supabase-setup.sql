-- =============================================
-- Art Dekor Furniture - Supabase Setup (2026)
-- =============================================

-- 1) Gallery table
--    category must be one of: kitchens | furniture | others
--    The home slideshow pulls ALL active rows; each page filters by category.
--
--    If the table already exists (created manually in the Supabase UI),
--    run the ALTER statements below to add the three missing columns.
--    If the table does NOT exist yet, CREATE TABLE handles everything.

CREATE TABLE IF NOT EXISTS gallery_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT        NOT NULL CHECK (category IN ('kitchens', 'furniture', 'others')),
  image_url   TEXT        NOT NULL,
  alt_text    TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If the table existed already (with old columns), add the new ones:
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS alt_text   TEXT;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS sort_order INTEGER     NOT NULL DEFAULT 0;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS is_active  BOOLEAN     NOT NULL DEFAULT TRUE;
-- Make title nullable if it exists from the old schema
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gallery_items' AND column_name = 'title'
  ) THEN
    ALTER TABLE gallery_items ALTER COLUMN title DROP NOT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS gallery_items_category_active_sort_idx
  ON gallery_items (category, is_active, sort_order);

-- 2) Site settings table (single row id=1)
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY,
  whatsapp_url TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  map_url TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, address, phone, email)
VALUES (1, 'Lipjan, Kosovo', '+383 44 000 000', 'info@artdekor.com')
ON CONFLICT (id) DO NOTHING;

-- 3) Contact form table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4) Keep site_settings.updated_at fresh
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS site_settings_set_updated_at ON site_settings;
CREATE TRIGGER site_settings_set_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- 5) Row Level Security
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- gallery_items: public read, auth write
DROP POLICY IF EXISTS "gallery_items_public_read" ON gallery_items;
CREATE POLICY "gallery_items_public_read"
  ON gallery_items
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "gallery_items_auth_write" ON gallery_items;
CREATE POLICY "gallery_items_auth_write"
  ON gallery_items
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- site_settings: public read, auth write
DROP POLICY IF EXISTS "site_settings_public_read" ON site_settings;
CREATE POLICY "site_settings_public_read"
  ON site_settings
  FOR SELECT
  TO anon, authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "site_settings_auth_write" ON site_settings;
CREATE POLICY "site_settings_auth_write"
  ON site_settings
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- contact_messages: public insert, auth read
DROP POLICY IF EXISTS "contact_messages_public_insert" ON contact_messages;
CREATE POLICY "contact_messages_public_insert"
  ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "contact_messages_auth_read" ON contact_messages;
CREATE POLICY "contact_messages_auth_read"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- 6) Storage bucket + policies
-- Use one public bucket named: media
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', TRUE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "media_bucket_public_read" ON storage.objects;
CREATE POLICY "media_bucket_public_read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_auth_insert" ON storage.objects;
CREATE POLICY "media_bucket_auth_insert"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_auth_update" ON storage.objects;
CREATE POLICY "media_bucket_auth_update"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

DROP POLICY IF EXISTS "media_bucket_auth_delete" ON storage.objects;
CREATE POLICY "media_bucket_auth_delete"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');

