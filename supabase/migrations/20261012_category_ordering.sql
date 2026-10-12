alter table public.categories
  add column if not exists sort_order integer;

with ordered_categories as (
  select id, row_number() over (
    partition by workspace_id, type
    order by created_at, id
  ) - 1 as position
  from public.categories
)
update public.categories category
set sort_order = ordered_categories.position
from ordered_categories
where category.id = ordered_categories.id
  and category.sort_order is null;

alter table public.categories
  alter column sort_order set default 0,
  alter column sort_order set not null;

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
