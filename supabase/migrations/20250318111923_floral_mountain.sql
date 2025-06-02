/*
  # Fix document management migration

  1. Changes
    - Add IF NOT EXISTS checks for table creation
    - Add IF NOT EXISTS checks for policies and triggers
    - Handle existing categories gracefully
    
  2. Security
    - Maintain RLS policies
    - Ensure proper cascade behavior
*/

-- Create tables if they don't exist
DO $$ 
BEGIN
  -- Create document_categories table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'document_categories') THEN
    CREATE TABLE document_categories (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL UNIQUE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON document_categories
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON document_categories
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON document_categories
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON document_categories
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_document_categories_updated_at
        BEFORE UPDATE ON document_categories
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Add comment
    COMMENT ON TABLE document_categories IS 'Kategorien für Dokumente wie Befunde, Überweisungen etc.';
  END IF;

  -- Create appointment_documents table if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_documents') THEN
    CREATE TABLE appointment_documents (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
      category_id uuid REFERENCES document_categories(id) ON DELETE RESTRICT,
      name text NOT NULL,
      file_type text NOT NULL,
      file_size bigint NOT NULL,
      storage_path text NOT NULL,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE appointment_documents ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Enable read access for all users" ON appointment_documents
        FOR SELECT TO public USING (true);

    CREATE POLICY "Enable insert access for all users" ON appointment_documents
        FOR INSERT TO public WITH CHECK (true);

    CREATE POLICY "Enable update access for all users" ON appointment_documents
        FOR UPDATE TO public USING (true) WITH CHECK (true);

    CREATE POLICY "Enable delete access for all users" ON appointment_documents
        FOR DELETE TO public USING (true);

    -- Add updated_at trigger
    CREATE TRIGGER update_appointment_documents_updated_at
        BEFORE UPDATE ON appointment_documents
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Add comment
    COMMENT ON TABLE appointment_documents IS 'Dokumente die einem Termin zugeordnet sind';
  END IF;
END $$;

-- Insert default categories if they don't exist
INSERT INTO document_categories (name)
SELECT unnest(ARRAY[
  'Fremdbefunde',
  'Vorbefund',
  'Befund',
  'Überweisung'
])
ON CONFLICT (name) DO NOTHING;