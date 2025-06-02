create type "public"."body_side_enum" as enum ('left', 'right', 'both_sides');

DROP POLICY IF EXISTS "Enable delete access for own comments" on "public"."appointment_comments";

DROP POLICY IF EXISTS "Enable insert access for authenticated users" on "public"."appointment_comments";

DROP POLICY IF EXISTS "Enable read access for authenticated users" on "public"."appointment_comments";

DROP POLICY IF EXISTS "Enable update access for own comments" on "public"."appointment_comments";

alter table "public"."user_profiles" drop constraint "user_profiles_user_id_fkey";

alter table "public"."user_roles" drop constraint "user_roles_user_id_fkey";

alter table "public"."insurance_providers" drop constraint "insurance_providers_type_check";

drop view if exists "public"."appointment_forms_view";

alter table "public"."forms" alter column "form_type" drop default;

alter type "public"."form_type_enum" rename to "form_type_enum__old_version_to_be_dropped";

create type "public"."form_type_enum" as enum ('registration', 'registration_bg', 'privacy', 'mri_consent', 'prostate_new_patient', 'ct_consent', 'ct_therapy', 'mri_ct_consent', 'prostate_questionnaire', 'biopsy', 'prostate_followup', 'prostate_tulsa', 'prostate_holep', 'ipss');


DROP TABLE IF EXISTS "public"."biopsy_form_submissions";
create table "public"."biopsy_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "consent_pelvis_ct" boolean,
    "has_disorders_of_metabolism_or_organs" boolean,
    "which_disorders" text,
    "risk_factors" text[],
    "further_risk_factors" text,
    "has_acute_infectious_disease" boolean,
    "which_acute_infectious_disease" text,
    "has_infectious_disease" boolean,
    "which_infectious_disease" text,
    "taking_blood_thinning_medication" boolean,
    "which_blood_thinning_medication" text,
    "since_when_taking_medication" text,
    "stopped_medication" text,
    "when_stopped_medication_in_days" integer,
    "when_adapted_medication_in_days" integer,
    "which_new_medication" text,
    "taking_regular_medication" boolean,
    "which_regular_medication" text,
    "taken_aspirin_or_blood_thinner" boolean,
    "when_taken_aspirin_or_blood_thinner" integer,
    "increased_bleeding" boolean,
    "suppuration_or_abscesses" boolean,
    "surgery_on_urinary_organs" boolean,
    "which_surgery" text,
    "increased_bleeding_tendency" boolean,
    "has_allergies" boolean
);


DROP TABLE IF EXISTS "public"."ct_form_submissions";
create table "public"."ct_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "height" numeric not null,
    "weight" numeric not null,
    "had_previous_exam_with_contrast_media" boolean not null,
    "had_side_effects_from_contrast_media" boolean,
    "has_allergies" boolean not null,
    "which_allergies" text,
    "has_asthma" boolean not null,
    "has_preliminary_examinations" boolean not null,
    "preliminary_examinations_details" text,
    "preliminary_examinations_date" text,
    "has_known_hyperthyroidism" boolean not null,
    "taking_medication_for_hyperthyroidism" boolean not null,
    "which_hyperthyroidism_medication" text,
    "had_thyroid_surgery_or_radioactive_iodine_therapy" boolean not null,
    "has_diabetes" boolean not null,
    "taking_metformin_or_similar" boolean not null,
    "has_renal_impairment" boolean not null,
    "taking_blood_thinners" boolean not null,
    "blood_thinners_details" text,
    "blood_thinners_since" text,
    "has_infectious_disease" boolean not null,
    "infectious_disease_details" text,
    "pregnant" boolean,
    "last_menstruation" text,
    "breastfeeding" boolean
);


DROP TABLE IF EXISTS "public"."ct_therapy_form_submissions";
create table "public"."ct_therapy_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "had_previous_exam_with_contrast_media" boolean,
    "had_side_effects_from_contrast_media" boolean,
    "has_allergies" boolean,
    "which_allergies" text,
    "has_known_hyperthyroidism" boolean,
    "has_osteoporosis" boolean,
    "has_hepatitis" boolean,
    "has_diabetes" boolean,
    "has_high_blood_pressure" boolean,
    "has_increased_intraocular_pressure" boolean,
    "has_history_of_gastric_or_duodenal_ulcers" boolean,
    "has_history_of_thrombosis_or_pulmonary_embolism" boolean,
    "treated_with_anticoagulants" boolean,
    "which_anticoagulants" text,
    "height" integer,
    "weight" integer,
    "pregnant" boolean,
    "last_menstruation" text,
    "breastfeeding" boolean
);



create table if not exists "public"."document_categories" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."document_categories" enable row level security;

