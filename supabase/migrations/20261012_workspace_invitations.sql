-- Allow invitations to exist before the invited person has an auth.users row.
alter table public.workspace_members
  alter column user_id drop not null;

create unique index if not exists workspace_members_pending_invite_unique
  on public.workspace_members (workspace_id, lower(invited_email))
  where status = 'pending' and user_id is null;

create or replace function public.accept_workspace_invitations()
returns uuid[] language plpgsql security definer set search_path = public as $$
declare
  v_email text;
  v_workspace_ids uuid[];
begin
  if auth.uid() is null or not public.is_active_user() then
    raise exception 'An active signed-in account is required to accept invitations';
  end if;

  select lower(email) into v_email
  from auth.users
  where id = auth.uid() and email_confirmed_at is not null;
  if v_email is null then return '{}'::uuid[]; end if;

  delete from public.workspace_members invitation
  where invitation.user_id is null
    and invitation.status = 'pending'
    and lower(invitation.invited_email) = v_email
    and exists (
      select 1 from public.workspace_members existing
      where existing.workspace_id = invitation.workspace_id
        and existing.user_id = auth.uid()
        and existing.status = 'accepted'
    );

  with accepted as (
    update public.workspace_members
    set user_id = auth.uid(), status = 'accepted'
    where user_id is null
      and status = 'pending'
      and lower(invited_email) = v_email
    returning workspace_id
  )
  select coalesce(array_agg(workspace_id), '{}'::uuid[])
  into v_workspace_ids
  from accepted;

  return v_workspace_ids;
end;
$$;

revoke all on function public.accept_workspace_invitations() from public;
grant execute on function public.accept_workspace_invitations() to authenticated;

create or replace function public.guard_workspace_member_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
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

drop trigger if exists trg_guard_workspace_member_changes on public.workspace_members;
create trigger trg_guard_workspace_member_changes before update on public.workspace_members
  for each row execute function public.guard_workspace_member_changes();

drop policy if exists "Owners or admins can insert workspace members" on public.workspace_members;
create policy "Owners or admins can insert workspace members"
  on public.workspace_members for insert
  with check (public.is_active_user() and (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or public.is_admin()
  ) and user_id is null and status = 'pending'
    and invited_email is not null and role in ('editor', 'viewer'));
