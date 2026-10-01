-- Voortgang per account: één rij per speler met dezelfde gegevens als in de
-- browser (zie src/storage). Iedereen kan alleen zijn eigen rij lezen en
-- schrijven. Wordt het account verwijderd, dan verdwijnt de voortgang ook.

create table public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  -- Telt op bij elke wijziging; zo merkt de site dat een andere computer
  -- tussendoor iets heeft opgeslagen.
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint progress_data_is_object check (jsonb_typeof(data) = 'object'),
  constraint progress_data_size check (octet_length(data::text) <= 1000000)
);

alter table public.progress enable row level security;

revoke all on public.progress from anon;

create policy "Eigen voortgang lezen" on public.progress
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Eigen voortgang aanmaken" on public.progress
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Eigen voortgang bijwerken" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- revision en updated_at zet de database zelf, niet de site.
create function public.progress_set_revision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.revision := 1;
  else
    new.revision := old.revision + 1;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke execute on function public.progress_set_revision() from public, anon, authenticated;

create trigger progress_set_revision
  before insert or update on public.progress
  for each row execute function public.progress_set_revision();
