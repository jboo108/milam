# MILAM Demo Video — Shooting Script

**Target length:** ~3 minutes. **Format:** screen recording + webcam PIP for the opening monologue.

---

## Before you hit record

- [ ] Dev server running on localhost:3000 (`pnpm dev` in `apps/web/`) — has Clude + Solana keys live so tx hashes come through on camera
- [ ] Browser window sized to ~1280×800 (looks best on mobile judge screens)
- [ ] Two browser tabs open and ready:
  - Tab 1 — `http://localhost:3000`
  - Tab 2 — `https://explorer.solana.com/tx/<ready-to-paste>`
- [ ] (Optional) Nosana dashboard open on a third tab showing the deployed job
- [ ] Clear the journal if needed: delete `apps/web/data/local-dreams.json` OR just leave prior dreams; judges seeing a non-empty journal is good
- [ ] Write down 3 real dreams you'll actually type. Don't script them — dream them. Use something you actually remember. **The restraint reads as real only if the input is real.**

---

## Scene-by-scene

### Scene 1 — Opening (0:00 → 0:30) · **face on camera**

Hit record on your phone or webcam. Look into the lens. This is the only time you talk to the camera.

> "I have dreams. Sleeping dreams. Daydreams. Flashes of ideas. And they all disappear. Every AI I try wants to interpret them, analyze them, tell me what they mean. I don't want that. I want something that just holds them. Receives them. And remembers them forever."

Cut to screen. No more face-on.

---

### Scene 2 — The dream loop (0:30 → 1:15)

Cursor on the dream textarea. Type a real dream at normal pace. Press **Offer**.

Let the pause breathe. Two seconds of silence on camera is fine — **it's the product**.

MILAM's one-line reply fades in. **Read it out loud once, quietly.** One beat.

Mouse hovers the tech strip below: `nosana · Qwen3.5-9B-FP8 · 2985ms`. Voiceover:

> "That line took three seconds on a Nosana GPU. The model is Qwen3.5-9B, running on decentralized compute — not AWS, not OpenAI. The reply is one thread. Not an essay. MILAM never explains your dream. She offers one thing and then she's quiet."

---

### Scene 3 — The reply (1:15 → 1:45)

Click into the reply textarea that appeared below MILAM's line. Type something short that deepens the dream — a detail that came back while she was asking her question.

Press **offer reply**.

Screen shows *"held."*

Voiceover:

> "I can reply. She doesn't answer back — she already said her one thing. But my reply becomes part of the dream. Stored alongside it. Next time I recall this dream, both are there."

Click **bring another** → the journal scrolls into view showing the full exchange.

---

### Scene 4 — The encryption + Solana anchor (1:45 → 2:15)

Hover over the latest journal entry. Point at:
- The dream text (plaintext only on my device, because the key is local)
- MILAM's reply
- The `solana tx ↗` link

Click the Solana link. Switch to the explorer tab. Scroll to show:
- Transaction status: **Success**
- Program: **Memo**
- Payload: `dream:<sha256 hash>`
- Fee: ~0.000005 SOL
- Cluster: **mainnet-beta**

Voiceover:

> "The dream text is encrypted with libsodium before it leaves my machine. Clude stores only the ciphertext. And the SHA-256 hash of that ciphertext is written to Solana mainnet — right here, forever. The content never hits the chain. Only the proof that it existed at this moment. That's the privacy model."

Use this real tx from the build as backup if live write hangs:
`37k7ubYiz2PHEft6BSwsUPwGg4QUBSFkczqaikvte4uDsd7w8mUz2qyMAoEndSHSdh5KHDdu6LCKQ8Cr2zsWFjzr`

---

### Scene 5 — Nosana job + Clude memory (2:15 → 2:45)

Switch to the Nosana dashboard tab. Show your running `milam-web` job:
- Job ID
- GPU type (or compute market)
- Duration remaining
- Status: **Running**

Voiceover (while showing):

> "And MILAM herself runs on Nosana. This is the job — live, decentralized, no cloud middlemen. Every dream goes through this infrastructure."

Cut to the Clude dashboard (clude.io/dashboard-new). Sign in with the Backpack wallet if needed, open Memory Timeline. Show the dreams you just logged with their numeric memory IDs and tags: `dream`, `milam`, `sleeping_dream`, `reply`.

Voiceover:

> "And these are the memories themselves — typed, tagged, bonded. Episodic dreams, semantic replies. When Clude's JEPA layer goes live, these connect themselves. I don't have to build that. I just have to hold the dream correctly. Today."

---

### Scene 6 — The vision (2:45 → 3:00)

Cut back to the MILAM UI, or a text overlay card.

Voiceover:

> "MILAM is the foundation. Next comes MIRA — a day companion that holds your waking world and wonders at the connections between everything you've ever brought her. Dream through the night. Wonder through the day. That's MIRARI."

Last frame: the MILAM title, italic, alone. Fade to black.

---

## Raw assets you already have (in case re-recording fails)

**Live Solana mainnet txs from this build (click any):**
- `pwGT7B3NQ6kczBTw2XfKA7N1jmDQbifu7ukoQ32ygQhVpmgy8MtcKSEU9w518s6ysg9p4NkRj9x9AccCfmuthSA` — the pomegranate dream
- `37k7ubYiz2PHEft6BSwsUPwGg4QUBSFkczqaikvte4uDsd7w8mUz2qyMAoEndSHSdh5KHDdu6LCKQ8Cr2zsWFjzr` — the same dream, different session
- `2dBn3qtBXWraDUmRkWsFQ8hqDeSTQjSEzEqSLD2txgtBtgxQG9ywYT4WRa953mxrjZaYfgznMBkzqfSAdPB9iQ69` — the dreamer reply on the pomegranate

**Live Clude memory IDs:**
- `2254249` — the episodic dream
- `2254250` — the semantic reply bonded to it

**Stored dream transcripts (in `apps/web/data/local-dreams.json` after your local runs):** check this before recording if you want to demo the journal scrolling.

---

## Editing notes

- Keep cuts tight. Every moment of silence should be intentional (the MILAM-is-receiving pause is the only deliberate silence)
- No background music. The product is silence-shaped. Music fights it.
- If you want a subtle ambient track: slow pad under voiceover, cut before the Scene 2 pause, restart on Scene 5
- Title card at the top: just **MILAM** in Fraunces italic, nothing else
- End card: the MIRARI name in the same style

The reel only needs to land one feeling: **this AI does less on purpose, and that's the feature.**
