-- Realynk CRM access model.
-- CRM queries run as crm_app, which is subject to row level security.
-- Auth helpers are security definer and stay executable by the table owner only.
-- The company email domain is stored only after the server supplies one.
-- This migration does not invent a domain.

do $$
begin
  create role crm_app nologin;
exception
  when duplicate_object then null;
end
$$;

grant crm_app to current_user;

create schema if not exists private;
revoke all on schema public from public;
grant usage on schema public to crm_app;
grant usage on schema private to crm_app;

create table public.company_access (
  id integer primary key check (id = 1),
  email_domain text,
  sample_mode boolean not null default true,
  constraint company_access_domain_chk check (
    email_domain is null
    or email_domain ~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$'
  )
);

create table public.crm_settings (
  id integer primary key check (id = 1),
  stale_after_days integer not null default 7 check (stale_after_days between 1 and 90)
);

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text not null,
  role text not null check (role in ('admin', 'sales', 'manager')),
  status text not null default 'invited' check (status in ('invited', 'active', 'disabled')),
  email_verified_at timestamptz,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_name_chk check (char_length(btrim(full_name)) between 2 and 80)
);

create unique index users_email_lower_idx on public.users (lower(email));
create index users_role_idx on public.users (role);

create table public.user_credentials (
  user_id uuid primary key references public.users (id) on delete cascade,
  password_hash text not null
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  user_id uuid not null references public.users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index sessions_user_idx on public.sessions (user_id);
create index sessions_expires_idx on public.sessions (expires_at);

create table public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.role_permissions (
  role text not null check (role in ('admin', 'sales', 'manager')),
  permission text not null,
  primary key (role, permission)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text not null,
  email text not null,
  stage text not null default 'new' check (stage in ('new', 'qualified', 'meeting', 'proposal', 'won', 'lost')),
  owner_id uuid references public.users (id),
  source text not null default 'Inbound',
  notes text not null default '',
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leads_name_chk check (char_length(btrim(full_name)) between 2 and 120),
  constraint leads_company_chk check (char_length(btrim(company)) between 2 and 160)
);

create index leads_owner_idx on public.leads (owner_id);
create index leads_stage_idx on public.leads (stage);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id),
  title text not null,
  stage text not null default 'qualified' check (stage in ('new', 'qualified', 'meeting', 'proposal', 'won', 'lost')),
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  owner_id uuid references public.users (id),
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_title_chk check (char_length(btrim(title)) between 2 and 160)
);

create index opportunities_owner_idx on public.opportunities (owner_id);
create index opportunities_lead_idx on public.opportunities (lead_id);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads (id),
  opportunity_id uuid references public.opportunities (id),
  owner_id uuid not null references public.users (id),
  kind text not null check (kind in ('task', 'call', 'note', 'meeting')),
  summary text not null,
  due_on date,
  completed_at timestamptz,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  constraint activities_summary_chk check (char_length(btrim(summary)) between 2 and 280),
  constraint activities_parent_chk check (lead_id is not null or opportunity_id is not null)
);

create index activities_owner_idx on public.activities (owner_id);
create index activities_lead_idx on public.activities (lead_id);
create index activities_open_due_idx on public.activities (due_on) where completed_at is null;

insert into public.company_access (id) values (1);
insert into public.crm_settings (id) values (1);

insert into public.role_permissions (role, permission) values
  ('admin', 'crm.full'),
  ('admin', 'users.manage'),
  ('admin', 'leads.view_all'),
  ('admin', 'leads.manage_all'),
  ('admin', 'leads.create'),
  ('admin', 'leads.assign'),
  ('admin', 'opportunities.view_all'),
  ('admin', 'opportunities.manage_all'),
  ('admin', 'opportunities.create'),
  ('admin', 'pipeline.update_assigned'),
  ('admin', 'activities.view_all'),
  ('admin', 'activities.create'),
  ('admin', 'activities.manage'),
  ('admin', 'settings.manage'),
  ('admin', 'performance.view'),
  ('sales', 'leads.view_assigned'),
  ('sales', 'leads.manage_assigned'),
  ('sales', 'pipeline.update_assigned'),
  ('sales', 'opportunities.view_assigned'),
  ('sales', 'opportunities.create'),
  ('sales', 'activities.create'),
  ('sales', 'activities.manage_own'),
  ('manager', 'leads.view_all'),
  ('manager', 'leads.create'),
  ('manager', 'leads.assign'),
  ('manager', 'opportunities.view_all'),
  ('manager', 'activities.view_all'),
  ('manager', 'performance.view');

