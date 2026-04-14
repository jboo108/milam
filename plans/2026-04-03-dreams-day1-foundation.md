# DREAMS Day 1: Foundation — Environment + Running Agent

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Get a working ElizaOS agent running locally, connected to the Nosana Qwen3.5 endpoint, ready for customization.

**Architecture:** Install Ubuntu on WSL2, set up Node 23 + bun inside WSL2, fork the hackathon starter repo, configure the Nosana inference endpoint, and run the default agent to confirm everything works end-to-end.

**Tech Stack:** WSL2/Ubuntu, Node.js 23+, bun, ElizaOS v2, Nosana Qwen3.5-27B-AWQ-4bit endpoint, Git/GitHub

---

### Task 1: Install Ubuntu on WSL2

**Context:** ElizaOS v2 explicitly requires WSL2 on Windows. Currently only `docker-desktop` distro is installed. We need a full Ubuntu distro.

- [ ] **Step 1: Install Ubuntu 24.04 on WSL2**

This requires an elevated terminal. The user must run this themselves since it needs admin privileges and will prompt for a Unix username/password.

```bash
wsl --install -d Ubuntu-24.04
```

Expected: Downloads and installs Ubuntu 24.04. Will prompt to create a Unix username and password. This may take 5-10 minutes and may require a restart.

- [ ] **Step 2: Verify Ubuntu is running on WSL2**

```bash
wsl -l -v
```

Expected: Should show `Ubuntu-24.04` with STATE `Running` and VERSION `2`.

- [ ] **Step 3: Enter Ubuntu and verify**

```bash
wsl -d Ubuntu-24.04
cat /etc/os-release | head -3
```

Expected: Shows Ubuntu 24.04 LTS info.

---

### Task 2: Install Node.js 23+ Inside WSL2

**Context:** ElizaOS requires Node.js v23.3.0+. The Windows Node (v22) won't work. We install inside WSL2 using nvm.

- [ ] **Step 1: Install nvm inside Ubuntu**

Run inside WSL2 (Ubuntu):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
```

Then reload the shell:

```bash
source ~/.bashrc
```

- [ ] **Step 2: Install Node.js 23**

```bash
nvm install 23
nvm use 23
node --version
```

Expected: `v23.x.x` (23.3.0 or higher)

- [ ] **Step 3: Verify npm works**

```bash
npm --version
```

Expected: Version number printed (no errors).

---

### Task 3: Install Bun Inside WSL2

**Context:** ElizaOS uses bun as its package manager. The Windows bun won't work inside WSL2.

- [ ] **Step 1: Install bun**

Run inside WSL2:

```bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

- [ ] **Step 2: Verify bun**

```bash
bun --version
```

Expected: Version 1.x.x printed.

---

### Task 4: Fork and Clone the Hackathon Starter Repo

**Context:** The hackathon provides a starter repo at `nosana-ci/agent-challenge` with character template, plugin scaffold, Dockerfile, and Nosana job definition.

- [ ] **Step 1: Fork the repo on GitHub**

Run from WSL2 (uses the `gh` CLI if available, otherwise do manually on github.com):

```bash
gh repo fork nosana-ci/agent-challenge --clone --remote
```

If `gh` is not installed in WSL2:
```bash
sudo apt-get update && sudo apt-get install -y gh
gh auth login
gh repo fork nosana-ci/agent-challenge --clone --remote
```

If gh auth is difficult, fork manually on GitHub.com, then:
```bash
cd ~
git clone https://github.com/jboo108/agent-challenge.git dreams-agent
cd dreams-agent
```

- [ ] **Step 2: Rename the directory (if cloned as agent-challenge)**

```bash
cd ~
mv agent-challenge dreams-agent 2>/dev/null || true
cd ~/dreams-agent
```

- [ ] **Step 3: Verify repo contents**

```bash
ls -la
```

Expected: Should see `characters/`, `src/`, `Dockerfile`, `package.json`, `.env.example`, `nos_job_def/`

- [ ] **Step 4: Check the character file**

```bash
cat characters/agent.character.json
```

Expected: JSON with name, system prompt, bio, messageExamples, style rules.

- [ ] **Step 5: Check the .env.example**

```bash
cat .env.example
```

Expected: Should show `OPENAI_API_KEY`, `OPENAI_API_URL` (Nosana endpoint), `MODEL_NAME`, embedding config.

---

### Task 5: Configure Environment Variables

**Context:** The starter repo comes pre-configured to point at Nosana's hackathon Qwen3.5 endpoint. We need to create the `.env` file from the example.

