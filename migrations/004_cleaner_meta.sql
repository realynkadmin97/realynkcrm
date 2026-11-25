-- Column prompts and frozen columns travel with the saved sheet.

alter table public.cleaner_lists
  add column meta jsonb not null default '{}'::jsonb;

alter table public.cleaner_lists
  add constraint cleaner_lists_meta_shape check (
    jsonb_typeof(meta) = 'object'
    and octet_length(meta::text) <= 200000
  );
