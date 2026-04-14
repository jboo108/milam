# Deploying MILAM to Nosana

Five steps. Browser + terminal. ~20 min including image upload.

---

## 1. Build the image (already done if the Docker build step succeeded)

```bash
cd apps/web
docker build -t milam-web:latest .
```

Verify it runs locally before you ship it:

```bash
docker run --rm -p 3001:3000 --env-file .env.local milam-web:latest
# Visit http://localhost:3001 — should look identical to `pnpm dev`
```

---

## 2. Push the image to Docker Hub

You need a Docker Hub account — free at hub.docker.com. Log in from the terminal:

```bash
docker login
# Use your Docker Hub username + password or personal access token
```

Tag and push:

```bash
# Replace YOUR_USERNAME with your Docker Hub handle.
docker tag milam-web:latest YOUR_USERNAME/milam-web:latest
docker push YOUR_USERNAME/milam-web:latest
```

First push takes 3–8 min depending on image size (~400 MB for a Next.js app with the deps we pulled in).

---

## 3. Edit the Nosana job definition

Open `nos_job_def/milam-web.json`. Replace:

- `REPLACE_WITH_YOUR_DOCKER_USERNAME/milam-web:latest` with your actual pushed image path
- `ARCIUM_MASTER_KEY` — the same base64 string from your local `.env.local`
- `CORTEX_API_KEY` — the `clk_...` key (same as local, or leave empty for local-only fallback)
- `SOLANA_SECRET_KEY` — your Backpack private key (same as local, or leave empty to skip Solana anchoring)

**Security note:** Nosana job definitions are pinned to IPFS and publicly readable. If you put real keys here:
- Use a demo/throwaway Clude agent (regeneratable via `npx clude-bot register` after the hackathon)
- Fund the Solana wallet with only the ~0.001 SOL needed for demo memo transactions (~200 writes)
- Rotate both after submission

An alternative: deploy with empty `CORTEX_API_KEY` and `SOLANA_SECRET_KEY` — the app will fall back to local JSON storage, and the Solana anchor step will no-op. Judges still see MILAM running on Nosana infrastructure; they just won't see the Clude memory IDs or mainnet tx links from the hosted instance. Record those in the demo video from your local run instead.

---

## 4. Post the job via the Nosana dashboard

1. Open https://dashboard.nosana.com
2. Click **Deploy** → **New Job**
3. Paste the contents of `nos_job_def/milam-web.json`
4. Pick a market — "nvidia-3060" or similar is sufficient (no GPU needed for the web app itself; it calls the shared Qwen endpoint for inference)
5. Set duration — **1 hour** for the demo window; extend after submission if needed
6. Confirm the NOS token spend and submit

Within ~3–5 min you'll get a public URL:
`https://<unique-id>.node.k8s.prd.nos.ci`

That URL is what you put in the demo video. That URL is what judges click.

---

## 5. Smoke-test the hosted URL

```bash
curl https://<YOUR_DEPLOYED_URL>/api/journal
```

Should return `{"count":0,"connected":{"clude":...},"entries":[]}` (or existing dreams if CORTEX_API_KEY was set).

Submit a dream via the UI at `https://<YOUR_DEPLOYED_URL>`.

If MILAM replies and the response shape matches your local run — the deployment is green.

---

## Screenshots to grab for the demo

- Nosana dashboard **Jobs** view showing your running `milam-web` job (job ID, duration, GPU type, status)
- The MILAM UI on `node.k8s.prd.nos.ci` with a dream response rendered
- Solana explorer page for one of your tx hashes (from local run — mainnet)
- Clude dashboard memory timeline showing stored dreams

Those four frames carry the 25%-Nosana and 25%-Technical-Implementation credit in the video.