- [ ] **Step 1: Copy .env.example to .env**

```bash
cd ~/dreams-agent
cp .env.example .env
```

- [ ] **Step 2: Verify the Nosana endpoint is configured**

```bash
cat .env
```

Expected: Should contain something like:
```
OPENAI_API_URL=https://[nosana-endpoint]/v1
MODEL_NAME=Qwen3.5-27B-AWQ-4bit
```

If the endpoint URL is blank or needs a key, check the hackathon Discord or https://deploy.nosana.com for participant credentials.

- [ ] **Step 3: If endpoint needs registration, register at Nosana**

Go to https://deploy.nosana.com and sign up. Request builder credits from Discord. Update `.env` with any API keys or endpoint URLs provided.

---

### Task 6: Install Dependencies and Run the Agent

**Context:** This is the moment of truth — get the default ElizaOS agent running locally.

- [ ] **Step 1: Install dependencies**

```bash
cd ~/dreams-agent
bun install
```

Expected: Dependencies install without errors. May take 1-2 minutes. If there are native module compilation errors (better-sqlite3, etc.), install build tools:

```bash
sudo apt-get install -y python3 make g++ build-essential
bun install
```

- [ ] **Step 2: Run the agent in dev mode**

```bash
npx elizaos dev
```

Or if that doesn't work:

```bash
bun run dev
```

Expected: Agent starts up, loads the character file, connects to the Nosana endpoint. You should see logs indicating the agent is ready. A web UI may open on http://localhost:3000.

- [ ] **Step 3: Test a basic message**

If a web UI is available at localhost:3000, open it in your Windows browser and send a test message like "Hello, are you there?"

If no web UI, check the terminal output for how to interact with the agent.

Expected: The agent responds using the Qwen3.5 model via the Nosana endpoint. Any response confirms: ElizaOS is running, Nosana endpoint is live, inference works.

- [ ] **Step 4: Confirm Nosana endpoint is actually being used**

Check the terminal logs for the inference call URL. It should show the Nosana endpoint, not a local model.

Expected: Logs showing requests to the Nosana Qwen3.5 endpoint.

---

### Task 7: Create GitHub Repo and Push

**Context:** We need our own repo for the hackathon submission.

- [ ] **Step 1: Create a new GitHub repo**

```bash
gh repo create dreams-agent --public --source=. --remote=origin --push
```

Or if the fork is already set up as origin, rename and push:

```bash
git remote set-url origin https://github.com/jboo108/dreams-agent.git
```

- [ ] **Step 2: Initial commit with clean state**

```bash
git add -A
git status
git commit -m "feat: initial setup from nosana agent-challenge starter"
git push -u origin main
```

Expected: Clean push to GitHub. Repo visible at https://github.com/jboo108/dreams-agent

---

### Task 8: Verify Embedding Endpoint

**Context:** ElizaOS uses embeddings for memory/RAG. The hackathon provides a Qwen3-Embedding-0.6B endpoint. We need to confirm it works because Clude and dream fragment storage depend on it.

- [ ] **Step 1: Check embedding config in .env**

```bash
grep -i embed .env
```

Expected: Should show `OPENAI_EMBEDDING_URL`, `OPENAI_EMBEDDING_MODEL=Qwen3-Embedding-0.6B`, `OPENAI_EMBEDDING_DIMENSIONS=1024`.

- [ ] **Step 2: Test embedding endpoint manually**

```bash
curl -s -X POST "${OPENAI_EMBEDDING_URL:-$(grep OPENAI_EMBEDDING_URL .env | cut -d= -f2-)}/embeddings" \
  -H "Content-Type: application/json" \
  -d '{"model":"Qwen3-Embedding-0.6B","input":"test dream fragment"}' | head -c 200
```

Expected: JSON response with embedding vector. Any response with numbers confirms the endpoint works.

---

## Day 1 Completion Criteria

All of these must be true before moving to Day 2:

- [ ] Ubuntu 24.04 running on WSL2
- [ ] Node.js 23+ installed inside WSL2
- [ ] Bun installed inside WSL2
- [ ] Starter repo cloned and dependencies installed
- [ ] `.env` configured with Nosana endpoints
- [ ] Default agent runs and responds to messages
- [ ] Embedding endpoint confirmed working
- [ ] Repo pushed to GitHub

**If all pass:** Day 1 complete. Day 2 is Supabase + Clude self-hosted setup.

**If blocked:** Most likely blockers are WSL2 install (may need restart), Nosana endpoint access (may need Discord request), or native module compilation in bun install (need build-essential). Each has a workaround above.
