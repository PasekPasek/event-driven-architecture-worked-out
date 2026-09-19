# Event-Driven Architecture, Worked Out — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a single-page, dependency-free, source-grounded interactive explainer for event-driven
architecture — same "workshop plate" format as `event-loop-worked-out` — ending with AI agents as a
worked application of the same primitives, live at `https://pasekpasek.github.io/event-driven-architecture-worked-out/`.

**Architecture:** One `index.html` (markup + inline CSS + inline JS), following the sibling repos'
convention of embedding reusable logic in named comment-delimited blocks (`/* MODEL:<name> START */
... /* MODEL:<name> END */`) so a separate `test-model.ts` can extract that exact code, run it for
real (a real Node HTTP server for the SSE model; an independently-written oracle port of the real
`4th-devs` scheduler algorithm for the scheduler model; the literal formula for backoff), and fail if
the page's model disagrees. Ten numbered sections, ~7 interactive sandboxes built from the CSS
components already proven in `event-loop-worked-out` (`.map` for graphs, `.tl` for timelines, `.rows`/
`.pane`/`.simgrid` for step-through consoles).

**Tech Stack:** Plain HTML/CSS/JS (no framework, no bundler), Node 24 (native TypeScript type-stripping,
so `test-model.ts` runs directly with `node test-model.ts`, no build step), zero npm dependencies.

**Design spec:** `docs/superpowers/specs/2026-09-19-event-driven-architecture-worked-out-design.md`
**Reference repos (read-only, for copying patterns/attribution, not for import):**
`/tmp/claude-1001/-home-ppasek-projects-dev-cards/69758100-a385-493c-b973-de8144bfe624/scratchpad/{event-loop-worked-out,auth-worked-out,4th-devs}`
(if that scratchpad no longer exists when this plan is executed, re-clone: `git clone --depth 1 https://github.com/PasekPasek/event-loop-worked-out`,
`.../auth-worked-out`, `https://github.com/i-am-alice/4th-devs`)

---

## Phase 0 — Scaffolding

### Task 1: Repo scaffolding files

**Files:**
- Create: `LICENSE`
- Create: `.nojekyll`
- Create: `robots.txt`
- Create: `sitemap.xml`
- Create: `favicon.svg`
- Create: `.gitignore`

- [ ] **Step 1: Create the MIT license**

```text
MIT License

Copyright (c) 2026 Paweł Pasek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Save this as `LICENSE` (no extension).

- [ ] **Step 2: Create `.nojekyll` (empty file, disables GitHub Pages' Jekyll processing)**

```bash
touch .nojekyll
```

- [ ] **Step 3: Create `robots.txt`**

```text
User-agent: *
Allow: /

Sitemap: https://pasekpasek.github.io/event-driven-architecture-worked-out/sitemap.xml
```

- [ ] **Step 4: Create `sitemap.xml`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://pasekpasek.github.io/event-driven-architecture-worked-out/</loc>
    <lastmod>2026-09-19</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

- [ ] **Step 5: Create `favicon.svg`**

Same shape language as the two sibling pages (a machined dial), recolored so the three pages are
recognizably a set but distinguishable: swap the "live" accent from amber (`#F0A94C`, event loop) /
whatever `auth-worked-out` uses, to a violet accent for this page (`#C79BDF`, already in the shared
palette as `--c-key`) so it reads as "the third one" at a glance:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="5" fill="#1A2028"/>
  <circle cx="11" cy="11" r="4" fill="none" stroke="#3D4B5A" stroke-width="2.4"/>
  <circle cx="22" cy="11" r="4" fill="none" stroke="#3D4B5A" stroke-width="2.4"/>
  <circle cx="16.5" cy="22" r="4" fill="none" stroke="#C79BDF" stroke-width="2.4"/>
  <path d="M13.4 13.6 L15 18.4 M19.6 13.6 L18 18.4" stroke="#7FA7C4" stroke-width="2" stroke-linecap="round"/>
</svg>
```

(Three linked nodes — a tiny event graph — rather than the event loop's single dial or auth's likely
lock/key shape.)

- [ ] **Step 6: Create `.gitignore`**

```text
.DS_Store
*.log
/tmp-model-*
```

- [ ] **Step 7: Commit**

```bash
git add LICENSE .nojekyll robots.txt sitemap.xml favicon.svg .gitignore
git commit -m "chore: repo scaffolding (license, robots, sitemap, favicon)"
```

---

## Phase 1 — Page shell and design system

### Task 2: `index.html` shell — head, meta, CSS design system, header/TOC/footer skeleton

**Files:**
- Create: `index.html`

- [ ] **Step 1: Write the `<head>` block**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>Event-Driven Architecture, Worked Out — Queues, SSE and AI Agents in TypeScript</title>
<meta name="description" content="An interactive walkthrough of event-driven architecture: what a broker actually guarantees (Kafka, SQS, SNS, EventBridge), what Server-Sent Events really is, how AI model streaming and multi-agent orchestration are both applications of the same mechanism. Built from real broker docs, real captured AI streams, and real agent-scheduler code, in TypeScript.">
<meta name="author" content="Pawe&#322; Pasek">
<link rel="canonical" href="https://pasekpasek.github.io/event-driven-architecture-worked-out/">

<meta property="og:type" content="article">
<meta property="og:title" content="Event-Driven Architecture, Worked Out">
<meta property="og:description" content="Queues, Server-Sent Events, and AI agents, derived from the same three facts. Every claim either verified by running real code or cited from a primary source.">
<meta property="og:url" content="https://pasekpasek.github.io/event-driven-architecture-worked-out/">
<meta property="og:image" content="https://pasekpasek.github.io/event-driven-architecture-worked-out/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A dependency graph of tasks reacting to events, with the ready set highlighted.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Event-Driven Architecture, Worked Out">
<meta name="twitter:description" content="Queues, Server-Sent Events, and AI agents, derived from the same three facts. Every claim either verified by running real code or cited from a primary source.">
<meta name="twitter:image" content="https://pasekpasek.github.io/event-driven-architecture-worked-out/og.png">
<meta name="theme-color" content="#1A2028">
<link rel="icon" href="favicon.svg" type="image/svg+xml">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Event-Driven Architecture, Worked Out",
  "description": "An interactive walkthrough of event-driven architecture: broker delivery guarantees, ordering and partitioning, Server-Sent Events, AI model streaming, and multi-agent orchestration as event-sourced systems.",
  "author": { "@type": "Person", "name": "Paweł Pasek", "url": "https://github.com/PasekPasek" },
  "inLanguage": "en",
  "keywords": "event-driven architecture, TypeScript, Kafka, SQS, SNS, EventBridge, NATS, Server-Sent Events, SSE, AI agents, event sourcing, message queue",
  "about": { "@type": "Thing", "name": "Event-driven architecture" }
}
</script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">

<style>
</style>
</head>
<body>
</body>
</html>
```

- [ ] **Step 2: Fill the `<style>` block — copy the design-token system verbatim from `event-loop-worked-out/index.html` (its `:root` block through `.fname{...}`, roughly lines 45–274 of that file), unchanged except the accent swap below**

Copy every rule from the sibling's `<style>` block. Then change only these two lines (the accent
color, so this page reads as violet-accented rather than amber-accented, while every other token —
`--plate`, `--well`, `--ink`, etc. — stays identical so the trilogy is visually a set):

```css
--live:#C79BDF; --stored:#7FA7C4; --warn:#C98A44;
```

(was `--live:#F0A94C;` in the sibling — everything downstream that references `var(--live)` picks up
the new accent automatically; no other rule needs to change.)

Leave every other selector — `.demo`, `.pane`, `.rows`, `.map`, `.tl`, `.simgrid`, `.qgrid`, `.lp`,
`.lane`, `.truths`, `table.spec`, `.caveat`, `.toc`, the `@media` blocks — exactly as in the sibling.
These are the components Tasks 7–17 build every sandbox from; do not rename or restructure them here.

- [ ] **Step 3: Write the page skeleton — header, table of contents, ten empty `<section>` shells with numbered headings, footer**

```html
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <marker id="m-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#3A4552"/></marker>
  </defs>
</svg>
<div class="wrap">

<header>
  <p class="kicker">event-driven architecture — worked out</p>
  <h1>How events actually flow, from a queue to an AI agent</h1>
  <p class="lead">A producer publishes a fact. Something, eventually, reacts to it. Everything else —
  brokers, Server-Sent Events, streaming model output, multi-agent orchestration — is a variation on
  that one relationship. This page derives event-driven architecture from three things that are
  always true, then shows the same three things underneath a Kafka topic, an <code>EventSource</code>
  connection, and a graph of AI agents reacting to each other's output.</p>
  <ol class="toc">
    <li><a href="#truths">01 — Three things always true</a></li>
    <li><a href="#build-it">02 — If you had to build it</a></li>
    <li><a href="#guarantees">03 — Delivery guarantees, for real</a></li>
    <li><a href="#ordering">04 — Ordering and partitioning</a></li>
    <li><a href="#sse">05 — What SSE actually is</a></li>
    <li><a href="#ai-streaming">06 — AI model streaming as an SSE application</a></li>
    <li><a href="#agents">07 — Agents as event-driven systems</a></li>
    <li><a href="#event-sourcing">08 — Event sourcing and agent state</a></li>
    <li><a href="#failure">09 — Failure, retries, poison messages</a></li>
    <li><a href="#rules">10 — The whole page in rules, and scope</a></li>
  </ol>
</header>

<section id="truths"><!-- Task 7 --></section>
<section id="build-it"><!-- Task 8 --></section>
<section id="guarantees"><!-- Task 9 --></section>
<section id="ordering"><!-- Task 10 --></section>
<section id="sse"><!-- Task 11 --></section>
<section id="ai-streaming"><!-- Task 13 --></section>
<section id="agents"><!-- Task 14 --></section>
<section id="event-sourcing"><!-- Task 15 --></section>
<section id="failure"><!-- Task 16 --></section>
<section id="rules"><!-- Task 17 --></section>

<footer>
  <p>Built by <a href="https://github.com/PasekPasek">Paweł Pasek</a>. Companion to
  <a href="https://github.com/PasekPasek/event-loop-worked-out">event-loop-worked-out</a> and
  <a href="https://github.com/PasekPasek/auth-worked-out">auth-worked-out</a>, which use the same
  workshop-plate design.</p>
</footer>

</div>
<script>
/* MODEL:backoff START */
/* MODEL:backoff END */

/* MODEL:sse START */
/* MODEL:sse END */

/* MODEL:scheduler START */
/* MODEL:scheduler END */
</script>
</body>
```

Note: the `<!-- Task N -->` HTML comments are placeholders for *this scaffolding step only* — they
are removed by name in Tasks 7–17, each of which replaces its own comment with real content. This is
the one place in this plan an empty marker is acceptable, because it is immediately resolved by an
enumerated, already-scheduled task, not left open-ended.

- [ ] **Step 4: Open the file directly in a browser and confirm the page renders**

```bash
python3 -m http.server 8000 &
```

Open `http://localhost:8000/` — expect: dark plate background, serif body text, header with lead
paragraph, a table of contents with 10 links, ten empty (but bordered, spaced) sections, footer with
two working links. Kill the server afterward (`kill %1`).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat: page shell, design tokens, header and section skeleton"
```

---

## Phase 2 — Reusable logic models and their verification harness

Every model lives inside `index.html`'s final `<script>` block, between its own
`/* MODEL:<name> START */` / `/* MODEL:<name> END */` markers (already stubbed in Task 2, Step 3).
`test-model.ts` (created in this phase) extracts each block by name with the same technique
`event-loop-worked-out/test-model.cjs` uses for its single `ENGINE` block, and checks it two
different ways per the design spec: against a real running system (SSE), against an independently
written oracle port of the real `4th-devs` algorithm (scheduler), or against the literal source
formula (backoff).

### Task 3: `MODEL:backoff` — exponential backoff, verified against the real formula

**Files:**
- Modify: `index.html` (fill `MODEL:backoff` block)
- Create: `test-model.ts`

- [ ] **Step 1: Write the model into `index.html`, inside the `MODEL:backoff` markers**

```js
/* MODEL:backoff START */
// Ported from 4th-devs (github.com/i-am-alice/4th-devs),
// 05_01_agent_graph/src/scheduler/recovery.ts, computeRetryDelayMs.
const BACKOFF_BASE_MS = 1500;
const BACKOFF_MAX_MS = 15000;
const MAX_AUTO_RETRY_ATTEMPTS = 3;

