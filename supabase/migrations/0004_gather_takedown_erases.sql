-- Taking a story down now erases what was written and every answer.
-- Only a short record stays (title, dates, optional reason) so the person can
-- see in their account that it's down.
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
     set status = 'taken_down',
         taken_down_at = now(),
         takedown_reason = left(reason, 200),
         answers = '{}'::jsonb,
         published_text = null
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

update public.stories set answers = '{}'::jsonb, published_text = null where status = 'taken_down';
