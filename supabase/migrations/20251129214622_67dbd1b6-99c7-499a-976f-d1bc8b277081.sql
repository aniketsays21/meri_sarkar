-- Add image_url column to area_alerts
ALTER TABLE area_alerts ADD COLUMN image_url TEXT;

-- Create storage bucket for alert images
INSERT INTO storage.buckets (id, name, public)
VALUES ('alert-images', 'alert-images', true);

-- RLS policies for alert images storage
CREATE POLICY "Anyone can view alert images"
ON storage.objects FOR SELECT
USING (bucket_id = 'alert-images');

CREATE POLICY "Authenticated users can upload alert images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'alert-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own alert images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'alert-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own alert images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'alert-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);