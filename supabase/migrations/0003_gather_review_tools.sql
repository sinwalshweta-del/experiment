-- Review page support: only reviewers can list stories with the sender's email,
-- and change a story's review status. Once a story is taken down, reviewers no
-- longer see what was written. (The first reviewer was added from the dashboard:
-- insert into public.reviewers (user_id) select id from auth.users where email = '<reviewer email>';)

create or replace function public.review_queue()
returns table (
  id uuid, title text, answers jsonb, publish boolean, status public.story_status,
  created_at timestamptz, reviewed_at timestamptz, taken_down_at timestamptz,
  takedown_reason text, published_text text, email text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.is_reviewer()) then
    raise exception 'reviewers only' using errcode = '42501';
  end if;
  return query
    select s.id, s.title,
           case when s.status = 'taken_down' then '{}'::jsonb else s.answers end,
           s.publish, s.status, s.created_at, s.reviewed_at,
           s.taken_down_at, s.takedown_reason, s.published_text, u.email::text
      from public.stories s
      join auth.users u on u.id = s.user_id
     order by s.created_at desc;
end;
$$;
revoke all on function public.review_queue() from public, anon;
grant execute on function public.review_queue() to authenticated;

create or replace function public.review_story(story_id uuid, new_status public.story_status)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select private.is_reviewer()) then
    raise exception 'reviewers only' using errcode = '42501';
  end if;
  if new_status not in ('received', 'approved', 'not_used') then
    raise exception 'reviewers can only approve, not use, or send back to waiting' using errcode = '22023';
  end if;
  update public.stories
     set status = new_status,
         reviewed_at = case when new_status = 'received' then null else now() end
   where id = story_id and status <> 'taken_down';
end;
$$;
revoke all on function public.review_story(uuid, public.story_status) from public, anon;
grant execute on function public.review_story(uuid, public.story_status) to authenticated;

create or replace function public.am_reviewer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$ select private.is_reviewer(); $$;
revoke all on function public.am_reviewer() from public, anon;
grant execute on function public.am_reviewer() to authenticated;
