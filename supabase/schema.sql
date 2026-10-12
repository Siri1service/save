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
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  status text not null default 'accepted' check (status in ('pending', 'accepted', 'declined')),
  invited_email text,
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

-- 4. CATEGORIES (Income & Expense)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'Tag',
  color text not null default '#6366f1',
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

-- Helper function: Is current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper function: Does current user have access to workspace?
create or replace function public.has_workspace_access(ws_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = ws_id and w.owner_id = auth.uid()
  ) or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ws_id and wm.user_id = auth.uid() and wm.status = 'accepted'
  ) or public.is_admin();
$$;

-- Helper function: Does user have editor or owner role in workspace?
create or replace function public.has_workspace_edit_access(ws_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.workspaces w
    where w.id = ws_id and w.owner_id = auth.uid()
  ) or exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = ws_id and wm.user_id = auth.uid() and wm.role in ('owner', 'editor') and wm.status = 'accepted'
  ) or public.is_admin();
$$;

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
  with check (auth.uid() = owner_id or public.is_admin());

create policy "Owners or admins can update workspaces"
  on public.workspaces for update
  using (auth.uid() = owner_id or public.is_admin());

create policy "Owners or admins can delete workspaces"
  on public.workspaces for delete
  using (auth.uid() = owner_id or public.is_admin());

-- WORKSPACE MEMBERS POLICIES
create policy "Members or admins can view workspace members"
  on public.workspace_members for select
  using (public.has_workspace_access(workspace_id));

create policy "Owners or admins can insert workspace members"
  on public.workspace_members for insert
  with check (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or public.is_admin()
  );

create policy "Owners or admins can update workspace members"
  on public.workspace_members for update
  using (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or public.is_admin()
  );

create policy "Owners or members themselves can delete membership"
  on public.workspace_members for delete
  using (
    exists (select 1 from public.workspaces where id = workspace_id and owner_id = auth.uid())
    or user_id = auth.uid()
    or public.is_admin()
  );

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
    coalesce(new.raw_user_meta_data->>'role', 'user'),
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
