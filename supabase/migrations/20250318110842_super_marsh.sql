/*
  # Add document management functionality

  1. New Tables
    - `document_categories`
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `appointment_documents`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, foreign key)
      - `category_id` (uuid, foreign key)
      - `name` (text) - Original filename
      - `file_type` (text) - File extension/MIME type
      - `file_size` (bigint) - Size in bytes
      - `storage_path` (text) - Path in storage bucket
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for all operations
*/

-- Create document_categories table
CREATE TABLE document_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointment_documents table
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
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for document_categories
CREATE POLICY "Enable read access for all users" ON document_categories
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON document_categories
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON document_categories
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON document_categories
    FOR DELETE TO public USING (true);

-- Create policies for appointment_documents
CREATE POLICY "Enable read access for all users" ON appointment_documents
    FOR SELECT TO public USING (true);

CREATE POLICY "Enable insert access for all users" ON appointment_documents
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON appointment_documents
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON appointment_documents
    FOR DELETE TO public USING (true);

-- Add updated_at triggers
CREATE TRIGGER update_document_categories_updated_at
    BEFORE UPDATE ON document_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointment_documents_updated_at
    BEFORE UPDATE ON appointment_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO document_categories (name) VALUES
  ('Fremdbefunde'),
  ('Vorbefund'),
  ('Befund'),
  ('Überweisung');

-- Add helpful comments
COMMENT ON TABLE document_categories IS 'Kategorien für Dokumente wie Befunde, Überweisungen etc.';
COMMENT ON TABLE appointment_documents IS 'Dokumente die einem Termin zugeordnet sind';