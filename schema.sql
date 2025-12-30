-- Create a table for scans
create table public.scans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  original_image_url text not null,
  annotated_image_url text,
  prediction_label text,
  confidence_score float,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  scan_type text
);

-- Enable RLS
alter table public.scans enable row level security;

-- Policy to allow users to see only their own scans
create policy "Users can view their own scans"
  on public.scans for select
  using ( auth.uid() = user_id );

-- Policy to allow users to insert their own scans
create policy "Users can insert their own scans"
  on public.scans for insert
  with check ( auth.uid() = user_id );

-- Storage buckets setup (Run these via Supabase Dashboard if SQL editor doesn't support storage creation directly)
-- insert into storage.buckets (id, name, public) values ('mammo-scans', 'mammo-scans', true);

-- Storage Policies
-- create policy "Authenticated users can upload scans"
-- on storage.objects for insert
-- with check ( bucket_id = 'mammo-scans' and auth.role() = 'authenticated' );

-- create policy "Users can view their own uploads"
-- on storage.objects for select
-- using ( bucket_id = 'mammo-scans' and auth.uid() = owner );
