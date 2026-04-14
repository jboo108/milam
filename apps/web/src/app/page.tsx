import Journal from "./Journal";

export default function Page() {
  return (
    <main
      className="relative z-10 flex min-h-dvh flex-col items-center px-6 py-10 gap-10"
      style={{ background: "var(--bg-base)" }}
    >
      <header className="flex flex-col items-center gap-3 mt-8">
        <h1
          className="italic"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-echo)",
            color: "var(--fg-primary)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: "var(--leading-tight)",
            fontVariationSettings: "'opsz' 144, 'SOFT' 100",
          }}
        >
          milam
        </h1>
        <p
          className="italic text-center max-w-md"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-small)",
            color: "var(--fg-whisper)",
            opacity: 0.7,
          }}
        >
          bring a dream. she receives and holds, never interprets.
        </p>
      </header>

      <Journal />

      <footer
        className="mt-auto pt-8 text-center"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-micro)",
          color: "var(--fg-whisper)",
          opacity: 0.5,
          letterSpacing: "var(--tracking-label)",
        }}
      >
        DREAMERS · MILAM · NOSANA × ELIZAOS · 2026
      </footer>
    </main>
  );
}
