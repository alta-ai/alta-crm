-- Enable storage by creating the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow all users to upload files
CREATE POLICY "Allow all users to upload files"
ON storage.objects FOR INSERT TO public WITH CHECK (
  bucket_id = 'documents'
);

-- Allow all users to update files
CREATE POLICY "Allow all users to update files"
ON storage.objects FOR UPDATE TO public USING (
  bucket_id = 'documents'
) WITH CHECK (
  bucket_id = 'documents'
);

-- Allow all users to read files
CREATE POLICY "Allow all users to read files" 
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'documents');

-- Allow all users to delete files
CREATE POLICY "Allow all users to delete files"
ON storage.objects FOR DELETE TO public
USING (bucket_id = 'documents');