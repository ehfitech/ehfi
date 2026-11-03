begin;

create table public.professional_public_profiles (
  user_id uuid primary key references public.user_profiles (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  bio text not null default '' check (char_length(bio) <= 600),
  specialties text[] not null default '{}',
  city text not null check (char_length(btrim(city)) between 2 and 80),
  state text not null check (state in (
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
  )),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(specialties) <= 12),
  check (array_position(specialties, null) is null)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.user_profiles (id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 100),
  description text not null default '' check (char_length(description) <= 1200),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location text not null check (char_length(btrim(location)) between 2 and 160),
  price_cents integer not null default 0 check (price_cents >= 0),
  capacity integer not null check (capacity between 1 and 500),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table public.activity_bookings (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  student_id uuid not null references public.user_profiles (id) on delete cascade,
  status text not null default 'reserved'
    check (status in ('reserved', 'cancelled_by_student', 'cancelled_by_professional', 'attended', 'no_show')),
  booked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create unique index activity_bookings_one_reserved_per_student
  on public.activity_bookings (activity_id, student_id)
  where status = 'reserved';
create index activities_professional_start_idx
  on public.activities (professional_id, starts_at);
create index activities_published_start_idx
  on public.activities (starts_at)
  where status = 'published';
create index activity_bookings_student_booked_idx
  on public.activity_bookings (student_id, booked_at desc);
create index activity_bookings_activity_status_idx
  on public.activity_bookings (activity_id, status);

create or replace function public.set_activity_platform_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.set_activity_platform_updated_at() from public, anon, authenticated;

create trigger professional_public_profiles_updated_at
  before update on public.professional_public_profiles
  for each row execute function public.set_activity_platform_updated_at();
create trigger activities_updated_at
  before update on public.activities
  for each row execute function public.set_activity_platform_updated_at();
create trigger activity_bookings_updated_at
  before update on public.activity_bookings
  for each row execute function public.set_activity_platform_updated_at();

alter table public.professional_public_profiles enable row level security;
alter table public.activities enable row level security;
alter table public.activity_bookings enable row level security;

revoke all on public.professional_public_profiles, public.activities, public.activity_bookings from anon, authenticated;
grant select, insert, update on public.professional_public_profiles to authenticated;
grant select on public.activities, public.activity_bookings to authenticated;

create policy "professionals manage their public profile"
  on public.professional_public_profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "professionals insert their public profile"
  on public.professional_public_profiles for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'professional'
    )
  );
create policy "professionals update their public profile"
  on public.professional_public_profiles for update to authenticated
  using (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'professional'
    )
  )
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'professional'
    )
  );
create policy "professionals read their activities"
  on public.activities for select to authenticated
  using (
    professional_id = (select auth.uid())
    and exists (
      select 1 from public.user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'professional'
    )
  );
create policy "students read only their bookings"
  on public.activity_bookings for select to authenticated
  using (
    student_id = (select auth.uid())
    and exists (
      select 1 from public.user_roles r
      where r.user_id = (select auth.uid()) and r.role = 'student'
    )
  );