create table  if not exists  "public"."email_logs" (
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


DROP TABLE IF EXISTS "public"."examination_form_submissions";

create table  if not exists  "public"."examination_sequences" (
    "id" uuid not null default gen_random_uuid(),
    "examination_id" uuid,
    "name" text not null,
    "with_contrast" boolean not null default false,
    "is_standard" boolean not null default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."examination_sequences" enable row level security;

create table if not exists "public"."form_links" (
    "id" uuid not null default uuid_generate_v4(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "expires_at" timestamp with time zone not null,
    "active" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."form_links" enable row level security;

create table if not exists "public"."insurance_billing_factors" (
    "id" uuid not null default gen_random_uuid(),
    "insurance_provider_id" uuid not null,
    "billing_category_id" uuid not null,
    "factor" numeric(10,2) not null default 1.0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table if not exists "public"."ipss_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "ipss_score" integer,
    "bladder_not_empty_after_urinating" integer not null,
    "urinating_twice_in_two_hours" integer not null,
    "restart_urination" integer not null,
    "struggling_delay_urination" integer not null,
    "weak_urine_stream" integer not null,
    "strain_to_urinate" integer not null,
    "get_up_at_night_to_urinate" integer not null,
    "urination_symptoms_satisfaction_level" text not null
);

create table if not exists "public"."medical_specialties" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."medical_specialties" enable row level security;

DROP TABLE IF EXISTS "public"."mri_ct_form_submissions";
create table "public"."mri_ct_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "wearing_interfearing_devices" boolean,
    "interfearing_devices" text,
    "had_brain_or_heart_op" boolean,
    "which_op" text,
    "when_op" text,
    "had_organ_removed" boolean,
    "which_organ" text,
    "when_organ" text,
    "has_kidney_disease" boolean,
    "which_kidney_disease" text,
    "wearing_interfearing_implants_or_metal_objects" boolean,
    "which_interfearing_implants" text,
    "when_interfearing_implants" text,
    "has_injuries_by_metallic_objects" boolean,
    "which_injuries" text,
    "has_allergies" boolean,
    "which_allergies" text,
    "had_previous_exam_with_contrast_media" boolean,
    "had_side_effects_from_contrast_media" boolean,
    "has_asthma" boolean,
    "has_known_hyperthyroidism" boolean,
    "taking_medication_for_hyperthyroidism" boolean,
    "which_hyperthyroidism_medication" text,
    "had_thyroid_surgery_or_radioactive_iodine_therapy" boolean,
    "has_diabetes" boolean,
    "taking_metformin_or_similar" boolean,
    "has_renal_impairment" boolean,
    "has_glaucoma" boolean,
    "has_preliminary_examinations" boolean,
    "preliminary_examinations_details" text,
    "preliminary_examinations_date" text,
    "has_infectious_disease" boolean,
    "infectious_disease_details" text,
    "taking_blood_thinners" boolean,
    "blood_thinners_details" text,
    "blood_thinners_since" text,
    "taking_other_medications" boolean,
    "other_medications_details" text,
    "has_claustrophobia" boolean,
    "height" integer,
    "weight" integer,
    "consent_form_read" boolean
);


DROP TABLE IF EXISTS "public"."mri_form_submissions";
create table "public"."mri_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "wearing_interfearing_devices" boolean not null,
    "interfearing_devices" text,
    "had_brain_or_heart_op" boolean not null,
    "which_op" text,
    "when_op" text,
    "had_organ_removed" boolean not null,
    "which_organ" text,
    "when_organ" text,
    "has_kidney_disease" boolean not null,
    "which_kidney_disease" text,
    "wearing_interfearing_implants_or_metal_objects" boolean not null,
    "which_interfearing_implants" text,
    "when_interfearing_implants" text,
    "has_injuries_by_metallic_objects" boolean not null,
    "which_injuries" text,
    "has_allergies" boolean not null,
    "which_allergies" text,
    "has_glaucoma" boolean not null,
    "has_preliminary_examinations" boolean not null,
    "preliminary_examinations_details" text,
    "preliminary_examinations_date" text,
    "has_infectious_disease" boolean not null,
    "infectious_disease_details" text,
    "taking_blood_thinners" boolean not null,
    "blood_thinners_details" text,
    "blood_thinners_since" text,
    "taking_other_medications" boolean not null,
    "other_medications_details" text,
    "has_claustrophobia" boolean not null,
    "height" integer,
    "weight" integer,
    "pregnant" boolean,
    "last_menstruation" text,
    "breastfeeding" boolean,
    "consent_form_read" boolean not null
);


create table if not exists "public"."patient_photos" (
    "id" uuid not null default uuid_generate_v4(),
    "patient_id" uuid not null,
    "photo_data" text not null,
    "active" boolean default true,
    "created_at" timestamp with time zone default now()
);


DROP TABLE IF EXISTS "public"."privacy_form_submissions";
create table "public"."privacy_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "email_consent" boolean not null,
    "appointment_reminder_consent" boolean not null,
    "request_report_consent" boolean not null,
    "transmit_report_consent" boolean not null,
    "data_processing_consent" boolean not null,
    "foto_consent" boolean
);


DROP TABLE IF EXISTS "public"."prostate_followup_form_submissions";
create table "public"."prostate_followup_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "psa_value_1" numeric,
    "psa_date_1" text,
    "psa_value_2" numeric,
    "psa_date_2" text,
    "psa_value_3" numeric,
    "psa_date_3" text,
    "psa_value_4" numeric,
    "psa_date_4" text,
    "psa_value_5" numeric,
    "psa_date_5" text,
    "psa_value_6" numeric,
    "psa_date_6" text,
    "psa_value_7" numeric,
    "psa_date_7" text,
    "psa_value_8" numeric,
    "psa_date_8" text,
    "psa_value_9" numeric,
    "psa_date_9" text,
    "psa_value_10" numeric,
    "psa_date_10" text,
    "prostate_treatment_types" text[],
    "prostate_not_treated_reason" text,
    "enlargement_therapy_type" text[],
    "enlargement_therapy_other" text,
    "enlargement_therapy_date" text,
    "enlargement_medication_type" text[],
    "enlargement_medication_other" text,
    "enlargement_medication_since" text,
    "inflammation_therapy_type" text[],
    "inflammation_therapy_other" text,
    "inflammation_therapy_date" text,
    "inflammation_therapy_duration" text,
    "cancer_therapy_type" text[],
    "cancer_therapy_other" text,
    "cancer_therapy_date" text,
    "urination_symptoms" text[],
    "urination_pain_location" text,
    "night_urination_frequency" text,
    "urination_symptoms_duration" text,
    "urination_satisfaction_level" text,
    "has_other_problems" boolean,
    "other_problems_description" text,
    "other_problems_since" text,
    "biopsy_types" text[],
    "last_alta_biopsy_date" text,
    "last_usg_biopsy_date" text,
    "last_fusion_biopsy_date" text,
    "last_saturation_biopsy_date" text,
    "last_unknown_biopsy_date" text,
    "last_biopsy_access_route" text,
    "biopsy_count" integer,
    "last_biopsy_result" text,
    "biopsy_gleason_score" text[]
);


