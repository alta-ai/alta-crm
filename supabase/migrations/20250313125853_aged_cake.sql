/*
  # Add examination category and billing info

  1. Changes
    - Add category enum type for examination categories
    - Add category column to examinations table
    - Add billing_info column for rich text billing information

  2. Security
    - Maintain existing RLS policies
*/

-- Create enum type for examination categories
CREATE TYPE examination_category_enum AS ENUM (
  'MRT',
  'CT',
  'Biopsie',
  'TULSA-PRO',
  'DaVinci-OP',
  'HoLEP',
  'TURP',
  'Urologie',
  'Kardiologie',
  'Checkup-Frau',
  'Checkup-Mann'
);

-- Add new columns to examinations table
ALTER TABLE examinations 
ADD COLUMN category examination_category_enum NOT NULL DEFAULT 'MRT',
ADD COLUMN billing_info text;