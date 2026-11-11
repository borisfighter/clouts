-- One plan set: free | starter | growth | enterprise (pro/team were legacy names)
update public.users set plan = 'growth' where plan = 'pro';
update public.users set plan = 'enterprise' where plan = 'team';
update public.users set plan = 'free' where plan not in ('free', 'starter', 'growth', 'enterprise');
alter table public.users drop constraint if exists users_plan_check;
alter table public.users add constraint users_plan_check check (plan in ('free', 'starter', 'growth', 'enterprise'));

-- Mirrors src/lib/plans.ts limits (-1 = unlimited)
create or replace function public.plan_limit(p_plan text, p_limit text)
returns int language sql immutable as $$
  select case p_limit
    when 'brands'  then case p_plan when 'starter' then 1 when 'growth' then 5 when 'enterprise' then -1 else 1 end
    when 'prompts' then case p_plan when 'starter' then 25 when 'growth' then 100 when 'enterprise' then -1 else 5 end
  end
$$;

create or replace function public.enforce_brand_plan_limits()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_plan text;
  v_brands int;
  v_prompts int;
  v_count int;
begin
  select coalesce(plan, 'free') into v_plan from users where id = new.user_id;
  v_plan := coalesce(v_plan, 'free');
  v_brands := plan_limit(v_plan, 'brands');
  v_prompts := plan_limit(v_plan, 'prompts');
  if tg_op = 'INSERT' and v_brands <> -1 then
    select count(*) into v_count from brands where user_id = new.user_id;
    if v_count >= v_brands then
      raise exception 'Brand limit reached (% on the % plan). Upgrade to add more brands.', v_brands, v_plan using errcode = 'P0001';
    end if;
  end if;
  if v_prompts <> -1 and coalesce(cardinality(new.keywords), 0) > v_prompts
     and (tg_op = 'INSERT' or coalesce(cardinality(new.keywords), 0) > coalesce(cardinality(old.keywords), 0)) then
    raise exception 'Prompt limit reached (% per brand on the % plan). Upgrade to track more prompts.', v_prompts, v_plan using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists brands_plan_limits on public.brands;
create trigger brands_plan_limits before insert or update of keywords on public.brands
  for each row execute function public.enforce_brand_plan_limits();
