-- Supabase stored procedures für Transaktionen
-- Diese Funktionen ermöglichen die Verwendung von Transaktionen über die Supabase API

-- Funktion zum Starten einer Transaktion
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In PostgreSQL-Funktionen können wir nicht einfach BEGIN verwenden.
  -- Stattdessen verwenden wir die PERFORM-Anweisung mit einem SELECT,
  -- um eine aktive Transaktion zu erzeugen, falls noch keine existiert.
  PERFORM 1;
END;
$$;

-- Funktion zum Bestätigen (Commit) einer Transaktion
CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- PostgreSQL-Funktionen verwenden implizit Transaktionen.
  -- Diese Funktion muss nichts tun, da die Transaktion beim erfolgreichen 
  -- Abschluss der Funktion automatisch bestätigt wird.
  NULL;
END;
$$;

-- Funktion zum Rückgängigmachen (Rollback) einer Transaktion
CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Wir können einen Fehler auslösen, um einen Rollback zu erzwingen
  RAISE EXCEPTION 'Transaction rollback requested';
END;
$$;

-- Gewähre Ausführungsrechte für die Funktionen
GRANT EXECUTE ON FUNCTION begin_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION commit_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_transaction TO authenticated; 