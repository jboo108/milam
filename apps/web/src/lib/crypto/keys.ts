/**
 * Per-user key derivation for the Arcium-compatible envelope.
 *
 * Hackathon model: a single 32-byte master key (`ARCIUM_MASTER_KEY`, base64)
 * is loaded from the environment, and per-user subkeys are derived via
 * libsodium's `crypto_kdf` BLAKE2b construction with the userId as context
 * material. This means:
 *   - the master key never touches a database row
 *   - each user's fragments are encrypted with a distinct subkey
 *   - in Phase 2, the master key becomes a wallet-signature-derived seed
 *     and DEMO_USER_ID disappears entirely
 *
 * TODO(phase2): replace `getMasterKey` with wallet-bound key agreement.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sodium = require('libsodium-wrappers') as typeof import('libsodium-wrappers');

/** The single hackathon-mode user. Lives ONLY at the API boundary. */
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

const KDF_CONTEXT = 'milam_dr'; // 8 bytes, libsodium kdf requirement

let masterKeyPromise: Promise<Uint8Array> | null = null;

async function getMasterKey(): Promise<Uint8Array> {
  if (masterKeyPromise) return masterKeyPromise;
  masterKeyPromise = (async () => {
    await sodium.ready;
    const raw = process.env.ARCIUM_MASTER_KEY;
    if (!raw) {
      throw new Error(
        'ARCIUM_MASTER_KEY not set. Generate one with: ' +
          'node -e "console.log(require(\'libsodium-wrappers\').then(s=>s.ready.then(()=>console.log(s.to_base64(s.randombytes_buf(32),s.base64_variants.ORIGINAL)))))"',
      );
    }
    const key = sodium.from_base64(raw, sodium.base64_variants.ORIGINAL);
    if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
      throw new Error(
        `ARCIUM_MASTER_KEY must decode to ${sodium.crypto_secretbox_KEYBYTES} bytes`,
      );
    }
    return key;
  })();
  return masterKeyPromise;
}

/**
 * Stable 64-bit subkey id derived from a userId string. We hash with BLAKE2b
 * and read the first 8 bytes as a little-endian unsigned integer so the same
 * userId always maps to the same subkey id (and therefore the same subkey).
 */
async function userIdToSubkeyId(userId: string): Promise<bigint> {
  await sodium.ready;
  const digest = sodium.crypto_generichash(8, sodium.from_string(userId), null, 'uint8array');
  let id = 0n;
  for (let i = 0; i < 8; i++) {
    id |= BigInt(digest[i]) << BigInt(8 * i);
  }
  return id;
}

/**
 * Returns a 32-byte subkey unique to this userId. The same userId returns
 * the same subkey across calls and across processes (given the same master
 * key).
 */
export async function deriveUserKey(userId: string): Promise<Uint8Array> {
  await sodium.ready;
  const master = await getMasterKey();
  const subkeyId = await userIdToSubkeyId(userId);
  return sodium.crypto_kdf_derive_from_key(
    sodium.crypto_secretbox_KEYBYTES,
    subkeyId as unknown as number, // libsodium accepts bigint at runtime
    KDF_CONTEXT,
    master,
  );
}

/** Test helper: lets the smoke test inject a deterministic master key. */
export function _resetMasterKeyCacheForTests(): void {
  masterKeyPromise = null;
}