function computeRetryDelayMs(attempt) {
  return Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * (2 ** Math.max(0, attempt - 1)));
}
/* MODEL:backoff END */
```

- [ ] **Step 2: Create `test-model.ts` with the extraction helper and the backoff check**

```ts
// Checks the page's models against something real: a real HTTP server + real
// client for SSE, an independently-written oracle port of 4th-devs' scheduler
// algorithm for the agent scheduler, and the literal source formula for backoff.
//
//   node test-model.ts

import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

function extractModel(name: string): string {
  const re = new RegExp(`/\\* MODEL:${name} START \\*/([\\s\\S]*?)/\\* MODEL:${name} END \\*/`);
  const match = html.match(re);
  if (!match) throw new Error(`MODEL:${name} block not found in index.html`);
  return match[1];
}

function loadModel<T>(name: string, exportNames: string[]): T {
  const src = extractModel(name);
  const fn = new Function(`${src}\nreturn { ${exportNames.join(', ')} };`);
  return fn() as T;
}

let failures = 0;
function check(label: string, pass: boolean, detail?: string): void {
  if (!pass) failures++;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label}${detail ? `\n    ${detail}` : ''}`);
}

// ── backoff ──────────────────────────────────────────────────────────────
{
  const { computeRetryDelayMs } = loadModel<{ computeRetryDelayMs: (a: number) => number }>(
    'backoff',
    ['computeRetryDelayMs'],
  );
  // Real source: 4th-devs recovery.ts, BASE_RETRY_DELAY_MS=1500, MAX_RETRY_DELAY_MS=15000,
  // delay = min(max, base * 2^(attempt-1)).
  const expected = [1500, 3000, 6000, 12000, 15000, 15000];
  const got = [1, 2, 3, 4, 5, 6].map(computeRetryDelayMs);
  check(
    'backoff: matches 4th-devs recovery.ts formula for attempts 1-6',
    JSON.stringify(got) === JSON.stringify(expected),
    `expected ${JSON.stringify(expected)}, got ${JSON.stringify(got)}`,
  );
}

console.log(failures ? `\n${failures} failing` : '\nall backoff checks pass');
```

- [ ] **Step 3: Run it and confirm it fails for the right reason before the model exists — then confirm it passes**

```bash
node test-model.ts
```

Expected right now (model already written in Step 1): `PASS  backoff: matches 4th-devs recovery.ts
formula for attempts 1-6`, then `all backoff checks pass`. If you see a `MODEL:backoff block not
found` error, re-check the exact marker text in `index.html` matches
`/* MODEL:backoff START */` / `/* MODEL:backoff END */` byte-for-byte.

- [ ] **Step 4: Commit**

```bash
git add index.html test-model.ts
git commit -m "feat: backoff model, verified against the real recovery.ts formula"
```

### Task 4: `MODEL:sse` — SSE wire parser, verified against a real HTTP server

**Files:**
- Modify: `index.html` (fill `MODEL:sse` block)
- Modify: `test-model.ts`

- [ ] **Step 1: Write the parser into `index.html`, inside the `MODEL:sse` markers**

This follows the WHATWG HTML "event stream interpretation" algorithm (the same one every browser's
`EventSource` implements), simplified to the fields this page uses:

```js
/* MODEL:sse START */
function createSseParser() {
  let carry = '';
  let dataBuf = '';
  let eventType = '';
  let lastEventId = '';

  function processLine(line, out) {
    if (line === '') {
      if (dataBuf !== '') {
        out.push({
          id: lastEventId || null,
          event: eventType || 'message',
          data: dataBuf.endsWith('\n') ? dataBuf.slice(0, -1) : dataBuf,
        });
      }
      dataBuf = '';
      eventType = '';
      return;
    }
    if (line[0] === ':') return; // comment line, e.g. a keep-alive ping
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value[0] === ' ') value = value.slice(1);
    if (field === 'data') dataBuf += value + '\n';
    else if (field === 'event') eventType = value;
    else if (field === 'id' && !value.includes('\u0000')) lastEventId = value;
    // 'retry' is parsed by real browsers to set the reconnection time; this
    // model doesn't drive a real reconnect timer, so it's read and ignored.
  }

  return {
    push(chunk) {
      carry += chunk;
      const lines = carry.split(/\r\n|\r|\n/);
      carry = lines.pop();
      const out = [];
      for (const line of lines) processLine(line, out);
      return out;
    },
    get lastEventId() {
      return lastEventId;
    },
  };
}
/* MODEL:sse END */
```

- [ ] **Step 2: Add the SSE real-server check to `test-model.ts`**

This starts a real `node:http` server that speaks `text/event-stream` — deliberately splitting one
event across two separate `res.write` calls (a chunk boundary mid-field) to prove the parser handles
a field split across network packets, which is the actual reason a naive `split('\n\n')` on the
whole response body would be wrong, and that the parser tracks a running `lastEventId` as it goes.

This check does *not* exercise an actual disconnect/reconnect/`Last-Event-ID` round trip — that
scenario (4th-devs' real server always replays its whole bounded buffer on any new connection,
rather than resuming from a `Last-Event-ID` request header) is covered narratively and interactively
in §05's live page sandbox (Task 11's "disconnect + reconnect" button), not as an automated
regression check here. Don't describe this specific check as proving reconnection or deduplication
when writing or reviewing it — it only proves chunk-boundary parsing and id tracking within one
connection.

```ts
// ── sse ──────────────────────────────────────────────────────────────────
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

async function checkSse(): Promise<void> {
  const { createSseParser } = loadModel<{ createSseParser: () => {
    push(chunk: string): Array<{ id: string | null; event: string; data: string }>;
    lastEventId: string;
  } }>('sse', ['createSseParser']);

  const sent = [
    { id: '1', data: 'first' },
    { id: '2', data: 'second' },
    { id: '3', data: 'third' },
  ];

  const server = createServer((req, res) => {
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    });
    // Split the second event's "data:" line and its terminating blank line
    // across two writes, on purpose, to prove the parser buffers a partial line.
    res.write(`id: ${sent[0].id}\ndata: ${sent[0].data}\n\n`);
    res.write(`id: ${sent[1].id}\ndata: `);
    setTimeout(() => {
      res.write(`${sent[1].data}\n\n`);
      res.write(`id: ${sent[2].id}\ndata: ${sent[2].data}\n\n`);
      res.end();
    }, 20);
  });

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;

  const res = await fetch(`http://localhost:${port}/`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  const parser = createSseParser();
  const received: Array<{ id: string | null; event: string; data: string }> = [];

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    received.push(...parser.push(decoder.decode(value, { stream: true })));
  }

  server.close();

  const wantIds = sent.map((s) => s.id);
  const gotIds = received.map((e) => e.id);
  const wantData = sent.map((s) => s.data);
  const gotData = received.map((e) => e.data);

  check(
    'sse: parses 3 events split across chunk boundaries, ids in order',
    JSON.stringify(gotIds) === JSON.stringify(wantIds),
    `expected ids ${JSON.stringify(wantIds)}, got ${JSON.stringify(gotIds)}`,
  );
  check(
    'sse: data field reassembled correctly across a split mid-value',
    JSON.stringify(gotData) === JSON.stringify(wantData),
    `expected data ${JSON.stringify(wantData)}, got ${JSON.stringify(gotData)}`,
  );
  check(
    'sse: parser tracks lastEventId as the running Last-Event-ID',
    parser.lastEventId === '3',
    `expected lastEventId "3", got "${parser.lastEventId}"`,
  );
}

await checkSse();
```

Place this block after the backoff check and before the final `console.log(failures ...)` line;
move that final summary line to the very end of the file (after all three model sections) in the
next task.

- [ ] **Step 3: Run it**

```bash
node test-model.ts
```

Expected: three new `PASS` lines for the `sse:` checks, real HTTP round-trip (you'll see a brief
pause from the deliberate 20ms `setTimeout` split). If `gotData` doesn't match, the most likely bug
is not restoring the trailing partial line (`carry`) between `push()` calls — check that `carry` is
assigned from `lines.pop()` and reused on the next `push`, not reset to `''`.

- [ ] **Step 4: Commit**

```bash
git add index.html test-model.ts
git commit -m "feat: SSE parser model, verified against a real chunked HTTP server"
```

### Task 5: `MODEL:scheduler` — DAG ready-set scheduler, verified against an independent oracle port

**Files:**
- Modify: `index.html` (fill `MODEL:scheduler` block)
- Modify: `test-model.ts`

- [ ] **Step 1: Write the model into `index.html`, inside the `MODEL:scheduler` markers**

This is a simplified, plain-array port of the real DAG logic in `4th-devs`,
`05_01_agent_graph/src/scheduler/graph.ts` (`findReadyTasks`, `unblockParents`) and `loop.ts`
(`processSession`'s per-round loop), with the file-backed store replaced by an in-memory array and
the actor/LLM call replaced by a caller-supplied `runTask` function:

```js
/* MODEL:scheduler START */
// Simplified from 4th-devs (github.com/i-am-alice/4th-devs),
// 05_01_agent_graph/src/scheduler/{graph.ts,loop.ts}.
function areDependenciesMet(task, tasks) {
  return task.dependsOn.every((id) => {
    const dep = tasks.find((t) => t.id === id);
    return dep && dep.status === 'done';
  });
}

function hasUnfinishedChildren(task, tasks) {
  return tasks.some(
    (t) => t.parentId === task.id && t.status !== 'done' && t.status !== 'blocked',
  );
}

function findReadyTasks(tasks) {
  const ready = [];
  for (const task of tasks) {
    if (task.status === 'todo' && areDependenciesMet(task, tasks)) {
      ready.push(task);
    } else if (
      task.status === 'waiting'
      && areDependenciesMet(task, tasks)
      && !hasUnfinishedChildren(task, tasks)
    ) {
      task.status = 'todo';
      ready.push(task);
    }
  }
  return ready.sort((a, b) => a.priority - b.priority);
}

function unblockParents(completedTask, tasks) {
  if (!completedTask.parentId) return;
  const parent = tasks.find((t) => t.id === completedTask.parentId);
  if (!parent || parent.status !== 'waiting') return;
  if (hasUnfinishedChildren(parent, tasks)) return;
  if (!areDependenciesMet(parent, tasks)) return;
  parent.status = 'todo';
}

function runRound(tasks, runTask) {
  const events = [];
  const ready = findReadyTasks(tasks);
  for (const task of ready) {
    task.status = 'in_progress';
    events.push({ type: 'task.started', id: task.id });
    const outcome = runTask(task);
    if (outcome === 'completed') {
      task.status = 'done';
      events.push({ type: 'task.completed', id: task.id });
      unblockParents(task, tasks);
    } else {
      task.status = 'blocked';
      events.push({ type: 'task.blocked', id: task.id });
    }
  }
  return events;
}
/* MODEL:scheduler END */
```

- [ ] **Step 2: Add the scheduler check to `test-model.ts`, using an independently-written oracle**

The oracle below is deliberately *not* copy-pasted from the block above — it's written from the same
algorithm description (a fresh re-derivation from `graph.ts`/`loop.ts`), using a `Map` instead of
`Array.find` and a differently-shaped event record, so a passing test means two independent
implementations of the same real algorithm agree, not that one was pasted into the other:

```ts
// ── scheduler ────────────────────────────────────────────────────────────
interface OracleTask {
  id: string;
  status: 'todo' | 'in_progress' | 'waiting' | 'blocked' | 'done';
  dependsOn: string[];
  parentId?: string;
  priority: number;
}

function oracleRunRound(
  tasksById: Map<string, OracleTask>,
  runTask: (t: OracleTask) => 'completed' | 'blocked',
): string[] {
  const depsMet = (t: OracleTask) =>
    t.dependsOn.every((id) => tasksById.get(id)?.status === 'done');
  const unfinishedChildren = (t: OracleTask) =>
    [...tasksById.values()].some(
      (c) => c.parentId === t.id && c.status !== 'done' && c.status !== 'blocked',
    );

  const ready = [...tasksById.values()]
    .filter((t) => {
      if (t.status === 'todo') return depsMet(t);
      if (t.status === 'waiting') return depsMet(t) && !unfinishedChildren(t);
      return false;
    })
    .sort((a, b) => a.priority - b.priority);

  const trace: string[] = [];
  for (const task of ready) {
    if (task.status === 'waiting') task.status = 'todo';
    task.status = 'in_progress';
    trace.push(`start:${task.id}`);
    const outcome = runTask(task);
    task.status = outcome;
    trace.push(`${outcome}:${task.id}`);
    if (outcome === 'done' && task.parentId) {
      const parent = tasksById.get(task.parentId);
      if (parent && parent.status === 'waiting' && depsMet(parent) && !unfinishedChildren(parent)) {
        parent.status = 'todo';
      }
    }
  }
  return trace;
}

