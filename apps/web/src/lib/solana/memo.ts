/**
 * Solana memo anchor for on-chain dream provenance.
 *
 * Writes a single Solana memo instruction whose payload is the SHA-256
 * hash of the encrypted dream envelope (base64). The content stays
 * off-chain — Clude holds the ciphertext — but the hash on mainnet
 * gives an immutable "this dream existed at this time" anchor judges
 * can verify on explorer.solana.com.
 *
 * Env:
 *   SOLANA_RPC_URL         e.g. https://api.mainnet-beta.solana.com
 *                          or a Helius / Triton URL you own
 *   SOLANA_SECRET_KEY      base58 secret key of the Backpack wallet
 *                          funded for memo fees (~0.000005 SOL per write)
 *   SOLANA_CLUSTER         mainnet-beta | devnet — controls explorer link
 */
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import { createHash } from "node:crypto";

const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

export interface MemoResult {
  signature: string;
  cluster: "mainnet-beta" | "devnet";
  explorerUrl: string;
  payloadHash: string;
}

export async function anchorDreamHash(envelopeCiphertext: string): Promise<MemoResult | null> {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const secretKey = process.env.SOLANA_SECRET_KEY;
  const clusterEnv = (process.env.SOLANA_CLUSTER ?? "mainnet-beta") as MemoResult["cluster"];
  if (!rpcUrl || !secretKey) return null;

  const payer = Keypair.fromSecretKey(bs58.decode(secretKey));
  const connection = new Connection(rpcUrl, "confirmed");
  const payloadHash = createHash("sha256").update(envelopeCiphertext, "utf8").digest("hex");
  const memoData = Buffer.from(`dream:${payloadHash}`, "utf8");

  const ix = new TransactionInstruction({
    keys: [{ pubkey: payer.publicKey, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: memoData,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = payer.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash("confirmed")).blockhash;
  tx.sign(payer);

  const signature = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  await connection.confirmTransaction(signature, "confirmed");

  const base =
    clusterEnv === "mainnet-beta"
      ? `https://explorer.solana.com/tx/${signature}`
      : `https://explorer.solana.com/tx/${signature}?cluster=${clusterEnv}`;

  return {
    signature,
    cluster: clusterEnv,
    explorerUrl: base,
    payloadHash,
  };
}
