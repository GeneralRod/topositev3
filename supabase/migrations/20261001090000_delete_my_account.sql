-- Een speler kan zijn eigen account verwijderen (knop op /account). Alleen het
-- account van wie is ingelogd; de voortgang verdwijnt mee (on delete cascade).

create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Niet ingelogd' using errcode = '28000';
  end if;
  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