function buildFixtureGraph(): OracleTask[] {
  // fetch-price and fetch-inventory run first (no deps); price-check depends on
  // both and starts 'waiting' with an unfinished child 'sanity-check', so it
  // must NOT be ready until that child is also done; notify depends on price-check.
  return [
    { id: 'fetch-price', status: 'todo', dependsOn: [], priority: 1 },
    { id: 'fetch-inventory', status: 'todo', dependsOn: [], priority: 2 },
    { id: 'sanity-check', status: 'todo', dependsOn: [], parentId: 'price-check', priority: 0 },
    { id: 'price-check', status: 'waiting', dependsOn: ['fetch-price', 'fetch-inventory'], priority: 1 },
    { id: 'notify', status: 'todo', dependsOn: ['price-check'], priority: 1 },
  ];
}

async function checkScheduler(): Promise<void> {
  const { runRound } = loadModel<{
    runRound: (tasks: OracleTask[], runTask: (t: OracleTask) => 'completed' | 'blocked') => Array<{ type: string; id: string }>;
  }>('scheduler', ['runRound']);

  const alwaysCompletes = () => 'completed' as const;

  // Page model run.
  const pageTasks = buildFixtureGraph();
  const pageTrace: string[] = [];
  for (let round = 0; round < 5; round++) {
    const events = runRound(pageTasks, alwaysCompletes);
    if (events.length === 0) break;
    pageTrace.push(...events.map((e) => `${e.type === 'task.completed' ? 'completed' : e.type === 'task.started' ? 'start' : 'blocked'}:${e.id}`));
  }

  // Oracle run, independently written, same fixture.
  const oracleTasks = new Map(buildFixtureGraph().map((t) => [t.id, t]));
  const oracleTrace: string[] = [];
  for (let round = 0; round < 5; round++) {
    const trace = oracleRunRound(oracleTasks, () => 'done');
    if (trace.length === 0) break;
    oracleTrace.push(...trace.map((e) => e.replace('done:', 'completed:')));
  }

  check(
    'scheduler: page model matches an independently-written oracle port of 4th-devs graph.ts/loop.ts',
    JSON.stringify(pageTrace) === JSON.stringify(oracleTrace),
    `page:   ${JSON.stringify(pageTrace)}\n    oracle: ${JSON.stringify(oracleTrace)}`,
  );
  check(
    'scheduler: price-check does not run before its unfinished child sanity-check completes',
    !pageTrace.some((e) => e.startsWith('start:price-check')) || pageTrace.indexOf('completed:sanity-check') < pageTrace.indexOf('start:price-check'),
    `trace: ${JSON.stringify(pageTrace)}`,
  );
}

await checkScheduler();
```

- [ ] **Step 3: Move the summary line to the end of the file and run everything**

```ts
console.log(failures ? `\n${failures} failing` : '\nall model checks pass');
process.exit(failures ? 1 : 0);
```

(Delete the earlier, now-duplicate `console.log(failures ? ...)` line from Task 3, Step 2 — there
should be exactly one summary block, at the very end of `test-model.ts`, after the `await
checkScheduler()` call.)

```bash
node test-model.ts
```

Expected: `PASS` for all backoff, sse and scheduler checks, ending with `all model checks pass` and
exit code 0 (`echo $?`).

- [ ] **Step 4: Commit**

```bash
git add index.html test-model.ts
git commit -m "feat: DAG scheduler model, verified against an independent oracle port"
```

### Task 6: Verification harness README note

**Files:**
- Create: `VERIFICATION.md` (a short, standalone note; folded into the main `README.md` in Task 19 — kept separate here so this phase is independently reviewable)

- [ ] **Step 1: Write it**

```markdown
# What is real and what is a model

Three claims on this page are backed by running code, checked by `test-model.ts`:

- **The SSE parser** is checked against a real `node:http` server, including an event deliberately
  split across two TCP-level writes, over a real `fetch` + `ReadableStream` client.
- **The DAG scheduler** (ready-set computation, parent-unblocking) is checked against an
  independently-written oracle port of the real algorithm in `4th-devs`
  (`05_01_agent_graph/src/scheduler/graph.ts` and `loop.ts`) — two separate implementations of the
  same real logic, not one copy-pasted into the other.
- **The backoff formula** is checked against the literal formula in `4th-devs`
  (`05_01_agent_graph/src/scheduler/recovery.ts`, `computeRetryDelayMs`).

Everything about Kafka, SQS, SNS, EventBridge and NATS delivery/ordering guarantees is not modeled —
those systems aren't run locally. Those claims are cited and quoted from official documentation
instead; see the "Source material" section of `llms.txt` for the exact links.

Run the harness:

    node test-model.ts
```

- [ ] **Step 2: Commit**

```bash
git add VERIFICATION.md
git commit -m "docs: what is real vs. modeled on this page"
```

---

## Phase 3 — Content sections

Each task below replaces one `<!-- Task N -->` placeholder from Task 2, Step 3 with real markup,
following the sibling page's structural idioms exactly (`.sec-head`/`.sec-num`/`h2` header, `.lead`
opening paragraph, `.truths`/`ul.plain`/`table.spec` for structured claims, `.demo`/`.pane`/`.simgrid`
for sandboxes, `.src` for a citation line under any quoted source). Every numbered fact below must
appear somewhere in the section's prose or tables — that is the acceptance check for each task, not
a suggestion.

### Task 7: Section 1 — Three things always true about event-driven systems

**Files:**
- Modify: `index.html` (replace `<section id="truths">`)

- [ ] **Step 1: Replace the placeholder with this structure and content**

Required facts (all must appear):
1. A producer does not know who, if anyone, consumes an event — no return value, no caller identity.
2. An event describes a fact that already happened ("price.changed"), not a request for work
   ("change the price") — a consumer that fails to process it does not undo the fact.
3. Coupling moves from "who do I call" (a function reference, a service URL) to "what schema do I
   emit, what schema do I read" — runtime coupling is traded for schema coupling, not eliminated.

```html
<section id="truths">
  <div class="sec-head"><span class="sec-num">01</span><h2>Three things always true</h2></div>
  <p class="lead">Most explanations of event-driven architecture open with a diagram: boxes for
  services, arrows for messages, a cylinder for a queue. The diagram is a consequence. Start one
  level lower, with what makes something "event-driven" rather than just "asynchronous."</p>
  <ol class="truths">
    <li>A producer does not know who, if anyone, consumes an event it publishes. There is no return
      value and no caller identity — publishing is not the same operation as calling.
      <p>Contrast a function call, where the caller knows exactly what it invoked and gets a value
      back. An event has none of that: zero, one, or a hundred consumers may react, and the producer's
      code is identical in every case.</p></li>
    <li>An event describes a fact that has already happened — <code>price.changed</code>, not
      <code>change the price</code>. A consumer that fails to process it does not un-happen it.
      <p>This is why retrying a failed consumer is safe in a way retrying a failed RPC often isn't:
      the fact is still true, and processing it again should converge to the same result (see
      idempotency in §09).</p></li>
    <li>Coupling doesn't disappear, it moves: from "who do I call" (a function reference, a service
      URL) to "what shape do I emit, what shape do I expect to read." A schema change is now the
      thing that breaks consumers, not a moved endpoint.</li>
  </ol>
  <p>Everything below is one of these three facts wearing a costume: a Kafka partition is fact 1 with
  a specific answer to "how many consumers, in what order"; an SSE connection is fact 1 pointed in one
  direction only; an AI agent reacting to another agent's completion is fact 2 with the agent as both
  producer and consumer.</p>
</section>
```

- [ ] **Step 2: Reload the page and confirm the numbered-list styling (`.truths`) renders as three
  bordered, numbered blocks, matching the visual style of the equivalent list in `event-loop-worked-out`**

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(content): section 01 - three things always true"
```

### Task 8: Section 2 — If you had to build it

**Files:**
- Modify: `index.html` (replace `<section id="build-it">`)

- [ ] **Step 1: Replace the placeholder**

Required facts / artifacts (all must appear):
1. Draft 1 — an in-process `EventEmitter`: synchronous, at-most-once, everything lost on crash.
2. Draft 2 — append to a durable log before dispatch: survives a crash, but a slow/absent consumer
   still means the event is only ever delivered once, at dispatch time.
3. Draft 3 — separate producer/consumer processes, consumer tracks its own read offset into the log:
   a consumer can now restart and resume from where it left off (at-least-once becomes possible).
4. Draft 4 — acknowledge-or-redeliver: a message not acknowledged within a timeout is redelivered.
   This is the shape every real broker in §03 takes, just with different names for the timeout
   (SQS: visibility timeout; Kafka: consumer group session timeout).
5. Drafts 1-3 must each be shown as a small, real TypeScript snippet (illustrative, quoted — not
   wired into `test-model.ts`; that harness verifies the *page's later models*, not this narrative
   code). Draft 4 introduces no new mechanism to snippet — it names the same acknowledge-or-redeliver
   rule as it appears in three real systems — so it is prose plus the comparison table only.

```html
<section id="build-it">
  <div class="sec-head"><span class="sec-num">02</span><h2>If you had to build it</h2></div>
  <p class="lead">An event needs something to hold it and something to eventually call the right
  reactions. Four drafts, each fixing the last one's problem, arrive at the shape every real broker
  takes.</p>

  <h3>Draft 1 — in-process, and gone the moment it's handled</h3>
  <pre class="lit"><span class="ln">import { EventEmitter } from "node:events";</span>
<span class="ln"></span>
<span class="ln">const bus = new EventEmitter();</span>
<span class="ln">bus.on("price.changed", (e: { productId: string; price: number }) => {</span>
<span class="ln">  console.log(`repricing ${e.productId} at ${e.price}`);</span>
<span class="ln">});</span>
<span class="ln">bus.emit("price.changed", { productId: "sku-1", price: 1999 });</span></pre>
  <p>Synchronous, at-most-once, and the event never existed outside process memory: crash between
  <code>emit</code> and the listener finishing, and it's simply gone. Fine for coordinating within one
  process; not durable enough for anything that must survive a restart.</p>

  <h3>Draft 2 — durable, but dispatched once</h3>
  <pre class="lit"><span class="ln">import { appendFileSync } from "node:fs";</span>
<span class="ln"></span>
<span class="ln">function publish(event: unknown): void {</span>
<span class="ln">  appendFileSync("events.log", JSON.stringify(event) + "\n"); // durable</span>
<span class="ln">  bus.emit("price.changed", event); // still only reaches whoever is listening *now*</span>
<span class="ln">}</span></pre>
  <p>The fact survives a crash in the log. But dispatch is still a one-shot, in-memory broadcast: a
  consumer that starts five minutes later, or was down when it happened, never sees it. Durability of
  the fact and delivery to a consumer are two different problems.</p>

  <h3>Draft 3 — a reader tracks its own position</h3>
  <pre class="lit"><span class="ln">let offset = 0;</span>
<span class="ln"></span>
<span class="ln">function poll(): unknown[] {</span>
<span class="ln">  const lines = readFileSync("events.log", "utf8").trim().split("\n");</span>
<span class="ln">  const fresh = lines.slice(offset).map((l) => JSON.parse(l));</span>
<span class="ln">  offset = lines.length; // remembered *after* processing, not before</span>
<span class="ln">  return fresh;</span>
<span class="ln">}</span></pre>
  <p>Now a consumer that restarts can resume from its own <code>offset</code> instead of the
  producer's broadcast moment. But note the comment: if the process crashes after reading a line and
  before persisting the new <code>offset</code>, that event is redelivered on restart. That's not a
  bug to fix — it's the origin of "at-least-once."</p>

  <h3>Draft 4 — acknowledge or redeliver</h3>
  <p>Give every delivered-but-unacknowledged event a deadline. If it isn't acknowledged before the
  deadline, hand it out again. That single rule is a broker's visibility timeout (SQS), its consumer
  group session timeout (Kafka), and its ack-wait (NATS JetStream) — three names for the same fix to
  the same problem Draft 3 exposed.</p>
  <table class="spec">
    <thead><tr><th>Draft</th><th class="prose">What it fixes</th><th class="prose">What it still can't do</th></tr></thead>
    <tbody>
      <tr><td>1</td><td class="prose">Reacting to something, at all</td><td class="prose">Survive a crash</td></tr>
      <tr><td>2</td><td class="prose">Surviving a crash (the fact is on disk)</td><td class="prose">Deliver to a consumer that wasn't listening yet</td></tr>
      <tr><td>3</td><td class="prose">Resuming after a restart</td><td class="prose">Tell the difference between "processed" and "crashed mid-process"</td></tr>
      <tr><td>4</td><td class="prose">Redelivering what wasn't acknowledged</td><td class="prose">Guarantee a redelivery isn't processed twice (§09: idempotency)</td></tr>
    </tbody>
  </table>
</section>
```