create or replace function public.save_professional_activity(
  p_activity_id uuid,
  p_title text,
  p_description text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_location text,
  p_price_cents integer,
  p_capacity integer,
  p_status text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_professional_id uuid := auth.uid();
  v_activity public.activities%rowtype;
  v_activity_id uuid := coalesce(p_activity_id, gen_random_uuid());
  v_reserved_count integer;
begin
  if v_professional_id is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = v_professional_id and r.role = 'professional'
  ) then
    raise exception using message = 'professional_role_required';
  end if;

  if p_status is null or p_status not in ('draft', 'published')
    or p_title is null or char_length(btrim(p_title)) not between 3 and 100
    or p_description is null or char_length(p_description) > 1200
    or p_location is null or char_length(btrim(p_location)) not between 2 and 160
    or p_starts_at is null or p_ends_at is null or p_ends_at <= p_starts_at
    or p_ends_at - p_starts_at > interval '12 hours'
    or p_price_cents is null or p_price_cents < 0
    or p_capacity is null or p_capacity not between 1 and 500 then
    raise exception using message = 'invalid_activity';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_professional_id::text, 83011));

  if p_activity_id is not null then
    select * into v_activity
    from public.activities a
    where a.id = p_activity_id and a.professional_id = v_professional_id
    for update;
    if not found then
      raise exception using message = 'activity_not_found';
    end if;
    if v_activity.status in ('cancelled', 'completed') then
      raise exception using message = 'activity_not_editable';
    end if;
    select count(*)::integer into v_reserved_count
    from public.activity_bookings b
    where b.activity_id = p_activity_id and b.status = 'reserved';
    if v_reserved_count > 0 and (
      p_starts_at is distinct from v_activity.starts_at
      or p_ends_at is distinct from v_activity.ends_at
      or p_location is distinct from v_activity.location
      or p_capacity is distinct from v_activity.capacity
    ) then
      raise exception using message = 'booked_activity_schedule_locked';
    end if;
    if p_status = 'draft' and v_reserved_count > 0 then
      raise exception using message = 'booked_activity_cannot_be_unpublished';
    end if;
    if p_capacity < v_reserved_count then
      raise exception using message = 'capacity_below_reserved_count';
    end if;
  end if;

  if p_status = 'published' then
    if p_starts_at <= now() then
      raise exception using message = 'activity_start_must_be_future';
    end if;
    if not exists (
      select 1 from public.professional_public_profiles profile
      where profile.user_id = v_professional_id and profile.is_published
    ) and (p_activity_id is null or v_activity.status <> 'published') then
      raise exception using message = 'public_profile_required';
    end if;
    if exists (
      select 1 from public.activities other
      where other.professional_id = v_professional_id
        and other.id <> v_activity_id
        and other.status = 'published'
        and other.starts_at < p_ends_at
        and other.ends_at > p_starts_at
    ) then
      raise exception using message = 'professional_schedule_conflict';
    end if;
  end if;

  if p_activity_id is null then
    insert into public.activities (
      id, professional_id, title, description, starts_at, ends_at,
      location, price_cents, capacity, status
    ) values (
      v_activity_id, v_professional_id, btrim(p_title), p_description,
      p_starts_at, p_ends_at, btrim(p_location), p_price_cents, p_capacity, p_status
    );
  else
    update public.activities
    set title = btrim(p_title), description = p_description,
        starts_at = p_starts_at, ends_at = p_ends_at,
        location = btrim(p_location), price_cents = p_price_cents,
        capacity = p_capacity, status = p_status, updated_at = now()
    where id = v_activity_id and professional_id = v_professional_id;
  end if;
  return v_activity_id;
end;
$$;

create or replace function public.reserve_activity(p_activity_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := auth.uid();
  v_activity public.activities%rowtype;
  v_profile_published boolean;
  v_reserved_count integer;
  v_booking_id uuid;
begin
  if v_student_id is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = v_student_id and r.role = 'student'
  ) then
    raise exception using message = 'student_role_required';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_student_id::text, 83012));
  select * into v_activity from public.activities a where a.id = p_activity_id for update;
  if not found or v_activity.status <> 'published' or v_activity.starts_at <= now() then
    raise exception using message = 'activity_unavailable';
  end if;
  if v_activity.professional_id = v_student_id then
    raise exception using message = 'cannot_reserve_own_activity';
  end if;

  select profile.is_published into v_profile_published
  from public.professional_public_profiles profile
  where profile.user_id = v_activity.professional_id
  for update;
  if not coalesce(v_profile_published, false) then
    raise exception using message = 'activity_hidden';
  end if;

  if exists (
    select 1 from public.activity_bookings b
    where b.activity_id = p_activity_id and b.student_id = v_student_id and b.status = 'reserved'
  ) then
    raise exception using message = 'already_reserved';
  end if;
  if exists (
    select 1
    from public.activity_bookings b
    join public.activities other on other.id = b.activity_id
    where b.student_id = v_student_id
      and b.status = 'reserved'
      and other.status = 'published'
      and other.starts_at < v_activity.ends_at
      and other.ends_at > v_activity.starts_at
  ) then
    raise exception using message = 'student_schedule_conflict';
  end if;

  select count(*)::integer into v_reserved_count
  from public.activity_bookings b
  where b.activity_id = p_activity_id and b.status = 'reserved';
  if v_reserved_count >= v_activity.capacity then
    raise exception using message = 'activity_full';
  end if;

  insert into public.activity_bookings (activity_id, student_id, status)
  values (p_activity_id, v_student_id, 'reserved')
  returning id into v_booking_id;
  return v_booking_id;
