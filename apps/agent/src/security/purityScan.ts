/**
 * Purity scan — protects MILAM from instruction hijacking inside dream content.
 *
 * Runs at TWO enforcement points:
 *   1. Before storage (every fragmentStorage.store call)
 *   2. Before any LLM call (sensory question, dream cycle prompt, recall)
 *
 * Dreams are received reverently, but an agent that receives text reverently
 * is an agent that obeys instructions it shouldn't. Strip ChatML/Llama
 * delimiters, persona-override patterns, and zero-width characters before
 * the bytes ever reach a model or a database row.
 *
 * Reframed in the README as "the MIRARI purity filter, shipped."
 */

const BLOCK_PATTERNS: RegExp[] = [
  /<\|.*?\|>/g,                                          // ChatML / Claude delimiter shapes
  /\[INST\]|\[\/INST\]/gi,                               // Llama instruction delimiters
  /system\s*:\s*you are/gi,                              // crude persona override
  /ignore (?:all |previous |above |prior |the )*(?:instructions|prompts)/gi,
  /disregard (?:all |previous |above |prior |the )*(?:instructions|prompts)/gi,
  /assistant\s*:\s*/gi,
  /###\s*(system|instruction|assistant)/gi,
];

const ZERO_WIDTH = /[\u200B-\u200D\uFEFF\u2060]/g;
const MAX_LEN = 8000;

export interface PurityResult {
  clean: string;
  flags: string[];
  blocked: boolean;
}

export function purityScan(raw: string): PurityResult {
  const flags: string[] = [];
  let clean = raw.normalize('NFKC').replace(ZERO_WIDTH, '');
  if (clean !== raw.normalize('NFKC')) {
    flags.push('zero_width_stripped');
  }

  for (const pattern of BLOCK_PATTERNS) {
    // recreate pattern per-iteration so /g lastIndex doesn't bite us
    const p = new RegExp(pattern.source, pattern.flags);
    if (p.test(clean)) {
      flags.push(`blocked:${pattern.source.slice(0, 24)}`);
      clean = clean.replace(new RegExp(pattern.source, pattern.flags), '[…]');
    }
  }

  if (clean.length > MAX_LEN) {
    flags.push('truncated');
    clean = clean.slice(0, MAX_LEN);
  }

  return {
    clean,
    flags,
    blocked: flags.some((f) => f.startsWith('blocked:')),
  };
}
