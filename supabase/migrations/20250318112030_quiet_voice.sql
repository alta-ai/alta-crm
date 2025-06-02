/*
  # Add storage bucket for documents

  1. Changes
    - Create storage bucket for documents
    - Set up public access policies
    - Enable file uploads
    
  2. Security
    - Enable RLS for storage
    - Add policies for authenticated users
*/

-- Enable storage by creating the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update files
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
) WITH CHECK (
  bucket_id = 'documents' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated users to read files" 
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete files
CREATE POLICY "Allow authenticated users to delete files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'documents' AND auth.role() = 'authenticated');