insert into public.users (email, full_name, role, status, email_verified_at, is_sample) values
  ('avery.chen@sample.invalid', 'Avery Chen', 'admin', 'active', now(), true),
  ('morgan.ellis@sample.invalid', 'Morgan Ellis', 'manager', 'active', now(), true),
  ('priya.shah@sample.invalid', 'Priya Shah', 'sales', 'active', now(), true),
  ('luis.ortega@sample.invalid', 'Luis Ortega', 'sales', 'active', now(), true);

insert into public.leads (full_name, company, email, stage, owner_id, source, notes, is_sample, updated_at)
select 'Dana Ruiz', 'Northwind Clinics', 'dana.ruiz@northwind.example', 'meeting', id, 'Referral', 'Asked for weekday coverage before the next hiring cycle.', true, now()
from public.users where email = 'priya.shah@sample.invalid';

insert into public.leads (full_name, company, email, stage, owner_id, source, notes, is_sample, updated_at)
select 'Elena Brooks', 'Lumen Dental Group', 'elena.brooks@lumen.example', 'proposal', id, 'Website', 'Proposal covers two front-office seats.', true, now()
from public.users where email = 'priya.shah@sample.invalid';

insert into public.leads (full_name, company, email, stage, owner_id, source, notes, is_sample, updated_at)
select 'Chris Patel', 'Harbor Freight Logistics', 'chris.patel@harbor.example', 'qualified', id, 'Outbound', 'Needs a coordinator who can start this month.', true, now() - interval '12 days'
from public.users where email = 'luis.ortega@sample.invalid';

insert into public.leads (full_name, company, email, stage, owner_id, source, notes, is_sample)
values ('Mark Adeyemi', 'Fieldstone Schools', 'mark.adeyemi@fieldstone.example', 'new', null, 'Inbound', 'No sales owner yet.', true);

insert into public.opportunities (lead_id, title, stage, amount, owner_id, is_sample)
select l.id, 'Northwind weekday coverage', 'proposal', 4200, l.owner_id, true
from public.leads l where l.email = 'dana.ruiz@northwind.example';

insert into public.opportunities (lead_id, title, stage, amount, owner_id, is_sample)
select l.id, 'Harbor coordinator seat', 'qualified', 1800, l.owner_id, true
from public.leads l where l.email = 'chris.patel@harbor.example';

insert into public.activities (lead_id, owner_id, kind, summary, due_on, is_sample)
select l.id, l.owner_id, 'task', 'Send the staffing one-pager', current_date + 1, true
from public.leads l where l.email = 'dana.ruiz@northwind.example';

insert into public.activities (lead_id, owner_id, kind, summary, completed_at, is_sample)
select l.id, l.owner_id, 'call', 'Discovery call about the coordinator seat', now() - interval '12 days', true
from public.leads l where l.email = 'chris.patel@harbor.example';

insert into public.activities (lead_id, owner_id, kind, summary, is_sample)
select l.id, u.id, 'note', 'Waiting on a sales owner before the first call.', true
from public.leads l
cross join public.users u
where l.email = 'mark.adeyemi@fieldstone.example' and u.email = 'morgan.ellis@sample.invalid';

create or replace function private.current_user_id()
returns uuid
language sql
stable
set search_path = ''
as $fn$
  select nullif(current_setting('app.user_id', true), '')::uuid
$fn$;

create or replace function private.normalize_domain(domain text)
returns text
language plpgsql
immutable
set search_path = ''
as $fn$
declare
  normalized text := lower(btrim(coalesce(domain, '')));
begin
  if normalized = '' then
    return null;
  end if;
  if left(normalized, 1) = '@' then
    normalized := substr(normalized, 2);
  end if;
  if normalized !~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$' then
    raise exception 'CRM:invalid_domain';
  end if;
  return normalized;
end;
$fn$;

create or replace function private.in_workspace(row_is_sample boolean)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select row_is_sample is not distinct from (
    select sample_mode from public.company_access where id = 1
  )
$fn$;

