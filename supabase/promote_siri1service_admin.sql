-- Run manually in the Supabase SQL Editor after siri1service@gmail.com has signed up.
-- This intentionally changes only this existing account's role.
do $$
declare
  target_user_id uuid;
begin
  select id
  into target_user_id
  from auth.users
  where lower(email) = lower('siri1service@gmail.com');

  if target_user_id is null then
    raise exception 'No Supabase Auth account exists for siri1service@gmail.com. Sign up and confirm the email first.';
  end if;

  update public.profiles
  set role = 'admin'
  where id = target_user_id;

  if not found then
    raise exception 'No profile exists for siri1service@gmail.com. Check the profile creation trigger.';
  end if;
end;
$$;

select email, role, status
from public.profiles
where lower(email) = lower('siri1service@gmail.com');
