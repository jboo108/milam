-- DREAMERS / MILAM — initial schema
-- Migration 001: tables only. RLS lives in 002_rls.sql.
-- Per data-security review (2026-04-05). userId NOT NULL from day one.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------
-- users  (demo stub; swap for auth.users in Phase 2)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  handle              TEXT UNIQUE NOT NULL,
  solana_pubkey       TEXT UNIQUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_training    BOOLEAN NOT NULL DEFAULT false,
  consent_training_at TIMESTAMPTZ
);

-- ------------------------------------------------------------
-- fragments  (episodic dream fragments — content always encrypted)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fragments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id         TEXT NOT NULL CHECK (agent_id IN ('milam','rolpa','dreamtime')),
  input_type       TEXT NOT NULL CHECK (input_type IN ('text','voice','link','photo','screenshot')),
  memory_type      TEXT NOT NULL CHECK (memory_type IN ('episodic','semantic','introspective','self_model')),
  namespace_key    TEXT NOT NULL,          -- milam:{userId}:episodic:fragment-{uuid}
  content_cipher   TEXT NOT NULL,
  content_nonce    TEXT NOT NULL,
  envelope_version TEXT NOT NULL DEFAULT 'libsodium-v1',
  importance       REAL NOT NULL CHECK (importance BETWEEN 0 AND 1),
  tags             TEXT[] NOT NULL DEFAULT '{}',
  promotable       BOOLEAN NOT NULL DEFAULT false,
  promoted_at      TIMESTAMPTZ,
  dream_cycle_id   UUID,
  solana_hash      TEXT,
  metadata         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fragments_user_created ON public.fragments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fragments_namespace    ON public.fragments(namespace_key);
CREATE INDEX IF NOT EXISTS idx_fragments_tags         ON public.fragments USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_fragments_metadata     ON public.fragments USING GIN(metadata);

-- ------------------------------------------------------------
-- journal_entries  (MILAM's nightly dream journal — encrypted)
-- (review doc names this `journals`; we alias for the spec)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id         TEXT NOT NULL DEFAULT 'milam',
  cycle_date       DATE NOT NULL,
  namespace_key    TEXT NOT NULL,          -- milam:{userId}:introspective:journal-{date}
  content_cipher   TEXT NOT NULL,
  content_nonce    TEXT NOT NULL,
  envelope_version TEXT NOT NULL DEFAULT 'libsodium-v1',
  fragment_ids     UUID[] NOT NULL DEFAULT '{}',
  clinamen_trace   JSONB,
  solana_hash      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id, cycle_date)
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user_date ON public.journal_entries(user_id, cycle_date DESC);

-- ------------------------------------------------------------
-- self_model
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.self_model (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id         TEXT NOT NULL,
  namespace_key    TEXT NOT NULL,
  content_cipher   TEXT NOT NULL,
  content_nonce    TEXT NOT NULL,
  envelope_version TEXT NOT NULL DEFAULT 'libsodium-v1',
  version          INT NOT NULL DEFAULT 1,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, agent_id, version)
);

-- ------------------------------------------------------------
-- dream_cycles  (pipeline run records — no content)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dream_cycles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id        TEXT NOT NULL DEFAULT 'milam',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  status          TEXT NOT NULL DEFAULT 'running'
                  CHECK (status IN ('running','completed','failed')),
  fragment_count  INT NOT NULL DEFAULT 0,
  journal_id      UUID REFERENCES public.journal_entries(id) ON DELETE SET NULL,
  error_message   TEXT,
  trigger_source  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dream_cycles_user ON public.dream_cycles(user_id, started_at DESC);

-- ------------------------------------------------------------
-- audit_log  (operational metadata only — never content)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
  actor           TEXT NOT NULL,
  operation       TEXT NOT NULL,
  resource_table  TEXT,
  resource_id     UUID,
  ip              INET,
  user_agent      TEXT,
  success         BOOLEAN NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_user_time  ON public.audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_operation  ON public.audit_log(operation, created_at DESC);

-- Seed the demo user (matches DEMO_USER_ID in src/crypto/keys.ts)
INSERT INTO public.users (id, handle, consent_training, consent_training_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo', true, now())
ON CONFLICT DO NOTHING;
