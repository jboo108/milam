/**
 * Arcium-compatible MXE envelope (Phase 2 swap point).
 *
 * Hackathon demo mode wraps content in libsodium `crypto_secretbox`.
 * The wire format `{nonce, ciphertext, envelopeVersion}` is deliberately
 * shaped as a drop-in for Arcium MXE payloads — when the real SDK lands,
 * `envelope_version` bumps from `libsodium-v1` to `arcium-mxe-v1` and
 * `encrypt` / `decrypt` become the only files that change.
 *
 * TODO(phase2): Replace internals with @arcium/mxe-sdk.
 *   See: https://docs.arcium.com/mxe (federated MPC training).
 */
// Use the CJS build via createRequire — the published ESM build has a
// broken sibling import (`./libsodium.mjs`) that bun's isolated
// node_modules layout cannot resolve.
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sodium = require('libsodium-wrappers') as typeof import('libsodium-wrappers');

export const ENVELOPE_VERSION = 'libsodium-v1' as const;
export type EnvelopeVersion = typeof ENVELOPE_VERSION;

export interface Envelope {
  ciphertext: string;            // base64
  nonce: string;                 // base64
  envelopeVersion: EnvelopeVersion;
}

async function ready(): Promise<void> {
  await sodium.ready;
}

export async function encrypt(plaintext: string, key: Uint8Array): Promise<Envelope> {
  await ready();
  if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new Error(`key must be ${sodium.crypto_secretbox_KEYBYTES} bytes`);
  }
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_secretbox_easy(
    sodium.from_string(plaintext),
    nonce,
    key,
  );
  return {
    ciphertext: sodium.to_base64(cipher, sodium.base64_variants.ORIGINAL),
    nonce: sodium.to_base64(nonce, sodium.base64_variants.ORIGINAL),
    envelopeVersion: ENVELOPE_VERSION,
  };
}

export async function decrypt(envelope: Envelope, key: Uint8Array): Promise<string> {
  await ready();
  if (envelope.envelopeVersion !== ENVELOPE_VERSION) {
    throw new Error(`Unsupported envelope version: ${envelope.envelopeVersion}`);
  }
  if (key.length !== sodium.crypto_secretbox_KEYBYTES) {
    throw new Error(`key must be ${sodium.crypto_secretbox_KEYBYTES} bytes`);
  }
  const cipher = sodium.from_base64(envelope.ciphertext, sodium.base64_variants.ORIGINAL);
  const nonce = sodium.from_base64(envelope.nonce, sodium.base64_variants.ORIGINAL);
  const plaintext = sodium.crypto_secretbox_open_easy(cipher, nonce, key);
  return sodium.to_string(plaintext);
}