- [ ] **Step 2: Reload and confirm the four `pre.lit` code blocks and the comparison table render**

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(content): section 02 - if you had to build it"
```

### Task 9: Section 3 — Delivery guarantees, for real

**Files:**
- Modify: `index.html` (replace `<section id="guarantees">`)

- [ ] **Step 1: Replace the placeholder**

Required facts, each cited to its official doc (all must appear, with a `.src` line linking the doc):
1. At-most-once / at-least-once / exactly-once defined precisely (0-or-1 delivery attempts with
   possible loss; 1-or-more with possible duplicates; exactly 1 observed effect).
2. Kafka: at-least-once by default; exactly-once requires an idempotent producer
   (`enable.idempotence=true`) plus a transactional consumer reading with
   `isolation.level=read_committed` — cite Kafka's own documentation/design docs on exactly-once
   semantics (Confluent/Apache Kafka docs on transactions).
3. SQS: standard queues are at-least-once with best-effort ordering (duplicates and reordering both
   possible); FIFO queues add exactly-once processing (via deduplication) and ordering, but ordering
   only within a single Message Group ID — cite AWS SQS developer guide (message ordering, exactly-once
   processing, FIFO queues).
4. SNS: fanout to multiple subscription types (SQS, Lambda, HTTP/S, email); standard topics give no
   ordering guarantee across the fanout; SNS FIFO topics (subscribable only by SQS FIFO queues)
   preserve order per message group — cite AWS SNS developer guide (message ordering, FIFO topics).
5. EventBridge: rule-based routing by pattern-matching the event's JSON; at-least-once delivery with
   automatic retries and a configurable dead-letter queue per rule target; no ordering guarantee —
   cite AWS EventBridge user guide (event delivery guarantees, retry and DLQ).

```html
<section id="guarantees">
  <div class="sec-head"><span class="sec-num">03</span><h2>Delivery guarantees, for real</h2></div>
  <p class="lead">"At-least-once" and "exactly-once" get repeated as marketing lines. Defined
  precisely, and checked against what four real systems actually document:</p>
  <ul class="plain">
    <li><strong>At-most-once</strong> — delivered zero or one times; a crash between send and receipt
    loses it silently.</li>
    <li><strong>At-least-once</strong> — delivered one or more times; a crash between processing and
    acknowledging causes a redelivery. The consumer must tolerate duplicates.</li>
    <li><strong>Exactly-once</strong> — the observed <em>effect</em> happens once, even if the
    underlying delivery is at-least-once underneath (achieved via deduplication or idempotent
    writes, not by magically never redelivering).</li>
  </ul>
  <table class="spec">
    <thead><tr><th>System</th><th class="prose">Default guarantee</th><th class="prose">Ordering</th></tr></thead>
    <tbody>
      <tr><td>Kafka</td><td class="prose">At-least-once. Exactly-once needs an idempotent producer
        (<code>enable.idempotence=true</code>) and a transactional consumer
        (<code>isolation.level=read_committed</code>).</td>
        <td class="prose">Within one partition only (§04).</td></tr>
      <tr><td>SQS standard</td><td class="prose">At-least-once, best-effort — duplicates and
        reordering both possible.</td><td class="prose">None.</td></tr>
      <tr><td>SQS FIFO</td><td class="prose">Exactly-once processing via deduplication.</td>
        <td class="prose">Within one Message Group ID only.</td></tr>
      <tr><td>SNS standard</td><td class="prose">At-least-once per subscriber.</td>
        <td class="prose">None across the fanout.</td></tr>
      <tr><td>SNS FIFO</td><td class="prose">Exactly-once, SQS FIFO subscribers only.</td>
        <td class="prose">Within one message group.</td></tr>
      <tr><td>EventBridge</td><td class="prose">At-least-once, automatic retry, per-rule DLQ.</td>
        <td class="prose">None.</td></tr>
    </tbody>
  </table>
  <p class="src">Sources: <a href="https://kafka.apache.org/documentation/#semantics">Apache Kafka
  documentation — message delivery semantics</a>; <a href="https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html">AWS SQS developer guide — FIFO queues</a>;
  <a href="https://docs.aws.amazon.com/sns/latest/dg/fifo-topics.html">AWS SNS developer guide — FIFO
  topics</a>; <a href="https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-basic-concepts.html">AWS EventBridge user guide</a>.</p>
  <p class="caveat">None of these are run locally on this page — there's no browser-executable
  "real Kafka" to diff against, the way libuv could be diffed for the event loop page. These rows are
  quoted from the vendors' own documentation, not independently reproduced.</p>
</section>
```

- [ ] **Step 2: Click through both linked docs pages to confirm the URLs are current and match the
  claims (AWS and Kafka occasionally restructure their docs URLs) — fix any that 404**

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(content): section 03 - delivery guarantees for real"
```

### Task 10: Section 4 — Ordering and partitioning

**Files:**
- Modify: `index.html` (replace `<section id="ordering">`)

- [ ] **Step 1: Replace the placeholder**

Required facts (all must appear):
1. "The event happened first" is not the same claim as "a consumer sees it first" — something has to
   enforce it.
2. Kafka orders messages only within a partition; a topic's overall order across partitions is
   undefined; a producer picks the partition via a key (same key → same partition → ordered relative
   to each other).
3. SQS FIFO orders only within a Message Group ID; two different group IDs give no relative
   ordering guarantee.
4. A sandbox: two or three lettered "partitions", each an independently-advancing sequence, that the
   reader can feed events into (by clicking) and see interleaved into a single combined timeline,
   with a toggle for "same key" vs. "different keys" to show when ordering is/isn't preserved.

```html
<section id="ordering">
  <div class="sec-head"><span class="sec-num">04</span><h2>Ordering and partitioning</h2></div>
  <p class="lead">"The event happened first" and "a consumer sees it first" are different claims.
  Nothing connects them unless a specific mechanism does.</p>
  <p>Kafka orders messages only <em>within</em> a partition. A topic's messages across partitions have
  no defined relative order at all. A producer picks the partition via a key — same key, same
  partition, so events for that key are ordered relative to each other, but two different keys give
  no guarantee either way. SQS FIFO does the equivalent with a Message Group ID instead of a
  partition key: order is preserved only within one group.</p>
  <div class="demo">
    <h4>Sandbox — partition key vs. ordering</h4>
    <div class="ctl">
      <label><input type="radio" name="pk-mode" value="same" checked> same key for every event</label>
      <label><input type="radio" name="pk-mode" value="mixed"> mixed keys (sku-1 / sku-2)</label>
    </div>
    <div class="controls">
      <button type="button" data-emit="sku-1">emit for sku-1</button>
      <button type="button" data-emit="sku-2">emit for sku-2</button>
      <button type="button" class="ghost" data-reset>reset</button>
    </div>
    <div class="qgrid">
      <div class="pane"><h4>partition 0</h4><ul class="rows" data-partition="0"><li class="empty">(empty)</li></ul></div>
      <div class="pane"><h4>partition 1</h4><ul class="rows" data-partition="1"><li class="empty">(empty)</li></ul></div>
      <div class="pane wide"><h4>consumer sees (topic order)</h4><ul class="rows" data-combined><li class="empty">(empty)</li></ul></div>
    </div>
    <p class="hint" data-hint>Click "emit" a few times in "mixed keys" mode: sku-1 and sku-2 land in
    different partitions, and the combined view shows them interleaved — sku-1's events stay ordered
    relative to each other, sku-2's stay ordered relative to each other, but the two sequences
    interleave arbitrarily.</p>
  </div>
</section>
```

- [ ] **Step 2: Add the sandbox's driving script, inline right before `</body>`, after the existing
  `<script>` block's model markers (this is page-only interactive glue, not one of the three verified
  models — no `MODEL:` markers needed)**

```html
<script>
(() => {
  const partitions = { 0: [], 1: [] };
  const combined = [];
  const keyToPartition = (key) => (key === 'sku-1' ? 0 : 1);
  const root = document.getElementById('ordering');
  if (!root) return;

  function render() {
    for (const p of [0, 1]) {
      const el = root.querySelector(`[data-partition="${p}"]`);
      el.innerHTML = partitions[p].length
        ? partitions[p].map((e) => `<li>${e}</li>`).join('')
        : '<li class="empty">(empty)</li>';
    }
    const combinedEl = root.querySelector('[data-combined]');
    combinedEl.innerHTML = combined.length
      ? combined.map((e) => `<li>${e}</li>`).join('')
      : '<li class="empty">(empty)</li>';
  }

  root.querySelectorAll('[data-emit]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = root.querySelector('input[name="pk-mode"]:checked').value;
      const key = mode === 'same' ? 'sku-1' : btn.dataset.emit;
      const seq = partitions[keyToPartition(key)].length + 1;
      const label = `${key} #${seq}`;
      partitions[keyToPartition(key)].push(label);
      combined.push(label);
      render();
    });
  });
  root.querySelector('[data-reset]').addEventListener('click', () => {
    partitions[0] = []; partitions[1] = []; combined.length = 0; render();
  });
  render();
})();
</script>
```

- [ ] **Step 3: In the browser, click "emit for sku-1" three times in "mixed keys" mode, then "emit for
  sku-2" twice, then back to sku-1 once — confirm partition 0 shows only sku-1 events in order,
  partition 1 shows only sku-2 events in order, and the combined view shows all six in the order
  clicked (demonstrating that combined/topic order is just "arrival order," not a guarantee)**

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(content): section 04 - ordering and partitioning, with sandbox"
```

### Task 11: Section 5 — What SSE actually is

**Files:**
- Modify: `index.html` (replace `<section id="sse">`, wire the `MODEL:sse` parser into a live sandbox)

- [ ] **Step 1: Replace the placeholder**

Required facts (all must appear — this is the explicit "explain what SSE is" content the user asked
for directly):
1. SSE = Server-Sent Events: one HTTP response, kept open, `Content-Type: text/event-stream`, the
   server keeps writing to it — one-directional, server → client only, over plain HTTP (no upgrade,
   unlike WebSocket).
2. The wire format: lines of `field: value`; a blank line dispatches the buffered event; the fields
   are `data:` (payload, can repeat and is joined with newlines), `event:` (event type, default
   `"message"`), `id:` (sets the reconnect checkpoint), `retry:` (reconnection delay in ms).
3. The browser's native `EventSource` API: `new EventSource(url)`, `.onmessage`, `.addEventListener`
   for named event types, and — the reason `id:` matters — automatic reconnection on drop, resending
   the last-seen id as a `Last-Event-ID` request header so the server can resume (or, as the real
   `4th-devs` server does, just replay everything from a bounded buffer and let the client
   re-render — a simpler, correct-enough choice quoted directly).
4. Grounded in the real code: quote the actual `sseHandler` from `4th-devs`
   (`05_01_agent_graph/src/server.ts`) and the actual client line
   (`05_01_agent_graph/src/dashboard/app.js`, `new EventSource("/events")`).
5. A live sandbox: the reader types/pastes raw SSE bytes into a "server" textarea (or clicks preset
   buttons), the `MODEL:sse` parser (extracted for real by `test-model.ts`, run here in the browser
   unmodified) parses it live, and a "client sees" panel shows the resulting events — plus a
   "disconnect / reconnect" button that clears the panel and re-feeds the same buffer, demonstrating
   replay.

