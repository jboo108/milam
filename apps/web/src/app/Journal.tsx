"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface JournalEntryReply {
  text: string;
  createdAt: string | null;
  solanaTx: string | null;
  solanaExplorerUrl: string | null;
}

interface JournalEntry {
  id: string;
  createdAt: string;
  dream: string;
  response: string;
  inputType: "sleeping_dream" | "daydream" | "fragment";
  solanaTx: string | null;
  solanaExplorerUrl: string | null;
  nosanaJobUrl: string | null;
  cludeMemoryId: string | null;
  reply: JournalEntryReply | null;
}

interface JournalResponse {
  count: number;
  connected: { clude: boolean };
  entries: JournalEntry[];
}

interface DreamReplyMeta {
  id: string;
  response: string;
  createdAt: string;
  inputType: JournalEntry["inputType"];
  inference: {
    model: string;
    endpoint: string;
    latencyMs: number;
    promptTokens: number;
    completionTokens: number;
  };
  envelope: { ciphertextPreview: string; version: string };
  solana: { signature: string; cluster: string; explorerUrl: string; payloadHash: string } | null;
  clude: { memoryId: string | null };
}

type Stage = "idle" | "sending" | "receiving" | "revealed" | "replying" | "reply-sent";

export default function Journal() {
  const [text, setText] = useState("");
  const [inputType, setInputType] = useState<JournalEntry["inputType"]>("sleeping_dream");
  const [stage, setStage] = useState<Stage>("idle");
  const [latest, setLatest] = useState<DreamReplyMeta | null>(null);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [cludeConnected, setCludeConnected] = useState<boolean | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const loadJournal = useCallback(async () => {
    try {
      const res = await fetch("/api/journal", { cache: "no-store" });
      const data = (await res.json()) as JournalResponse;
      setEntries(data.entries);
      setCludeConnected(data.connected.clude);
    } catch {
      setEntries([]);
    }
  }, []);

  useEffect(() => {
    loadJournal();
  }, [loadJournal]);

  const submit = async () => {
    const trimmed = text.trim();
    if (!trimmed || stage !== "idle") return;
    setError(null);
    setStage("sending");
    try {
      // Deliberate pause — MILAM is not a chatbot. Silence is the feature.
      const minPause = 2000;
      const started = Date.now();
      const [res] = await Promise.all([
        fetch("/api/dream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, inputType }),
        }),
        new Promise((r) => setTimeout(r, minPause)),
      ]);
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        throw new Error(err.detail ?? err.error ?? `${res.status}`);
      }
      setStage("receiving");
      const data = (await res.json()) as DreamReplyMeta;
      // Brief extra moment before the response appears.
      await new Promise((r) => setTimeout(r, 600 + Math.min(Date.now() - started, 0)));
      setLatest(data);
      setStage("revealed");
      setText("");
      await loadJournal();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStage("idle");
    }
  };

  const submitReply = async () => {
    if (!latest || !replyText.trim() || stage === "replying") return;
    setStage("replying");
    setError(null);
    try {
      const res = await fetch("/api/dream/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parentId: latest.id, text: replyText.trim() }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        throw new Error(err.detail ?? err.error ?? `${res.status}`);
      }
      setReplyText("");
      setStage("reply-sent");
      await loadJournal();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStage("revealed");
    }
  };

  const reset = () => {
    setStage("idle");
    setLatest(null);
    setReplyText("");
    setError(null);
    textareaRef.current?.focus();
  };

  return (
    <section className="w-full max-w-xl flex flex-col gap-10">
      {/* Input area */}
      <div
        className="rounded-2xl p-6 flex flex-col gap-4"
        style={{
          background: "var(--bg-velvet)",
          boxShadow: "var(--velvet-inset)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <label
          htmlFor="dream-input"
          className="uppercase"
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "var(--text-micro)",
            letterSpacing: "var(--tracking-label)",
            color: "var(--fg-whisper)",
          }}
        >
          Your dream
        </label>
        <textarea
          id="dream-input"
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={stage !== "idle"}
          rows={5}
          placeholder="The door was open but I couldn't step through…"
          style={{
            background: "transparent",
            color: "var(--fg-primary)",
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-dream)",
            lineHeight: "var(--leading-dream)",
            letterSpacing: "var(--tracking-normal)",
            border: "none",
            outline: "none",
            resize: "vertical",
            fontStyle: "italic",
            opacity: stage === "idle" ? 1 : 0.4,
            transition: "opacity var(--dur-medium) var(--ease-out-soft)",
          }}
        />
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-3" role="radiogroup" aria-label="kind of dream">
            {(["sleeping_dream", "daydream", "fragment"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                role="radio"
                aria-checked={inputType === kind}
                disabled={stage !== "idle"}
                onClick={() => setInputType(kind)}
                style={{
                  background:
                    inputType === kind ? "var(--milam-mauve-500)" : "transparent",
                  color: inputType === kind ? "var(--milam-cream-100)" : "var(--fg-whisper)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--text-micro)",
                  letterSpacing: "var(--tracking-label)",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--milam-mauve-400)",
                  textTransform: "uppercase",
                  opacity: stage === "idle" ? 1 : 0.3,
                  cursor: stage === "idle" ? "pointer" : "default",
                  transition: "all var(--dur-fast) var(--ease-out-soft)",
                }}
              >
                {kind.replace("_", " ")}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={stage !== "idle" || !text.trim()}
            style={{
              background:
                stage === "idle" && text.trim()
                  ? "var(--milam-gold-500)"
                  : "var(--milam-midnight-600)",
              color: "var(--milam-midnight-900)",
              fontFamily: "var(--font-ui)",
              fontSize: "var(--text-small)",
              letterSpacing: "var(--tracking-label)",
              padding: "10px 24px",
              borderRadius: "var(--radius-pill)",
              border: "none",
              textTransform: "uppercase",
              fontWeight: 600,
              opacity: stage === "idle" && text.trim() ? 1 : 0.5,
              cursor: stage === "idle" && text.trim() ? "pointer" : "default",
              transition: "all var(--dur-fast) var(--ease-out-soft)",
            }}
          >
            Offer
          </button>
        </div>
      </div>

      {/* Response / status area */}
      {(stage !== "idle" || latest || error) && (
        <div
          role="status"
          aria-live="polite"
          className="text-center min-h-[120px] flex flex-col items-center justify-center gap-4"
        >
          {stage === "sending" && (
            <p
              className="italic"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-small)",
                color: "var(--fg-whisper)",
                opacity: 0.7,
              }}
            >
              milam is receiving
            </p>
          )}
          {stage === "receiving" && (
            <p
              className="italic"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-small)",
                color: "var(--fg-whisper)",
                opacity: 0.5,
              }}
            >
              …
            </p>
          )}
          {(stage === "revealed" || stage === "replying" || stage === "reply-sent") && latest && (
            <>
              <p
                className="italic"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-question)",
                  color: "var(--fg-primary)",
                  lineHeight: "var(--leading-snug)",
                  maxWidth: "36ch",
                }}
              >
                {latest.response}
              </p>
              <div
                className="flex flex-wrap gap-3 justify-center"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-micro)",
                  color: "var(--fg-whisper)",
                  opacity: 0.6,
                  letterSpacing: "var(--tracking-label)",
                }}
              >
                <span>nosana · {latest.inference.model} · {latest.inference.latencyMs}ms</span>
                {latest.solana?.explorerUrl && (
                  <a
                    href={latest.solana.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "var(--accent)" }}
                  >
                    solana tx ↗
                  </a>
                )}
                <span>envelope · {latest.envelope.version}</span>
              </div>

              {stage === "reply-sent" && (
                <p
                  className="italic"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-small)",
                    color: "var(--fg-whisper)",
                    opacity: 0.7,
                  }}
                >
                  held.
                </p>
              )}

              {(stage === "revealed" || stage === "replying") && (
                <div
                  className="w-full mt-4 flex flex-col gap-3"
                  style={{
                    maxWidth: "40ch",
                    borderTop: "1px dashed var(--milam-mauve-400)",
                    paddingTop: "var(--space-4)",
                  }}
                >
                  <label
                    htmlFor="reply-input"
                    className="uppercase text-left"
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "var(--text-micro)",
                      letterSpacing: "var(--tracking-label)",
                      color: "var(--fg-whisper)",
                      opacity: 0.7,
                    }}
                  >
                    reply (optional) — she won't respond, but she will hold this too
                  </label>
                  <textarea
                    id="reply-input"
                    ref={replyRef}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={stage === "replying"}
                    rows={3}
                    placeholder="the blue came before the falling…"
                    style={{
                      background: "transparent",
                      color: "var(--fg-primary)",
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-body)",
                      lineHeight: "var(--leading-dream)",
                      border: "none",
                      outline: "none",
                      resize: "vertical",
                      fontStyle: "italic",
                      opacity: stage === "replying" ? 0.4 : 1,
                      transition: "opacity var(--dur-medium) var(--ease-out-soft)",
                      textAlign: "left",
                    }}
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={submitReply}
                      disabled={stage === "replying" || !replyText.trim()}
                      style={{
                        background:
                          stage === "revealed" && replyText.trim()
                            ? "var(--milam-mauve-500)"
                            : "var(--milam-midnight-600)",
                        color: "var(--milam-cream-100)",
                        fontFamily: "var(--font-ui)",
                        fontSize: "var(--text-micro)",
                        letterSpacing: "var(--tracking-label)",
                        padding: "8px 18px",
                        borderRadius: "var(--radius-pill)",
                        border: "none",
                        textTransform: "uppercase",
                        opacity: stage === "revealed" && replyText.trim() ? 1 : 0.5,
                        cursor:
                          stage === "revealed" && replyText.trim() ? "pointer" : "default",
                        transition: "all var(--dur-fast) var(--ease-out-soft)",
                      }}
                    >
                      {stage === "replying" ? "held…" : "offer reply"}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={reset}
                style={{
                  background: "transparent",
                  color: "var(--fg-whisper)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--text-micro)",
                  letterSpacing: "var(--tracking-label)",
                  textTransform: "uppercase",
                  border: "1px solid var(--milam-mauve-400)",
                  padding: "6px 18px",
                  borderRadius: "var(--radius-pill)",
                  marginTop: "var(--space-3)",
                  cursor: "pointer",
                }}
              >
                bring another
              </button>
            </>
          )}
          {error && (
            <p
              role="alert"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-small)",
                color: "var(--milam-gold-500)",
              }}
            >
              {error}
            </p>
          )}
        </div>
      )}

      {/* Journal */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lede)",
              color: "var(--fg-secondary)",
              fontStyle: "italic",
              letterSpacing: "var(--tracking-tight)",
            }}
          >
            what she has held
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-micro)",
              color: "var(--fg-whisper)",
              opacity: 0.5,
              letterSpacing: "var(--tracking-label)",
            }}
          >
            {entries.length} {entries.length === 1 ? "dream" : "dreams"}
            {cludeConnected === false && " · local only"}
            {cludeConnected === true && " · clude"}
          </span>
        </div>
        {entries.length === 0 && (
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-small)",
              color: "var(--fg-whisper)",
              opacity: 0.5,
              fontStyle: "italic",
            }}
          >
            no dreams yet.
          </p>
        )}
        {entries.map((e) => (
          <article
            key={e.id}
            className="rounded-xl p-5 flex flex-col gap-3"
            style={{
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-hush)",
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-micro)",
                color: "var(--fg-whisper)",
                opacity: 0.5,
                letterSpacing: "var(--tracking-label)",
              }}
            >
              <span>{formatDate(e.createdAt)}</span>
              <span>{e.inputType.replace("_", " ")}</span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-body)",
                color: "var(--fg-primary)",
                lineHeight: "var(--leading-dream)",
                fontStyle: "italic",
              }}
            >
              {e.dream}
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-body)",
                color: "var(--fg-secondary)",
                lineHeight: "var(--leading-snug)",
                borderLeft: "2px solid var(--milam-mauve-400)",
                paddingLeft: "var(--space-3)",
                fontStyle: "italic",
              }}
            >
              {e.response}
            </p>
            {e.reply && (
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-body)",
                  color: "var(--fg-primary)",
                  lineHeight: "var(--leading-dream)",
                  borderLeft: "2px solid var(--milam-gold-500)",
                  paddingLeft: "var(--space-3)",
                  fontStyle: "italic",
                  opacity: 0.85,
                }}
              >
                {e.reply.text}
              </p>
            )}
            <div
              className="flex flex-wrap gap-4"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-micro)",
                color: "var(--fg-whisper)",
                opacity: 0.55,
                letterSpacing: "var(--tracking-label)",
              }}
            >
              {e.solanaExplorerUrl && (
                <a
                  href={e.solanaExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  solana tx ↗
                </a>
              )}
              {e.reply?.solanaExplorerUrl && (
                <a
                  href={e.reply.solanaExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  reply tx ↗
                </a>
              )}
              {e.cludeMemoryId && <span>clude · {e.cludeMemoryId.slice(0, 8)}</span>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    .toLowerCase();
}