DROP TABLE IF EXISTS "public"."prostate_holep_form_submissions";
create table "public"."prostate_holep_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "psa_value_1" numeric,
    "psa_date_1" text,
    "psa_value_2" numeric,
    "psa_date_2" text,
    "psa_value_3" numeric,
    "psa_date_3" text,
    "psa_value_4" numeric,
    "psa_date_4" text,
    "psa_value_5" numeric,
    "psa_date_5" text,
    "psa_value_6" numeric,
    "psa_date_6" text,
    "has_complaints" boolean,
    "complaints_description" text,
    "has_potency_problems" boolean not null,
    "has_incontinence" boolean not null,
    "templates_per_day" text,
    "has_normal_ejaculation" boolean not null,
    "has_other_complaints" boolean,
    "other_complaints_description" text,
    "night_toilet_usage" text not null,
    "taking_phosphodiesterase_inhibitors" boolean not null,
    "phosphodiesterase_inhibitors_details" text,
    "taking_prostate_medication" boolean not null,
    "prostate_medication_description" text,
    "prostate_medication_since_when" text,
    "had_antibiotic_therapy" boolean not null,
    "antibiotic_therapy_when" text,
    "antibiotic_therapy_duration" text,
    "taking_blood_thinners" boolean not null,
    "blood_thinners_description" text,
    "blood_thinners_since_when" text
);


