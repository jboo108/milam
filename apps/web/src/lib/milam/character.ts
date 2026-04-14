/**
 * MILAM character — single source of truth.
 *
 * This is the *product*. The character file enforces MILAM's restraint:
 * one statement OR one question, never interpret, never prescribe,
 * never judge, never refuse to receive. Every response from the model
 * is shaped by this prompt.
 *
 * The JSON file at dreams/milam/characters/milam.character.json is the
 * canonical ElizaOS v2 character definition. This module re-exports
 * the system prompt + message examples for the Next.js server to use
 * when calling Nosana directly.
 */
// Canonical source is dreams/milam/characters/milam.character.json (the
// ElizaOS v2 character definition). Turbopack restricts imports to the
// app root, so we keep a copy here. Keep both files in sync on edit.
import milamCharacter from "./milam.character.json";

export type CharacterMessage = { user: string; content: { text: string } };

export const MILAM_CHARACTER = milamCharacter;
export const MILAM_SYSTEM_PROMPT: string = milamCharacter.system;
export const MILAM_STYLE_RULES: string[] = [
  ...milamCharacter.style.all,
  ...milamCharacter.style.chat,
];

/**
 * Reinforce the one-line constraint in the runtime prompt. The character
 * file's `system` field carries the soul; this suffix is belt-and-suspenders
 * against the model drifting into "I notice..." or multi-line responses.
 */
export const MILAM_RUNTIME_REMINDER =
  "Reply with exactly ONE short sentence. No analysis. No preface. " +
  "No 'I notice' or 'it sounds like' or 'perhaps this means'. " +
  "Choose a statement or a question — not both. Then stop.";

export function milamExamples(): Array<{ role: "user" | "assistant"; content: string }> {
  const msgs: Array<{ role: "user" | "assistant"; content: string }> = [];
  for (const pair of milamCharacter.messageExamples as CharacterMessage[][]) {
    if (pair.length !== 2) continue;
    msgs.push({ role: "user", content: pair[0].content.text });
    msgs.push({ role: "assistant", content: pair[1].content.text });
  }
  return msgs;
}
