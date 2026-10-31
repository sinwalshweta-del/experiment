-- Anonymous feedback after sharing: no user id, no email, no story link.
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  feeling smallint not null check (feeling between 1 and 5),
  friend text not null check (friend in ('nah', 'maybe', 'yes')),
  comment text check (char_length(comment) <= 1000)
);
alter table public.feedback enable row level security;
create policy "feedback: signed-in people can send" on public.feedback
  for insert to authenticated with check (true);

create or replace function public.review_feedback()
returns setof public.feedback
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not (select private.is_reviewer()) then
    raise exception 'reviewers only' using errcode = '42501';
  end if;
  return query select * from public.feedback order by created_at desc;
end;
$$;
revoke all on function public.review_feedback() from public, anon;
grant execute on function public.review_feedback() to authenticated;

-- What the team sent about each story (filled in by the send-story-email function).
alter table public.stories
  add column emailed_at timestamptz,
  add column review_note text,
  add column notused_reason text;

drop function public.review_queue();
create function public.review_queue()
returns table (
  id uuid, title text, answers jsonb, publish boolean, status public.story_status,
  created_at timestamptz, reviewed_at timestamptz, taken_down_at timestamptz,
  takedown_reason text, published_text text, email text,
  emailed_at timestamptz, review_note text, notused_reason text
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
           s.taken_down_at, s.takedown_reason, s.published_text, u.email::text,
           s.emailed_at, s.review_note, s.notused_reason
      from public.stories s
      join auth.users u on u.id = s.user_id
     order by s.created_at desc;
end;
$$;
revoke all on function public.review_queue() from public, anon;
grant execute on function public.review_queue() to authenticated;
