-- Apply to existing Supabase projects to secure signup roles and account access.
create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

create or replace function public.has_workspace_access(ws_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or (public.is_active_user() and (exists (
    select 1 from public.workspaces w
    where w.id = ws_id and w.owner_id = auth.uid()
  ) or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ws_id and wm.user_id = auth.uid() and wm.status = 'accepted'
  )));
$$;

create or replace function public.has_workspace_edit_access(ws_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or (public.is_active_user() and (exists (
    select 1 from public.workspaces w
    where w.id = ws_id and w.owner_id = auth.uid()
  ) or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ws_id and wm.user_id = auth.uid()
      and wm.role in ('owner', 'editor') and wm.status = 'accepted'
  )));
$$;

create or replace function public.guard_profile_privileges()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() = old.id
    and not public.is_admin()
    and (new.id is distinct from old.id
      or new.role is distinct from old.role
      or new.status is distinct from old.status) then
    raise exception 'Only an active admin can change profile access';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profile_privileges on public.profiles;
create trigger trg_guard_profile_privileges before update on public.profiles
  for each row execute function public.guard_profile_privileges();

drop policy if exists "Users can insert their own workspaces" on public.workspaces;
create policy "Users can insert their own workspaces"
  on public.workspaces for insert
  with check (public.is_active_user() and (auth.uid() = owner_id or public.is_admin()));

drop policy if exists "Owners or admins can update workspaces" on public.workspaces;
create policy "Owners or admins can update workspaces"
  on public.workspaces for update
  using (public.is_active_user() and (auth.uid() = owner_id or public.is_admin()));

drop policy if exists "Owners or admins can delete workspaces" on public.workspaces;
create policy "Owners or admins can delete workspaces"
  on public.workspaces for delete
  using (public.is_active_user() and (auth.uid() = owner_id or public.is_admin()));

drop policy if exists "Owners or admins can insert workspace members" on public.workspace_members;
create policy "Owners or admins can insert workspace members"
  on public.workspace_members for insert
  with check (public.is_active_user() and (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or public.is_admin()
  ));

drop policy if exists "Owners or admins can update workspace members" on public.workspace_members;
create policy "Owners or admins can update workspace members"
  on public.workspace_members for update
  using (public.is_active_user() and (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or public.is_admin()
  ));

drop policy if exists "Owners or members themselves can delete membership" on public.workspace_members;
create policy "Owners or members themselves can delete membership"
  on public.workspace_members for delete
  using (public.is_active_user() and (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or user_id = auth.uid()
    or public.is_admin()
  ));

-- Ignore any role submitted as signup metadata; new profiles are always users.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_ws_id uuid;
begin
  insert into public.profiles (id, email, full_name, role, status, last_sign_in_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user',
    'active',
    now()
  );

  insert into public.workspaces (owner_id, name, type, description, currency)
  values (
    new.id,
    'บัญชีส่วนบุคคล',
    'personal',
    'กระเป๋าเงินและค่าใช้จ่ายส่วนตัว',
    'THB'
  ) returning id into new_ws_id;

  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new_ws_id, new.id, 'owner', 'accepted');

  insert into public.categories (workspace_id, name, type, icon, color, is_default) values
    (new_ws_id, 'เงินเดือน', 'income', 'Wallet', '#10b981', true),
    (new_ws_id, 'รายได้เสริม', 'income', 'TrendingUp', '#06b6d4', true),
    (new_ws_id, 'โบนัส/ของขวัญ', 'income', 'Gift', '#8b5cf6', true),
    (new_ws_id, 'อาหารและเครื่องดื่ม', 'expense', 'Utensils', '#f97316', true),
    (new_ws_id, 'เดินทางและขนส่ง', 'expense', 'Car', '#3b82f6', true),
    (new_ws_id, 'ช้อปปิ้งและของใช้', 'expense', 'ShoppingBag', '#ec4899', true),
    (new_ws_id, 'บิลและสาธารณูปโภค', 'expense', 'Receipt', '#64748b', true),
    (new_ws_id, 'สุขภาพและการรักษา', 'expense', 'Heart', '#ef4444', true),
    (new_ws_id, 'ที่อยู่อาศัย', 'expense', 'Home', '#0ea5e9', true);

  return new;
end;
$$;
