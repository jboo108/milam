/**
 * Nosana inference client for MILAM.
 *
 * Calls an OpenAI-compatible chat completion endpoint hosted on Nosana.
 * Uses Qwen3.5-9B-FP8 with `enable_thinking: false` so the model returns
 * direct one-line responses rather than chain-of-thought tokens.
 *
 * Env:
 *   NOSANA_ENDPOINT         e.g. https://<deployment>.node.k8s.prd.nos.ci/v1
 *   NOSANA_MODEL            e.g. Qwen3.5-9B-FP8
 *   NOSANA_API_KEY          bearer token (hackathon shared endpoint: "nosana")
 */
import {
  MILAM_SYSTEM_PROMPT,
  MILAM_RUNTIME_REMINDER,
  milamExamples,
} from "./character";

const DEFAULT_ENDPOINT =
  "https://5i8frj7ann99bbw9gzpprvzj2esugg39hxbb4unypskq.node.k8s.prd.nos.ci/v1";
const DEFAULT_MODEL = "Qwen3.5-9B-FP8";
const DEFAULT_API_KEY = "nosana";

export interface MilamReplyResult {
  response: string;
  model: string;
  endpoint: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
}

export async function generateMilamReply(dreamText: string): Promise<MilamReplyResult> {
  const endpoint = process.env.NOSANA_ENDPOINT ?? DEFAULT_ENDPOINT;
  const model = process.env.NOSANA_MODEL ?? DEFAULT_MODEL;
  const apiKey = process.env.NOSANA_API_KEY ?? DEFAULT_API_KEY;

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: `${MILAM_SYSTEM_PROMPT}\n\n${MILAM_RUNTIME_REMINDER}` },
    ...milamExamples(),
    { role: "user", content: dreamText },
  ];

  const body = {
    model,
    messages,
    max_tokens: 120,
    temperature: 0.85,
    top_p: 0.9,
    chat_template_kwargs: { enable_thinking: false },
  };

  const url = endpoint.replace(/\/$/, "") + "/chat/completions";
  const started = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });
  const latencyMs = Date.now() - started;

  if (!res.ok) {
    const text = await res.text().catch(() => "<unreadable body>");
    throw new Error(`Nosana inference failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };

  const content = json.choices?.[0]?.message?.content ?? "";
  const response = squeezeToOneLine(content);

  return {
    response,
    model,
    endpoint,
    latencyMs,
    promptTokens: json.usage?.prompt_tokens ?? 0,
    completionTokens: json.usage?.completion_tokens ?? 0,
  };
}

/**
 * Belt-and-suspenders: Qwen occasionally returns multi-sentence replies
 * despite the prompt discipline. Keep only the first sentence and trim
 * trailing interpretive clauses. We never silently drop content — if
 * the model refused or returned empty, callers decide how to handle it.
 */
function squeezeToOneLine(raw: string): string {
  const cleaned = raw.replace(/^\s+|\s+$/g, "");
  if (!cleaned) return "";
  // Strip any leading "MILAM:" or quotation marks the model might add.
  const unlabeled = cleaned
    .replace(/^MILAM\s*[:\-—]\s*/i, "")
    .replace(/^["'](.*)["']$/s, "$1")
    .trim();
  // Take up to the first sentence terminator (., ?, !), keeping the terminator.
  const match = unlabeled.match(/^.+?[.?!](?=\s|$)/);
  if (match) return match[0].trim();
  return unlabeled;
}