create or replace function private.user_is_allowed(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1
    from public.users u
    cross join public.company_access c
    where u.id = target
      and c.id = 1
      and u.status = 'active'
      and u.email_verified_at is not null
      and (
        (c.sample_mode and u.is_sample)
        or (
          not c.sample_mode
          and not u.is_sample
          and c.email_domain is not null
          and lower(split_part(u.email, '@', 2)) = c.email_domain
        )
      )
  )
$fn$;

create or replace function private.has_permission(requested text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $fn$
  select exists (
    select 1
    from public.users u
    join public.role_permissions rp on rp.role = u.role
    where u.id = private.current_user_id()
      and private.user_is_allowed(u.id)
      and (rp.permission = requested or rp.permission = 'crm.full')
  )
$fn$;

create or replace function private.apply_runtime_config(domain text)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  normalized text;
begin
  normalized := private.normalize_domain(domain);
  if normalized is null then
    if (select email_domain from public.company_access where id = 1) is null then
      update public.company_access set sample_mode = true where id = 1;
    end if;
    return;
  end if;
  update public.company_access
  set email_domain = normalized, sample_mode = false
  where id = 1;
  perform set_config('app.system_update', '1', true);
  update public.users
  set status = 'disabled', updated_at = pg_catalog.now()
  where is_sample and status <> 'disabled';
end;
$fn$;

create or replace function private.ensure_bootstrap_admin(admin_email text, admin_name text, password_hash text)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  domain text;
  normalized_email text := lower(btrim(coalesce(admin_email, '')));
  uid uuid;
begin
  select email_domain into domain
  from public.company_access
  where id = 1 and sample_mode = false;
  if domain is null then
    return;
  end if;
  if exists (
    select 1 from public.users
    where role = 'admin' and status = 'active' and not is_sample and email_verified_at is not null
  ) then
    return;
  end if;
  if normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+$' or lower(split_part(normalized_email, '@', 2)) <> domain then
    raise exception 'CRM:bootstrap_domain';
  end if;
  if char_length(btrim(coalesce(admin_name, ''))) < 2 then
    raise exception 'CRM:invalid_name';
  end if;
  if password_hash is null or char_length(password_hash) < 20 then
    raise exception 'CRM:weak_password';
  end if;
  select id into uid from public.users where lower(users.email) = normalized_email;
  if uid is null then
    insert into public.users (email, full_name, role, status, email_verified_at, is_sample)
    values (normalized_email, btrim(admin_name), 'admin', 'active', pg_catalog.now(), false)
    returning id into uid;
  else
    update public.users
    set full_name = btrim(admin_name),
        role = 'admin',
        status = 'active',
        email_verified_at = coalesce(email_verified_at, pg_catalog.now()),
        is_sample = false,
        updated_at = pg_catalog.now()
    where id = uid;
  end if;
  insert into public.user_credentials (user_id, password_hash)
  values (uid, password_hash)
  on conflict (user_id) do update set password_hash = excluded.password_hash;
end;
$fn$;

create or replace function private.workspace_status()
returns table (sample_mode boolean, email_domain text, has_active_admin boolean)
language sql
stable
security definer
set search_path = ''
as $fn$
  select
    c.sample_mode,
    c.email_domain,
    exists (
      select 1 from public.users u
      where u.role = 'admin'
        and u.status = 'active'
        and u.email_verified_at is not null
        and u.is_sample = c.sample_mode
        and (
          c.sample_mode
          or lower(split_part(u.email, '@', 2)) = c.email_domain
        )
    )
  from public.company_access c
  where c.id = 1
$fn$;

create or replace function private.sample_directory()
returns table (id uuid, full_name text, email text, role text)
language sql
stable
security definer
set search_path = ''
as $fn$
  select u.id, u.full_name, u.email, u.role
  from public.users u
  cross join public.company_access c
  where c.id = 1
    and c.sample_mode
    and u.is_sample
    and u.status = 'active'
  order by case u.role when 'admin' then 0 when 'manager' then 1 else 2 end, u.full_name
$fn$;

create or replace function private.credential_for_login(login_email text)
returns table (user_id uuid, password_hash text)
language sql
stable
security definer
set search_path = ''
as $fn$
  select u.id, cred.password_hash
  from public.users u
  join public.user_credentials cred on cred.user_id = u.id
  where lower(u.email) = lower(btrim(coalesce(login_email, '')))
    and private.user_is_allowed(u.id)
$fn$;

create or replace function private.open_session(target uuid, token_hash text, expires_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if not private.user_is_allowed(target) then
    raise exception 'CRM:not_allowed';
  end if;
  if token_hash is null or char_length(token_hash) < 20 or char_length(token_hash) > 200 or expires_at <= pg_catalog.now() then
    raise exception 'CRM:not_allowed';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(7272742);
  delete from public.sessions as stale where stale.expires_at <= pg_catalog.now();
  delete from public.sessions as extra
  where extra.user_id = target
    and extra.id not in (
      select kept.id from public.sessions as kept
      where kept.user_id = target
      order by kept.created_at desc
      limit 2
    );
  delete from public.sessions as overflow
  where overflow.id in (
    select ranked.id from public.sessions as ranked
    order by ranked.created_at desc
    offset 39
  );

  insert into public.sessions (token_hash, user_id, expires_at)
  values (token_hash, target, expires_at);
end;
$fn$;

create or replace function private.open_sample_session(target uuid, token_hash text, expires_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if not coalesce((select sample_mode from public.company_access where id = 1), false) then
    raise exception 'CRM:sample_mode';
  end if;
  if not exists (
    select 1 from public.users
    where id = target and is_sample and status = 'active' and role <> 'admin'
  ) then
    raise exception 'CRM:not_allowed';
  end if;
  perform private.open_session(target, token_hash, expires_at);
end;
$fn$;

create or replace function private.session_profile(token_hash text)
returns table (
  user_id uuid,
  email text,
  full_name text,
  role text,
  sample_mode boolean,
  email_domain text
)
language sql
stable
security definer
set search_path = ''
as $fn$
  select u.id, u.email, u.full_name, u.role, c.sample_mode, c.email_domain
  from public.sessions s
  join public.users u on u.id = s.user_id
  cross join public.company_access c
  where s.token_hash = session_profile.token_hash
    and s.expires_at > pg_catalog.now()
    and c.id = 1
    and private.user_is_allowed(u.id)
$fn$;

create or replace function private.close_session(token_hash text)
returns void
language sql
security definer
set search_path = ''
as $fn$
  delete from public.sessions where sessions.token_hash = close_session.token_hash
$fn$;

create or replace function private.create_invite(
  actor uuid,
  new_email text,
  new_name text,
  new_role text,
  token_hash text,
  expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  normalized_email text := lower(btrim(coalesce(new_email, '')));
  domain text;
  uid uuid;
begin
  if not private.user_is_allowed(actor) then
    raise exception 'CRM:not_allowed';
  end if;
  if not exists (
    select 1
    from public.users u
    join public.role_permissions rp on rp.role = u.role
    where u.id = actor and (rp.permission = 'users.manage' or rp.permission = 'crm.full')
  ) then
    raise exception 'CRM:not_allowed';
  end if;
  if coalesce((select sample_mode from public.company_access where id = 1), true) then
    raise exception 'CRM:sample_mode';
  end if;
  select email_domain into domain from public.company_access where id = 1;
  if normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' or lower(split_part(normalized_email, '@', 2)) <> domain then
    raise exception 'CRM:domain_rejected';
  end if;
  if new_role not in ('admin', 'sales', 'manager') then
    raise exception 'CRM:invalid_role';
  end if;
  if char_length(btrim(coalesce(new_name, ''))) < 2 then
    raise exception 'CRM:invalid_name';
  end if;
  if exists (select 1 from public.users where lower(users.email) = normalized_email) then
    raise exception 'CRM:duplicate_email';
  end if;
  if token_hash is null or char_length(token_hash) < 20 or expires_at <= pg_catalog.now() then
    raise exception 'CRM:invalid_token';
  end if;
  insert into public.users (email, full_name, role, status, is_sample)
  values (normalized_email, btrim(new_name), new_role, 'invited', false)
  returning id into uid;
  insert into public.email_verifications (user_id, token_hash, expires_at)
  values (uid, token_hash, expires_at);
  return uid;
end;
$fn$;

create or replace function private.verification_preview(token_hash text)
returns table (email text, full_name text, role text)
language sql
stable
security definer
set search_path = ''
as $fn$
  select u.email, u.full_name, u.role
  from public.email_verifications v
  join public.users u on u.id = v.user_id
  where v.token_hash = verification_preview.token_hash
    and v.used_at is null
    and v.expires_at > pg_catalog.now()
    and u.status <> 'disabled'
$fn$;

create or replace function private.accept_invite(token_hash text, password_hash text)
returns void
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  uid uuid;
begin
  if password_hash is null or char_length(password_hash) < 20 then
    raise exception 'CRM:weak_password';
  end if;
  select v.user_id into uid
  from public.email_verifications v
  join public.users u on u.id = v.user_id
  where v.token_hash = accept_invite.token_hash
    and v.used_at is null
    and v.expires_at > pg_catalog.now()
    and u.status = 'invited'
  for update;
  if uid is null then
    raise exception 'CRM:invalid_token';
  end if;
  update public.users
  set status = 'active', email_verified_at = pg_catalog.now(), updated_at = pg_catalog.now()
  where id = uid;
  insert into public.user_credentials (user_id, password_hash)
  values (uid, password_hash)
  on conflict (user_id) do update set password_hash = excluded.password_hash;
  update public.email_verifications
  set used_at = pg_catalog.now()
  where email_verifications.token_hash = accept_invite.token_hash;
end;
$fn$;

create or replace function private.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if current_setting('app.system_update', true) = '1' then
    new.updated_at := pg_catalog.now();
    return new;
  end if;
  if old.role = 'admin'
    and old.status = 'active'
    and (new.role <> 'admin' or new.status <> 'active')
    and (
      select count(*)
      from public.users
      where role = 'admin'
        and status = 'active'
        and is_sample = old.is_sample
        and id <> old.id
    ) < 1
  then
    raise exception 'CRM:last_admin';
  end if;
  new.updated_at := pg_catalog.now();
  return new;
end;
$fn$;

create trigger users_protect_last_admin
before update on public.users
for each row
execute function private.protect_last_admin();

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to current_user;
grant execute on function private.current_user_id() to crm_app;
grant execute on function private.in_workspace(boolean) to crm_app;
grant execute on function private.user_is_allowed(uuid) to crm_app;
grant execute on function private.has_permission(text) to crm_app;

grant select, insert, update on public.leads to crm_app;
grant select, insert, update on public.opportunities to crm_app;
grant select, insert, update on public.activities to crm_app;
grant select (id, email, full_name, role, status, email_verified_at, is_sample, created_at) on public.users to crm_app;
grant update (role, status, full_name, updated_at) on public.users to crm_app;
grant select on public.role_permissions to crm_app;
grant select on public.company_access to crm_app;
grant select on public.crm_settings to crm_app;
grant update (stale_after_days) on public.crm_settings to crm_app;

alter table public.company_access enable row level security;
alter table public.crm_settings enable row level security;
alter table public.users enable row level security;
alter table public.user_credentials enable row level security;
alter table public.sessions enable row level security;
alter table public.email_verifications enable row level security;
alter table public.role_permissions enable row level security;
alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.activities enable row level security;

create policy company_access_read on public.company_access
for select to crm_app
using ((select private.user_is_allowed((select private.current_user_id()))));

create policy crm_settings_read on public.crm_settings
for select to crm_app
using ((select private.user_is_allowed((select private.current_user_id()))));

create policy crm_settings_update on public.crm_settings
for update to crm_app
using ((select private.has_permission('settings.manage')))
with check (
  (select private.has_permission('settings.manage'))
  and stale_after_days between 1 and 90
);

create policy role_permissions_read on public.role_permissions
for select to crm_app
using ((select private.user_is_allowed((select private.current_user_id()))));

create policy users_read on public.users
for select to crm_app
using (
  (select private.user_is_allowed((select private.current_user_id())))
  and (select private.in_workspace(is_sample))
  and (
    id = (select private.current_user_id())
    or (select private.has_permission('users.manage'))
    or ((select private.has_permission('leads.assign')) and role = 'sales' and status = 'active')
  )
);

create policy users_update on public.users
for update to crm_app
using (
  (select private.has_permission('users.manage'))
  and (select private.in_workspace(is_sample))
)
with check (
  (select private.has_permission('users.manage'))
  and (select private.in_workspace(is_sample))
  and role in ('admin', 'sales', 'manager')
  and status in ('invited', 'active', 'disabled')
  and (status <> 'active' or email_verified_at is not null or is_sample)
);

create policy leads_read on public.leads
for select to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.user_is_allowed((select private.current_user_id())))
  and (
    (select private.has_permission('leads.view_all'))
    or (
      (select private.has_permission('leads.view_assigned'))
      and owner_id = (select private.current_user_id())
    )
  )
);

create policy leads_insert on public.leads
for insert to crm_app
with check (
  (select private.in_workspace(is_sample))
  and (
    (select private.has_permission('leads.manage_all'))
    or (select private.has_permission('leads.create'))
  )
  and (
    owner_id is null
    or exists (
      select 1 from public.users u
      where u.id = leads.owner_id
        and u.role = 'sales'
        and private.user_is_allowed(u.id)
    )
  )
);

create policy leads_update_manage on public.leads
for update to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.has_permission('leads.manage_all'))
)
with check (
  (select private.in_workspace(is_sample))
  and (select private.has_permission('leads.manage_all'))
);

