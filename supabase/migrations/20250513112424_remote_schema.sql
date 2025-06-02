alter table "public"."insurance_providers" drop constraint "insurance_providers_type_check";

create table "public"."appointment_forms" (
    "id" uuid not null default uuid_generate_v4(),
    "appointment_id" uuid not null,
    "form_id" uuid not null,
    "form_data" jsonb not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."billing_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."billing_code_examination_categories" (
    "id" uuid not null default uuid_generate_v4(),
    "billing_code_id" uuid,
    "examination_category_id" uuid,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."billing_code_examination_categories" enable row level security;

create table "public"."billing_codes" (
    "id" uuid not null default gen_random_uuid(),
    "code" text not null,
    "description" text not null,
    "price" numeric(10,2) not null,
    "category_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "parent_id" uuid,
    "is_sub_item" boolean default false
);


create table "public"."billing_form_options" (
    "id" uuid not null default gen_random_uuid(),
    "question_id" uuid not null,
    "option_text" text not null,
    "billing_code_id" uuid,
    "order_index" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "option_type" text
);


create table "public"."billing_form_questions" (
    "id" uuid not null default gen_random_uuid(),
    "form_id" uuid not null,
    "question_text" text not null,
    "question_type" text not null,
    "order_index" integer not null,
    "required" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "depends_on_question_id" uuid,
    "depends_on_option_id" uuid
);


create table "public"."billing_forms" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "description" text,
    "category_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."device_blockers" (
    "id" uuid not null default gen_random_uuid(),
    "device_id" uuid not null,
    "date" date not null,
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "reason" text,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."email_logs" (
    "id" uuid not null default uuid_generate_v4(),
    "template_id" uuid,
    "appointment_id" uuid,
    "patient_id" uuid,
    "recipient_email" text not null,
    "subject" text not null,
    "body" text not null,
    "status" text not null,
    "error_message" text,
    "scheduled_for" timestamp with time zone,
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone default now()
);


create table "public"."examination_billing_answers" (
    "id" uuid not null default gen_random_uuid(),
    "examination_billing_form_id" uuid not null,
    "question_id" uuid not null,
    "option_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "text_answer" text,
    "number_answer" numeric
);


create table "public"."examination_billing_codes" (
    "id" uuid not null default gen_random_uuid(),
    "examination_id" uuid not null,
    "billing_code_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


create table "public"."examination_billing_forms" (
    "id" uuid not null default gen_random_uuid(),
    "examination_id" uuid not null,
    "form_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid
);


create table "public"."examination_categories" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
);


alter table "public"."examination_categories" enable row level security;

create table "public"."insurance_billing_factors" (
    "id" uuid not null default gen_random_uuid(),
    "insurance_provider_id" uuid not null,
    "billing_category_id" uuid not null,
    "factor" numeric(10,2) not null default 1.0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."report_templates" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text not null,
    "description" text,
    "template_type" text not null default 'general'::text,
    "is_default" boolean not null default false,
    "header_content" text,
    "body_content" text not null,
    "footer_content" text,
    "conditions" jsonb,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."report_templates" enable row level security;

create table "public"."reports" (
    "id" uuid not null default uuid_generate_v4(),
    "appointment_id" uuid not null,
    "title" text,
    "indication" text,
    "report" text,
    "assessment" text,
    "is_complete" boolean default false,
    "completed_by_user" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."scheduled_emails" (
    "id" uuid not null default uuid_generate_v4(),
    "template_id" uuid not null,
    "appointment_id" uuid,
    "patient_id" uuid,
    "recipient_email" text not null,
    "subject" text,
    "body" text,
    "status" text not null default 'pending'::text,
    "scheduled_for" timestamp with time zone not null,
    "created_at" timestamp with time zone default now()
);


alter table "public"."appointment_comments" add column "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column "priority" boolean not null default false;

alter table "public"."email_templates" add column "conditions" jsonb;

alter table "public"."email_templates" add column "schedule_time_unit" text;

alter table "public"."email_templates" add column "schedule_time_value" integer;

alter table "public"."email_templates" add column "schedule_type" text;

alter table "public"."email_templates" add column "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column "trigger_type" text;

alter table "public"."examinations" drop column "category";

alter table "public"."examinations" add column "category_id" uuid;

alter table "public"."examinations" add column "old_category" text;

alter table "public"."form_links" alter column "id" set default uuid_generate_v4();

alter table "public"."locations" add column "letterhead_url" text;

alter table "public"."locations" add column "use_default_letterhead" boolean default false;

alter table "public"."patient_photos" drop column "updated_at";

alter table "public"."patient_photos" alter column "active" drop not null;

alter table "public"."patient_photos" alter column "id" set default uuid_generate_v4();

alter table "public"."patient_photos" alter column "patient_id" set not null;

alter table "public"."patient_photos" disable row level security;

CREATE INDEX appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE UNIQUE INDEX billing_code_examination_cate_billing_code_id_examination_c_key ON public.billing_code_examination_categories USING btree (billing_code_id, examination_category_id);

CREATE UNIQUE INDEX billing_code_examination_categories_pkey ON public.billing_code_examination_categories USING btree (id);

CREATE INDEX billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE INDEX billing_form_options_order_idx ON public.billing_form_options USING btree (order_index);

CREATE UNIQUE INDEX billing_form_options_pkey ON public.billing_form_options USING btree (id);

CREATE INDEX billing_form_options_question_id_idx ON public.billing_form_options USING btree (question_id);

CREATE INDEX billing_form_questions_depends_on_option_idx ON public.billing_form_questions USING btree (depends_on_option_id);

CREATE INDEX billing_form_questions_depends_on_question_idx ON public.billing_form_questions USING btree (depends_on_question_id);

CREATE INDEX billing_form_questions_form_id_idx ON public.billing_form_questions USING btree (form_id);

CREATE INDEX billing_form_questions_order_idx ON public.billing_form_questions USING btree (order_index);

CREATE UNIQUE INDEX billing_form_questions_pkey ON public.billing_form_questions USING btree (id);

CREATE INDEX billing_forms_category_id_idx ON public.billing_forms USING btree (category_id);

CREATE UNIQUE INDEX billing_forms_pkey ON public.billing_forms USING btree (id);

CREATE UNIQUE INDEX device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX email_logs_pkey ON public.email_logs USING btree (id);

CREATE INDEX examination_billing_answers_form_id_idx ON public.examination_billing_answers USING btree (examination_billing_form_id);

CREATE UNIQUE INDEX examination_billing_answers_pkey ON public.examination_billing_answers USING btree (id);

CREATE INDEX examination_billing_codes_billing_code_id_idx ON public.examination_billing_codes USING btree (billing_code_id);

CREATE UNIQUE INDEX examination_billing_codes_examination_id_billing_code_id_key ON public.examination_billing_codes USING btree (examination_id, billing_code_id);

CREATE INDEX examination_billing_codes_examination_id_idx ON public.examination_billing_codes USING btree (examination_id);

CREATE UNIQUE INDEX examination_billing_codes_pkey ON public.examination_billing_codes USING btree (id);

CREATE INDEX examination_billing_forms_examination_id_idx ON public.examination_billing_forms USING btree (examination_id);

CREATE UNIQUE INDEX examination_billing_forms_pkey ON public.examination_billing_forms USING btree (id);

CREATE UNIQUE INDEX examination_categories_name_key ON public.examination_categories USING btree (name);

CREATE UNIQUE INDEX examination_categories_pkey ON public.examination_categories USING btree (id);

CREATE INDEX idx_billing_form_questions_depends_on_option_id ON public.billing_form_questions USING btree (depends_on_option_id) WHERE (depends_on_option_id IS NOT NULL);

CREATE INDEX idx_billing_form_questions_depends_on_question_id ON public.billing_form_questions USING btree (depends_on_question_id) WHERE (depends_on_question_id IS NOT NULL);

CREATE INDEX idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

alter table "public"."appointment_forms" add constraint "appointment_forms_pkey" PRIMARY KEY using index "appointment_forms_pkey";

alter table "public"."billing_categories" add constraint "billing_categories_pkey" PRIMARY KEY using index "billing_categories_pkey";

alter table "public"."billing_code_examination_categories" add constraint "billing_code_examination_categories_pkey" PRIMARY KEY using index "billing_code_examination_categories_pkey";

alter table "public"."billing_codes" add constraint "billing_codes_pkey" PRIMARY KEY using index "billing_codes_pkey";

alter table "public"."billing_form_options" add constraint "billing_form_options_pkey" PRIMARY KEY using index "billing_form_options_pkey";

alter table "public"."billing_form_questions" add constraint "billing_form_questions_pkey" PRIMARY KEY using index "billing_form_questions_pkey";

alter table "public"."billing_forms" add constraint "billing_forms_pkey" PRIMARY KEY using index "billing_forms_pkey";

alter table "public"."device_blockers" add constraint "device_blockers_pkey" PRIMARY KEY using index "device_blockers_pkey";

alter table "public"."email_logs" add constraint "email_logs_pkey" PRIMARY KEY using index "email_logs_pkey";

alter table "public"."examination_billing_answers" add constraint "examination_billing_answers_pkey" PRIMARY KEY using index "examination_billing_answers_pkey";

alter table "public"."examination_billing_codes" add constraint "examination_billing_codes_pkey" PRIMARY KEY using index "examination_billing_codes_pkey";

alter table "public"."examination_billing_forms" add constraint "examination_billing_forms_pkey" PRIMARY KEY using index "examination_billing_forms_pkey";

alter table "public"."examination_categories" add constraint "examination_categories_pkey" PRIMARY KEY using index "examination_categories_pkey";

alter table "public"."insurance_billing_factors" add constraint "insurance_billing_factors_pkey" PRIMARY KEY using index "insurance_billing_factors_pkey";

alter table "public"."report_templates" add constraint "report_templates_pkey" PRIMARY KEY using index "report_templates_pkey";

alter table "public"."reports" add constraint "reports_pkey" PRIMARY KEY using index "reports_pkey";

alter table "public"."scheduled_emails" add constraint "scheduled_emails_pkey" PRIMARY KEY using index "scheduled_emails_pkey";

alter table "public"."appointment_forms" add constraint "appointment_forms_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(id) not valid;

alter table "public"."appointment_forms" validate constraint "appointment_forms_appointment_id_fkey";

alter table "public"."appointment_forms" add constraint "appointment_forms_appointment_id_form_id_key" UNIQUE using index "appointment_forms_appointment_id_form_id_key";

alter table "public"."appointment_forms" add constraint "appointment_forms_form_id_fkey" FOREIGN KEY (form_id) REFERENCES forms(id) not valid;

alter table "public"."appointment_forms" validate constraint "appointment_forms_form_id_fkey";

alter table "public"."billing_code_examination_categories" add constraint "billing_code_examination_cate_billing_code_id_examination_c_key" UNIQUE using index "billing_code_examination_cate_billing_code_id_examination_c_key";

alter table "public"."billing_code_examination_categories" add constraint "billing_code_examination_categorie_examination_category_id_fkey" FOREIGN KEY (examination_category_id) REFERENCES examination_categories(id) ON DELETE CASCADE not valid;

alter table "public"."billing_code_examination_categories" validate constraint "billing_code_examination_categorie_examination_category_id_fkey";

alter table "public"."billing_code_examination_categories" add constraint "billing_code_examination_categories_billing_code_id_fkey" FOREIGN KEY (billing_code_id) REFERENCES billing_codes(id) ON DELETE CASCADE not valid;

alter table "public"."billing_code_examination_categories" validate constraint "billing_code_examination_categories_billing_code_id_fkey";

alter table "public"."billing_codes" add constraint "billing_codes_category_id_fkey" FOREIGN KEY (category_id) REFERENCES billing_categories(id) not valid;

alter table "public"."billing_codes" validate constraint "billing_codes_category_id_fkey";

alter table "public"."billing_codes" add constraint "billing_codes_code_check" CHECK ((char_length(code) <= 4)) not valid;

alter table "public"."billing_codes" validate constraint "billing_codes_code_check";

alter table "public"."billing_codes" add constraint "billing_codes_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES billing_codes(id) not valid;

alter table "public"."billing_codes" validate constraint "billing_codes_parent_id_fkey";

alter table "public"."billing_codes" add constraint "billing_codes_price_check" CHECK ((price >= (0)::numeric)) not valid;

alter table "public"."billing_codes" validate constraint "billing_codes_price_check";

alter table "public"."billing_form_options" add constraint "billing_form_options_billing_code_id_fkey" FOREIGN KEY (billing_code_id) REFERENCES billing_codes(id) ON DELETE SET NULL not valid;

alter table "public"."billing_form_options" validate constraint "billing_form_options_billing_code_id_fkey";

alter table "public"."billing_form_options" add constraint "billing_form_options_question_id_fkey" FOREIGN KEY (question_id) REFERENCES billing_form_questions(id) ON DELETE CASCADE not valid;

alter table "public"."billing_form_options" validate constraint "billing_form_options_question_id_fkey";

alter table "public"."billing_form_questions" add constraint "billing_form_questions_depends_on_option_id_fkey" FOREIGN KEY (depends_on_option_id) REFERENCES billing_form_options(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED not valid;

alter table "public"."billing_form_questions" validate constraint "billing_form_questions_depends_on_option_id_fkey";

alter table "public"."billing_form_questions" add constraint "billing_form_questions_depends_on_question_id_fkey" FOREIGN KEY (depends_on_question_id) REFERENCES billing_form_questions(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED not valid;

alter table "public"."billing_form_questions" validate constraint "billing_form_questions_depends_on_question_id_fkey";

alter table "public"."billing_form_questions" add constraint "billing_form_questions_form_id_fkey" FOREIGN KEY (form_id) REFERENCES billing_forms(id) ON DELETE CASCADE not valid;

alter table "public"."billing_form_questions" validate constraint "billing_form_questions_form_id_fkey";

alter table "public"."billing_form_questions" add constraint "billing_form_questions_question_type_check" CHECK ((question_type = ANY (ARRAY['yes_no'::text, 'single_choice'::text, 'multiple_choice'::text, 'text'::text, 'number'::text, 'bullet_points'::text]))) not valid;

alter table "public"."billing_form_questions" validate constraint "billing_form_questions_question_type_check";

alter table "public"."billing_forms" add constraint "billing_forms_category_id_fkey" FOREIGN KEY (category_id) REFERENCES examination_categories(id) ON DELETE CASCADE not valid;

alter table "public"."billing_forms" validate constraint "billing_forms_category_id_fkey";

alter table "public"."device_blockers" add constraint "device_blockers_device_id_fkey" FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE not valid;

alter table "public"."device_blockers" validate constraint "device_blockers_device_id_fkey";

alter table "public"."email_logs" add constraint "email_logs_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(id) not valid;

alter table "public"."email_logs" validate constraint "email_logs_appointment_id_fkey";

alter table "public"."email_logs" add constraint "email_logs_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES patients(id) not valid;

alter table "public"."email_logs" validate constraint "email_logs_patient_id_fkey";

alter table "public"."email_logs" add constraint "email_logs_template_id_fkey" FOREIGN KEY (template_id) REFERENCES email_templates(id) not valid;

alter table "public"."email_logs" validate constraint "email_logs_template_id_fkey";

alter table "public"."examination_billing_answers" add constraint "examination_billing_answers_examination_billing_form_id_fkey" FOREIGN KEY (examination_billing_form_id) REFERENCES examination_billing_forms(id) ON DELETE CASCADE not valid;

alter table "public"."examination_billing_answers" validate constraint "examination_billing_answers_examination_billing_form_id_fkey";

alter table "public"."examination_billing_answers" add constraint "examination_billing_answers_option_id_fkey" FOREIGN KEY (option_id) REFERENCES billing_form_options(id) not valid;

alter table "public"."examination_billing_answers" validate constraint "examination_billing_answers_option_id_fkey";

alter table "public"."examination_billing_answers" add constraint "examination_billing_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES billing_form_questions(id) not valid;

alter table "public"."examination_billing_answers" validate constraint "examination_billing_answers_question_id_fkey";

alter table "public"."examination_billing_codes" add constraint "examination_billing_codes_billing_code_id_fkey" FOREIGN KEY (billing_code_id) REFERENCES billing_codes(id) ON DELETE CASCADE not valid;

alter table "public"."examination_billing_codes" validate constraint "examination_billing_codes_billing_code_id_fkey";

alter table "public"."examination_billing_codes" add constraint "examination_billing_codes_examination_id_billing_code_id_key" UNIQUE using index "examination_billing_codes_examination_id_billing_code_id_key";

alter table "public"."examination_billing_codes" add constraint "examination_billing_codes_examination_id_fkey" FOREIGN KEY (examination_id) REFERENCES examinations(id) ON DELETE CASCADE not valid;

alter table "public"."examination_billing_codes" validate constraint "examination_billing_codes_examination_id_fkey";

alter table "public"."examination_billing_forms" add constraint "examination_billing_forms_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."examination_billing_forms" validate constraint "examination_billing_forms_created_by_fkey";

alter table "public"."examination_billing_forms" add constraint "examination_billing_forms_examination_id_fkey" FOREIGN KEY (examination_id) REFERENCES examinations(id) ON DELETE CASCADE not valid;

alter table "public"."examination_billing_forms" validate constraint "examination_billing_forms_examination_id_fkey";

alter table "public"."examination_billing_forms" add constraint "examination_billing_forms_form_id_fkey" FOREIGN KEY (form_id) REFERENCES billing_forms(id) not valid;

alter table "public"."examination_billing_forms" validate constraint "examination_billing_forms_form_id_fkey";

alter table "public"."examination_categories" add constraint "examination_categories_name_key" UNIQUE using index "examination_categories_name_key";

alter table "public"."examinations" add constraint "examinations_category_id_fkey" FOREIGN KEY (category_id) REFERENCES examination_categories(id) not valid;

alter table "public"."examinations" validate constraint "examinations_category_id_fkey";

alter table "public"."insurance_billing_factors" add constraint "insurance_billing_factors_billing_category_id_fkey" FOREIGN KEY (billing_category_id) REFERENCES billing_categories(id) ON DELETE CASCADE not valid;

alter table "public"."insurance_billing_factors" validate constraint "insurance_billing_factors_billing_category_id_fkey";

alter table "public"."insurance_billing_factors" add constraint "insurance_billing_factors_insurance_provider_id_billing_cat_key" UNIQUE using index "insurance_billing_factors_insurance_provider_id_billing_cat_key";

alter table "public"."insurance_billing_factors" add constraint "insurance_billing_factors_insurance_provider_id_fkey" FOREIGN KEY (insurance_provider_id) REFERENCES insurance_providers(id) ON DELETE CASCADE not valid;

alter table "public"."insurance_billing_factors" validate constraint "insurance_billing_factors_insurance_provider_id_fkey";

alter table "public"."reports" add constraint "reports_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE not valid;

alter table "public"."reports" validate constraint "reports_appointment_id_fkey";

alter table "public"."reports" add constraint "reports_appointment_id_key" UNIQUE using index "reports_appointment_id_key";

alter table "public"."reports" add constraint "reports_completed_by_user_fkey" FOREIGN KEY (completed_by_user) REFERENCES auth.users(id) not valid;

alter table "public"."reports" validate constraint "reports_completed_by_user_fkey";

alter table "public"."scheduled_emails" add constraint "scheduled_emails_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(id) not valid;

alter table "public"."scheduled_emails" validate constraint "scheduled_emails_appointment_id_fkey";

alter table "public"."scheduled_emails" add constraint "scheduled_emails_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES patients(id) not valid;

alter table "public"."scheduled_emails" validate constraint "scheduled_emails_patient_id_fkey";

alter table "public"."scheduled_emails" add constraint "scheduled_emails_template_id_fkey" FOREIGN KEY (template_id) REFERENCES email_templates(id) not valid;

alter table "public"."scheduled_emails" validate constraint "scheduled_emails_template_id_fkey";

alter table "public"."insurance_providers" add constraint "insurance_providers_type_check" CHECK ((type = ANY (ARRAY['private'::text, 'statutory'::text, 'Berufsgenossenschft'::text, 'Foreigners'::text]))) not valid;

alter table "public"."insurance_providers" validate constraint "insurance_providers_type_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.begin_transaction()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- In PostgreSQL-Funktionen können wir nicht einfach BEGIN verwenden.
  -- Stattdessen verwenden wir die PERFORM-Anweisung mit einem SELECT,
  -- um eine aktive Transaktion zu erzeugen, falls noch keine existiert.
  PERFORM 1;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.commit_transaction()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- PostgreSQL-Funktionen verwenden implizit Transaktionen.
  -- Diese Funktion muss nichts tun, da die Transaktion beim erfolgreichen 
  -- Abschluss der Funktion automatisch bestätigt wird.
  NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.rollback_transaction()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Wir können einen Fehler auslösen, um einen Rollback zu erzwingen
  RAISE EXCEPTION 'Transaction rollback requested';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.save_billing_form(p_form_id uuid, p_form_name text, p_form_description text, p_form_category_id uuid, p_questions jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  created_form_id UUID;
  question_data JSONB;
  new_question_id UUID;
  option_data JSONB;
  new_option_id UUID;
  question_index INTEGER;
  option_index INTEGER;
  question_mapping JSONB := '{}';
  option_mapping JSONB := '{}';
  question_ids UUID[] := '{}';
  option_ids UUID[] := '{}';
  temp_depends_on_question_id TEXT;
  temp_depends_on_option_id TEXT;
  temp_q_id UUID;
  temp_o_id UUID;
  result JSONB;
BEGIN
  -- Protokollierung für Debugging
  RAISE NOTICE 'Starte save_billing_form mit form_id: %', p_form_id;
  
  -- Wenn form_id null ist, erstelle einen neuen Abrechnungsbogen
  IF p_form_id IS NULL THEN
    INSERT INTO billing_forms (name, description, category_id)
    VALUES (p_form_name, p_form_description, p_form_category_id)
    RETURNING id INTO created_form_id;
    
    RAISE NOTICE 'Neuer Abrechnungsbogen erstellt mit ID: %', created_form_id;
  ELSE
    -- Andernfalls aktualisiere den bestehenden Bogen
    UPDATE billing_forms
    SET name = p_form_name,
        description = p_form_description,
        category_id = p_form_category_id
    WHERE id = p_form_id;
    
    created_form_id := p_form_id;
    
    RAISE NOTICE 'Bestehender Abrechnungsbogen aktualisiert mit ID: %', created_form_id;
    
    -- Lösche bestehende Fragen (Optionen werden via CASCADE gelöscht)
    DELETE FROM billing_form_questions
    WHERE form_id = created_form_id;
    
    RAISE NOTICE 'Bestehende Fragen für Abrechnungsbogen gelöscht';
  END IF;
  
  -- Erstelle neue Fragen und Optionen ohne Abhängigkeiten
  question_index := 0;
  RAISE NOTICE 'Beginne mit der Erstellung von % Fragen', jsonb_array_length(p_questions);
  
  FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    -- Erstelle Frage ohne Abhängigkeiten
    INSERT INTO billing_form_questions (
      form_id,
      question_text,
      question_type,
      required,
      order_index,
      depends_on_question_id,
      depends_on_option_id
    )
    VALUES (
      created_form_id,
      question_data->>'question_text',
      question_data->>'question_type',
      (question_data->>'required')::boolean,
      question_index,
      NULL,  -- Abhängigkeiten werden später gesetzt
      NULL   -- Abhängigkeiten werden später gesetzt
    )
    RETURNING id INTO new_question_id;
    
    RAISE NOTICE 'Frage % erstellt: ID=%, Text=%, Type=%', 
      question_index, new_question_id, question_data->>'question_text', question_data->>'question_type';
    
    -- Speichere die Zuordnung zwischen Index und ID
    question_mapping := question_mapping || jsonb_build_object(question_index::text, new_question_id);
    question_ids := array_append(question_ids, new_question_id);
    
    -- Erstelle Optionen für diese Frage
    option_index := 0;
    FOR option_data IN SELECT * FROM jsonb_array_elements(question_data->'options')
    LOOP
      INSERT INTO billing_form_options (
        question_id,
        option_text,
        billing_code_id,
        order_index,
        option_type
      )
      VALUES (
        new_question_id,
        option_data->>'option_text',
        (option_data->>'billing_code_id')::uuid,
        option_index,
        option_data->>'option_type'
      )
      RETURNING id INTO new_option_id;
      
      RAISE NOTICE 'Option %_% erstellt: ID=%, Text=%', 
        question_index, option_index, new_option_id, option_data->>'option_text';
      
      -- Speichere die Zuordnung zwischen Frageindex, Optionsindex und ID
      option_mapping := option_mapping || jsonb_build_object(
        question_index::text || '_' || option_index::text, 
        new_option_id
      );
      option_ids := array_append(option_ids, new_option_id);
      
      option_index := option_index + 1;
    END LOOP;
    
    question_index := question_index + 1;
  END LOOP;
  
  -- Jetzt aktualisiere alle Abhängigkeiten in einem zweiten Durchlauf
  RAISE NOTICE 'Beginne mit der Aktualisierung der Abhängigkeiten';
  question_index := 0;
  
  FOR question_data IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    -- Extrahiere Abhängigkeitsinformationen
    temp_depends_on_question_id := question_data->>'depends_on_question_id';
    temp_depends_on_option_id := question_data->>'depends_on_option_id';
    temp_q_id := NULL;
    temp_o_id := NULL;
    
    RAISE NOTICE 'Verarbeite Abhängigkeiten für Frage %: depends_on_question_id=%, depends_on_option_id=%', 
      question_index, temp_depends_on_question_id, temp_depends_on_option_id;
    
    -- Verarbeite Question-ID-Abhängigkeit
    IF temp_depends_on_question_id IS NOT NULL AND temp_depends_on_question_id != '' THEN
      IF temp_depends_on_question_id LIKE 'new-%' THEN
        -- Neue Frage-ID
        DECLARE
          index_str TEXT := REPLACE(temp_depends_on_question_id, 'new-', '');
        BEGIN
          RAISE NOTICE 'Versuche, neue Frage-ID zu finden für Index %', index_str;
          temp_q_id := (question_mapping->>index_str)::uuid;
          RAISE NOTICE 'Gefundene Question-ID für Index %: %', index_str, temp_q_id;
        END;
      ELSE
        -- Bestehende Frage-ID
        BEGIN
          temp_q_id := temp_depends_on_question_id::uuid;
          RAISE NOTICE 'Verwende bestehende Question-ID: %', temp_q_id;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Fehler beim Konvertieren der Question-ID: %', temp_depends_on_question_id;
        END;
      END IF;
    END IF;
    
    -- Verarbeite Option-ID-Abhängigkeit
    IF temp_depends_on_option_id IS NOT NULL AND temp_depends_on_option_id != '' THEN
      IF temp_depends_on_option_id LIKE 'new-option-%' THEN
        -- Neue Option-ID, Format: new-option-QINDEX-OINDEX
        DECLARE
          parts TEXT[];
          option_key TEXT;
          orig_key TEXT := REPLACE(temp_depends_on_option_id, 'new-option-', '');
        BEGIN
          RAISE NOTICE 'Versuche, neue Option-ID zu finden für %', orig_key;
          
          -- Versuche das Format new-option-INDEX zu verarbeiten
          IF orig_key ~ '^[0-9]+$' THEN
            option_key := '0_' || orig_key;  -- Nimm an, es ist die erste Frage
            RAISE NOTICE 'Einfacher Index, verwende Schlüssel: %', option_key;
          ELSE
            -- Versuche das Format new-option-QINDEX-OINDEX zu verarbeiten
            parts := string_to_array(orig_key, '-');
            IF array_length(parts, 1) >= 2 THEN
              option_key := parts[1] || '_' || parts[2];
              RAISE NOTICE 'Zusammengesetzter Index, verwende Schlüssel: %', option_key;
            ELSE
              option_key := orig_key;
              RAISE NOTICE 'Unbekanntes Format, verwende direkt: %', option_key;
            END IF;
          END IF;
          
          temp_o_id := (option_mapping->>option_key)::uuid;
          RAISE NOTICE 'Gefundene Option-ID für Schlüssel %: %', option_key, temp_o_id;
        END;
      ELSE
        -- Bestehende Option-ID
        BEGIN
          temp_o_id := temp_depends_on_option_id::uuid;
          RAISE NOTICE 'Verwende bestehende Option-ID: %', temp_o_id;
        EXCEPTION WHEN OTHERS THEN
          RAISE NOTICE 'Fehler beim Konvertieren der Option-ID: %', temp_depends_on_option_id;
        END;
      END IF;
    END IF;
    
    -- Aktualisiere die Abhängigkeiten nur, wenn sie gesetzt werden sollen
    IF temp_q_id IS NOT NULL OR temp_o_id IS NOT NULL THEN
      RAISE NOTICE 'Aktualisiere Abhängigkeiten für Frage %: question_id=%, depends_on_question_id=%, depends_on_option_id=%', 
        question_index, question_ids[question_index + 1], temp_q_id, temp_o_id;
      
      -- WICHTIGE KORREKTUR: question_index + 1 zu question_index geändert
      -- Arrays in PostgreSQL beginnen bei 1, nicht bei 0
      IF question_index < array_length(question_ids, 1) THEN
        UPDATE billing_form_questions
        SET depends_on_question_id = temp_q_id,
            depends_on_option_id = temp_o_id
        WHERE id = question_ids[question_index + 1];
        
        -- Überprüfe, ob das Update erfolgreich war
        DECLARE
          updated_rows INTEGER;
        BEGIN
          GET DIAGNOSTICS updated_rows = ROW_COUNT;
          RAISE NOTICE 'Update für Frage % abgeschlossen, % Zeilen betroffen', question_index, updated_rows;
        END;
      ELSE
        RAISE NOTICE 'Index % außerhalb des gültigen Bereichs für question_ids (Länge: %)', 
          question_index, array_length(question_ids, 1);
      END IF;
    END IF;
    
    question_index := question_index + 1;
  END LOOP;
  
  -- Zeige das finale Mapping für Debugging
  RAISE NOTICE 'Finales Question-Mapping: %', question_mapping;
  RAISE NOTICE 'Finales Option-Mapping: %', option_mapping;
  
  -- Erstelle Ergebnis
  result := jsonb_build_object(
    'success', true,
    'form_id', created_form_id,
    'question_ids', question_ids,
    'option_ids', option_ids,
    'debug', jsonb_build_object(
      'question_mapping', question_mapping,
      'option_mapping', option_mapping
    )
  );

  RETURN result;

EXCEPTION WHEN OTHERS THEN
  -- Bei Fehler: Ergebnisdaten mit Fehlermeldung erstellen
  RAISE NOTICE 'Fehler in save_billing_form: %', SQLERRM;
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$function$
;

grant delete on table "public"."appointment_forms" to "anon";

grant insert on table "public"."appointment_forms" to "anon";

grant references on table "public"."appointment_forms" to "anon";

grant select on table "public"."appointment_forms" to "anon";

grant trigger on table "public"."appointment_forms" to "anon";

grant truncate on table "public"."appointment_forms" to "anon";

grant update on table "public"."appointment_forms" to "anon";

grant delete on table "public"."appointment_forms" to "authenticated";

grant insert on table "public"."appointment_forms" to "authenticated";

grant references on table "public"."appointment_forms" to "authenticated";

grant select on table "public"."appointment_forms" to "authenticated";

grant trigger on table "public"."appointment_forms" to "authenticated";

grant truncate on table "public"."appointment_forms" to "authenticated";

grant update on table "public"."appointment_forms" to "authenticated";

grant delete on table "public"."appointment_forms" to "service_role";

grant insert on table "public"."appointment_forms" to "service_role";

grant references on table "public"."appointment_forms" to "service_role";

grant select on table "public"."appointment_forms" to "service_role";

grant trigger on table "public"."appointment_forms" to "service_role";

grant truncate on table "public"."appointment_forms" to "service_role";

grant update on table "public"."appointment_forms" to "service_role";

grant delete on table "public"."billing_categories" to "anon";

grant insert on table "public"."billing_categories" to "anon";

grant references on table "public"."billing_categories" to "anon";

grant select on table "public"."billing_categories" to "anon";

grant trigger on table "public"."billing_categories" to "anon";

grant truncate on table "public"."billing_categories" to "anon";

grant update on table "public"."billing_categories" to "anon";

grant delete on table "public"."billing_categories" to "authenticated";

grant insert on table "public"."billing_categories" to "authenticated";

grant references on table "public"."billing_categories" to "authenticated";

grant select on table "public"."billing_categories" to "authenticated";

grant trigger on table "public"."billing_categories" to "authenticated";

grant truncate on table "public"."billing_categories" to "authenticated";

grant update on table "public"."billing_categories" to "authenticated";

grant delete on table "public"."billing_categories" to "service_role";

grant insert on table "public"."billing_categories" to "service_role";

grant references on table "public"."billing_categories" to "service_role";

grant select on table "public"."billing_categories" to "service_role";

grant trigger on table "public"."billing_categories" to "service_role";

grant truncate on table "public"."billing_categories" to "service_role";

grant update on table "public"."billing_categories" to "service_role";

grant delete on table "public"."billing_code_examination_categories" to "anon";

grant insert on table "public"."billing_code_examination_categories" to "anon";

grant references on table "public"."billing_code_examination_categories" to "anon";

grant select on table "public"."billing_code_examination_categories" to "anon";

grant trigger on table "public"."billing_code_examination_categories" to "anon";

grant truncate on table "public"."billing_code_examination_categories" to "anon";

grant update on table "public"."billing_code_examination_categories" to "anon";

grant delete on table "public"."billing_code_examination_categories" to "authenticated";

grant insert on table "public"."billing_code_examination_categories" to "authenticated";

grant references on table "public"."billing_code_examination_categories" to "authenticated";

grant select on table "public"."billing_code_examination_categories" to "authenticated";

grant trigger on table "public"."billing_code_examination_categories" to "authenticated";

grant truncate on table "public"."billing_code_examination_categories" to "authenticated";

grant update on table "public"."billing_code_examination_categories" to "authenticated";

grant delete on table "public"."billing_code_examination_categories" to "service_role";

grant insert on table "public"."billing_code_examination_categories" to "service_role";

grant references on table "public"."billing_code_examination_categories" to "service_role";

grant select on table "public"."billing_code_examination_categories" to "service_role";

grant trigger on table "public"."billing_code_examination_categories" to "service_role";

grant truncate on table "public"."billing_code_examination_categories" to "service_role";

grant update on table "public"."billing_code_examination_categories" to "service_role";

grant delete on table "public"."billing_codes" to "anon";

grant insert on table "public"."billing_codes" to "anon";

grant references on table "public"."billing_codes" to "anon";

grant select on table "public"."billing_codes" to "anon";

grant trigger on table "public"."billing_codes" to "anon";

grant truncate on table "public"."billing_codes" to "anon";

grant update on table "public"."billing_codes" to "anon";

grant delete on table "public"."billing_codes" to "authenticated";

grant insert on table "public"."billing_codes" to "authenticated";

grant references on table "public"."billing_codes" to "authenticated";

grant select on table "public"."billing_codes" to "authenticated";

grant trigger on table "public"."billing_codes" to "authenticated";

grant truncate on table "public"."billing_codes" to "authenticated";

grant update on table "public"."billing_codes" to "authenticated";

grant delete on table "public"."billing_codes" to "service_role";

grant insert on table "public"."billing_codes" to "service_role";

grant references on table "public"."billing_codes" to "service_role";

grant select on table "public"."billing_codes" to "service_role";

grant trigger on table "public"."billing_codes" to "service_role";

grant truncate on table "public"."billing_codes" to "service_role";

grant update on table "public"."billing_codes" to "service_role";

grant delete on table "public"."billing_form_options" to "anon";

grant insert on table "public"."billing_form_options" to "anon";

grant references on table "public"."billing_form_options" to "anon";

grant select on table "public"."billing_form_options" to "anon";

grant trigger on table "public"."billing_form_options" to "anon";

grant truncate on table "public"."billing_form_options" to "anon";

grant update on table "public"."billing_form_options" to "anon";

grant delete on table "public"."billing_form_options" to "authenticated";

grant insert on table "public"."billing_form_options" to "authenticated";

grant references on table "public"."billing_form_options" to "authenticated";

grant select on table "public"."billing_form_options" to "authenticated";

grant trigger on table "public"."billing_form_options" to "authenticated";

grant truncate on table "public"."billing_form_options" to "authenticated";

grant update on table "public"."billing_form_options" to "authenticated";

grant delete on table "public"."billing_form_options" to "service_role";

grant insert on table "public"."billing_form_options" to "service_role";

grant references on table "public"."billing_form_options" to "service_role";

grant select on table "public"."billing_form_options" to "service_role";

grant trigger on table "public"."billing_form_options" to "service_role";

grant truncate on table "public"."billing_form_options" to "service_role";

grant update on table "public"."billing_form_options" to "service_role";

grant delete on table "public"."billing_form_questions" to "anon";

grant insert on table "public"."billing_form_questions" to "anon";

grant references on table "public"."billing_form_questions" to "anon";

grant select on table "public"."billing_form_questions" to "anon";

grant trigger on table "public"."billing_form_questions" to "anon";

grant truncate on table "public"."billing_form_questions" to "anon";

grant update on table "public"."billing_form_questions" to "anon";

grant delete on table "public"."billing_form_questions" to "authenticated";

grant insert on table "public"."billing_form_questions" to "authenticated";

grant references on table "public"."billing_form_questions" to "authenticated";

grant select on table "public"."billing_form_questions" to "authenticated";

grant trigger on table "public"."billing_form_questions" to "authenticated";

grant truncate on table "public"."billing_form_questions" to "authenticated";

grant update on table "public"."billing_form_questions" to "authenticated";

grant delete on table "public"."billing_form_questions" to "service_role";

grant insert on table "public"."billing_form_questions" to "service_role";

grant references on table "public"."billing_form_questions" to "service_role";

grant select on table "public"."billing_form_questions" to "service_role";

grant trigger on table "public"."billing_form_questions" to "service_role";

grant truncate on table "public"."billing_form_questions" to "service_role";

grant update on table "public"."billing_form_questions" to "service_role";

grant delete on table "public"."billing_forms" to "anon";

grant insert on table "public"."billing_forms" to "anon";

grant references on table "public"."billing_forms" to "anon";

grant select on table "public"."billing_forms" to "anon";

grant trigger on table "public"."billing_forms" to "anon";

grant truncate on table "public"."billing_forms" to "anon";

grant update on table "public"."billing_forms" to "anon";

grant delete on table "public"."billing_forms" to "authenticated";

grant insert on table "public"."billing_forms" to "authenticated";

grant references on table "public"."billing_forms" to "authenticated";

grant select on table "public"."billing_forms" to "authenticated";

grant trigger on table "public"."billing_forms" to "authenticated";

grant truncate on table "public"."billing_forms" to "authenticated";

grant update on table "public"."billing_forms" to "authenticated";

grant delete on table "public"."billing_forms" to "service_role";

grant insert on table "public"."billing_forms" to "service_role";

grant references on table "public"."billing_forms" to "service_role";

grant select on table "public"."billing_forms" to "service_role";

grant trigger on table "public"."billing_forms" to "service_role";

grant truncate on table "public"."billing_forms" to "service_role";

grant update on table "public"."billing_forms" to "service_role";

grant delete on table "public"."device_blockers" to "anon";

grant insert on table "public"."device_blockers" to "anon";

grant references on table "public"."device_blockers" to "anon";

grant select on table "public"."device_blockers" to "anon";

grant trigger on table "public"."device_blockers" to "anon";

grant truncate on table "public"."device_blockers" to "anon";

grant update on table "public"."device_blockers" to "anon";

grant delete on table "public"."device_blockers" to "authenticated";

grant insert on table "public"."device_blockers" to "authenticated";

grant references on table "public"."device_blockers" to "authenticated";

grant select on table "public"."device_blockers" to "authenticated";

grant trigger on table "public"."device_blockers" to "authenticated";

grant truncate on table "public"."device_blockers" to "authenticated";

grant update on table "public"."device_blockers" to "authenticated";

grant delete on table "public"."device_blockers" to "service_role";

grant insert on table "public"."device_blockers" to "service_role";

grant references on table "public"."device_blockers" to "service_role";

grant select on table "public"."device_blockers" to "service_role";

grant trigger on table "public"."device_blockers" to "service_role";

grant truncate on table "public"."device_blockers" to "service_role";

grant update on table "public"."device_blockers" to "service_role";

grant delete on table "public"."email_logs" to "anon";

grant insert on table "public"."email_logs" to "anon";

grant references on table "public"."email_logs" to "anon";

grant select on table "public"."email_logs" to "anon";

grant trigger on table "public"."email_logs" to "anon";

grant truncate on table "public"."email_logs" to "anon";

grant update on table "public"."email_logs" to "anon";

grant delete on table "public"."email_logs" to "authenticated";

grant insert on table "public"."email_logs" to "authenticated";

grant references on table "public"."email_logs" to "authenticated";

grant select on table "public"."email_logs" to "authenticated";

grant trigger on table "public"."email_logs" to "authenticated";

grant truncate on table "public"."email_logs" to "authenticated";

grant update on table "public"."email_logs" to "authenticated";

grant delete on table "public"."email_logs" to "service_role";

grant insert on table "public"."email_logs" to "service_role";

grant references on table "public"."email_logs" to "service_role";

grant select on table "public"."email_logs" to "service_role";

grant trigger on table "public"."email_logs" to "service_role";

grant truncate on table "public"."email_logs" to "service_role";

grant update on table "public"."email_logs" to "service_role";

grant delete on table "public"."examination_billing_answers" to "anon";

grant insert on table "public"."examination_billing_answers" to "anon";

grant references on table "public"."examination_billing_answers" to "anon";

grant select on table "public"."examination_billing_answers" to "anon";

grant trigger on table "public"."examination_billing_answers" to "anon";

grant truncate on table "public"."examination_billing_answers" to "anon";

grant update on table "public"."examination_billing_answers" to "anon";

grant delete on table "public"."examination_billing_answers" to "authenticated";

grant insert on table "public"."examination_billing_answers" to "authenticated";

grant references on table "public"."examination_billing_answers" to "authenticated";

grant select on table "public"."examination_billing_answers" to "authenticated";

grant trigger on table "public"."examination_billing_answers" to "authenticated";

grant truncate on table "public"."examination_billing_answers" to "authenticated";

grant update on table "public"."examination_billing_answers" to "authenticated";

grant delete on table "public"."examination_billing_answers" to "service_role";

grant insert on table "public"."examination_billing_answers" to "service_role";

grant references on table "public"."examination_billing_answers" to "service_role";

grant select on table "public"."examination_billing_answers" to "service_role";

grant trigger on table "public"."examination_billing_answers" to "service_role";

grant truncate on table "public"."examination_billing_answers" to "service_role";

grant update on table "public"."examination_billing_answers" to "service_role";

grant delete on table "public"."examination_billing_codes" to "anon";

grant insert on table "public"."examination_billing_codes" to "anon";

grant references on table "public"."examination_billing_codes" to "anon";

grant select on table "public"."examination_billing_codes" to "anon";

grant trigger on table "public"."examination_billing_codes" to "anon";

grant truncate on table "public"."examination_billing_codes" to "anon";

grant update on table "public"."examination_billing_codes" to "anon";

grant delete on table "public"."examination_billing_codes" to "authenticated";

grant insert on table "public"."examination_billing_codes" to "authenticated";

grant references on table "public"."examination_billing_codes" to "authenticated";

grant select on table "public"."examination_billing_codes" to "authenticated";

grant trigger on table "public"."examination_billing_codes" to "authenticated";

grant truncate on table "public"."examination_billing_codes" to "authenticated";

grant update on table "public"."examination_billing_codes" to "authenticated";

grant delete on table "public"."examination_billing_codes" to "service_role";

grant insert on table "public"."examination_billing_codes" to "service_role";

grant references on table "public"."examination_billing_codes" to "service_role";

grant select on table "public"."examination_billing_codes" to "service_role";

grant trigger on table "public"."examination_billing_codes" to "service_role";

grant truncate on table "public"."examination_billing_codes" to "service_role";

grant update on table "public"."examination_billing_codes" to "service_role";

grant delete on table "public"."examination_billing_forms" to "anon";

grant insert on table "public"."examination_billing_forms" to "anon";

grant references on table "public"."examination_billing_forms" to "anon";

grant select on table "public"."examination_billing_forms" to "anon";

grant trigger on table "public"."examination_billing_forms" to "anon";

grant truncate on table "public"."examination_billing_forms" to "anon";

grant update on table "public"."examination_billing_forms" to "anon";

grant delete on table "public"."examination_billing_forms" to "authenticated";

grant insert on table "public"."examination_billing_forms" to "authenticated";

grant references on table "public"."examination_billing_forms" to "authenticated";

grant select on table "public"."examination_billing_forms" to "authenticated";

grant trigger on table "public"."examination_billing_forms" to "authenticated";

grant truncate on table "public"."examination_billing_forms" to "authenticated";

grant update on table "public"."examination_billing_forms" to "authenticated";

grant delete on table "public"."examination_billing_forms" to "service_role";

grant insert on table "public"."examination_billing_forms" to "service_role";

grant references on table "public"."examination_billing_forms" to "service_role";

grant select on table "public"."examination_billing_forms" to "service_role";

grant trigger on table "public"."examination_billing_forms" to "service_role";

grant truncate on table "public"."examination_billing_forms" to "service_role";

grant update on table "public"."examination_billing_forms" to "service_role";

grant delete on table "public"."examination_categories" to "anon";

grant insert on table "public"."examination_categories" to "anon";

grant references on table "public"."examination_categories" to "anon";

grant select on table "public"."examination_categories" to "anon";

grant trigger on table "public"."examination_categories" to "anon";

grant truncate on table "public"."examination_categories" to "anon";

grant update on table "public"."examination_categories" to "anon";

grant delete on table "public"."examination_categories" to "authenticated";

grant insert on table "public"."examination_categories" to "authenticated";

grant references on table "public"."examination_categories" to "authenticated";

grant select on table "public"."examination_categories" to "authenticated";

grant trigger on table "public"."examination_categories" to "authenticated";

grant truncate on table "public"."examination_categories" to "authenticated";

grant update on table "public"."examination_categories" to "authenticated";

grant delete on table "public"."examination_categories" to "service_role";

grant insert on table "public"."examination_categories" to "service_role";

grant references on table "public"."examination_categories" to "service_role";

grant select on table "public"."examination_categories" to "service_role";

grant trigger on table "public"."examination_categories" to "service_role";

grant truncate on table "public"."examination_categories" to "service_role";

grant update on table "public"."examination_categories" to "service_role";

grant delete on table "public"."insurance_billing_factors" to "anon";

grant insert on table "public"."insurance_billing_factors" to "anon";

grant references on table "public"."insurance_billing_factors" to "anon";

grant select on table "public"."insurance_billing_factors" to "anon";

grant trigger on table "public"."insurance_billing_factors" to "anon";

grant truncate on table "public"."insurance_billing_factors" to "anon";

grant update on table "public"."insurance_billing_factors" to "anon";

grant delete on table "public"."insurance_billing_factors" to "authenticated";

grant insert on table "public"."insurance_billing_factors" to "authenticated";

grant references on table "public"."insurance_billing_factors" to "authenticated";

grant select on table "public"."insurance_billing_factors" to "authenticated";

grant trigger on table "public"."insurance_billing_factors" to "authenticated";

grant truncate on table "public"."insurance_billing_factors" to "authenticated";

grant update on table "public"."insurance_billing_factors" to "authenticated";

grant delete on table "public"."insurance_billing_factors" to "service_role";

grant insert on table "public"."insurance_billing_factors" to "service_role";

grant references on table "public"."insurance_billing_factors" to "service_role";

grant select on table "public"."insurance_billing_factors" to "service_role";

grant trigger on table "public"."insurance_billing_factors" to "service_role";

grant truncate on table "public"."insurance_billing_factors" to "service_role";

grant update on table "public"."insurance_billing_factors" to "service_role";

grant delete on table "public"."report_templates" to "anon";

grant insert on table "public"."report_templates" to "anon";

grant references on table "public"."report_templates" to "anon";

grant select on table "public"."report_templates" to "anon";

grant trigger on table "public"."report_templates" to "anon";

grant truncate on table "public"."report_templates" to "anon";

grant update on table "public"."report_templates" to "anon";

grant delete on table "public"."report_templates" to "authenticated";

grant insert on table "public"."report_templates" to "authenticated";

grant references on table "public"."report_templates" to "authenticated";

grant select on table "public"."report_templates" to "authenticated";

grant trigger on table "public"."report_templates" to "authenticated";

grant truncate on table "public"."report_templates" to "authenticated";

grant update on table "public"."report_templates" to "authenticated";

grant delete on table "public"."report_templates" to "service_role";

grant insert on table "public"."report_templates" to "service_role";

grant references on table "public"."report_templates" to "service_role";

grant select on table "public"."report_templates" to "service_role";

grant trigger on table "public"."report_templates" to "service_role";

grant truncate on table "public"."report_templates" to "service_role";

grant update on table "public"."report_templates" to "service_role";

grant delete on table "public"."reports" to "anon";

grant insert on table "public"."reports" to "anon";

grant references on table "public"."reports" to "anon";

grant select on table "public"."reports" to "anon";

grant trigger on table "public"."reports" to "anon";

grant truncate on table "public"."reports" to "anon";

grant update on table "public"."reports" to "anon";

grant delete on table "public"."reports" to "authenticated";

grant insert on table "public"."reports" to "authenticated";

grant references on table "public"."reports" to "authenticated";

grant select on table "public"."reports" to "authenticated";

grant trigger on table "public"."reports" to "authenticated";

grant truncate on table "public"."reports" to "authenticated";

grant update on table "public"."reports" to "authenticated";

grant delete on table "public"."reports" to "service_role";

grant insert on table "public"."reports" to "service_role";

grant references on table "public"."reports" to "service_role";

grant select on table "public"."reports" to "service_role";

grant trigger on table "public"."reports" to "service_role";

grant truncate on table "public"."reports" to "service_role";

grant update on table "public"."reports" to "service_role";

grant delete on table "public"."scheduled_emails" to "anon";

grant insert on table "public"."scheduled_emails" to "anon";

grant references on table "public"."scheduled_emails" to "anon";

grant select on table "public"."scheduled_emails" to "anon";

grant trigger on table "public"."scheduled_emails" to "anon";

grant truncate on table "public"."scheduled_emails" to "anon";

grant update on table "public"."scheduled_emails" to "anon";

grant delete on table "public"."scheduled_emails" to "authenticated";

grant insert on table "public"."scheduled_emails" to "authenticated";

grant references on table "public"."scheduled_emails" to "authenticated";

grant select on table "public"."scheduled_emails" to "authenticated";

grant trigger on table "public"."scheduled_emails" to "authenticated";

grant truncate on table "public"."scheduled_emails" to "authenticated";

grant update on table "public"."scheduled_emails" to "authenticated";

grant delete on table "public"."scheduled_emails" to "service_role";

grant insert on table "public"."scheduled_emails" to "service_role";

grant references on table "public"."scheduled_emails" to "service_role";

grant select on table "public"."scheduled_emails" to "service_role";

grant trigger on table "public"."scheduled_emails" to "service_role";

grant truncate on table "public"."scheduled_emails" to "service_role";

grant update on table "public"."scheduled_emails" to "service_role";

create policy "billing_categories_auth_policy"
on "public"."billing_categories"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Billing code examination categories are deletable by authentica"
on "public"."billing_code_examination_categories"
as permissive
for delete
to public
using ((auth.role() = 'authenticated'::text));


create policy "Billing code examination categories are insertable by authentic"
on "public"."billing_code_examination_categories"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Billing code examination categories are updatable by authentica"
on "public"."billing_code_examination_categories"
as permissive
for update
to public
using ((auth.role() = 'authenticated'::text));


create policy "Billing code examination categories are viewable by all users"
on "public"."billing_code_examination_categories"
as permissive
for select
to public
using (true);


create policy "Billing codes are viewable by authenticated users"
on "public"."billing_codes"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Users with admin roles can insert billing codes"
on "public"."billing_codes"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Users with admin roles can update billing codes"
on "public"."billing_codes"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "billing_codes_auth_policy"
on "public"."billing_codes"
as permissive
for all
to authenticated
using (true)
with check (true);


create policy "Only admins can create options"
on "public"."billing_form_options"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Only admins can delete options"
on "public"."billing_form_options"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Only admins can update options"
on "public"."billing_form_options"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Options are viewable by authenticated users"
on "public"."billing_form_options"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Only admins can create questions"
on "public"."billing_form_questions"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Only admins can delete questions"
on "public"."billing_form_questions"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Only admins can update questions"
on "public"."billing_form_questions"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Questions are viewable by authenticated users"
on "public"."billing_form_questions"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Billing forms are viewable by authenticated users"
on "public"."billing_forms"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Only admins can create billing forms"
on "public"."billing_forms"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Only admins can delete billing forms"
on "public"."billing_forms"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Only admins can update billing forms"
on "public"."billing_forms"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Answers are viewable by authenticated users"
on "public"."examination_billing_answers"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Authenticated users can create answers"
on "public"."examination_billing_answers"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Examination billing codes are viewable by authenticated users"
on "public"."examination_billing_codes"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "Only admins can create examination billing codes"
on "public"."examination_billing_codes"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Only admins can delete examination billing codes"
on "public"."examination_billing_codes"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Only admins can update examination billing codes"
on "public"."examination_billing_codes"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM (user_roles ur
     JOIN roles r ON ((ur.role_id = r.id)))
  WHERE ((ur.user_id = auth.uid()) AND (r.name = 'admin'::text)))));


create policy "Authenticated users can create filled forms"
on "public"."examination_billing_forms"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Filled forms are viewable by authenticated users"
on "public"."examination_billing_forms"
as permissive
for select
to public
using ((auth.role() = 'authenticated'::text));


create policy "examination_categories_policy"
on "public"."examination_categories"
as permissive
for all
to public
using (true)
with check (true);


create policy "Offener Zugriff auf patient_photos Tabelle"
on "public"."patient_photos"
as permissive
for all
to public
using (true);


create policy "Allow public access to report templates"
on "public"."report_templates"
as permissive
for all
to public
using (true)
with check (true);


create policy "Report templates are accessible to all authenticated users"
on "public"."report_templates"
as permissive
for all
to authenticated
using (true)
with check (true);


CREATE TRIGGER update_billing_categories_updated_at BEFORE UPDATE ON public.billing_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_codes_updated_at BEFORE UPDATE ON public.billing_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_form_options_updated_at BEFORE UPDATE ON public.billing_form_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_form_questions_updated_at BEFORE UPDATE ON public.billing_form_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_forms_updated_at BEFORE UPDATE ON public.billing_forms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_examination_billing_codes_updated_at BEFORE UPDATE ON public.examination_billing_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_insurance_billing_factors_updated_at BEFORE UPDATE ON public.insurance_billing_factors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


