ALTER TABLE public.broadcasts ADD COLUMN image_url TEXT;

COMMENT ON COLUMN public.broadcasts.image_url IS 'Optional image/poster URL stored in Supabase Storage (broadcast-images bucket)';

-- Create broadcast-images storage bucket (public, 2MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('broadcast-images', 'broadcast-images', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Admins can upload broadcast images
CREATE POLICY "Admins upload broadcast images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'broadcast-images'
    AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = (SELECT auth.uid()) AND profiles.role IN ('admin', 'super_admin'))
  );

-- Anyone can read broadcast images (they're public)
CREATE POLICY "Public read broadcast images" ON storage.objects
  FOR SELECT USING (bucket_id = 'broadcast-images');
