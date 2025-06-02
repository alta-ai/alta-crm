/*
  # Fix storage policies for public access

  1. Changes
    - Drop existing policies if they exist
    - Create new policies with unique names
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
DROP POLICY IF EXISTS "Allow public upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete" ON storage.objects;

-- Create new policies with unique names
CREATE POLICY "documents_allow_public_upload"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_allow_public_update"
ON storage.objects FOR UPDATE TO public
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "documents_allow_public_read"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documents');

CREATE POLICY "documents_allow_public_delete"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'documents');