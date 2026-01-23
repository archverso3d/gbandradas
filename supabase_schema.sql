-- Create table for Student Attendance
create table public.student_attendance (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  checkin_at timestamp with time zone not null default now(),
  status text not null default 'present'::text,
  constraint student_attendance_pkey primary key (id),
  constraint student_attendance_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- Enable RLS for student_attendance
alter table public.student_attendance enable row level security;

create policy "Users can view their own attendance" on public.student_attendance
  for select using (auth.uid() = user_id);

create policy "Users can insert their own attendance" on public.student_attendance
  for insert with check (auth.uid() = user_id);

-- Create table for Student Graduations
create table public.student_graduations (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  current_belt text not null,
  start_date date not null,
  promotion_date date null,
  next_forecast date null,
  certificate_url text null,
  created_at timestamp with time zone not null default now(),
  constraint student_graduations_pkey primary key (id),
  constraint student_graduations_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- Enable RLS for student_graduations
alter table public.student_graduations enable row level security;

create policy "Users can view their own graduations" on public.student_graduations
  for select using (auth.uid() = user_id);

-- Create table for Saved Techniques
create table public.saved_techniques (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null default auth.uid (),
  title text not null,
  link text not null,
  category text null,
  category_id uuid null,
  platform text null, -- 'youtube', 'instagram', etc.
  created_at timestamp with time zone not null default now(),
  constraint saved_techniques_pkey primary key (id),
  constraint saved_techniques_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  constraint saved_techniques_category_id_fkey foreign key (category_id) references technique_groups (id) on delete set null
);

-- Enable RLS for saved_techniques
alter table public.saved_techniques enable row level security;

create policy "Users can view their own techniques" on public.saved_techniques
  for select using (auth.uid() = user_id);

create policy "Users can insert their own techniques" on public.saved_techniques
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own techniques" on public.saved_techniques
  for update using (auth.uid() = user_id);

create policy "Users can delete their own techniques" on public.saved_techniques
  for delete using (auth.uid() = user_id);

-- Create table for User Profiles
create table public.user_profiles (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_user_id_key unique (user_id)
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Policies
create policy "Users can view all profiles" 
  on public.user_profiles for select 
  using (true);

create policy "Users can update their own profile" 
  on public.user_profiles for update 
  using (auth.uid() = user_id);

create policy "Users can insert their own profile" 
  on public.user_profiles for insert 
  with check (auth.uid() = user_id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (user_id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