DROP TABLE IF EXISTS "public"."prostate_new_patient_form_submissions";
create table "public"."prostate_new_patient_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "psa_value_1" numeric,
    "psa_date_1" text,
    "psa_value_2" numeric,
    "psa_date_2" text,
    "psa_value_3" numeric,
    "psa_date_3" text,
    "psa_value_4" numeric,
    "psa_date_4" text,
    "psa_value_5" numeric,
    "psa_date_5" text,
    "psa_value_6" numeric,
    "psa_date_6" text,
    "psa_value_7" numeric,
    "psa_date_7" text,
    "psa_value_8" numeric,
    "psa_date_8" text,
    "psa_value_9" numeric,
    "psa_date_9" text,
    "psa_value_10" numeric,
    "psa_date_10" text,
    "free_psa_value" numeric,
    "family_prostate_disease" boolean,
    "family_member" text[],
    "family_disease_type" text[],
    "urologist_treatment" boolean,
    "urologist_recommendation" text[],
    "known_diagnosis" boolean,
    "diagnosis_type" text[],
    "prostate_not_treated_reason" text,
    "enlargement_therapy_type" text[],
    "enlargement_therapy_other" text,
    "enlargement_therapy_date" text,
    "enlargement_medication_type" text[],
    "enlargement_medication_other" text,
    "enlargement_medication_since" text,
    "inflammation_therapy_type" text[],
    "inflammation_therapy_other" text,
    "inflammation_therapy_date" text,
    "inflammation_therapy_duration" text,
    "cancer_therapy_type" text[],
    "cancer_therapy_other" text,
    "cancer_therapy_date" text,
    "urination_symptoms" text[],
    "urination_pain_location" text,
    "night_urination_frequency" text,
    "urination_symptoms_duration" text,
    "urination_satisfaction_level" text,
    "urologist_palpation" text[],
    "urologist_ultrasound" text[],
    "had_mri" boolean,
    "mri_date" text,
    "brings_mri_cd" text,
    "biopsy_types" text[],
    "last_usg_biopsy_date" text,
    "last_fusion_biopsy_date" text,
    "last_saturation_biopsy_date" text,
    "last_unknown_biopsy_date" text,
    "last_biopsy_access_route" text,
    "biopsy_count" integer,
    "last_biopsy_result" text,
    "biopsy_gleason_score" text[],
    "prostate_treated" text[]
);


DROP TABLE IF EXISTS "public"."prostate_tulsa_form_submissions";
create table "public"."prostate_tulsa_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "psa_value_1" numeric,
    "psa_date_1" text,
    "psa_value_2" numeric,
    "psa_date_2" text,
    "psa_value_3" numeric,
    "psa_date_3" text,
    "psa_value_4" numeric,
    "psa_date_4" text,
    "psa_value_5" numeric,
    "psa_date_5" text,
    "psa_value_6" numeric,
    "psa_date_6" text,
    "has_complaints" boolean,
    "complaint_description" text,
    "has_erection_problems" boolean not null,
    "has_incontinence" boolean not null,
    "pads_per_day" text,
    "has_normal_ejaculation" boolean not null,
    "has_other_complaints" boolean,
    "other_complaints_description" text,
    "taking_phosphodiesterase_inhibitors" boolean not null,
    "phosphodiesterase_inhibitors_details" text,
    "night_toilet_frequency" text not null,
    "taking_prostate_medication" boolean not null,
    "prostate_medication_description" text,
    "prostate_medication_since_when" text,
    "had_antibiotic_therapy" boolean not null,
    "antibiotic_therapy_when" text,
    "antibiotic_therapy_duration" text,
    "taking_blood_thinners" boolean not null,
    "blood_thinners_description" text,
    "blood_thinners_since_when" text
);


create table if not exists "public"."referring_doctors" (
    "id" uuid not null default gen_random_uuid(),
    "title" text,
    "gender" text not null,
    "first_name" text not null,
    "last_name" text not null,
    "street" text not null,
    "house_number" text not null,
    "postal_code" text not null,
    "city" text not null,
    "phone" text not null,
    "fax" text,
    "email" text,
    "specialty_id" uuid,
    "report_preference" report_preference_enum not null default 'email'::report_preference_enum,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


DROP TABLE IF EXISTS "public"."registration_bg_form_submissions";
create table "public"."registration_bg_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "gender" text not null,
    "title" text,
    "first_name" text not null,
    "last_name" text not null,
    "street" text not null,
    "house_number" text not null,
    "postal_code" text not null,
    "city" text not null,
    "country" text default 'Deutschland'::text,
    "phone" text,
    "mobile" text not null,
    "email" text not null,
    "birth_date" date not null,
    "datetime_of_accident" timestamp with time zone not null,
    "name_of_company" text not null,
    "street_of_company" text not null,
    "house_number_of_company" text not null,
    "postal_code_of_company" text not null,
    "city_of_company" text not null,
    "profession" text not null,
    "time_of_employment" text not null,
    "referring_doctor_name" text not null,
    "accident_consent" boolean not null,
    "read_consent" boolean not null
);


DROP TABLE IF EXISTS "public"."registration_form_submissions";
create table "public"."registration_form_submissions" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "gender" text not null,
    "title" text,
    "first_name" text not null,
    "last_name" text not null,
    "street" text not null,
    "house_number" text not null,
    "postal_code" text not null,
    "city" text not null,
    "phone" text,
    "mobile" text not null,
    "email" text not null,
    "birth_date" date not null,
    "insurance_type" text not null,
    "insurance_provider_id" uuid,
    "has_beihilfe" boolean,
    "has_transfer" boolean not null,
    "referring_doctor_name" text,
    "current_treatment" boolean not null,
    "treatment_recommendations" text[],
    "doctor_recommendation" boolean not null,
    "send_report_to_doctor" boolean not null,
    "report_delivery_method" text not null,
    "found_through" text[],
    "country" text default 'Deutschland'::text
);


