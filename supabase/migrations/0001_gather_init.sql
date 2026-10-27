-- GATHER People Insights: first schema.
--
-- Privacy rules this file enforces:
--   * People can only ever read and change their own drafts and stories (row-level security).
--   * Stories link to the auth user id, never to an email column. The email lives only in
--     Supabase Auth, so nothing published or counted carries it.
--   * Nothing is public until a reviewer approves it.
--   * Insights are counts only, and a count is hidden until at least 20 approved stories
--     answered that question (min_group below), and any single answer given by fewer than 5
--     people is folded into "Other answers", so small groups can't point to anyone.

-- ───────────────────────── reviewers ─────────────────────────

create table public.reviewers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table public.reviewers enable row level security;
-- no policies: only the service role (dashboard / server) can read or change this list

create or replace function public.is_reviewer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.reviewers r where r.user_id = (select auth.uid()));
$$;

-- ───────────────────────── drafts ─────────────────────────
-- One unfinished questionnaire per person, kept so they can pick up on any device.

create table public.drafts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  step text not null default 'q1',
  updated_at timestamptz not null default now()
);
alter table public.drafts enable row level security;

create policy "drafts: read own" on public.drafts
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "drafts: insert own" on public.drafts
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "drafts: update own" on public.drafts
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "drafts: delete own" on public.drafts
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ───────────────────────── stories ─────────────────────────

create type public.story_status as enum ('received', 'in_review', 'approved', 'not_used', 'taken_down');

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  answers jsonb not null,
  -- true: publish the story (after review); false: count the answers in insights only
  publish boolean not null,
  status public.story_status not null default 'received',
  -- the reviewer's edited copy of the story text, with identifying details removed
  published_text text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  taken_down_at timestamptz,
  takedown_reason text
);
alter table public.stories enable row level security;
create index stories_user_idx on public.stories (user_id);
create index stories_status_idx on public.stories (status);

create policy "stories: read own" on public.stories
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "stories: reviewers read all" on public.stories
  for select to authenticated using ((select public.is_reviewer()));
-- new stories always start as 'received'; people can't approve their own
create policy "stories: submit own" on public.stories
  for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'received' and reviewed_at is null and published_text is null);
create policy "stories: reviewers update" on public.stories
  for update to authenticated using ((select public.is_reviewer())) with check ((select public.is_reviewer()));
-- people change their own story only through take_down_story() below

-- Take my story down: the owner can always do this, from any device.
create or replace function public.take_down_story(story_id uuid, reason text default null)
returns public.stories
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.stories;
begin
  update public.stories
     set status = 'taken_down', taken_down_at = now(), takedown_reason = left(reason, 200)
   where id = story_id and user_id = (select auth.uid()) and status <> 'taken_down'
  returning * into s;
  if s.id is null then
    raise exception 'story not found or already taken down' using errcode = 'P0002';
  end if;
  return s;
end;
$$;
revoke all on function public.take_down_story(uuid, text) from public, anon;
grant execute on function public.take_down_story(uuid, text) to authenticated;

-- ───────────────────────── insights ─────────────────────────

-- How many approved stories there are in total (drives the "still collecting" state).
create or replace function public.insight_total()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int from public.stories where status = 'approved';
$$;

-- Answer counts for one question, only when at least min_group approved stories answered it.
-- Returns no rows below the threshold, so the page simply keeps that chart hidden.
create or replace function public.insight_counts(question text, min_group integer default 20)
returns table (answer text, people integer, answered integer)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  allowed constant text[] := array['type','withGender','met','howLong','hope','thought','good','hard','status','slowed','reasons','age','gender','region'];
  floor_n constant integer := greatest(coalesce(min_group, 20), 20); -- callers can raise it, never lower it
begin
  if not question = any (allowed) then
    raise exception 'unknown question %', question using errcode = '22023';
  end if;

  return query
  with base as (
    select s.answers -> question as v
      from public.stories s
     where s.status = 'approved'
       and s.answers ? question
       and s.answers -> question not in ('null'::jsonb, '""'::jsonb, '[]'::jsonb)
  ),
  picks as (
    select jsonb_array_elements_text(v) as a from base where jsonb_typeof(v) = 'array'
    union all
    select v #>> '{}' from base where jsonb_typeof(v) = 'string'
  ),
  n as (select count(*)::int as answered from base),
  counted as (select p.a, count(*)::int as c from picks p group by p.a),
  -- answers given by fewer than 5 people are folded into one "Other answers" row
  shown as (
    select a, c from counted where c >= 5
    union all
    select 'Other answers', sum(c)::int from counted where c < 5 having sum(c) > 0
  )
  select shown.a, shown.c, n.answered
    from shown cross join n
   where n.answered >= floor_n
   order by (shown.a = 'Other answers'), shown.c desc;
end;
$$;

revoke all on function public.insight_total() from public;
revoke all on function public.insight_counts(text, integer) from public;
grant execute on function public.insight_total() to anon, authenticated;
grant execute on function public.insight_counts(text, integer) to anon, authenticated;

-- is_reviewer is only used inside policies
revoke all on function public.is_reviewer() from public, anon;
grant execute on function public.is_reviewer() to authenticated;
