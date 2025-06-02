/*
  # Add billing type support to examination forms

  1. Changes
    - Add billing_type column to examination_forms table
    - Add check constraint to ensure valid billing types
    - Update existing records to use default billing type

  2. Security
    - Maintain existing RLS policies
*/

-- Add billing_type column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'examination_forms' 
    AND column_name = 'billing_type'
  ) THEN
    -- Add the column
    ALTER TABLE examination_forms 
    ADD COLUMN billing_type billing_type_enum[];

    -- Set default value for existing records (all billing types)
    UPDATE examination_forms 
    SET billing_type = ARRAY['self_payer', 'private_patient', 'foreign_patient', 'work_accident']::billing_type_enum[];

    -- Make the column not nullable
    ALTER TABLE examination_forms 
    ALTER COLUMN billing_type SET NOT NULL;

    -- Add check constraint to ensure at least one billing type is selected
    ALTER TABLE examination_forms 
    ADD CONSTRAINT examination_forms_billing_type_not_empty 
    CHECK (array_length(billing_type, 1) > 0);
  END IF;
END $$;

-- Update or create RLS policies
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable read access for all users" ON examination_forms;
  DROP POLICY IF EXISTS "Enable insert access for all users" ON examination_forms;
  DROP POLICY IF EXISTS "Enable update access for all users" ON examination_forms;
  DROP POLICY IF EXISTS "Enable delete access for all users" ON examination_forms;

  -- Create new policies
  CREATE POLICY "Enable read access for all users" 
    ON examination_forms FOR SELECT 
    TO public 
    USING (true);

  CREATE POLICY "Enable insert access for all users" 
    ON examination_forms FOR INSERT 
    TO public 
    WITH CHECK (true);

  CREATE POLICY "Enable update access for all users" 
    ON examination_forms FOR UPDATE 
    TO public 
    USING (true) 
    WITH CHECK (true);

  CREATE POLICY "Enable delete access for all users" 
    ON examination_forms FOR DELETE 
    TO public 
    USING (true);
END $$;