end;
$$;

create or replace function public.cancel_student_booking(p_booking_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_student_id uuid := auth.uid();
  v_activity_id uuid;
  v_starts_at timestamptz;
  v_status text;
begin
  if v_student_id is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = v_student_id and r.role = 'student'
  ) then
    raise exception using message = 'student_role_required';
  end if;
  select b.activity_id into v_activity_id
  from public.activity_bookings b
  where b.id = p_booking_id and b.student_id = v_student_id;
  if not found then
    raise exception using message = 'booking_not_found';
  end if;
  select a.starts_at into v_starts_at
  from public.activities a where a.id = v_activity_id for update;
  select b.status into v_status
  from public.activity_bookings b
  where b.id = p_booking_id and b.student_id = v_student_id
  for update;
  if v_status <> 'reserved' then
    raise exception using message = 'booking_not_active';
  end if;
  if v_starts_at <= now() then
    raise exception using message = 'cancellation_deadline_passed';
  end if;
  update public.activity_bookings
  set status = 'cancelled_by_student', cancelled_at = now(), updated_at = now()
  where id = p_booking_id and student_id = v_student_id;
end;
$$;

create or replace function public.cancel_professional_activity(p_activity_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_professional_id uuid := auth.uid();
begin
  if v_professional_id is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = v_professional_id and r.role = 'professional'
  ) then
    raise exception using message = 'professional_role_required';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(v_professional_id::text, 83011));
  perform 1 from public.activities a
  where a.id = p_activity_id and a.professional_id = v_professional_id
  for update;
  if not found then
    raise exception using message = 'activity_not_found';
  end if;
  update public.activities
  set status = 'cancelled', updated_at = now()
  where id = p_activity_id and professional_id = v_professional_id;
  update public.activity_bookings
  set status = 'cancelled_by_professional', cancelled_at = now(), updated_at = now()
  where activity_id = p_activity_id and status = 'reserved';
end;
$$;

create or replace function public.list_discoverable_activities(p_from timestamptz, p_to timestamptz)
returns table (
  activity_id uuid, title text, description text, starts_at timestamptz,
  ends_at timestamptz, location text, price_cents integer, capacity integer,
  status text, professional_display_name text, professional_bio text,
  professional_specialties text[], professional_city text, professional_state text,
  credentials_in_review boolean, reserved_count integer, places_remaining integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'student'
  ) then
    raise exception using message = 'student_role_required';
  end if;
  if p_from is null or p_to is null or p_to <= p_from then
    raise exception using message = 'invalid_date_range';
  end if;
  return query
  select a.id, a.title, a.description, a.starts_at, a.ends_at, a.location,
    a.price_cents, a.capacity,
    case when a.status = 'published' and a.ends_at <= now() then 'completed' else a.status end,
    profile.display_name, profile.bio,
    profile.specialties, profile.city, profile.state,
    coalesce(pro.practice_status, 'review_pending') <> 'active',
    counts.reserved_count, greatest(0, a.capacity - counts.reserved_count)
  from public.activities a
  join public.professional_public_profiles profile
    on profile.user_id = a.professional_id and profile.is_published
  left join public.professional_profiles pro on pro.user_id = a.professional_id
  cross join lateral (
    select count(*)::integer as reserved_count
    from public.activity_bookings b
    where b.activity_id = a.id and b.status = 'reserved'
  ) counts
  where a.status = 'published'
    and a.starts_at > now()
    and a.starts_at >= p_from and a.starts_at < p_to
  order by a.starts_at, a.id;
end;
$$;