```html
<section id="sse">
  <div class="sec-head"><span class="sec-num">05</span><h2>What SSE actually is</h2></div>
  <p class="lead">Server-Sent Events: one HTTP response that never ends. No upgrade handshake, no new
  protocol — just <code>Content-Type: text/event-stream</code> on an ordinary response the server
  keeps writing to, and a client that knows how to read it as a sequence of events instead of one
  blob. One direction only: server to client. A client that wants to talk back makes a separate,
  ordinary HTTP request.</p>
  <h3>The wire format</h3>
  <p>The body is lines of <code>field: value</code>. A blank line means "dispatch what's buffered so
  far":</p>
  <pre class="lit"><span class="ln">id: 42</span>
<span class="ln">event: task.completed</span>
<span class="ln">data: {"taskId":"write-intro","actor":"writer"}</span>
<span class="ln"></span>
<span class="ln">data: a plain message with no id or type — dispatched as "message"</span>
<span class="ln"></span></pre>
  <ul class="plain">
    <li><code>data:</code> — the payload. Multiple <code>data:</code> lines before a blank line are
    joined with newlines into one event.</li>
    <li><code>event:</code> — the event type a client can filter on with
    <code>addEventListener(type, ...)</code>; omitted, it dispatches as the generic
    <code>"message"</code> event.</li>
    <li><code>id:</code> — the reconnect checkpoint. The browser remembers the last one it saw and
    resends it as a <code>Last-Event-ID</code> request header if the connection drops and it
    reconnects.</li>
    <li><code>retry:</code> — how many milliseconds to wait before that automatic reconnect.</li>
  </ul>
  <h3>Real code, not a paraphrase</h3>
  <p>A minimal SSE server is a handful of lines. This one is quoted, unmodified, from
  <code>4th-devs</code> (an open-source agent-orchestration course repository):</p>
  <pre class="lit"><span class="ln">res.writeHead(200, {</span>
<span class="ln">  'content-type': 'text/event-stream',</span>
<span class="ln">  'cache-control': 'no-cache',</span>
<span class="ln">  connection: 'keep-alive',</span>
<span class="ln">})</span>
<span class="ln">res.flushHeaders()</span>
<span class="ln">for (const past of replay()) res.write(`data: ${JSON.stringify(past)}\n\n`)</span>
<span class="ln">const unsubscribe = subscribe(event => res.write(`data: ${JSON.stringify(event)}\n\n`))</span></pre>
  <p class="src">Source: <a href="https://github.com/i-am-alice/4th-devs/blob/main/05_01_agent_graph/src/server.ts">4th-devs, 05_01_agent_graph/src/server.ts</a> (<code>sseHandler</code>).</p>
  <p>Notice it replays every buffered past event on every new connection, unconditionally — it never
  reads a <code>Last-Event-ID</code> header at all. That's a legitimate, simpler design for a small
  bounded buffer: the client re-renders from scratch and de-duplicates by id, so exact resumption
  doesn't need to be the server's job. The client side is equally small:</p>
  <pre class="lit"><span class="ln">const es = new EventSource("/events");</span>
<span class="ln">es.onmessage = (e) => { const ev = JSON.parse(e.data); handleEvent(ev); };</span></pre>
  <p class="src">Source: <a href="https://github.com/i-am-alice/4th-devs/blob/main/05_01_agent_graph/src/dashboard/app.js">4th-devs, 05_01_agent_graph/src/dashboard/app.js</a>.</p>

  <div class="demo">
    <h4>Sandbox — the same parser this page's <code>test-model.ts</code> runs against a real server</h4>
    <div class="simgrid">
      <div class="pane">
        <h4>raw bytes over the wire</h4>
        <textarea data-sse-input rows="6" style="width:100%;background:var(--well);color:var(--ink);border:1px solid var(--etch);border-radius:var(--r);font-family:'IBM Plex Mono',monospace;font-size:12px;padding:10px">id: 1
data: {"type":"task.started","id":"fetch-price"}

id: 2
data: {"type":"task.completed","id":"fetch-price"}
</textarea>
      </div>
      <div class="pane">
        <h4>what the client sees</h4>
        <ul class="rows" data-sse-out><li class="empty">(click "send")</li></ul>
      </div>
    </div>
    <div class="controls">
      <button type="button" data-sse-send>send</button>
      <button type="button" class="ghost" data-sse-reconnect>disconnect + reconnect (replay)</button>
    </div>
    <p class="hint" data-sse-hint>"send" feeds the raw bytes above through the exact
    <code>createSseParser</code> function this page verifies against a real chunked HTTP server.
    "disconnect + reconnect" clears the client panel and re-feeds the same buffer, the way
    <code>4th-devs</code>'s server replays on every new connection.</p>
  </div>
</section>
```

- [ ] **Step 2: Wire the sandbox — add this script after the `MODEL:sse` block in the final `<script>`
  section (it calls `createSseParser`, which is now in scope on the page since the model block runs
  unmodified in the browser too, not only inside `test-model.ts`'s extraction)**

```html
<script>
(() => {
  const root = document.getElementById('sse');
  if (!root) return;
  const input = root.querySelector('[data-sse-input]');
  const out = root.querySelector('[data-sse-out]');
  let parser = createSseParser();
  let events = [];

  function renderEvents() {
    out.innerHTML = events.length
      ? events.map((e) => `<li><span>${e.event}</span><span class="who">id ${e.id ?? '—'}</span></li><li class="empty">${e.data}</li>`).join('')
      : '<li class="empty">(click "send")</li>';
  }

  root.querySelector('[data-sse-send]').addEventListener('click', () => {
    events.push(...parser.push(input.value));
    renderEvents();
  });
  root.querySelector('[data-sse-reconnect]').addEventListener('click', () => {
    parser = createSseParser();
    events = [];
    renderEvents();
  });
})();
</script>
```

- [ ] **Step 3: In the browser, click "send" — confirm two events appear (task.started / task.completed,
  ids 1 and 2). Click "disconnect + reconnect" — confirm the panel clears. Click "send" again — confirm
  both events reappear, demonstrating the replay-everything behavior described in the prose**

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(content): section 05 - what SSE actually is, with a live parser sandbox"
```

### Task 12: Capture a real AI streaming fixture

**Files:**
- Create: `fixtures/ai-stream-tool-call.json`
- Create: `fixtures/capture-ai-stream.sh` (kept in the repo so the capture is reproducible, not a one-off)

- [ ] **Step 1: Write the capture script**

```bash
#!/usr/bin/env bash
# Captures one real Anthropic Messages API streaming turn that uses a tool call,
# and saves both the raw SSE bytes and a structured summary as a fixture for
# section 06. Requires ANTHROPIC_API_KEY to be set. Costs a handful of tokens.
set -euo pipefail

: "${ANTHROPIC_API_KEY:?Set ANTHROPIC_API_KEY first}"

RAW_OUT="$(dirname "$0")/ai-stream-raw.txt"

curl -sS https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-5",
    "max_tokens": 300,
    "stream": true,
    "tools": [{
      "name": "get_weather",
      "description": "Get the current weather for a city",
      "input_schema": {
        "type": "object",
        "properties": { "city": { "type": "string" } },
        "required": ["city"]
      }
    }],
    "messages": [{ "role": "user", "content": "What is the weather in Warsaw? Use the tool." }]
  }' > "$RAW_OUT"

echo "Raw SSE bytes saved to $RAW_OUT"
echo "Now run: node fixtures/build-fixture.mjs"
```

```bash
chmod +x fixtures/capture-ai-stream.sh
```

- [ ] **Step 2: Write a small build script that turns the raw capture into the page's fixture shape**

```js
// fixtures/build-fixture.mjs
// Parses the raw SSE capture (fixtures/ai-stream-raw.txt) into the ordered list
// of {event, data} chunks the page's section-06 stepper walks through.
import { readFileSync, writeFileSync } from 'node:fs';

const raw = readFileSync(new URL('./ai-stream-raw.txt', import.meta.url), 'utf8');
const chunks = [];
let eventType = '';
let dataLines = [];

function flush() {
  if (dataLines.length === 0) return;
  chunks.push({ event: eventType || 'message', data: JSON.parse(dataLines.join('\n')) });
  eventType = '';
  dataLines = [];
}

for (const line of raw.split(/\r?\n/)) {
  if (line === '') { flush(); continue; }
  if (line.startsWith('event:')) { eventType = line.slice(6).trim(); continue; }
  if (line.startsWith('data:')) { dataLines.push(line.slice(5).trim()); continue; }
}
flush();

writeFileSync(
  new URL('./ai-stream-tool-call.json', import.meta.url),
  JSON.stringify({
    captured_at: new Date().toISOString().slice(0, 10),
    model: chunks.find((c) => c.event === 'message_start')?.data?.message?.model ?? 'unknown',
    chunks,
  }, null, 2),
);
console.log(`Wrote fixtures/ai-stream-tool-call.json with ${chunks.length} chunks`);
```

- [ ] **Step 3: Run the capture (requires the user's own `ANTHROPIC_API_KEY`)**

```bash
export ANTHROPIC_API_KEY=...   # the user's own key; not committed anywhere
./fixtures/capture-ai-stream.sh
node fixtures/build-fixture.mjs
```

Expected: `fixtures/ai-stream-tool-call.json` now exists with a `chunks` array starting with a
`message_start` event and ending with `message_stop`, including at least one `content_block_start`
with `type: "tool_use"` and one or more `input_json_delta` chunks building up the tool arguments.

If the model declines to call the tool (varies by prompt), adjust the user message to be more
directive ("You must call get_weather for Warsaw") and re-run.

- [ ] **Step 4: Confirm `fixtures/ai-stream-raw.txt` is excluded from history if it contains anything
  sensitive (it shouldn't — it's just the API response body) and commit both the script and the
  built JSON fixture; do not commit the API key**

```bash
git add fixtures/capture-ai-stream.sh fixtures/build-fixture.mjs fixtures/ai-stream-tool-call.json
git commit -m "feat: capture a real Anthropic streaming tool-call turn as a fixture"
```

### Task 13: Section 6 — AI model streaming as an SSE application

**Files:**
- Modify: `index.html` (replace `<section id="ai-streaming">`)

- [ ] **Step 1: Replace the placeholder**

Required facts (all must appear):
1. The realization: "streaming a chat response" is section 5's exact mechanism (`text/event-stream`,
   `EventSource`-compatible), with a specific event schema on top.
2. Anthropic's documented event sequence for a turn: `message_start` → one or more content blocks,
   each `content_block_start` → repeated `content_block_delta` → `content_block_stop` →
   `message_delta` (carries `stop_reason`) → `message_stop`; a `ping` event may appear as a
   keep-alive.
3. A tool call arrives as a `content_block_start` with `type: "tool_use"`, whose `input` field is
   built incrementally via `input_json_delta` chunks containing a `partial_json` string fragment —
   the caller must accumulate the fragments and only attempt to `JSON.parse` once
   `content_block_stop` arrives, exactly mirroring §05's "data buffer, dispatched on a boundary."
4. A stepper sandbox that walks the real captured fixture (Task 12) chunk by chunk, showing: which
   SSE event type this is, the running assembled text (for text deltas), and the running raw JSON
   string for tool input deltas — deliberately showing it as *not yet valid JSON* until the block
   closes, to make the accumulation point concrete rather than asserted.

```html
<section id="ai-streaming">
  <div class="sec-head"><span class="sec-num">06</span><h2>AI model streaming as an SSE application</h2></div>
  <p class="lead">"The model streams its response" is section 5, with a schema. Set
  <code>stream: true</code> on an Anthropic Messages API call and the response is exactly a
  <code>text/event-stream</code>, readable by the same <code>EventSource</code>-shaped logic — only
  now the event types and payloads are documented, not ad hoc.</p>
  <p>One turn is a fixed sequence: <code>message_start</code> (the message shell, with an empty
  content array), then per content block <code>content_block_start</code> →
  repeated <code>content_block_delta</code> → <code>content_block_stop</code>, then
  <code>message_delta</code> (carrying the final <code>stop_reason</code>) and
  <code>message_stop</code>. A <code>ping</code> event may appear between deltas purely as a
  keep-alive, with no content of its own — the same role as the <code>: connected</code> comment
  line a raw SSE server can send.</p>
  <p>A tool call is a content block whose <code>content_block_start</code> has
  <code>"type": "tool_use"</code> and a <em>partial</em>, growing set of arguments: each
  <code>content_block_delta</code> for that block carries an
  <code>input_json_delta</code> with a <code>partial_json</code> string fragment, not a complete
  value. The fragments must be concatenated and are only guaranteed parseable once
  <code>content_block_stop</code> closes the block — the exact same "buffer until the boundary" rule
  as an SSE <code>data:</code> field in §05, one level up the stack.</p>

  <div class="demo">
    <h4>Sandbox — stepping through a real captured tool-call turn</h4>
    <div class="simgrid">
      <div class="pane">
        <h4>SSE event</h4>
        <pre data-ai-event style="margin:0">(press "next chunk")</pre>
      </div>
      <div class="pane">
        <h4>accumulated so far</h4>
        <div data-ai-text style="font-family:'IBM Plex Mono',monospace;font-size:12.5px;white-space:pre-wrap"></div>
        <h4 style="margin-top:14px">tool input (raw, may not be valid JSON yet)</h4>
        <div data-ai-tool style="font-family:'IBM Plex Mono',monospace;font-size:12.5px;white-space:pre-wrap;color:var(--stored)"></div>
      </div>
    </div>
    <div class="controls">
      <button type="button" data-ai-next>next chunk</button>
      <button type="button" class="ghost" data-ai-reset>reset</button>
    </div>
    <p class="hint" data-ai-hint>Captured from a real Anthropic Messages API call — see
    <code>fixtures/ai-stream-tool-call.json</code> for the exact bytes.</p>
  </div>
