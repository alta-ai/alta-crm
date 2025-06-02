/*
  # Update storage policies for public access

  1. Changes
    - Drop existing policies if they exist
    - Create new policies for public access
    - Ensure bucket exists
    
  2. Security
    - Allow public access to storage bucket
    - Enable all CRUD operations
*/

-- Enable storage by creating the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete files" ON storage.objects;

-- Create new policies for public access
CREATE POLICY "Allow public upload"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public update"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documents');

CREATE POLICY "Allow public delete"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'documents');