-- Execute no SQL Editor do Supabase. Não exponha a service_role key.
create table if not exists public.legends_members (
  user_id uuid primary key references auth.users(id) on delete cascade
);
create table if not exists public.legends_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
alter table public.legends_members enable row level security;
alter table public.legends_lists enable row level security;
revoke all on public.legends_members from anon, authenticated;
grant select, insert, update, delete on public.legends_lists to authenticated;
create policy "Equipe consulta listas" on public.legends_lists for select to authenticated
using (exists(select 1 from public.legends_members m where m.user_id=(select auth.uid())));
create policy "Equipe cria listas" on public.legends_lists for insert to authenticated
with check (exists(select 1 from public.legends_members m where m.user_id=(select auth.uid())));
create policy "Equipe atualiza listas" on public.legends_lists for update to authenticated
using (exists(select 1 from public.legends_members m where m.user_id=(select auth.uid())))
with check (exists(select 1 from public.legends_members m where m.user_id=(select auth.uid())));
create policy "Equipe exclui listas" on public.legends_lists for delete to authenticated
using (exists(select 1 from public.legends_members m where m.user_id=(select auth.uid())));
-- Após criar contas pelo Auth, adicione IDs autorizados manualmente:
-- insert into public.legends_members(user_id) values ('UUID-DO-USUARIO');
