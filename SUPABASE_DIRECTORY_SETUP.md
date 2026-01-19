# Supabase Directory Setup (submit-profile)

This repo’s `directory.html` form posts to the `submit-profile` edge function. Use the steps below to create the table, policies, and function so submissions succeed and approved profiles render on the page.

## 1) Create table + policies

Run this in the Supabase SQL editor:

```sql
create table if not exists public.directory_listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  location text not null,
  email text not null,
  bio text,
  roles_worked text,
  past_work text,
  website text,
  instagram text,
  imdb text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.directory_listings enable row level security;

create policy "directory_public_read"
  on public.directory_listings
  for select
  using (status in ('approved', 'accepted'));
```

## 2) Add the edge function

Create a new edge function named `submit-profile` and use the code in:

```
supabase/functions/submit-profile/index.ts
```

### Required environment variables

Set these in Supabase (Edge Functions → Settings → Environment variables):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3) Deploy

From your local Supabase CLI:

```bash
supabase functions deploy submit-profile
```

## 4) Verify from the site

1. Open `directory.html` → “Join the Directory”.
2. Submit a new profile with valid required fields.
3. Confirm a new row appears in `directory_listings` with `status = 'pending'`.
4. Manually set the row to `approved` to see it appear on the directory page.
```
