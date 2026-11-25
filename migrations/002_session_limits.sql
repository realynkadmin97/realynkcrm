-- Replace session helpers on databases that already applied 001.
-- Sample admin accounts cannot be opened without a password.
-- Expired and extra sessions are deleted before a new one is stored.

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

revoke all on function private.open_session(uuid, text, timestamptz) from public;
revoke all on function private.open_sample_session(uuid, text, timestamptz) from public;
grant execute on function private.open_session(uuid, text, timestamptz) to current_user;
grant execute on function private.open_sample_session(uuid, text, timestamptz) to current_user;
