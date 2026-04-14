/**
 * POST /api/dream
 *
 * The complete dream-loop endpoint:
 *   1. Inference — call MILAM on Nosana Qwen3.5-9B with the character prompt.
 *   2. Encrypt  — wrap the dream text in a libsodium "Arcium-compatible MXE"
 *                 envelope so Clude's Supabase never sees plaintext.
 *   3. Anchor   — (best-effort) write a Solana memo transaction whose payload
 *                 is SHA-256(envelope.ciphertext). Immutable timestamp that
 *                 doesn't leak content.
 *   4. Store    — persist the encrypted envelope + MILAM response + Solana
 *                 tx + Nosana job URL in Clude as an episodic memory.
 *   5. Return   — the one-line response, created timestamp, explorer url,
 *                 and storage confirmation.
 *
 * No auth: hackathon-mode single DEMO_USER_ID. Production path swaps to
 * wallet-bound key agreement (see lib/crypto/keys.ts TODO).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { generateMilamReply } from "@/lib/milam/client";
import { encrypt } from "@/lib/crypto/envelope";
import { deriveUserKey, DEMO_USER_ID } from "@/lib/crypto/keys";
import { storeDream, type DreamRecord } from "@/lib/clude/store";
import { anchorDreamHash } from "@/lib/solana/memo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface DreamRequest {
  text?: string;
  inputType?: DreamRecord["inputType"];
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => null)) as DreamRequest | null;
  const text = body?.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  const inputType: DreamRecord["inputType"] = body?.inputType ?? "sleeping_dream";

  // 1. MILAM reply via Nosana.
  let reply;
  try {
    reply = await generateMilamReply(text);
  } catch (err) {
    return NextResponse.json(
      { error: "milam_inference_failed", detail: String(err) },
      { status: 502 },
    );
  }

  // 2. Encrypt the dream text (NOT the response — responses stay in
  //    plaintext so the journal is searchable locally).
  const key = await deriveUserKey(DEMO_USER_ID);
  const envelope = await encrypt(text, key);

  // 3. Anchor on Solana (best-effort; silent if no key configured).
  let solanaResult = null;
  try {
    solanaResult = await anchorDreamHash(envelope.ciphertext);
  } catch (err) {
    console.warn("[/api/dream] solana anchor failed:", err);
  }

  // 4. Persist in Clude (or local fallback if CORTEX_API_KEY not set).
  const id = randomUUID();
  const record: DreamRecord = {
    id,
    createdAt: new Date().toISOString(),
    envelope,
    milamResponse: reply.response,
    inputType,
    solanaTx: solanaResult?.signature,
  };
  const { memoryId } = await storeDream(record);

  return NextResponse.json({
    id,
    response: reply.response,
    createdAt: record.createdAt,
    inputType,
    inference: {
      model: reply.model,
      endpoint: reply.endpoint,
      latencyMs: reply.latencyMs,
      promptTokens: reply.promptTokens,
      completionTokens: reply.completionTokens,
    },
    envelope: {
      ciphertextPreview: envelope.ciphertext.slice(0, 32) + "…",
      version: envelope.envelopeVersion,
    },
    solana: solanaResult,
    clude: { memoryId: memoryId ?? null },
  });
}
