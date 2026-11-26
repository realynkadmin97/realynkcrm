create or replace function private.ensure_crm_app_grant()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  begin
    create role crm_app nologin;
  exception
    when duplicate_object then null;
  end;

  begin
    execute format('grant crm_app to %I', session_user);
  exception
    when others then null;
  end;

  begin
    execute 'grant crm_app to postgres';
  exception
    when others then null;
  end;
end;
$$;

revoke all on function private.ensure_crm_app_grant() from public;
grant execute on function private.ensure_crm_app_grant() to current_user;

select private.ensure_crm_app_grant();