create or replace function public.get_student_booking_activity(p_activity_id uuid)
returns table (
  activity_id uuid, title text, description text, starts_at timestamptz,
  ends_at timestamptz, location text, price_cents integer, capacity integer,
  status text, professional_display_name text, professional_bio text,
  professional_specialties text[], professional_city text, professional_state text,
  credentials_in_review boolean, reserved_count integer, places_remaining integer,
  professional_profile_hidden boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'student'
  ) then
    raise exception using message = 'student_role_required';
  end if;
  return query
  select a.id, a.title, a.description, a.starts_at, a.ends_at, a.location,
    a.price_cents, a.capacity,
    case when a.status = 'published' and a.ends_at <= now() then 'completed' else a.status end,
    profile.display_name, profile.bio,
    profile.specialties, profile.city, profile.state,
    coalesce(pro.practice_status, 'review_pending') <> 'active',
    counts.reserved_count, greatest(0, a.capacity - counts.reserved_count), not profile.is_published
  from public.activities a
  join public.professional_public_profiles profile on profile.user_id = a.professional_id
  left join public.professional_profiles pro on pro.user_id = a.professional_id
  cross join lateral (
    select count(*)::integer as reserved_count
    from public.activity_bookings b
    where b.activity_id = a.id and b.status = 'reserved'
  ) counts
  where a.id = p_activity_id
    and exists (
      select 1 from public.activity_bookings owned
      where owned.activity_id = a.id and owned.student_id = auth.uid()
    );
end;
$$;

create or replace function public.get_discoverable_activity(p_activity_id uuid)
returns table (
  activity_id uuid, title text, description text, starts_at timestamptz,
  ends_at timestamptz, location text, price_cents integer, capacity integer,
  status text, professional_display_name text, professional_bio text,
  professional_specialties text[], professional_city text, professional_state text,
  credentials_in_review boolean, reserved_count integer, places_remaining integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'student'
  ) then
    raise exception using message = 'student_role_required';
  end if;
  return query
  select a.id, a.title, a.description, a.starts_at, a.ends_at, a.location,
    a.price_cents, a.capacity,
    case when a.status = 'published' and a.ends_at <= now() then 'completed' else a.status end,
    profile.display_name, profile.bio,
    profile.specialties, profile.city, profile.state,
    coalesce(pro.practice_status, 'review_pending') <> 'active',
    counts.reserved_count, greatest(0, a.capacity - counts.reserved_count)
  from public.activities a
  join public.professional_public_profiles profile
    on profile.user_id = a.professional_id and profile.is_published
  left join public.professional_profiles pro on pro.user_id = a.professional_id
  cross join lateral (
    select count(*)::integer as reserved_count
    from public.activity_bookings b
    where b.activity_id = a.id and b.status = 'reserved'
  ) counts
  where a.id = p_activity_id and a.status = 'published' and a.starts_at > now();
end;
$$;

create or replace function public.list_student_bookings(p_from timestamptz, p_to timestamptz)
returns table (
  booking_id uuid, booking_status text, booked_at timestamptz, cancelled_at timestamptz,
  activity_id uuid, title text, description text, starts_at timestamptz,
  ends_at timestamptz, location text, price_cents integer, capacity integer,
  status text, professional_display_name text, professional_bio text,
  professional_specialties text[], professional_city text, professional_state text,
  credentials_in_review boolean, reserved_count integer, places_remaining integer,
  professional_profile_hidden boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'student'
  ) then
    raise exception using message = 'student_role_required';
  end if;
  if p_from is null or p_to is null or p_to <= p_from then
    raise exception using message = 'invalid_date_range';
  end if;
  return query
  select b.id, b.status, b.booked_at, b.cancelled_at,
    a.id, a.title, a.description, a.starts_at, a.ends_at, a.location,
    a.price_cents, a.capacity,
    case when a.status = 'published' and a.ends_at <= now() then 'completed' else a.status end,
    profile.display_name, profile.bio,
    profile.specialties,
    profile.city, profile.state,
    coalesce(pro.practice_status, 'review_pending') <> 'active',
    counts.reserved_count, greatest(0, a.capacity - counts.reserved_count), not profile.is_published
  from public.activity_bookings b
  join public.activities a on a.id = b.activity_id
  join public.professional_public_profiles profile on profile.user_id = a.professional_id
  left join public.professional_profiles pro on pro.user_id = a.professional_id
  cross join lateral (
    select count(*)::integer as reserved_count
    from public.activity_bookings active
    where active.activity_id = a.id and active.status = 'reserved'
  ) counts
  where b.student_id = auth.uid()
    and a.starts_at >= p_from and a.starts_at < p_to
  order by a.starts_at, b.booked_at desc;
