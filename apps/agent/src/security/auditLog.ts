/**
 * Append-only audit log helper.
 *
 * HARD INVARIANT: this function NEVER accepts content. If a caller passes
 * any field that looks like content (`content`, `plaintext`, `cipher`,
 * `body`, `text`, `dream`, `message`), this throws synchronously and the
 * write does not happen. The audit log is operational metadata only — it
 * is the consent substrate for the DREAMER MODEL training thesis, and its
 * value collapses the moment a single content byte leaks into it.
 *
 * The agent runs server-side with the Supabase service role key, so the
 * `audit_log` table's "no INSERT policy = deny from anon" RLS rule is the
 * production-time complement to this app-layer guard.
 */

export type AuditOperation =
  | 'fragment.store'
  | 'fragment.recall'
  | 'fragment.update'
  | 'fragment.delete'
  | 'journal.write'
  | 'journal.read'
  | 'self_model.read'
  | 'self_model.write'
  | 'dream_cycle.start'
  | 'dream_cycle.complete'
  | 'dream_cycle.failed'
  | 'auth.login'
  | 'auth.logout'
  | 'export.user_data';

export interface AuditEntry {
  userId: string;
  actor: string;                  // 'agent:milam' | 'api' | 'cron' | 'user'
  operation: AuditOperation;
  resourceTable?: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  timestamp?: Date;               // defaults to now() server-side
}

const FORBIDDEN_KEYS = new Set([
  'content', 'plaintext', 'cipher', 'ciphertext', 'body', 'text',
  'dream', 'message', 'prompt', 'response', 'completion', 'fragment',
  'journal', 'payload', 'data',
]);

function assertNoContent(entry: Record<string, unknown>): void {
  for (const key of Object.keys(entry)) {
    if (FORBIDDEN_KEYS.has(key.toLowerCase())) {
      throw new Error(
        `auditLog refused: forbidden field "${key}" — audit log NEVER stores content`,
      );
    }
  }
}

/**
 * Storage adapter — wired to pg / Supabase by the integration agent.
 * Kept as a swappable function pointer so this module is unit-testable
 * without a database, and so it can be mocked in DEMO_MODE.
 */
export type AuditWriter = (row: {
  user_id: string;
  actor: string;
  operation: string;
  resource_table: string | null;
  resource_id: string | null;
  ip: string | null;
  user_agent: string | null;
  success: boolean;
  created_at: string;
}) => Promise<void>;

let writer: AuditWriter = async () => {
  // default no-op until the integration agent installs a real writer.
  // We do NOT silently swallow in production: if no writer is set when
  // NODE_ENV === 'production', we throw.
  if (process.env.NODE_ENV === 'production') {
    throw new Error('auditLog: no AuditWriter installed in production');
  }
};

export function setAuditWriter(w: AuditWriter): void {
  writer = w;
}

export async function auditLog(entry: AuditEntry): Promise<void> {
  // Throw on any forbidden field BEFORE we touch the writer.
  assertNoContent(entry as unknown as Record<string, unknown>);

  if (!entry.userId) throw new Error('auditLog: userId is required');
  if (!entry.actor)  throw new Error('auditLog: actor is required');
  if (!entry.operation) throw new Error('auditLog: operation is required');
  if (typeof entry.success !== 'boolean') {
    throw new Error('auditLog: success must be a boolean');
  }

  await writer({
    user_id: entry.userId,
    actor: entry.actor,
    operation: entry.operation,
    resource_table: entry.resourceTable ?? null,
    resource_id: entry.resourceId ?? null,
    ip: entry.ip ?? null,
    user_agent: entry.userAgent ?? null,
    success: entry.success,
    created_at: (entry.timestamp ?? new Date()).toISOString(),
  });
}