</section>
```

- [ ] **Step 2: Wire the stepper — fetches the fixture and steps through it**

```html
<script>
(() => {
  const root = document.getElementById('ai-streaming');
  if (!root) return;
  const eventEl = root.querySelector('[data-ai-event]');
  const textEl = root.querySelector('[data-ai-text]');
  const toolEl = root.querySelector('[data-ai-tool]');
  let chunks = [];
  let i = 0;
  let text = '';
  let toolJson = '';

  function render() {
    if (i === 0) {
      eventEl.textContent = '(press "next chunk")';
      return;
    }
    const c = chunks[i - 1];
    eventEl.textContent = `${c.event}\n${JSON.stringify(c.data, null, 2)}`;
    textEl.textContent = text || '(no text yet)';
    toolEl.textContent = toolJson || '(no tool call yet)';
  }

  function apply(c) {
    if (c.event === 'content_block_delta' && c.data.delta?.type === 'text_delta') {
      text += c.data.delta.text;
    }
    if (c.event === 'content_block_delta' && c.data.delta?.type === 'input_json_delta') {
      toolJson += c.data.delta.partial_json;
    }
  }

  fetch('fixtures/ai-stream-tool-call.json')
    .then((r) => r.json())
    .then((fixture) => { chunks = fixture.chunks; });

  root.querySelector('[data-ai-next]').addEventListener('click', () => {
    if (i >= chunks.length) return;
    apply(chunks[i]);
    i++;
    render();
  });
  root.querySelector('[data-ai-reset]').addEventListener('click', () => {
    i = 0; text = ''; toolJson = ''; render();
  });
})();
</script>
```

- [ ] **Step 3: Serve over HTTP (the `fetch` for the fixture needs a server, not `file://`) and step
  through every chunk, confirming: the tool-input panel shows a growing, syntactically-incomplete JSON
  string until the block closes, then stops changing; the text panel accumulates word by word for the
  text block(s)**

```bash
python3 -m http.server 8000
```

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(content): section 06 - AI streaming as an SSE application, with a real fixture stepper"
```

### Task 14: Section 7 — Agents as event-driven systems

**Files:**
- Modify: `index.html` (replace `<section id="agents">`, wire `MODEL:scheduler` into a live sandbox)

- [ ] **Step 1: Replace the placeholder**

Required facts (all must appear):
1. An agent loop (plan → act → observe → replan) is a consumer reacting to events: its own tool
   results, another agent's completion, a human's answer to a posed question.
2. Multi-agent orchestration as a DAG of tasks with `depends_on` edges; the "ready set" — tasks whose
   dependencies are all `done` — is recomputed every round, exactly like `findReadyTasks` in the
   verified model.
3. The heartbeat round loop from `4th-devs` as the agent-world analogue of the event loop's phases:
   emit `heartbeat.started` → reconcile blocks/unblocks → resolve waiting-human tasks → each agent
   claims one task and runs → emit `heartbeat.idle` or `heartbeat.finished` → persist a round
   snapshot. Quoted from `03_02_events/docs/heartbeat.md`.
4. A sandbox: the exact fixture graph from `test-model.ts`'s scheduler check (fetch-price /
   fetch-inventory / sanity-check / price-check / notify), stepped round by round with a "run next
   round" button, showing the ready set, which tasks started/completed, and parent-unblocking as it
   happens — using the identical `runRound`/`findReadyTasks` functions from `MODEL:scheduler`, so the
   sandbox is provably the same code the test harness verified.

```html
<section id="agents">
  <div class="sec-head"><span class="sec-num">07</span><h2>Agents as event-driven systems</h2></div>
  <p class="lead">An agent's "loop" — plan, act, observe, replan — is a consumer reacting to events:
  its own tool result, another agent's completion, a human answering a question it posed. Wire
  several agents together and the whole system is a graph of tasks reacting to each other's
  <code>done</code> events.</p>
  <p>A real open-source agent-orchestration course (<code>4th-devs</code>) implements this as a DAG:
  each task lists what it <code>dependsOn</code>; every round, the scheduler recomputes the
  <em>ready set</em> — tasks whose dependencies are all <code>done</code> — and only those run. Its
  round loop is the agent-world analogue of the event loop's phases:</p>
  <ol class="plain">
    <li>Emit <code>heartbeat.started</code>.</li>
    <li>Reconcile dependency blocks/unblocks.</li>
    <li>Resolve waiting-on-a-human tasks.</li>
    <li>Each agent claims one open task, runs it, the status transition is emitted as an event.</li>
    <li>Emit <code>heartbeat.idle</code> if nothing was claimable, or mark the project done.</li>
    <li>Emit <code>heartbeat.finished</code>; persist a snapshot of the round.</li>
  </ol>
  <p class="src">Source: <a href="https://github.com/i-am-alice/4th-devs/blob/main/03_02_events/docs/heartbeat.md">4th-devs, 03_02_events/docs/heartbeat.md</a>.</p>

  <div class="demo">
    <h4>Sandbox — the exact scheduler this page's <code>test-model.ts</code> verifies</h4>
    <div class="mapwrap">
      <svg class="map" viewBox="0 0 560 220" data-agent-map></svg>
    </div>
    <div class="controls">
      <button type="button" data-agent-round>run next round</button>
      <button type="button" class="ghost" data-agent-reset>reset</button>
    </div>
    <p class="hint" data-agent-hint>fetch-price and fetch-inventory have no dependencies and are ready
    immediately. price-check depends on both <em>and</em> waits on its child sanity-check — watch it
    stay un-ready even after round 1. notify depends on price-check.</p>
  </div>
</section>
```

- [ ] **Step 2: Wire the sandbox — reuses `findReadyTasks`/`runRound` from `MODEL:scheduler` directly
  (no reimplementation), rendering the same fixture graph as an SVG node map using the existing
  `.map` CSS component**

```html
<script>
(() => {
  const root = document.getElementById('agents');
  if (!root) return;

  const positions = {
    'fetch-price': [70, 40], 'fetch-inventory': [70, 140],
    'sanity-check': [280, 190], 'price-check': [280, 90], 'notify': [470, 90],
  };
  function buildTasks() {
    return [
      { id: 'fetch-price', status: 'todo', dependsOn: [], priority: 1 },
      { id: 'fetch-inventory', status: 'todo', dependsOn: [], priority: 2 },
      { id: 'sanity-check', status: 'todo', dependsOn: [], parentId: 'price-check', priority: 0 },
      { id: 'price-check', status: 'waiting', dependsOn: ['fetch-price', 'fetch-inventory'], priority: 1 },
      { id: 'notify', status: 'todo', dependsOn: ['price-check'], priority: 1 },
    ];
  }
  let tasks = buildTasks();
  const edges = [
    ['fetch-price', 'price-check'], ['fetch-inventory', 'price-check'],
    ['sanity-check', 'price-check'], ['price-check', 'notify'],
  ];

  function render() {
    const svg = root.querySelector('[data-agent-map]');
    const boxes = tasks.map((t) => {
      const [x, y] = positions[t.id];
      const cls = t.status === 'done' ? 'root' : t.status === 'in_progress' ? 'ab' : '';
      return `<g class="ab ${cls}" transform="translate(${x},${y})">
        <rect width="150" height="34" rx="4"/>
        <text x="75" y="21" text-anchor="middle">${t.id} · ${t.status}</text>
      </g>`;
    }).join('');
    const lines = edges.map(([from, to]) => {
      const [x1, y1] = positions[from]; const [x2, y2] = positions[to];
      return `<path class="e" d="M${x1 + 150},${y1 + 17} L${x2},${y2 + 17}"/>`;
    }).join('');
    svg.innerHTML = lines + boxes;
  }

  root.querySelector('[data-agent-round]').addEventListener('click', () => {
    const events = runRound(tasks, () => 'completed');
    root.querySelector('[data-agent-hint]').textContent = events.length
      ? events.map((e) => `${e.type}:${e.id}`).join('  →  ')
      : 'No ready tasks this round — everything is either done or still blocked/waiting.';
    render();
  });
  root.querySelector('[data-agent-reset]').addEventListener('click', () => {
    tasks = buildTasks();
    render();
  });
  render();
})();
</script>
```

- [ ] **Step 3: In the browser, click "run next round" repeatedly — confirm round 1 completes
  fetch-price and fetch-inventory (sanity-check has no deps either, so it also completes round 1);
  round 2 completes price-check (now unblocked); round 3 completes notify; round 4 shows the "no
  ready tasks" message**

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(content): section 07 - agents as event-driven systems, live DAG sandbox"
```

### Task 15: Section 8 — Event sourcing and agent state

**Files:**
- Modify: `index.html` (replace `<section id="event-sourcing">`)

- [ ] **Step 1: Replace the placeholder**

Required facts (all must appear):
1. State is not stored directly; it's derived by folding over an append-only event log — the
   `events.jsonl` pattern real `4th-devs` uses, quoted from `03_02_events/docs/schemas.md`.
2. Why this gives crash recovery and observability "for free": replaying the log from empty state
   reconstructs exactly what happened, and any point in the log is an audit trail, not just a
   snapshot.
