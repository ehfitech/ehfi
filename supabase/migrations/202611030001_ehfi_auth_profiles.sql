begin;

create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  birth_date date,
  onboarding_status text not null default 'complete'
    check (onboarding_status in ('complete', 'incomplete')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  role text not null check (role in ('student', 'professional', 'company')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.student_profiles (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  review_status text not null default 'active'
    check (review_status in ('active', 'review_pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_health_records (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.professional_profiles (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  documents jsonb not null default '[]'::jsonb check (jsonb_typeof(documents) = 'array'),
  practice_status text not null default 'review_pending'
    check (practice_status in ('active', 'review_pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  cnpj text not null unique check (cnpj ~ '^[0-9]{14}$'),
  legal_name text not null,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_members (
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  member_role text not null default 'owner'
    check (member_role in ('owner', 'manager', 'member')),
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create table public.company_intakes (
  company_id uuid primary key references public.companies (id) on delete cascade,
  data jsonb not null default '{}'::jsonb check (jsonb_typeof(data) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles (id) on delete cascade,
  role text not null check (role in ('student', 'professional', 'company')),
  consent_type text not null,
  consent_version text not null,
  accepted boolean not null,
  representative_type text,
  accepted_at timestamptz not null default now(),
  unique (user_id, role, consent_type, consent_version)
);

create table public.registration_drafts (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('student', 'professional', 'company')),
  token_hash text not null unique,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  files jsonb not null default '[]'::jsonb check (jsonb_typeof(files) = 'array'),
  staged_files jsonb not null default '[]'::jsonb
    check (jsonb_typeof(staged_files) = 'array'),
  health_data_consent_version text,
  health_data_consent_at timestamptz,
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index registration_drafts_expiry_idx
  on public.registration_drafts (expires_at);
create index company_members_user_idx on public.company_members (user_id);

alter table public.user_profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_health_records enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.company_intakes enable row level security;
alter table public.consent_records enable row level security;
alter table public.registration_drafts enable row level security;

revoke all on public.user_profiles, public.user_roles, public.student_profiles,
  public.student_health_records, public.professional_profiles, public.companies,
  public.company_members, public.company_intakes, public.consent_records,
  public.registration_drafts from anon, authenticated;
grant all on public.user_profiles, public.user_roles, public.student_profiles,
  public.student_health_records, public.professional_profiles, public.companies,
  public.company_members, public.company_intakes, public.consent_records,
  public.registration_drafts to service_role;

grant select on public.user_profiles, public.user_roles, public.student_profiles,
  public.student_health_records, public.professional_profiles, public.companies,
  public.company_members, public.company_intakes, public.consent_records
  to authenticated;

create policy "users can read own profile"
  on public.user_profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "users can read own roles"
  on public.user_roles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "users can read own student profile"
  on public.student_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "students can read own health record"
  on public.student_health_records for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "professionals can read own profile"
  on public.professional_profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "company members can read their company"
  on public.companies for select to authenticated
  using (
    exists (
      select 1 from public.company_members membership
      where membership.company_id = id and membership.user_id = (select auth.uid())
    )
  );
create policy "members can read own memberships"
  on public.company_members for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "company members can read intake"
  on public.company_intakes for select to authenticated
  using (
    exists (
      select 1 from public.company_members membership
      where membership.company_id = company_id
        and membership.user_id = (select auth.uid())
    )
  );
create policy "users can read own consents"
  on public.consent_records for select to authenticated
  using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'professional-documents',
  'professional-documents',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "professionals can read own private documents"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'professional-documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop function if exists public.finalize_student_registration(jsonb, jsonb, jsonb);
drop function if exists public.finalize_professional_registration(jsonb, jsonb, jsonb);
drop function if exists public.finalize_company_registration(jsonb, jsonb, jsonb);

create or replace function public.finalize_student_registration(
  p_profile jsonb,
  p_health jsonb,
  p_consents jsonb,
  p_draft_token_hash text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_consent jsonb;
  v_review_pending boolean;
  v_draft public.registration_drafts%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if jsonb_typeof(p_profile) <> 'object'
    or jsonb_typeof(p_health) <> 'object'
    or jsonb_typeof(p_consents) <> 'array' then
    raise exception 'invalid registration payload' using errcode = '22023';
  end if;
  select * into v_draft
  from public.registration_drafts d
  where d.role = 'student'
    and d.token_hash = p_draft_token_hash
    and d.expires_at > now()
    and d.health_data_consent_version = 'health-data-v1'
    and d.health_data_consent_at is not null;
  if not found then
    raise exception 'valid student consent draft required' using errcode = '23514';
  end if;
  if p_profile ?| array['password', 'passwordConfirmation']
    or p_health ?| array['password', 'passwordConfirmation'] then
    raise exception 'credentials are not profile data' using errcode = '22023';
  end if;
  if not exists (
    select 1 from jsonb_array_elements(p_consents) as c(value)
    where c.value->>'type' = 'health_data'
      and c.value->>'accepted' = 'true'
      and c.value->>'version' = v_draft.health_data_consent_version
  ) then
    raise exception 'health data consent is required' using errcode = '23514';
  end if;
  if coalesce(p_profile->>'accuracyConfirmed', 'false') <> 'true' or not exists (
    select 1 from jsonb_array_elements(p_consents) as c(value)
    where c.value->>'type' = 'information_accuracy'
      and c.value->>'accepted' = 'true'
      and c.value->>'version' = 'student-accuracy-v1'
  ) then
    raise exception 'student accuracy confirmation is required' using errcode = '23514';
  end if;
  if nullif(trim(p_profile->>'fullName'), '') is null
    or nullif(trim(auth.jwt()->>'email'), '') is null
    or nullif(p_profile->>'birthDate', '') is null then
    raise exception 'required account data is missing' using errcode = '23514';
  end if;
  if p_profile ?| array[
    'conditions', 'otherCondition', 'conditionControl', 'usesMedication',
    'medicationName', 'medicationPurpose', 'symptoms', 'symptomDetails',
    'limitations', 'limitationDetails', 'injuryHistory', 'injuryDetails',
    'exerciseRestriction', 'restrictionDetails', 'pregnancyStatus',
    'pregnancyDuration', 'otherHealthInfo', 'guardianName', 'guardianContact',
    'guardianConfirmed', 'healthDataConsent'
  ] then
    raise exception 'health data must use the health record payload' using errcode = '22023';
  end if;

  insert into public.user_profiles (id, full_name, email, phone, birth_date)
  values (
    v_user_id,
    trim(p_profile->>'fullName'),
    lower(trim(auth.jwt()->>'email')),
    nullif(trim(p_profile->>'phone'), ''),
    (p_profile->>'birthDate')::date
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    birth_date = excluded.birth_date,
    onboarding_status = 'complete',
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'student')
  on conflict (user_id, role) do nothing;

  v_review_pending :=
    exists (select 1 from jsonb_array_elements_text(coalesce(p_health->'conditions', '[]'::jsonb)) as items(value) where items.value <> 'none')
    or p_health->>'usesMedication' = 'yes'
    or exists (select 1 from jsonb_array_elements_text(coalesce(p_health->'symptoms', '[]'::jsonb)) as items(value) where items.value <> 'none')
    or exists (select 1 from jsonb_array_elements_text(coalesce(p_health->'limitations', '[]'::jsonb)) as items(value) where items.value <> 'none')
    or coalesce(p_health->>'injuryHistory', 'none') not in ('', 'none')
    or coalesce(p_health->>'exerciseRestriction', 'no') not in ('', 'no')
    or p_health->>'pregnancyStatus' in ('pregnant', 'postpartum')
    or nullif(trim(p_health->>'otherHealthInfo'), '') is not null;

  insert into public.student_profiles (user_id, data, review_status)
  values (
    v_user_id,
    p_profile - 'password' - 'passwordConfirmation',
    case when v_review_pending then 'review_pending' else 'active' end
  )
  on conflict (user_id) do update set
    data = excluded.data,
    review_status = excluded.review_status,
    updated_at = now();

  insert into public.student_health_records (user_id, data)
  values (
    v_user_id,
    p_health
  )
  on conflict (user_id) do update set
    data = excluded.data,
    updated_at = now();

  for v_consent in select value from jsonb_array_elements(p_consents)
  loop
    if nullif(v_consent->>'type', '') is null
      or nullif(v_consent->>'version', '') is null
      or coalesce(v_consent->>'accepted', 'false') not in ('true', 'false') then
      raise exception 'invalid consent record' using errcode = '22023';
    end if;
    insert into public.consent_records (
      user_id, role, consent_type, consent_version, accepted, representative_type
    ) values (
      v_user_id, 'student', v_consent->>'type', v_consent->>'version',
      (v_consent->>'accepted')::boolean, nullif(v_consent->>'representativeType', '')
    )
    on conflict (user_id, role, consent_type, consent_version) do update
      set accepted = excluded.accepted,
          representative_type = excluded.representative_type,
          accepted_at = now();
  end loop;
end;
$$;

create or replace function public.finalize_professional_registration(
  p_profile jsonb,
  p_documents jsonb,
  p_consents jsonb,
  p_draft_token_hash text
) returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_personal jsonb := p_profile->'personal';
  v_cref jsonb := p_profile->'cref';
  v_consent jsonb;
  v_practice_status text;
  v_required_academic_kind text;
  v_draft public.registration_drafts%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if jsonb_typeof(p_profile) <> 'object'
    or jsonb_typeof(p_documents) <> 'array'
    or jsonb_typeof(p_consents) <> 'array' then
    raise exception 'invalid registration payload' using errcode = '22023';
  end if;
  select * into v_draft
  from public.registration_drafts d
  where d.role = 'professional'
    and d.token_hash = p_draft_token_hash
    and d.expires_at > now();
  if not found then
    raise exception 'valid professional draft required' using errcode = '23514';
  end if;
  if p_profile ?| array['password', 'passwordConfirmation']
    or coalesce(p_profile->'personal', '{}'::jsonb)
      ?| array['password', 'passwordConfirmation'] then
    raise exception 'credentials are not profile data' using errcode = '22023';
  end if;
  if nullif(trim(v_personal->>'fullName'), '') is null
    or lower(trim(v_personal->>'email')) <> lower(trim(auth.jwt()->>'email')) then
    raise exception 'required account data is missing' using errcode = '23514';
  end if;
  if not exists (
    select 1 from jsonb_array_elements(p_consents) as c(value)
    where c.value->>'type' = 'privacy_notice'
      and c.value->>'accepted' = 'true'
      and c.value->>'version' = 'professional-privacy-v1'
  ) or not exists (
    select 1 from jsonb_array_elements(p_consents) as c(value)
    where c.value->>'type' = 'professional_accuracy'
      and c.value->>'accepted' = 'true'
      and c.value->>'version' = 'professional-accuracy-v1'
  ) then
    raise exception 'required professional confirmations are missing' using errcode = '23514';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_documents) as d(value)
    where nullif(d.value->>'path', '') is null
      or split_part(d.value->>'path', '/', 1) <> v_user_id::text
      or d.value->>'kind' not in ('diploma', 'transcript', 'completion_declaration', 'cref-card', 'cref-request')
      or not exists (
        select 1 from jsonb_array_elements(v_draft.staged_files) as s(value)
        where s.value->>'path' = d.value->>'path'
          and s.value->>'kind' = d.value->>'kind'
      )
  ) then
    raise exception 'document path is not owned by this account' using errcode = '42501';
  end if;
  v_required_academic_kind := case
    when p_profile->'academic'->>'status' = 'in_progress' then 'transcript'
    when p_profile->'academic'->>'diplomaAvailability' = 'available' then 'diploma'
    when p_profile->'academic'->>'diplomaAvailability' = 'pending'
      then p_profile->'academic'->>'alternativeDocument'
    else null
  end;
  if v_required_academic_kind is null or not exists (
    select 1 from jsonb_array_elements(p_documents) as d(value)
    where d.value->>'kind' = v_required_academic_kind
  ) then
    raise exception 'academic proof is required' using errcode = '23514';
  end if;
  if v_cref->>'answer' = 'registered' and not exists (
    select 1 from jsonb_array_elements(p_documents) as d(value)
    where d.value->>'kind' = 'cref-card'
  ) then
    raise exception 'professional card is required' using errcode = '23514';
  end if;

  insert into public.user_profiles (id, full_name, email, phone, birth_date)
  values (
    v_user_id,
    trim(v_personal->>'fullName'),
    lower(trim(v_personal->>'email')),
    nullif(trim(v_personal->>'phone'), ''),
    (v_personal->>'birthDate')::date
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    birth_date = excluded.birth_date,
    onboarding_status = 'complete',
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'professional')
  on conflict (user_id, role) do nothing;

  -- No manual CREF verification workflow exists yet; self-declaration and an uploaded file are not verification.
  v_practice_status := 'review_pending';

  insert into public.professional_profiles (user_id, data, documents, practice_status)
  values (v_user_id, p_profile, p_documents, v_practice_status)
  on conflict (user_id) do update set
    data = excluded.data,
    documents = excluded.documents,
    practice_status = excluded.practice_status,
    updated_at = now();

  for v_consent in select value from jsonb_array_elements(p_consents)
  loop
    if nullif(v_consent->>'type', '') is null
      or nullif(v_consent->>'version', '') is null then
      raise exception 'invalid consent record' using errcode = '22023';
    end if;
    insert into public.consent_records (
      user_id, role, consent_type, consent_version, accepted, representative_type
    ) values (
      v_user_id, 'professional', v_consent->>'type', v_consent->>'version',
      coalesce((v_consent->>'accepted')::boolean, false), null
    )
    on conflict (user_id, role, consent_type, consent_version) do update
      set accepted = excluded.accepted, accepted_at = now();
  end loop;
end;
$$;

create or replace function public.finalize_company_registration(
  p_company jsonb,
  p_intake jsonb,
  p_consents jsonb,
  p_draft_token_hash text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_company_id uuid;
  v_consent jsonb;
  v_draft public.registration_drafts%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '28000';
  end if;
  if jsonb_typeof(p_company) <> 'object'
    or jsonb_typeof(p_intake) <> 'object'
    or jsonb_typeof(p_consents) <> 'array' then
    raise exception 'invalid registration payload' using errcode = '22023';
  end if;
  select * into v_draft
  from public.registration_drafts d
  where d.role = 'company'
    and d.token_hash = p_draft_token_hash
    and d.expires_at > now();
  if not found then
    raise exception 'valid company draft required' using errcode = '23514';
  end if;
  if p_company ?| array['password', 'passwordConfirmation'] then
    raise exception 'credentials are not company data' using errcode = '22023';
  end if;
  if nullif(trim(auth.jwt()->>'email'), '') is null
    or lower(trim(p_company->>'contactEmail')) <> lower(trim(auth.jwt()->>'email')) then
    raise exception 'contact email must match the signed-in identity' using errcode = '23514';
  end if;
  if not exists (
    select 1 from jsonb_array_elements(p_consents) as c(value)
    where c.value->>'type' = 'terms_of_use'
      and c.value->>'accepted' = 'true'
      and c.value->>'version' = 'company-terms-v1'
  ) or not exists (
    select 1 from jsonb_array_elements(p_consents) as c(value)
    where c.value->>'type' = 'privacy_notice'
      and c.value->>'accepted' = 'true'
      and c.value->>'version' = 'company-privacy-v1'
  ) or not exists (
    select 1 from jsonb_array_elements(p_consents) as c(value)
    where c.value->>'type' = 'contact_authorization'
      and c.value->>'accepted' = 'true'
      and c.value->>'version' = 'company-contact-v1'
  ) or not exists (
    select 1 from jsonb_array_elements(p_consents) as c(value)
    where c.value->>'type' = 'information_accuracy'
      and c.value->>'accepted' = 'true'
      and c.value->>'version' = 'company-accuracy-v1'
  ) then
    raise exception 'required company confirmations are missing' using errcode = '23514';
  end if;

  insert into public.user_profiles (id, full_name, email, phone, onboarding_status)
  values (
    v_user_id,
    trim(p_company->>'contactName'),
    lower(trim(auth.jwt()->>'email')),
    nullif(trim(p_company->>'contactPhone'), ''),
    'complete'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone,
    onboarding_status = 'complete',
    updated_at = now();

  select c.id into v_company_id
  from public.companies c
  where c.cnpj = regexp_replace(coalesce(p_company->>'cnpj', ''), '[^0-9]', '', 'g');

  if v_company_id is not null and not exists (
    select 1 from public.company_members m
    where m.company_id = v_company_id and m.user_id = v_user_id
  ) then
    raise exception 'company is already registered' using errcode = '23505';
  end if;

  if v_company_id is null then
    insert into public.companies (cnpj, legal_name, data)
    values (
      regexp_replace(p_company->>'cnpj', '[^0-9]', '', 'g'),
      trim(p_company->>'legalName'),
      p_company
    )
    returning id into v_company_id;
  else
    update public.companies
    set legal_name = trim(p_company->>'legalName'),
        data = p_company,
        updated_at = now()
    where id = v_company_id;
  end if;

  insert into public.user_roles (user_id, role)
  values (v_user_id, 'company')
  on conflict (user_id, role) do nothing;

  insert into public.company_members (company_id, user_id, member_role)
  values (v_company_id, v_user_id, 'owner')
  on conflict (company_id, user_id) do nothing;

  insert into public.company_intakes (company_id, data)
  values (v_company_id, p_intake)
  on conflict (company_id) do update set data = excluded.data, updated_at = now();

  for v_consent in select value from jsonb_array_elements(p_consents)
  loop
    if nullif(v_consent->>'type', '') is null
      or nullif(v_consent->>'version', '') is null then
      raise exception 'invalid consent record' using errcode = '22023';
    end if;
    insert into public.consent_records (
      user_id, role, consent_type, consent_version, accepted, representative_type
    ) values (
      v_user_id, 'company', v_consent->>'type', v_consent->>'version',
      coalesce((v_consent->>'accepted')::boolean, false), null
    )
    on conflict (user_id, role, consent_type, consent_version) do update
      set accepted = excluded.accepted, accepted_at = now();
  end loop;

  return v_company_id;
end;
$$;

revoke all on function public.finalize_student_registration(jsonb, jsonb, jsonb, text) from public, anon;
revoke all on function public.finalize_professional_registration(jsonb, jsonb, jsonb, text) from public, anon;
revoke all on function public.finalize_company_registration(jsonb, jsonb, jsonb, text) from public, anon;
grant execute on function public.finalize_student_registration(jsonb, jsonb, jsonb, text) to authenticated;
grant execute on function public.finalize_professional_registration(jsonb, jsonb, jsonb, text) to authenticated;
grant execute on function public.finalize_company_registration(jsonb, jsonb, jsonb, text) to authenticated;

commit;
