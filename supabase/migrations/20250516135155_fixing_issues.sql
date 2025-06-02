set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.sync_registration_bg_form_with_patient()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  -- Update patient record with form data
  UPDATE public.patients
  SET
    gender = NEW.gender,
    title = NEW.title,
    first_name = NEW.first_name,
    last_name = NEW.last_name,
    phone = NEW.mobile,
    email = NEW.email,
    birth_date = NEW.birth_date,
    updated_at = now()
  WHERE id = NEW.patient_id;
  
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.sync_registration_form_with_patient()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  -- Update patient record with form data
  UPDATE public.patients
  SET
    gender = NEW.gender,
    title = NEW.title,
    first_name = NEW.first_name,
    last_name = NEW.last_name,
    phone = NEW.mobile,
    email = NEW.email,
    birth_date = NEW.birth_date,
    updated_at = now()
  WHERE id = NEW.patient_id;
  
  RETURN NEW;
END;$function$
;

CREATE OR REPLACE FUNCTION public.validate_patient_data_body_side()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  -- Check if examination requires body side
  IF EXISTS (
    SELECT 1 FROM public.examinations e
    WHERE e.id = NEW.examination_id
    AND e.requires_body_side = true
  ) THEN
    -- Ensure body_side is present and valid when required
    IF NOT (
      NEW.patient_data->>'body_side' IN ('links', 'rechts')
    ) THEN
      RAISE EXCEPTION 'body_side must be either "links" or "rechts" when required';
    END IF;
  END IF;
  RETURN NEW;
END;$function$
;

-- alter appointments table
alter table "public"."appointments" drop column "insurance_provider_id";
alter table "public"."appointments" drop column "patient_data";
alter table "public"."appointments" drop column "previous_appointment_date";
alter table "public"."appointments" add column "has_transfer" boolean;
alter table "public"."appointments" add column "referring_doctor" text;
alter table "public"."appointments" add column "with_contrast_medium" boolean;

-- update form type enum
ALTER TYPE "public"."form_type_enum" ADD VALUE 'cost_estimation';

-- update form table 
alter table "public"."forms" add column if not exists "editable" boolean;
alter table "public"."forms" add column if not exists "needs_signature" boolean;
alter table "public"."forms" drop column "form_data";
alter table "public"."forms" drop column "form_fields";
alter table "public"."forms" drop column "api_endpoint";
alter table "public"."forms" drop column "api_mappings";
alter table "public"."forms" drop column "api_auth_token";
alter table "public"."forms" drop column "pdf_mappings";

-- update examinations table
alter table "public"."examinations" drop column "old_category";

-- alter patients table
alter table "public"."patients" add column if not exists "has_beihilfe" boolean;


