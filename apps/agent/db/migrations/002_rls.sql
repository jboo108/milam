-- DREAMERS / MILAM — Row Level Security
-- Migration 002: deny-by-default on every table; owner-only policies.
-- The agent runs with the Supabase service role key (bypasses RLS) for the
-- hackathon; these policies are the defense-in-depth for Phase 2 anon-key
-- access from a browser client.

ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fragments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.self_model       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dream_cycles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log        ENABLE ROW LEVEL SECURITY;

-- users: self read/update only
DROP POLICY IF EXISTS users_self_select ON public.users;
CREATE POLICY users_self_select ON public.users
  FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS users_self_update ON public.users;
CREATE POLICY users_self_update ON public.users
  FOR UPDATE USING (id = auth.uid());

-- fragments: owner CRUD
DROP POLICY IF EXISTS frag_owner_select ON public.fragments;
CREATE POLICY frag_owner_select ON public.fragments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS frag_owner_insert ON public.fragments;
CREATE POLICY frag_owner_insert ON public.fragments
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS frag_owner_update ON public.fragments;
CREATE POLICY frag_owner_update ON public.fragments
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS frag_owner_delete ON public.fragments;
CREATE POLICY frag_owner_delete ON public.fragments
  FOR DELETE USING (user_id = auth.uid());

-- journal_entries / self_model / dream_cycles: owner ALL
DROP POLICY IF EXISTS jrn_owner_all ON public.journal_entries;
CREATE POLICY jrn_owner_all ON public.journal_entries
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS sm_owner_all ON public.self_model;
CREATE POLICY sm_owner_all ON public.self_model
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS dc_owner_all ON public.dream_cycles;
CREATE POLICY dc_owner_all ON public.dream_cycles
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- audit_log: users may read their own rows; INSERT only via service role
-- (no INSERT policy = deny from anon, which is the intended invariant)
DROP POLICY IF EXISTS audit_owner_select ON public.audit_log;
CREATE POLICY audit_owner_select ON public.audit_log
  FOR SELECT USING (user_id = auth.uid());