create policy leads_update_assigned on public.leads
for update to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.has_permission('leads.manage_assigned'))
  and owner_id = (select private.current_user_id())
)
with check (
  (select private.in_workspace(is_sample))
  and (select private.has_permission('leads.manage_assigned'))
  and owner_id = (select private.current_user_id())
);

create policy leads_update_assign on public.leads
for update to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.has_permission('leads.assign'))
)
with check (
  (select private.in_workspace(is_sample))
  and (select private.has_permission('leads.assign'))
  and (
    owner_id is null
    or exists (
      select 1 from public.users u
      where u.id = leads.owner_id
        and u.role = 'sales'
        and private.user_is_allowed(u.id)
    )
  )
);

create policy opportunities_read on public.opportunities
for select to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.user_is_allowed((select private.current_user_id())))
  and (
    (select private.has_permission('opportunities.view_all'))
    or (
      (select private.has_permission('opportunities.view_assigned'))
      and owner_id = (select private.current_user_id())
    )
  )
);

create policy opportunities_insert on public.opportunities
for insert to crm_app
with check (
  (select private.in_workspace(is_sample))
  and (
    (select private.has_permission('opportunities.manage_all'))
    or (
      (select private.has_permission('opportunities.create'))
      and owner_id = (select private.current_user_id())
      and (
        lead_id is null
        or exists (
          select 1 from public.leads l
          where l.id = opportunities.lead_id
            and l.owner_id = (select private.current_user_id())
        )
      )
    )
  )
);