end;
$$;

create or replace function public.list_professional_activity_participants(p_activity_id uuid)
returns table (
  booking_id uuid, first_name text, surname_initial text, status text, booked_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'professional'
  ) then
    raise exception using message = 'professional_role_required';
  end if;
  if not exists (
    select 1 from public.activities a
    where a.id = p_activity_id and a.professional_id = auth.uid()
  ) then
    raise exception using message = 'activity_not_found';
  end if;
  return query
  select b.id, tokens.parts[1],
    case when cardinality(tokens.parts) > 1
      then upper(left(tokens.parts[cardinality(tokens.parts)], 1))
      else null end,
    b.status, b.booked_at
  from public.activity_bookings b
  join public.user_profiles up on up.id = b.student_id
  cross join lateral (
    select regexp_split_to_array(regexp_replace(btrim(up.full_name), '\s+', ' ', 'g'), ' ') as parts
  ) tokens
  where b.activity_id = p_activity_id
    and b.status in ('reserved', 'cancelled_by_professional')
  order by b.booked_at;
end;
$$;

create or replace function public.get_professional_activity_summary(p_from timestamptz, p_to timestamptz)
returns table (
  activity_id uuid, title text, starts_at timestamptz, ends_at timestamptz,
  location text, price_cents integer, capacity integer, status text, reserved_count integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = 'professional'
  ) then
    raise exception using message = 'professional_role_required';
  end if;
  if p_from is null or p_to is null or p_to <= p_from then
    raise exception using message = 'invalid_date_range';
  end if;
  return query
  select a.id, a.title, a.starts_at, a.ends_at, a.location,
    a.price_cents, a.capacity,
    case when a.status = 'published' and a.ends_at <= now() then 'completed' else a.status end,
    counts.reserved_count
  from public.activities a
  cross join lateral (
    select count(*)::integer as reserved_count
    from public.activity_bookings b
    where b.activity_id = a.id and b.status = 'reserved'
  ) counts
  where a.professional_id = auth.uid()
    and a.starts_at >= p_from and a.starts_at < p_to
  order by a.starts_at, a.id;
end;
$$;

revoke all on function public.save_professional_activity(uuid, text, text, timestamptz, timestamptz, text, integer, integer, text) from public, anon;
revoke all on function public.reserve_activity(uuid) from public, anon;
revoke all on function public.cancel_student_booking(uuid) from public, anon;
revoke all on function public.cancel_professional_activity(uuid) from public, anon;
revoke all on function public.list_discoverable_activities(timestamptz, timestamptz) from public, anon;
revoke all on function public.get_student_booking_activity(uuid) from public, anon;
revoke all on function public.get_discoverable_activity(uuid) from public, anon;
revoke all on function public.list_student_bookings(timestamptz, timestamptz) from public, anon;
revoke all on function public.list_professional_activity_participants(uuid) from public, anon;
revoke all on function public.get_professional_activity_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.save_professional_activity(uuid, text, text, timestamptz, timestamptz, text, integer, integer, text) to authenticated;
grant execute on function public.reserve_activity(uuid) to authenticated;
grant execute on function public.cancel_student_booking(uuid) to authenticated;
grant execute on function public.cancel_professional_activity(uuid) to authenticated;
grant execute on function public.list_discoverable_activities(timestamptz, timestamptz) to authenticated;
grant execute on function public.get_student_booking_activity(uuid) to authenticated;
grant execute on function public.get_discoverable_activity(uuid) to authenticated;
grant execute on function public.list_student_bookings(timestamptz, timestamptz) to authenticated;
grant execute on function public.list_professional_activity_participants(uuid) to authenticated;
grant execute on function public.get_professional_activity_summary(timestamptz, timestamptz) to authenticated;

commit;
