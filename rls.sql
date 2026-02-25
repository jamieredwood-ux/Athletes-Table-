-- Recommended: enable RLS and restrict access to signed-in users.
alter table players enable row level security;
alter table fuel_logs enable row level security;
alter table uefa_guidance enable row level security;

-- You are the only user: allow any authenticated user to read/write.
create policy "players_rw_authenticated"
on players for all
to authenticated
using (true)
with check (true);

create policy "fuel_logs_rw_authenticated"
on fuel_logs for all
to authenticated
using (true)
with check (true);

create policy "uefa_guidance_rw_authenticated"
on uefa_guidance for all
to authenticated
using (true)
with check (true);
