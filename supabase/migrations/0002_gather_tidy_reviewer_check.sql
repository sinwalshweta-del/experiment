-- Keep the reviewer check out of the public API and use one read policy on stories.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.reviewers r where r.user_id = (select auth.uid()));
$$;
revoke all on function private.is_reviewer() from public, anon;
grant execute on function private.is_reviewer() to authenticated;

drop policy "stories: read own" on public.stories;
drop policy "stories: reviewers read all" on public.stories;
drop policy "stories: reviewers update" on public.stories;

create policy "stories: read own or as reviewer" on public.stories
  for select to authenticated
  using ((select auth.uid()) = user_id or (select private.is_reviewer()));
create policy "stories: reviewers update" on public.stories
  for update to authenticated
  using ((select private.is_reviewer())) with check ((select private.is_reviewer()));

drop function public.is_reviewer();

-- reviewers is managed from the dashboard only; say so explicitly
create policy "reviewers: no direct access" on public.reviewers
  for select to authenticated using (false);