3. Where it breaks down, named honestly (not built): unbounded log growth, needing snapshots/
   compaction eventually (Kafka's own log compaction is the production answer to this).
4. A scrubber sandbox: a small fixed event log (5-8 events describing a task board's history), a
   range-input the reader drags, and a "state at this point" panel recomputed live by folding the log
   up to the dragged index — making "state = fold over events" concrete rather than asserted.

```html
<section id="event-sourcing">
  <div class="sec-head"><span class="sec-num">08</span><h2>Event sourcing and agent state</h2></div>
  <p class="lead">Nothing so far has stored "the current state" anywhere. It's derived: replay the
  event log from empty, and you have it. That's not an implementation detail — it's a deliberate
  trade of storage simplicity for compute-on-read.</p>
  <p><code>4th-devs</code> writes exactly this: an append-only <code>events.jsonl</code>, one JSON
  object per line, that's never edited, only appended to:</p>
  <pre class="lit"><span class="ln">{"type":"task.completed","round":3,"at":"2026-02-16T12:00:00.000Z",</span>
<span class="ln"> "agent":"writer","taskId":"write-events-section",</span>
<span class="ln"> "data":{"turns":2,"estimated_tokens":1800,"actual_tokens":1690}}</span></pre>
  <p class="src">Source: <a href="https://github.com/i-am-alice/4th-devs/blob/main/03_02_events/docs/schemas.md">4th-devs, 03_02_events/docs/schemas.md</a>.</p>
  <p>Two things fall out for free. Crash recovery: restart, replay the log, and the in-memory state is
  exactly what it was — there is no separate "did the state file get corrupted" failure mode, because
  there never was a state file, only the log. Observability: any question about "what happened, and
  when" is answerable by reading the log, not by having remembered to instrument that specific
  question in advance.</p>
  <p class="caveat">It doesn't stay free. A log that only ever grows eventually costs more to replay
  than a snapshot would cost to load — which is exactly why Kafka ships log compaction (keeping only
  the latest record per key) as a first-class feature, not an afterthought. Snapshotting is named
  here, not built: out of scope for this page (§10).</p>

  <div class="demo">
    <h4>Sandbox — state as a fold over the log</h4>
    <div class="ctl">
      <input type="range" min="0" max="6" value="0" data-log-scrub>
      <output data-log-count>0 / 6 events applied</output>
    </div>
    <div class="qgrid">
      <div class="pane wide"><h4>event log</h4><ol class="rows" data-log-events></ol></div>
      <div class="pane wide"><h4>state at this point (folded)</h4><pre data-log-state style="margin:0"></pre></div>
    </div>
  </div>
</section>
```

- [ ] **Step 2: Wire the scrubber**

```html
<script>
(() => {
  const root = document.getElementById('event-sourcing');
  if (!root) return;
  const log = [
    { type: 'task.created', taskId: 'fetch-price' },
    { type: 'task.created', taskId: 'notify' },
    { type: 'task.started', taskId: 'fetch-price', agent: 'researcher' },
    { type: 'task.completed', taskId: 'fetch-price', agent: 'researcher' },
    { type: 'task.started', taskId: 'notify', agent: 'writer' },
    { type: 'task.blocked', taskId: 'notify', reason: 'missing recipient' },
    { type: 'task.completed', taskId: 'notify', agent: 'writer' },
  ];
  const scrub = root.querySelector('[data-log-scrub]');
  scrub.max = String(log.length);
  const countEl = root.querySelector('[data-log-count]');
  const eventsEl = root.querySelector('[data-log-events]');
  const stateEl = root.querySelector('[data-log-state]');

  eventsEl.innerHTML = log.map((e, i) => `<li data-idx="${i}">${e.type} — ${e.taskId}</li>`).join('');

  function fold(upTo) {
    const state = {};
    for (let i = 0; i < upTo; i++) {
      const e = log[i];
      state[e.taskId] = state[e.taskId] || {};
      if (e.type === 'task.created') state[e.taskId].status = 'todo';
      if (e.type === 'task.started') { state[e.taskId].status = 'in_progress'; state[e.taskId].agent = e.agent; }
      if (e.type === 'task.completed') state[e.taskId].status = 'done';
      if (e.type === 'task.blocked') { state[e.taskId].status = 'blocked'; state[e.taskId].reason = e.reason; }
    }
    return state;
  }

  function render() {
    const n = Number(scrub.value);
    countEl.textContent = `${n} / ${log.length} events applied`;
    stateEl.textContent = JSON.stringify(fold(n), null, 2);
    eventsEl.querySelectorAll('li').forEach((li) => {
      li.classList.toggle('fx', Number(li.dataset.idx) < n);
    });
  }
  scrub.addEventListener('input', render);
  render();
})();
</script>
```

- [ ] **Step 3: Drag the slider through 0 → 7, confirming the state panel updates live: `fetch-price`
  moves `todo` → `in_progress` → `done`; `notify` moves `todo` → `in_progress` → `blocked` (with a
  `reason`) → `done`, and the reason disappears once the final `completed` event overwrites the
  status but not before**

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(content): section 08 - event sourcing and agent state, with a log scrubber"
```

### Task 16: Section 9 — Failure, retries, poison messages

**Files:**
- Modify: `index.html` (replace `<section id="failure">`, wire `MODEL:backoff`)

- [ ] **Step 1: Replace the placeholder**

Required facts (all must appear):
1. Once at-least-once delivery is in play, a redelivered event is not a bug — the consumer must be
   idempotent (processing it twice must converge to the same result as processing it once).
2. The real exponential-backoff formula from `4th-devs` (already verified in `MODEL:backoff`):
   `min(15000, 1500 * 2^(attempt-1))` ms, capped, quoted with its real values for attempts 1-6.
3. Dead-letter queues: SQS's redrive policy (a `maxReceiveCount` before moving to a DLQ), Kafka's
   dead-letter-topic convention (not a built-in feature — an application-level pattern of publishing
   to a `<topic>.DLT`) — both exist to stop a genuinely unprocessable ("poison") message from being
   redelivered forever.
4. A sandbox: a retry timeline (reusing the `.tl` timeline component) showing attempts 1-6 at their
   real computed delay from `computeRetryDelayMs`, with a "still failing" toggle that, past attempt 3
   (`MAX_AUTO_RETRY_ATTEMPTS` in the real source), routes the message to a visible "dead-letter"
   pane instead of scheduling another retry.

```html
<section id="failure">
  <div class="sec-head"><span class="sec-num">09</span><h2>Failure, retries, poison messages</h2></div>
  <p class="lead">Every "at-least-once" system in §03 can redeliver. That's not a bug the consumer
  waits out — it's a contract the consumer must be written for: processing the same event twice has
  to converge to the same result (idempotency), or duplicates corrupt state.</p>
  <p>The real backoff formula this page's <code>test-model.ts</code> verified against
  <code>4th-devs</code>' <code>recovery.ts</code>:</p>
  <pre class="lit"><span class="ln">const delay = Math.min(15_000, 1_500 * 2 ** (attempt - 1));</span>
<span class="ln">// attempt 1: 1500ms  2: 3000ms  3: 6000ms  4: 12000ms  5+: 15000ms (capped)</span></pre>
  <p>A message that keeps failing past a limit — <code>4th-devs</code> caps auto-retry at 3 attempts —
  is a poison message: something is genuinely wrong with it, not just transiently unlucky, and
  retrying forever would starve everything behind it. Real brokers name this explicitly: SQS's
  redrive policy moves a message to a dead-letter queue after a configured
  <code>maxReceiveCount</code>; Kafka has no built-in DLQ, so the convention is application-level —
  publish the poison message to a separate <code>&lt;topic&gt;.DLT</code> topic instead of committing
  its offset normally.</p>
  <p class="src">Sources: <a href="https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html">AWS SQS developer guide — dead-letter queues</a>; Kafka's
  dead-letter-topic pattern is documented as a convention across Kafka Streams/Connect docs rather
  than a single core-broker feature.</p>

  <div class="demo">
    <h4>Sandbox — the verified backoff formula, and where it gives up</h4>
    <div class="tlwrap"><svg class="tl" viewBox="0 0 560 140" data-retry-tl></svg></div>
    <div class="controls">
      <button type="button" data-retry-fail>attempt fails again</button>
      <button type="button" class="ghost" data-retry-reset>reset</button>
    </div>
    <p class="hint" data-retry-hint>Attempt 1 has already happened. Click "attempt fails again" to
    schedule the next retry at the real computed delay — after attempt 3, the message routes to the
    dead-letter pane instead.</p>
  </div>
</section>
```

- [ ] **Step 2: Wire the sandbox using `computeRetryDelayMs` and `MAX_AUTO_RETRY_ATTEMPTS` from
  `MODEL:backoff` directly**

```html
<script>
(() => {
  const root = document.getElementById('failure');
  if (!root) return;
  let attempt = 1;
  let dead = false;

  function render() {
    const svg = root.querySelector('[data-retry-tl]');
    let x = 20;
    const marks = [];
    for (let a = 1; a <= attempt; a++) {
      marks.push(`<circle class="ran" cx="${x}" cy="70" r="5"/><text x="${x}" y="95" text-anchor="middle">#${a}</text>`);
      if (a < attempt) {
        const delay = computeRetryDelayMs(a);
        marks.push(`<text x="${x + 30}" y="60" text-anchor="middle">+${delay}ms</text>`);
      }
      x += 90;
    }
    if (dead) {
      marks.push(`<rect x="${x - 10}" y="50" width="90" height="40" fill="none" stroke="var(--fail)" stroke-width="1.5"/>`);
      marks.push(`<text x="${x + 35}" y="75" text-anchor="middle" fill="var(--fail)">dead-lettered</text>`);
    }
    svg.innerHTML = marks.join('');
    root.querySelector('[data-retry-fail]').disabled = dead;
  }

  root.querySelector('[data-retry-fail]').addEventListener('click', () => {
    if (attempt >= MAX_AUTO_RETRY_ATTEMPTS) { dead = true; }
    else { attempt++; }
    render();
  });
  root.querySelector('[data-retry-reset]').addEventListener('click', () => {
    attempt = 1; dead = false; render();
  });
  render();
})();
</script>
```

- [ ] **Step 3: Click "attempt fails again" four times — confirm delays of +1500ms, +3000ms, +6000ms
  appear between attempts 1→2, 2→3, 3→4, and the fourth click (past `MAX_AUTO_RETRY_ATTEMPTS = 3`)
  shows the dead-lettered box and disables the button**

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat(content): section 09 - failure, retries, poison messages, with backoff sandbox"
```

### Task 17: Section 10 — The whole page in rules, and scope; footer polish

**Files:**
- Modify: `index.html` (replace `<section id="rules">`)

- [ ] **Step 1: Replace the placeholder**

Required content (all must appear):
1. A numbered rules list distilling §01–09 (aim for 7-9 rules, mirroring the sibling page's "whole
   page in six rules" density).
2. An explicit "left out" list, named rather than silently omitted: sagas/distributed transactions,
   the transactional outbox pattern, change-data-capture (CDC), exactly-once end-to-end across
   heterogeneous systems, non-JS/TS ecosystems, anything Windows-specific.

```html
<section id="rules">
  <div class="sec-head"><span class="sec-num">10</span><h2>The whole page in rules, and scope</h2></div>
  <ol class="plain">
    <li>A producer doesn't know its consumers; an event is a fact, not a request — a failed consumer
    doesn't un-happen it.</li>
    <li>"At-least-once" is the practical default everywhere (Kafka, SQS standard, EventBridge);
    exactly-once is achieved on top of it via idempotency or dedup, not by avoiding redelivery.</li>
    <li>Ordering is scoped: to a Kafka partition, to an SQS Message Group ID — never to a whole topic
    or queue.</li>
    <li>SSE is one HTTP response the server keeps writing to, in the wire format
    <code>data:</code>/<code>event:</code>/<code>id:</code>/<code>retry:</code>, one direction only.</li>
    <li>AI model streaming is SSE with a documented event schema:
    <code>message_start</code> → per-block <code>content_block_start/delta/stop</code> →
    <code>message_delta</code> → <code>message_stop</code>. Tool-call arguments arrive as JSON
    fragments that are only safe to parse once their block closes.</li>
    <li>A multi-agent system is a DAG reacting to <code>done</code> events; the ready set is
    recomputed every round, the same shape as an event loop's phases one level up.</li>
    <li>Agent state doesn't have to be stored directly — folding an append-only event log recovers it,
    for free, until the log itself needs compaction.</li>
    <li>A consumer under at-least-once delivery must be idempotent; a message that keeps failing past
    a limit belongs in a dead-letter queue, not in an infinite retry loop.</li>
  </ol>
  <p class="caveat">Left out, on purpose, not by oversight: sagas and distributed transactions across
  services; the transactional outbox pattern; change-data-capture (CDC); exactly-once delivery
  guaranteed end-to-end across heterogeneous systems (only within a single broker's own transactional
  features); non-JS/TS ecosystems; anything Windows-specific.</p>
</section>
```

- [ ] **Step 2: Reload the full page top to bottom, click every button in every sandbox at least once,
  and confirm no console errors (open browser devtools console while doing this)**

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(content): section 10 - rules and scope"
```

---

## Phase 4 — Discoverability and docs

### Task 18: `llms.txt` and `llms-full.txt`

**Files:**
- Create: `llms.txt`
- Create: `llms-full.txt`

- [ ] **Step 1: Write `llms.txt`, following the exact structure of the sibling repo's file (a summary
  blockquote, a bulleted key-points list, a Page link, a Source material list, a Caveat, an Optional
  repo link)**

```markdown
# Event-Driven Architecture, Worked Out

> An interactive, single-page explainer for event-driven architecture: what a broker actually
> guarantees (Kafka, SQS, SNS, EventBridge), what Server-Sent Events really is, and how AI model
> streaming and multi-agent orchestration are both applications of the same mechanism. The SSE parser
> and DAG scheduler shown are verified against real running code by `test-model.ts`; broker guarantees
> are cited from official docs. Author: Paweł Pasek.

Key points made on this page:

- **Foundations** — a producer doesn't know its consumers; an event is a fact, not a request, so a
  failed consumer doesn't un-happen it; coupling moves from runtime calls to schema shape.
- **Delivery guarantees** — Kafka is at-least-once by default (exactly-once needs an idempotent
  producer plus a transactional, read-committed consumer); SQS standard is at-least-once/best-effort
  order, SQS FIFO is exactly-once/ordered within one Message Group ID; SNS/EventBridge fan out with no
  cross-subscriber ordering (SNS FIFO topics excepted).
- **Ordering** — scoped to a Kafka partition or an SQS Message Group ID, never to a whole topic/queue.
- **SSE** — one HTTP response kept open, `Content-Type: text/event-stream`, wire fields
  `data:`/`event:`/`id:`/`retry:`, one direction only; `EventSource` auto-reconnects using
  `Last-Event-ID`.
- **AI streaming** — the same SSE mechanism with a documented schema:
  `message_start` → per-block `content_block_start/delta/stop` → `message_delta` → `message_stop`.
  Tool-call input arrives as JSON fragments (`input_json_delta`/`partial_json`) safe to parse only
  once the block closes.
- **Agents** — a multi-agent system is a DAG of tasks reacting to `done` events; the ready set
  (dependencies all satisfied) is recomputed every round, mirroring an event loop's phases one level up.
- **Event sourcing** — state is recovered by folding an append-only event log, not stored directly;
  crash recovery and an audit trail come for free, until the log needs compaction.
- **Failure handling** — a redelivered event under at-least-once delivery isn't a bug; the real
  backoff formula this page verifies is `min(15000, 1500 * 2^(attempt-1))` ms; a message failing past
  a retry limit belongs in a dead-letter queue.

## Page

- [Event-Driven Architecture, Worked Out](https://pasekpasek.github.io/event-driven-architecture-worked-out/): the full explainer.

## Source material

- [Apache Kafka documentation — message delivery semantics](https://kafka.apache.org/documentation/#semantics)
- [AWS SQS developer guide — FIFO queues](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html)
- [AWS SNS developer guide — FIFO topics](https://docs.aws.amazon.com/sns/latest/dg/fifo-topics.html)
- [AWS EventBridge user guide](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-basic-concepts.html)
- [4th-devs](https://github.com/i-am-alice/4th-devs), `05_01_agent_graph/src/{events.ts,server.ts,scheduler/*}` and `03_02_events/docs/{heartbeat.md,schemas.md}`: the real event bus, SSE server, DAG scheduler, backoff formula and heartbeat loop this page is built from.
- WHATWG HTML — the `text/event-stream` parsing algorithm `EventSource` implements.

## Caveat

The SSE parser and DAG scheduler shown are checked by `test-model.ts` against a real HTTP server and
an independently-written oracle port, respectively. Broker delivery/ordering guarantees (Kafka, SQS,
SNS, EventBridge) are cited from vendor documentation, not independently reproduced locally.

## Optional

- [Source repository](https://github.com/PasekPasek/event-driven-architecture-worked-out): one HTML file, no build step, MIT.
```

- [ ] **Step 2: Write `llms-full.txt` — the plain-text version of every section's content (no HTML,
  no sandbox markup), following the sibling's numbered-section format. Populate each `## 0N. <title>`
  block by copying the prose (not the markup) already written in Tasks 7-17, stripped of tags, in
  the same voice as the sibling's `llms-full.txt`. Include a header block matching the sibling's:**

```markdown
# Event-Driven Architecture, Worked Out

Source: https://pasekpasek.github.io/event-driven-architecture-worked-out/
Author: Paweł Pasek
Verified against: a real node:http server (SSE), an independent oracle port of 4th-devs' scheduler
(DAG readiness), the literal recovery.ts formula (backoff). Broker guarantees cited from vendor docs.

[... one "## 0N. <title>" block per section, 01 through 10, each a plain-text rendering of that
section's already-written prose — no new facts, just stripped of markup, exactly as
event-loop-worked-out/llms-full.txt is the plain-text twin of its own index.html ...]

## About this page's models

[...restate the VERIFICATION.md content from Task 6 here, in the sibling's voice...]
```

- [ ] **Step 3: Commit**

```bash
git add llms.txt llms-full.txt
git commit -m "docs: llms.txt and llms-full.txt"
```

### Task 19: `README.md`

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write it, following the sibling's exact section order (title, one-line description,
  Live link, "What's in it" bulleted list mirroring the ten sections, "What is real and what is a
  model" folded in from `VERIFICATION.md`, Scope, Running it, Credits)**

```markdown
# Event-Driven Architecture, Worked Out

A single-page, dependency-free interactive explainer for event-driven architecture, built up from
three facts rather than a diagram of boxes and queues — ending with AI agents as a worked application
of the same mechanism.

**Live: https://pasekpasek.github.io/event-driven-architecture-worked-out/**

## What's in it

- **Three things always true.** A producer doesn't know its consumers; an event is a fact, not a
  request; coupling moves from runtime calls to schema shape.
- **If you had to build it.** Four drafts — an in-process EventEmitter, a durable log, a
  self-tracking reader, acknowledge-or-redeliver — arriving at the shape every real broker takes.
- **Delivery guarantees, for real.** What Kafka, SQS, SNS and EventBridge actually commit to, cited
  from their own docs.
- **Ordering and partitioning.** Why "happened first" isn't "seen first," with a sandbox over
  partition keys and Message Group IDs.
- **What SSE actually is.** The wire format, `EventSource`, and a live sandbox running the exact
  parser this repo's `test-model.ts` verifies against a real chunked HTTP server.
- **AI model streaming as an SSE application.** A stepper over a real captured Anthropic streaming
  tool-call turn.
- **Agents as event-driven systems.** A live DAG scheduler sandbox — the same `findReadyTasks`/
  `runRound` code `test-model.ts` checks against an independent oracle port of a real open-source
  agent scheduler.
- **Event sourcing and agent state.** A scrubber over an event log, with state recomputed live as a
  fold.
- **Failure, retries, poison messages.** The real exponential-backoff formula, visualized, with a
  dead-letter cutoff.

## What is real and what is a model

Three things on this page are backed by running code, checked by `test-model.ts`: the SSE parser
(against a real `node:http` server, including a chunk boundary split mid-field), the DAG scheduler
(against an independently-written oracle port of the real algorithm), and the backoff formula
(against its literal source). Broker delivery/ordering guarantees (Kafka, SQS, SNS, EventBridge) are
not run locally — they're cited and quoted from official documentation instead.

```bash
node test-model.ts
```

## Scope

What a JS/TS backend developer needs to reason about queues, SSE and agent orchestration. Sagas and
distributed transactions, the transactional outbox pattern, CDC, end-to-end exactly-once across
heterogeneous systems, non-JS/TS ecosystems, and anything Windows-specific are named and left out.

## Running it

One file, no build step.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Credits

Built by [Paweł Pasek](https://github.com/PasekPasek). Companion to
[event-loop-worked-out](https://github.com/PasekPasek/event-loop-worked-out) and
[auth-worked-out](https://github.com/PasekPasek/auth-worked-out), which use the same workshop-plate
design. The SSE server shape, DAG scheduler, backoff formula and heartbeat loop are grounded in
[4th-devs](https://github.com/i-am-alice/4th-devs), an open-source agent-orchestration course
repository.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README"
```

### Task 20: `og.png` social preview image

**Files:**
- Create: `og.svg` (source)
- Create: `og.png` (rendered, 1200×630)

- [ ] **Step 1: Write the source SVG at the exact OG canvas size, reusing the page's own palette**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1A2028"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#2C3743" stroke-width="2"/>
  <g font-family="IBM Plex Mono, monospace" fill="#8C99A6" font-size="20">
    <text x="80" y="90">event-driven architecture — worked out</text>
  </g>
  <g font-family="IBM Plex Serif, Georgia, serif" fill="#DDE3E9" font-weight="600" font-size="56">
    <text x="80" y="200">How events actually flow,</text>
    <text x="80" y="270">from a queue to an AI agent</text>
  </g>
  <g stroke="#3A4552" stroke-width="1.5" fill="none">
    <circle cx="180" cy="430" r="46"/>
    <circle cx="380" cy="430" r="46"/>
    <circle cx="580" cy" ="430" r="46"/>
  </g>
</svg>
```

Fix the malformed third `<circle>` (`cy" ="430` is a typo introduced above — write it as
`cy="430"`) before saving:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1A2028"/>
  <rect x="0" y="0" width="1200" height="630" fill="none" stroke="#2C3743" stroke-width="2"/>
  <g font-family="IBM Plex Mono, monospace" fill="#8C99A6" font-size="20">
    <text x="80" y="90">event-driven architecture — worked out</text>
  </g>
  <g font-family="IBM Plex Serif, Georgia, serif" fill="#DDE3E9" font-weight="600" font-size="56">
    <text x="80" y="200">How events actually flow,</text>
    <text x="80" y="270">from a queue to an AI agent</text>
  </g>
  <g stroke="#3A4552" stroke-width="1.8" fill="none">
    <circle cx="180" cy="440" r="46"/>
    <circle cx="380" cy="440" r="46"/>
    <circle cx="580" cy="440" r="46"/>
    <path d="M226,440 L334,440 M426,440 L534,440" stroke="#7FA7C4"/>
  </g>
  <g fill="#C79BDF" font-family="IBM Plex Mono, monospace" font-size="16">
    <text x="140" y="530">producer</text>
    <text x="345" y="530">broker</text>
    <text x="535" y="530">agent</text>
  </g>
</svg>
```

- [ ] **Step 2: Render it to PNG at exactly 1200×630**

```bash
# Requires librsvg (rsvg-convert). Install if missing: sudo apt-get install librsvg2-bin
rsvg-convert -w 1200 -h 630 og.svg -o og.png
```

If `rsvg-convert` isn't available and can't be installed, use any locally available SVG-to-PNG tool
(e.g. Inkscape's `--export-type=png`, or a headless-browser screenshot of the SVG at 1200×630) — the
acceptance check is simply `file og.png` reporting `PNG image data, 1200 x 630`.

- [ ] **Step 3: Verify dimensions**

```bash
file og.png
```

Expected output contains `1200 x 630`.

- [ ] **Step 4: Commit**

```bash
git add og.svg og.png
git commit -m "feat: social preview image"
```

### Task 21: Final QA and publish

**Files:** none created; verification only.

- [ ] **Step 1: Run the full verification harness one more time from a clean checkout state**

```bash
node test-model.ts
echo "exit code: $?"
```

Expected: every check `PASS`, `all model checks pass`, exit code `0`.

- [ ] **Step 2: Full manual walkthrough — serve locally, open in a browser, and for every one of the
  seven sandboxes (ordering §04, SSE §05, AI streaming §06, agents §07, event log §08, retries §09,
  plus the dependency-map-equivalent content in §01/02) click every control at least once and confirm
  no console errors**

```bash
python3 -m http.server 8000
```

- [ ] **Step 3: Check `prefers-reduced-motion` and mobile width render correctly (the copied CSS
  already has both media queries — confirm they still apply, since no rule that defines them should
  have been touched)**

Resize the browser to ~375px width; confirm no horizontal scroll on the page itself (sandboxes with
wide SVGs/tables may scroll internally via `.mapwrap`/`.tlwrap`/`.tablewrap` — that's expected and
matches the sibling pages).

- [ ] **Step 4: Create the GitHub repository and push**

```bash
gh repo create PasekPasek/event-driven-architecture-worked-out --public --source=. --remote=origin --description "Interactive explainer for event-driven architecture — queues, Server-Sent Events, AI model streaming and multi-agent orchestration, in TypeScript. Verified against real running code where possible."
git push -u origin main
```

- [ ] **Step 5: Enable GitHub Pages, serving from `main` branch root**

```bash
gh api repos/PasekPasek/event-driven-architecture-worked-out/pages -X POST -f "source[branch]=main" -f "source[path]=/"
```

If that returns an error because Pages is already configured differently, set it via the repo
Settings → Pages UI instead: Source = "Deploy from a branch", Branch = `main`, folder = `/ (root)`.

- [ ] **Step 6: Wait for the Pages build and confirm the live URL renders**

```bash
sleep 60
curl -sI https://pasekpasek.github.io/event-driven-architecture-worked-out/ | head -1
```

Expected: `HTTP/2 200`. If `404`, re-check the Pages source setting from Step 5 and that `.nojekyll`
was committed (Task 1).

- [ ] **Step 7: No commit needed for this task (verification + deploy only); if any fix was made
  during QA, commit it with its own descriptive message before publishing**
