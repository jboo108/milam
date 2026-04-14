/**
 * GET /api/journal
 *
 * Returns the dream journal — all previously stored dreams for the
 * hackathon-mode DEMO_USER_ID. Each entry is decrypted server-side
 * using the master-key-derived subkey. In production (Phase 2), this
 * decryption moves client-side via wallet signature so the server
 * never sees plaintext. See lib/crypto/keys.ts TODO(phase2).
 */
import { NextResponse } from "next/server";
import { recallDreams, isCludeConnected } from "@/lib/clude/store";
import { decrypt } from "@/lib/crypto/envelope";
import { deriveUserKey, DEMO_USER_ID } from "@/lib/crypto/keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const dreams = await recallDreams(100);
  const key = await deriveUserKey(DEMO_USER_ID);
  const connected = await isCludeConnected();

  const entries = await Promise.all(
    dreams.map(async (d) => {
      let plaintext = "";
      try {
        plaintext = await decrypt(d.envelope, key);
      } catch {
        plaintext = "[decryption failed — this dream was encrypted with a different key]";
      }
      let replyPlain: string | null = null;
      if (d.reply) {
        try {
          replyPlain = await decrypt(d.reply.envelope, key);
        } catch {
          replyPlain = "[reply decryption failed]";
        }
      }
      return {
        id: d.id,
        createdAt: d.createdAt,
        dream: plaintext,
        response: d.milamResponse,
        inputType: d.inputType,
        solanaTx: d.solanaTx ?? null,
        solanaExplorerUrl: d.solanaTx
          ? `https://explorer.solana.com/tx/${d.solanaTx}`
          : null,
        nosanaJobUrl: d.nosanaJobUrl ?? null,
        cludeMemoryId: d.cludeMemoryId ?? null,
        reply: replyPlain
          ? {
              text: replyPlain,
              createdAt: d.reply?.createdAt ?? null,
              solanaTx: d.reply?.solanaTx ?? null,
              solanaExplorerUrl: d.reply?.solanaTx
                ? `https://explorer.solana.com/tx/${d.reply.solanaTx}`
                : null,
            }
          : null,
      };
    }),
  );

  return NextResponse.json({
    count: entries.length,
    connected: { clude: connected },
    entries,
  });
}
