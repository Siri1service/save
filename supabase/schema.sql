-- ========================================================
-- DATABASE SCHEMA: MINIMAL & MODERN EXPENSE TRACKER
-- Platform: Supabase (PostgreSQL + RLS + Auth Triggers)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. WORKSPACES (Personal & Shop/Business Accounts)
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  type text not null default 'personal' check (type in ('personal', 'shop')),
  description text,
  currency text not null default 'THB',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. WORKSPACE MEMBERS (Collaboration & Permissions)
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  status text not null default 'accepted' check (status in ('pending', 'accepted', 'declined')),
  invited_email text,
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create unique index if not exists workspace_members_pending_invite_unique
  on public.workspace_members (workspace_id, lower(invited_email))
  where status = 'pending' and user_id is null;

-- 4. CATEGORIES (Income & Expense)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'Tag',
  color text not null default '#6366f1',
  sort_order integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(14, 2) not null check (amount >= 0),
  date date not null default current_date,
  title text not null,
  notes text,
  receipt_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. EMAIL LOGS (Admin user communications)
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  recipient_email text not null,
  recipient_user_id uuid references auth.users(id) on delete set null,
  subject text not null,
  template_type text not null,
  content text not null,
  status text not null default 'sent',
  sent_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.email_logs enable row level security;

-- Helper function: Is the current account active?
create or replace function public.is_active_user()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'active'
  );
$$;

-- Helper function: Is current user an active admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- Helper function: Does current user have access to workspace?
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

-- Helper function: Does user have editor or owner role in workspace?
create or replace function public.has_workspace_edit_access(ws_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin() or (public.is_active_user() and (exists (
    select 1 from public.workspaces w
    where w.id = ws_id and w.owner_id = auth.uid()
  ) or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ws_id and wm.user_id = auth.uid() and wm.role in ('owner', 'editor') and wm.status = 'accepted'
  )));
$$;

create or replace function public.admin_delete_transactions_by_date_range(
  p_start_date date,
  p_end_date date
)
returns bigint language plpgsql security definer set search_path = public as $$
declare
  deleted_count bigint;
begin
  if not public.is_admin() then
    raise exception 'Only an active administrator can delete transactions across workspaces';
  end if;

  if p_start_date is null or p_end_date is null or p_start_date > p_end_date then
    raise exception 'A valid inclusive start and end date range is required';
  end if;

  delete from public.transactions
  where date >= p_start_date and date <= p_end_date;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.admin_delete_transactions_by_date_range(date, date) from public;
grant execute on function public.admin_delete_transactions_by_date_range(date, date) to authenticated;

create or replace function public.swap_category_order(
  p_category_id uuid,
  p_adjacent_category_id uuid
)
returns void language plpgsql security definer set search_path = public as $$
declare
  current_category public.categories%rowtype;
  adjacent_category public.categories%rowtype;
begin
  select * into current_category
  from public.categories
  where id = p_category_id;

  select * into adjacent_category
  from public.categories
  where id = p_adjacent_category_id;

  if current_category.id is null or adjacent_category.id is null
    or current_category.workspace_id <> adjacent_category.workspace_id
    or current_category.type <> adjacent_category.type then
    raise exception 'Categories must exist in the same workspace and category type';
  end if;

  if not public.has_workspace_edit_access(current_category.workspace_id) then
    raise exception 'You do not have permission to reorder categories in this workspace';
  end if;

  update public.categories
  set sort_order = adjacent_category.sort_order
  where id = current_category.id;

  update public.categories
  set sort_order = current_category.sort_order
  where id = adjacent_category.id;
end;
$$;

revoke all on function public.swap_category_order(uuid, uuid) from public;
grant execute on function public.swap_category_order(uuid, uuid) to authenticated;

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

drop trigger if exists trg_guard_workspace_member_changes on public.workspace_members;
create trigger trg_guard_workspace_member_changes before update on public.workspace_members
  for each row execute function public.guard_workspace_member_changes();

