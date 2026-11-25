-- Cloud lead lists for the cleaner. Rows stay in the company database.
-- Enrichment columns are not re-added on load; the sheet is whatever was saved.

create table public.cleaner_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  headers jsonb not null default '[]'::jsonb,
  rows jsonb not null default '[]'::jsonb,
  created_by uuid not null references public.users (id),
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cleaner_lists_name_len check (char_length(btrim(name)) between 1 and 80),
  constraint cleaner_lists_headers_shape check (jsonb_typeof(headers) = 'array' and jsonb_array_length(headers) <= 40),
  constraint cleaner_lists_rows_shape check (jsonb_typeof(rows) = 'array' and jsonb_array_length(rows) <= 500)
);

create index cleaner_lists_updated_idx on public.cleaner_lists (updated_at desc);

create or replace function private.protect_cleaner_list()
returns trigger
language plpgsql
security definer
set search_path = ''
as $fn$
begin
  if new.created_by is distinct from old.created_by or new.is_sample is distinct from old.is_sample then
    raise exception 'CRM:forbidden';
  end if;
  new.updated_at := pg_catalog.now();
  return new;
end;
$fn$;

create trigger cleaner_lists_protect
before update on public.cleaner_lists
for each row
execute function private.protect_cleaner_list();

revoke all on function private.protect_cleaner_list() from public;

insert into public.cleaner_lists (name, headers, rows, created_by, is_sample)
select
  'Outbound clinics',
  '["First Name","Last Name","Company","Title","Email","LinkedIn URL"]'::jsonb,
  jsonb_build_array(
    jsonb_build_object(
      '__id', 'c1e0c1e0-c1e0-41e0-81e0-c1e0c1e0c1e0',
      'First Name', 'Dana',
      'Last Name', 'Ruiz',
      'Company', 'northwind clinics, llc',
      'Title', 'vp operations',
      'Email', 'dana.ruiz@northwind.example',
      'LinkedIn URL', 'https://www.linkedin.com/in/dana-ruiz-example'
    ),
    jsonb_build_object(
      '__id', 'c2e0c2e0-c2e0-42e0-82e0-c2e0c2e0c2e0',
      'First Name', 'Elena',
      'Last Name', 'Brooks',
      'Company', 'LUMEN DENTAL GROUP INC',
      'Title', 'dir. of recruiting',
      'Email', 'elena.brooks@lumen.example',
      'LinkedIn URL', 'https://www.linkedin.com/in/elena-brooks-example'
    )
  ),
  id,
  true
from public.users
where email = 'morgan.ellis@sample.invalid';

grant select, insert, update, delete on public.cleaner_lists to crm_app;

alter table public.cleaner_lists enable row level security;

create policy cleaner_lists_read on public.cleaner_lists
for select to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.user_is_allowed((select private.current_user_id())))
);

create policy cleaner_lists_insert on public.cleaner_lists
for insert to crm_app
with check (
  (select private.in_workspace(is_sample))
  and (select private.user_is_allowed((select private.current_user_id())))
  and created_by = (select private.current_user_id())
);

create policy cleaner_lists_update on public.cleaner_lists
for update to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.user_is_allowed((select private.current_user_id())))
)
with check (
  (select private.in_workspace(is_sample))
  and (select private.user_is_allowed((select private.current_user_id())))
);

create policy cleaner_lists_delete on public.cleaner_lists
for delete to crm_app
using (
  (select private.in_workspace(is_sample))
  and (select private.user_is_allowed((select private.current_user_id())))
);
