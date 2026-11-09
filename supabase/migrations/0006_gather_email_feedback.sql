-- One-tap feedback from the approval email (Claude Design board 32).
-- People tap a feeling in the email without signing in, so writes go through
-- two functions instead of a table policy. The story id in the link only
-- proves the email was real; it is never saved, so feedback stays anonymous.

alter table public.feedback alter column friend drop not null;

create or replace function public.email_feedback(p_story uuid, p_feeling int)
returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if p_feeling is null or p_feeling < 1 or p_feeling > 5 then
    raise exception 'bad feeling' using errcode = '22023';
  end if;
  if not exists (select 1 from public.stories s where s.id = p_story and s.status = 'approved') then
    raise exception 'not found' using errcode = 'P0002';
  end if;
  insert into public.feedback (feeling, friend, comment) values (p_feeling::smallint, null, null)
  returning id into new_id;
  return new_id;
end;
$$;

-- Adds the optional "would you put a friend on?" and a comment to the row the
-- tap just made. Only works on a row from the last two hours that has no answer yet.
create or replace function public.email_feedback_more(p_id uuid, p_friend text, p_comment text)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_friend is not null and p_friend not in ('nah', 'maybe', 'yes') then
    raise exception 'bad friend' using errcode = '22023';
  end if;
  update public.feedback
     set friend = coalesce(p_friend, friend),
         comment = nullif(left(coalesce(p_comment, ''), 1000), '')
   where id = p_id
     and friend is null
     and comment is null
     and created_at > now() - interval '2 hours';
end;
$$;

revoke all on function public.email_feedback(uuid, int) from public;
revoke all on function public.email_feedback_more(uuid, text, text) from public;
grant execute on function public.email_feedback(uuid, int) to anon, authenticated;
grant execute on function public.email_feedback_more(uuid, text, text) to anon, authenticated;
