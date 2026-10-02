-- Beheer: rollen (nu 'admin', later ook 'leraar'), een logboek van alles wat
-- de beheerder aanpast, en functies voor de beheerpagina (/beheer). De tabellen
-- zijn niet direct te lezen; alles loopt via functies die eerst controleren of
-- je beheerder bent.

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'leraar')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;
revoke all on public.user_roles from anon, authenticated;

create table public.admin_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  admin_id uuid references auth.users (id) on delete set null,
  -- Wordt het account van de speler verwijderd, dan ook zijn regels in het logboek.
  player_id uuid references auth.users (id) on delete cascade,
  reason text,
  before jsonb,
  after jsonb
);

alter table public.admin_log enable row level security;
revoke all on public.admin_log from anon, authenticated;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

create function public.require_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Alleen voor de beheerder' using errcode = '42501';
  end if;
end;
$$;

-- Alle accounts met een samenvatting van hun voortgang.
create function public.admin_list_players()
returns table (
  user_id uuid,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  confirmed boolean,
  coins integer,
  prizes integer,
  stars integer,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  perform public.require_admin();
  return query
    select
      u.id,
      u.email::text,
      u.created_at,
      u.last_sign_in_at,
      u.email_confirmed_at is not null,
      coalesce((p.data ->> 'coins')::integer, 0),
      coalesce(jsonb_array_length(p.data -> 'prizes'), 0),
      (select count(*)::integer from jsonb_object_keys(coalesce(p.data -> 'stars', '{}'::jsonb))),
      p.updated_at
    from auth.users u
    left join public.progress p on p.user_id = u.id
    order by u.created_at desc;
end;
$$;

-- De volledige voortgang van één speler.
create function public.admin_get_progress(player uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform public.require_admin();
  select jsonb_build_object(
    'email', u.email,
    'data', p.data,
    'revision', p.revision
  )
  into result
  from auth.users u
  left join public.progress p on p.user_id = u.id
  where u.id = player;
  return result;
end;
$$;

-- Voortgang van een speler aanpassen. Alleen als niemand hem intussen wijzigde
-- (expected_revision); null = de speler heeft nog geen voortgang online.
-- Geeft de nieuwe revision terug.
create function public.admin_save_progress(
  player uuid,
  new_data jsonb,
  expected_revision bigint,
  reason text
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_data jsonb;
  new_revision bigint;
begin
  perform public.require_admin();
  if jsonb_typeof(new_data) <> 'object' then
    raise exception 'Ongeldige voortgang' using errcode = '22023';
  end if;

  if expected_revision is null then
    insert into public.progress (user_id, data) values (player, new_data)
    returning revision into new_revision;
  else
    select data into old_data from public.progress where user_id = player;
    update public.progress set data = new_data
    where user_id = player and revision = expected_revision
    returning revision into new_revision;
    if new_revision is null then
      raise exception 'De voortgang is intussen veranderd; laad hem opnieuw'
        using errcode = '40001';
    end if;
  end if;

  insert into public.admin_log (admin_id, player_id, reason, before, after)
  values ((select auth.uid()), player, nullif(trim(reason), ''), old_data, new_data);
  return new_revision;
end;
$$;

-- De laatste aanpassingen van de beheerder.
create function public.admin_recent_log()
returns table (at timestamptz, email text, reason text, before jsonb, after jsonb)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  perform public.require_admin();
  return query
    select l.at, u.email::text, l.reason, l.before, l.after
    from public.admin_log l
    left join auth.users u on u.id = l.player_id
    order by l.at desc
    limit 50;
end;
$$;

revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.require_admin() from public, anon, authenticated;
revoke execute on function public.admin_list_players() from public, anon;
revoke execute on function public.admin_get_progress(uuid) from public, anon;
revoke execute on function public.admin_save_progress(uuid, jsonb, bigint, text) from public, anon;
revoke execute on function public.admin_recent_log() from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.admin_list_players() to authenticated;
grant execute on function public.admin_get_progress(uuid) to authenticated;
grant execute on function public.admin_save_progress(uuid, jsonb, bigint, text) to authenticated;
grant execute on function public.admin_recent_log() to authenticated;
