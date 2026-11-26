-- Supabase / pooler connections need an explicit grant to assume crm_app.
do $$
begin
  create role crm_app nologin;
exception
  when duplicate_object then null;
end
$$;

grant crm_app to current_user;

do $$
begin
  execute 'grant crm_app to postgres';
exception
  when undefined_object then null;
  when insufficient_privilege then null;
end
$$;