-- Prevent users from granting themselves admin access or changing their status.
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

-- PROFILES POLICIES
create policy "Users can view own profile or admins view all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile or admins update any"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin());

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (public.is_admin());

-- WORKSPACES POLICIES
create policy "Users can view workspaces they belong to or admins"
  on public.workspaces for select
  using (public.has_workspace_access(id));

create policy "Users can insert their own workspaces"
  on public.workspaces for insert
  with check (public.is_active_user() and (auth.uid() = owner_id or public.is_admin()));

create policy "Owners or admins can update workspaces"
  on public.workspaces for update
  using (public.is_active_user() and (auth.uid() = owner_id or public.is_admin()));

create policy "Owners or admins can delete workspaces"
  on public.workspaces for delete
  using (public.is_active_user() and (auth.uid() = owner_id or public.is_admin()));

-- WORKSPACE MEMBERS POLICIES
create policy "Members or admins can view workspace members"
  on public.workspace_members for select
  using (public.has_workspace_access(workspace_id));

create policy "Owners or admins can insert workspace members"
  on public.workspace_members for insert
  with check (public.is_active_user() and (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or public.is_admin()
  ) and user_id is null and status = 'pending'
    and invited_email is not null and role in ('editor', 'viewer'));

create policy "Owners or admins can update workspace members"
  on public.workspace_members for update
  using (public.is_active_user() and (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or public.is_admin()
  ));

create policy "Owners or members themselves can delete membership"
  on public.workspace_members for delete
  using (public.is_active_user() and (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or user_id = auth.uid()
    or public.is_admin()
  ));

-- CATEGORIES POLICIES
create policy "Users can view categories in permitted workspaces"
  on public.categories for select
  using (public.has_workspace_access(workspace_id));

create policy "Editors and owners can manage categories"
  on public.categories for insert
  with check (public.has_workspace_edit_access(workspace_id));

create policy "Editors and owners can update categories"
  on public.categories for update
  using (public.has_workspace_edit_access(workspace_id));

create policy "Editors and owners can delete categories"
  on public.categories for delete
  using (public.has_workspace_edit_access(workspace_id));

-- TRANSACTIONS POLICIES
create policy "Users can view transactions in permitted workspaces"
  on public.transactions for select
  using (public.has_workspace_access(workspace_id));

create policy "Editors and owners can insert transactions"
  on public.transactions for insert
  with check (public.has_workspace_edit_access(workspace_id));

create policy "Editors and owners can update transactions"
  on public.transactions for update
  using (public.has_workspace_edit_access(workspace_id));

create policy "Editors and owners can delete transactions"
  on public.transactions for delete
  using (public.has_workspace_edit_access(workspace_id));

-- EMAIL LOGS POLICIES
create policy "Admins can view and create email logs"
  on public.email_logs for all
  using (public.is_admin());

-- ========================================================
-- AUTOMATIC TRIGGERS (New user signup handler)
-- ========================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_ws_id uuid;
begin
  -- 1. Create Profile
  insert into public.profiles (id, email, full_name, role, status, last_sign_in_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'user',
    'active',
    now()
  );

  -- 2. Create Default Personal Workspace
  insert into public.workspaces (owner_id, name, type, description, currency)
  values (
    new.id,
    'บัญชีส่วนบุคคล',
    'personal',
    'กระเป๋าเงินและค่าใช้จ่ายส่วนตัว',
    'THB'
  ) returning id into new_ws_id;

  -- 3. Add workspace member as owner
  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new_ws_id, new.id, 'owner', 'accepted');

  -- 4. Seed Default Categories for the Workspace
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

-- Trigger execution on auth.users insert
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at timestamp trigger
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_workspaces_updated before update on public.workspaces
  for each row execute function public.update_updated_at_column();

create trigger trg_categories_updated before update on public.categories
  for each row execute function public.update_updated_at_column();

create trigger trg_transactions_updated before update on public.transactions
  for each row execute function public.update_updated_at_column();

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.update_updated_at_column();
