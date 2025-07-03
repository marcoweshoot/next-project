
-- Create a storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- Create policy to allow public access to videos
CREATE POLICY "Public Access to Videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Create policy to allow uploads (you can restrict this later if needed)
CREATE POLICY "Allow video uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'videos');
