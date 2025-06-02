/*
  # Fix timezone settings for date handling

  1. Changes
    - Set timezone to Europe/Berlin for consistent date handling
    - Ensure dates are stored without timezone conversion
*/

-- Set timezone to Europe/Berlin
ALTER DATABASE postgres SET timezone TO 'Europe/Berlin';

-- Ensure birth_date column uses date type without timezone
ALTER TABLE patients ALTER COLUMN birth_date TYPE date;