create policy opportunities_update on public.opportunities
for update to crm_app
using (
  (select private.in_workspace(is_sample))
  and (
    (select private.has_permission('opportunities.manage_all'))
    or (
      (select private.has_permission('pipeline.update_assigned'))
      and owner_id = (select private.current_user_id())
    )
  )
)
with check (
  (select private.in_workspace(is_sample))
  and (
    (select private.has_permission('opportunities.manage_all'))
    or (
      (select private.has_permission('pipeline.update_assigned'))
      and owner_id = (select private.current_user_id())
    )
  )
);

create policy activities_read on public.activities
for select to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.user_is_allowed((select private.current_user_id())))
  and (
    (select private.has_permission('activities.view_all'))
    or owner_id = (select private.current_user_id())
    or exists (
      select 1 from public.leads l
      where l.id = activities.lead_id
        and l.owner_id = (select private.current_user_id())
    )
    or exists (
      select 1 from public.opportunities o
      where o.id = activities.opportunity_id
        and o.owner_id = (select private.current_user_id())
    )
  )
);

create policy activities_insert on public.activities
for insert to crm_app
with check (
  (select private.in_workspace(is_sample))
  and (select private.has_permission('activities.create'))
  and owner_id = (select private.current_user_id())
  and (
    (select private.has_permission('activities.view_all'))
    or exists (
      select 1 from public.leads l
      where l.id = activities.lead_id
        and l.owner_id = (select private.current_user_id())
    )
    or exists (
      select 1 from public.opportunities o
      where o.id = activities.opportunity_id
        and o.owner_id = (select private.current_user_id())
    )
  )
);

create policy activities_update on public.activities
for update to crm_app
using (
  (select private.in_workspace(is_sample))
  and (
    (select private.has_permission('activities.manage'))
    or (
      (select private.has_permission('activities.manage_own'))
      and owner_id = (select private.current_user_id())
    )
  )
)
with check (
  (select private.in_workspace(is_sample))
  and (
    (select private.has_permission('activities.manage'))
    or (
      (select private.has_permission('activities.manage_own'))
      and owner_id = (select private.current_user_id())
    )
  )
);