create table if not exists "public"."report_templates" (
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


create table if not exists "public"."reports" (
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


create table if not exists"public"."scheduled_emails" (
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


DROP TABLE IF EXISTS "public"."signature_requests";
create table "public"."signature_requests" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "device_id" text,
    "early_cleared" boolean default false
);


DROP TABLE IF EXISTS "public"."signatures";
create table "public"."signatures" (
    "id" uuid not null default gen_random_uuid(),
    "appointment_id" uuid,
    "form_id" uuid,
    "patient_id" uuid,
    "created_at" timestamp with time zone default now(),
    "signature" text
);


alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;

alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" drop column  "status";

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);


CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;

alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

alter table "public"."patients" add constraint "patients_insurance_provider_id_fkey" FOREIGN KEY (insurance_provider_id) REFERENCES insurance_providers(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."patients" validate constraint "patients_insurance_provider_id_fkey";



alter table "public"."registration_form_submissions" add constraint "registration_form_submissions_pkey" PRIMARY KEY using index "registration_form_submissions_pkey";

alter table "public"."registration_form_submissions" add constraint "registration_form_submissions_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE not valid;

alter table "public"."registration_form_submissions" validate constraint "registration_form_submissions_appointment_id_fkey";

alter table "public"."registration_form_submissions" add constraint "registration_form_submissions_insurance_provider_id_fkey" FOREIGN KEY (insurance_provider_id) REFERENCES insurance_providers(id) not valid;

alter table "public"."registration_form_submissions" validate constraint "registration_form_submissions_insurance_provider_id_fkey";

alter table "public"."registration_form_submissions" add constraint "registration_form_submissions_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE not valid;

alter table "public"."registration_form_submissions" validate constraint "registration_form_submissions_patient_id_fkey";


alter table "public"."signature_requests" add constraint "signature_requests_pkey" PRIMARY KEY using index "signature_requests_pkey";

alter table "public"."signature_requests" add constraint "signature_requests_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE not valid;

alter table "public"."signature_requests" validate constraint "signature_requests_appointment_id_fkey";

alter table "public"."signature_requests" add constraint "signature_requests_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE not valid;

alter table "public"."signature_requests" validate constraint "signature_requests_patient_id_fkey";


alter table "public"."signatures" add constraint "signatures_pkey" PRIMARY KEY using index "signatures_pkey";

alter table "public"."signatures" add constraint "signatures_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE not valid;

alter table "public"."signatures" validate constraint "signatures_appointment_id_fkey";

alter table "public"."signatures" add constraint "signatures_form_id_fkey" FOREIGN KEY (form_id) REFERENCES forms(id) not valid;

alter table "public"."signatures" validate constraint "signatures_form_id_fkey";

alter table "public"."signatures" add constraint "signatures_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE not valid;

alter table "public"."signatures" validate constraint "signatures_patient_id_fkey";


CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;

alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;




alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;

alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;

alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;

alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;



alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;



alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;



alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;



alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;



alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;



alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;



alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;

alter table "public"."email_templates" add column if not exists "conditions" jsonb;

alter table "public"."email_templates" add column if not exists "schedule_time_unit" text;

alter table "public"."email_templates" add column if not exists "schedule_time_value" integer;

alter table "public"."email_templates" add column if not exists "schedule_type" text;

alter table "public"."email_templates" add column if not exists "send_only_workdays" boolean default true;

alter table "public"."email_templates" add column if not exists "send_time_end" time without time zone default '18:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "send_time_start" time without time zone default '08:00:00'::time without time zone;

alter table "public"."email_templates" add column if not exists "trigger_type" text;

alter table "public"."examinations" add column if not exists "prompt" text;

alter table "public"."examinations" add column if not exists "report_title" text;

alter table "public"."examinations" add column if not exists "report_title_template" text;

alter table "public"."examinations" add column if not exists "requires_body_side" boolean not null default false;







alter table "public"."forms" alter column "form_type" set default 'prostate_new_patient'::form_type_enum;

alter table "public"."locations" add column if not exists "letterhead_url" text;

alter table "public"."locations" add column if not exists "use_default_letterhead" boolean default false;

alter table "public"."patients" add column if not exists "city" text default 'Stendal'::text;

alter table "public"."patients" add column if not exists "country" text default 'Deutschland'::text;

alter table "public"."patients" add column if not exists "house_number" text default '42'::text;

alter table "public"."patients" add column if not exists "insurance_provider_id" uuid;

alter table "public"."patients" add column if not exists "mobile" text;

alter table "public"."patients" add column if not exists "postal_code" text;

alter table "public"."patients" add column if not exists "street" text default 'Bahnhofsstraße'::text;

alter table "public"."patients" alter column "patient_number" set data type text using "patient_number"::text;

CREATE INDEX if not exists appointment_comments_comment_type_idx ON public.appointment_comments USING btree (comment_type);

CREATE INDEX if not exists appointment_comments_todo_idx ON public.appointment_comments USING btree (is_todo);

CREATE UNIQUE INDEX if not exists appointment_documents_pkey ON public.appointment_documents USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_forms_appointment_id_form_id_key ON public.appointment_forms USING btree (appointment_id, form_id);

CREATE UNIQUE INDEX if not exists appointment_forms_pkey ON public.appointment_forms USING btree (id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_appointment_id_referring_doct_key ON public.appointment_referring_doctors USING btree (appointment_id, referring_doctor_id);

CREATE UNIQUE INDEX if not exists appointment_referring_doctors_pkey ON public.appointment_referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists billing_categories_pkey ON public.billing_categories USING btree (id);

CREATE INDEX if not exists billing_codes_category_id_idx ON public.billing_codes USING btree (category_id);

CREATE INDEX if not exists billing_codes_code_idx ON public.billing_codes USING btree (code);

CREATE UNIQUE INDEX if not exists billing_codes_pkey ON public.billing_codes USING btree (id);

CREATE UNIQUE INDEX if not exists biopsy_form_submissions_pkey ON public.biopsy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists cost_reimbursement_form_submissions_pkey ON public.cost_reimbursement_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_consent_form_submissions_pkey ON public.ct_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists ct_therapy_form_submissions_pkey ON public.ct_therapy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists device_blockers_pkey ON public.device_blockers USING btree (id);

CREATE UNIQUE INDEX if not exists document_categories_name_key ON public.document_categories USING btree (name);

CREATE UNIQUE INDEX if not exists document_categories_pkey ON public.document_categories USING btree (id);

CREATE UNIQUE INDEX if not exists email_logs_pkey ON public.email_logs USING btree (id);

CREATE UNIQUE INDEX if not exists examination_sequences_pkey ON public.examination_sequences USING btree (id);

CREATE UNIQUE INDEX if not exists form_links_pkey ON public.form_links USING btree (id);

CREATE INDEX if not exists idx_device_blockers_device_date ON public.device_blockers USING btree (device_id, date);

CREATE INDEX if not exists idx_registration_bg_form_submissions_appointment_id ON public.registration_bg_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_bg_form_submissions_patient_id ON public.registration_bg_form_submissions USING btree (patient_id);

CREATE INDEX if not exists idx_registration_form_submissions_appointment_id ON public.registration_form_submissions USING btree (appointment_id);

CREATE INDEX if not exists idx_registration_form_submissions_patient_id ON public.registration_form_submissions USING btree (patient_id);

CREATE INDEX if not exists insurance_billing_factors_billing_category_id_idx ON public.insurance_billing_factors USING btree (billing_category_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_insurance_provider_id_billing_cat_key ON public.insurance_billing_factors USING btree (insurance_provider_id, billing_category_id);

CREATE INDEX if not exists insurance_billing_factors_insurance_provider_id_idx ON public.insurance_billing_factors USING btree (insurance_provider_id);

CREATE UNIQUE INDEX if not exists insurance_billing_factors_pkey ON public.insurance_billing_factors USING btree (id);

CREATE UNIQUE INDEX if not exists ipss_form_submissions_pkey ON public.ipss_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists medical_specialties_name_key ON public.medical_specialties USING btree (name);

CREATE UNIQUE INDEX if not exists medical_specialties_pkey ON public.medical_specialties USING btree (id);

CREATE UNIQUE INDEX if not exists mri_consent_form_submissions_pkey ON public.mri_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists mri_ct_form_submissions_pkey ON public.mri_ct_form_submissions USING btree (id);

CREATE INDEX if not exists patient_photos_active_idx ON public.patient_photos USING btree (active);

CREATE INDEX if not exists patient_photos_patient_id_idx ON public.patient_photos USING btree (patient_id);

CREATE UNIQUE INDEX if not exists patient_photos_pkey ON public.patient_photos USING btree (id);

CREATE UNIQUE INDEX if not exists privacy_form_submissions_pkey ON public.privacy_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_followup_form_submissions_pkey ON public.prostate_followup_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_holep_form_submissions_pkey ON public.prostate_holep_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_new_patient_form_submissions_pkey ON public.prostate_new_patient_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists prostate_tulsa_form_submissions_pkey ON public.prostate_tulsa_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists referring_doctors_pkey ON public.referring_doctors USING btree (id);

CREATE UNIQUE INDEX if not exists registration_bg_form_submissions_pkey ON public.registration_bg_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists registration_form_submissions_pkey ON public.registration_form_submissions USING btree (id);

CREATE UNIQUE INDEX if not exists report_templates_pkey ON public.report_templates USING btree (id);

CREATE INDEX if not exists reports_appointment_id_idx ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_appointment_id_key ON public.reports USING btree (appointment_id);

CREATE UNIQUE INDEX if not exists reports_pkey ON public.reports USING btree (id);

CREATE UNIQUE INDEX if not exists scheduled_emails_pkey ON public.scheduled_emails USING btree (id);

CREATE UNIQUE INDEX if not exists signature_requests_pkey ON public.signature_requests USING btree (id);

CREATE UNIQUE INDEX if not exists signatures_pkey ON public.signatures USING btree (id);

alter table "public"."email_templates" alter column trigger_form type "public"."form_type_enum" using trigger_form::text::"public"."form_type_enum";

alter table "public"."forms" alter column form_type type "public"."form_type_enum" using form_type::text::"public"."form_type_enum";

alter table "public"."forms" alter column "form_type" set default null::form_type_enum;



alter table "public"."appointment_comments" add column if not exists "comment_type" text not null default 'info'::text;

alter table "public"."appointment_comments" add column if not exists "completed" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "is_todo" boolean not null default false;

alter table "public"."appointment_comments" add column if not exists "priority" boolean not null default false;

alter table "public"."appointments" add column if not exists "body_side" body_side_enum;

alter table "public"."appointments" add column if not exists "previous_appointment_date" timestamp with time zone;


DROP POLICY IF EXISTS "Allow authenticated users to update form links" ON "public"."form_links";

create policy "Allow authenticated users to update form links"
on "public"."form_links"
as permissive
for update
to authenticated
using (true)
with check (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."medical_specialties";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."medical_specialties";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."medical_specialties";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."medical_specialties";

create policy "Enable delete access for all users"
on "public"."medical_specialties"
as permissive
for delete
to public
using (true);


create policy "Enable insert access for all users"
on "public"."medical_specialties"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."medical_specialties"
as permissive
for select
to public
using (true);


create policy "Enable update access for all users"
on "public"."medical_specialties"
as permissive
for update
to public
using (true)
with check (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."patient_photos";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."patient_photos";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."patient_photos";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."patient_photos";
DROP POLICY IF EXISTS "Offener Zugriff auf patient_photos Tabelle" ON "public"."patient_photos";

create policy "Enable delete access for all users"
on "public"."patient_photos"
as permissive
for delete
to public
using (true);


create policy "Enable insert access for all users"
on "public"."patient_photos"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."patient_photos"
as permissive
for select
to public
using (true);


create policy "Enable update access for all users"
on "public"."patient_photos"
as permissive
for update
to public
using (true)
with check (true);


create policy "Offener Zugriff auf patient_photos Tabelle"
on "public"."patient_photos"
as permissive
for all
to public
using (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."referring_doctors";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."referring_doctors";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."referring_doctors";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."referring_doctors";


create policy "Enable delete access for all users"
on "public"."referring_doctors"
as permissive
for delete
to public
using (true);


create policy "Enable insert access for all users"
on "public"."referring_doctors"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."referring_doctors"
as permissive
for select
to public
using (true);


create policy "Enable update access for all users"
on "public"."referring_doctors"
as permissive
for update
to public
using (true)
with check (true);

DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."registration_form_submissions";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."registration_form_submissions";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."registration_form_submissions";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."registration_form_submissions";

create policy "Enable delete access for all users"
on "public"."registration_form_submissions"
as permissive
for delete
to public
using (true);


create policy "Enable insert access for all users"
on "public"."registration_form_submissions"
as permissive
for insert
to public
with check (true);


create policy "Enable read access for all users"
on "public"."registration_form_submissions"
as permissive
for select
to public
using (true);


create policy "Enable update access for all users"
on "public"."registration_form_submissions"
as permissive
for update
to public
using (true)
with check (true);

DROP POLICY IF EXISTS "Allow public access to report templates" ON "public"."report_templates";
DROP POLICY IF EXISTS "Report templates are accessible to all authenticated users" ON "public"."report_templates";


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

CREATE OR REPLACE FUNCTION sync_registration_bg_form_with_patient()
RETURNS TRIGGER AS $$
BEGIN
  -- Update patient record with form data
  UPDATE patients
  SET
    gender = NEW.gender,
    title = NEW.title,
    first_name = NEW.first_name,
    last_name = NEW.last_name,
    street = NEW.street,
    house_number = NEW.house_number,
    postal_code = NEW.postal_code,
    city = NEW.city,
    country = NEW.country,
    phone = NEW.phone,
    mobile = NEW.mobile,
    email = NEW.email,
    birth_date = NEW.birth_date,
    updated_at = now()
  WHERE id = NEW.patient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_registration_form_with_patient()
RETURNS TRIGGER AS $$
BEGIN
  -- Update patient record with form data
  UPDATE patients
  SET
    gender = NEW.gender,
    title = NEW.title,
    first_name = NEW.first_name,
    last_name = NEW.last_name,
    street = NEW.street,
    house_number = NEW.house_number,
    postal_code = NEW.postal_code,
    city = NEW.city,
    country = NEW.country,
    phone = NEW.phone,
    mobile = NEW.mobile,
    email = NEW.email,
    birth_date = NEW.birth_date,
    insurance_provider_id = NEW.insurance_provider_id,
    updated_at = now()
  WHERE id = NEW.patient_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_ct_therapy_form_submissions_updated_at ON public.ct_therapy_form_submissions;
CREATE TRIGGER update_ct_therapy_form_submissions_updated_at BEFORE UPDATE ON public.ct_therapy_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_document_categories_updated_at ON public.document_categories;
CREATE TRIGGER update_document_categories_updated_at BEFORE UPDATE ON public.document_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_examination_sequences_updated_at ON public.examination_sequences;
CREATE TRIGGER update_examination_sequences_updated_at BEFORE UPDATE ON public.examination_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_insurance_billing_factors_updated_at ON public.insurance_billing_factors;
CREATE TRIGGER update_insurance_billing_factors_updated_at BEFORE UPDATE ON public.insurance_billing_factors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS ipss_form_submissions_updated_at ON public.ipss_form_submissions;
CREATE TRIGGER ipss_form_submissions_updated_at BEFORE UPDATE ON public.ipss_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_specialties_updated_at ON public.medical_specialties;
CREATE TRIGGER update_medical_specialties_updated_at BEFORE UPDATE ON public.medical_specialties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mri_ct_form_submissions_updated_at ON public.mri_ct_form_submissions;
CREATE TRIGGER update_mri_ct_form_submissions_updated_at BEFORE UPDATE ON public.mri_ct_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_mri_consent_form_submissions_updated_at ON public.mri_form_submissions;
CREATE TRIGGER update_mri_consent_form_submissions_updated_at BEFORE UPDATE ON public.mri_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_photos_updated_at ON public.patient_photos;
CREATE TRIGGER update_patient_photos_updated_at BEFORE UPDATE ON public.patient_photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_privacy_form_submissions_updated_at ON public.privacy_form_submissions;
CREATE TRIGGER update_privacy_form_submissions_updated_at BEFORE UPDATE ON public.privacy_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prostate_followup_form_submissions_updated_at ON public.prostate_followup_form_submissions;
CREATE TRIGGER update_prostate_followup_form_submissions_updated_at BEFORE UPDATE ON public.prostate_followup_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prostate_holep_form_submissions_updated_at ON public.prostate_holep_form_submissions;
CREATE TRIGGER update_prostate_holep_form_submissions_updated_at BEFORE UPDATE ON public.prostate_holep_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prostate_new_patient_form_submissions_updated_at ON public.prostate_new_patient_form_submissions;
CREATE TRIGGER update_prostate_new_patient_form_submissions_updated_at BEFORE UPDATE ON public.prostate_new_patient_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prostate_tulsa_form_submissions_updated_at ON public.prostate_tulsa_form_submissions;
CREATE TRIGGER update_prostate_tulsa_form_submissions_updated_at BEFORE UPDATE ON public.prostate_tulsa_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_referring_doctors_updated_at ON public.referring_doctors;
CREATE TRIGGER update_referring_doctors_updated_at BEFORE UPDATE ON public.referring_doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS sync_registration_bg_form_with_patient ON public.registration_bg_form_submissions;
CREATE TRIGGER sync_registration_bg_form_with_patient AFTER INSERT OR UPDATE ON public.registration_bg_form_submissions FOR EACH ROW EXECUTE FUNCTION sync_registration_bg_form_with_patient();

DROP TRIGGER IF EXISTS update_registration_bg_form_submissions_updated_at ON public.registration_bg_form_submissions;
CREATE TRIGGER update_registration_bg_form_submissions_updated_at BEFORE UPDATE ON public.registration_bg_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS sync_registration_form_with_patient ON public.registration_form_submissions;
CREATE TRIGGER sync_registration_form_with_patient AFTER INSERT OR UPDATE ON public.registration_form_submissions FOR EACH ROW EXECUTE FUNCTION sync_registration_form_with_patient();

DROP TRIGGER IF EXISTS update_registration_form_submissions_updated_at ON public.registration_form_submissions;
CREATE TRIGGER update_registration_form_submissions_updated_at BEFORE UPDATE ON public.registration_form_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();