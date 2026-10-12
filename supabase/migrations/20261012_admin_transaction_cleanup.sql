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
