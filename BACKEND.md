# Backend Setup

## 1. Environment

Copy `.env.example` to `.env` and fill in your Supabase project credentials.

## 2. Database Migration

Run the SQL in `supabase/migrations/20260622000000_initial_schema.sql` via:

- **Supabase Dashboard** → SQL Editor → paste and run, or
- **Supabase CLI**: `supabase link` then `supabase db push`

This creates all tables, RLS policies, auth triggers, and the avatars storage bucket.

## 3. Auth

Email + password signup/login is enabled by default in Supabase Auth. New users get an empty profile with no sample data.

## 5. Security checklist

- RLS enabled on all `public` tables — users can only access their own rows
- Auth session stored in `expo-secure-store` (not AsyncStorage)
- `service_role` key must never be in the mobile app
- Run Supabase Dashboard → Database → Advisors after applying migration

## 6. RLS verification (manual)

1. Create User A and add a task
2. Create User B — confirm User B cannot see User A's tasks
3. Attempt direct API call with User B's JWT to User A's task ID — should return empty/error
