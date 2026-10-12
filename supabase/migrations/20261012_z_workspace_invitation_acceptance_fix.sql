create or replace function public.guard_workspace_member_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.user_id is null
    and old.status = 'pending'
    and new.user_id = auth.uid()
    and new.status = 'accepted'
    and new.id is not distinct from old.id
    and new.workspace_id is not distinct from old.workspace_id
    and new.invited_email is not distinct from old.invited_email
    and new.role is not distinct from old.role
    and new.role in ('editor', 'viewer')
    and public.is_active_user()
    and exists (
      select 1 from auth.users
      where id = auth.uid()
        and email_confirmed_at is not null
        and lower(email) = lower(old.invited_email)
    ) then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.workspace_id is distinct from old.workspace_id
    or new.user_id is distinct from old.user_id
    or new.invited_email is distinct from old.invited_email
    or new.status is distinct from old.status then
    raise exception 'Workspace invitations can only be accepted through the invitation RPC';
  end if;

  if new.role not in ('editor', 'viewer') then
    raise exception 'Workspace member role must be editor or viewer';
  end if;

  return new;
end;
$$;
