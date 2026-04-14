/**
 * POST /api/dream/reply
 *
 * Dreamer enrichment. After MILAM offers her one line, the dreamer
 * may reply to deepen the dream context. MILAM does NOT respond —
 * her one-line rule is absolute. The reply is encrypted, optionally
 * anchored on Solana, and stored as a `semantic` Clude memory bonded
 * to the parent `episodic` dream. Clude's Hebbian bond graph links
 * co-retrieved pairs automatically over time.
 */
import { NextResponse } from "next/server";
import { encrypt } from "@/lib/crypto/envelope";
import { deriveUserKey, DEMO_USER_ID } from "@/lib/crypto/keys";
import { storeDreamerReply } from "@/lib/clude/store";
import { anchorDreamHash } from "@/lib/solana/memo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ReplyRequest {
  parentId?: string;
  text?: string;
}

export async function POST(req: Request): Promise<NextResponse> {
  const body = (await req.json().catch(() => null)) as ReplyRequest | null;
  const parentId = body?.parentId?.trim();
  const text = body?.text?.trim();
  if (!parentId || !text) {
    return NextResponse.json(
      { error: "parentId and text are required" },
      { status: 400 },
    );
  }

  const key = await deriveUserKey(DEMO_USER_ID);
  const envelope = await encrypt(text, key);

  let solanaResult = null;
  try {
    solanaResult = await anchorDreamHash(envelope.ciphertext);
  } catch (err) {
    console.warn("[/api/dream/reply] solana anchor failed:", err);
  }

  const reply = {
    envelope,
    createdAt: new Date().toISOString(),
    solanaTx: solanaResult?.signature,
  };

  const { memoryId } = await storeDreamerReply(parentId, reply);

  return NextResponse.json({
    parentId,
    createdAt: reply.createdAt,
    envelope: {
      ciphertextPreview: envelope.ciphertext.slice(0, 32) + "…",
      version: envelope.envelopeVersion,
    },
    solana: solanaResult,
    clude: { memoryId: memoryId ?? null },
  });
}
