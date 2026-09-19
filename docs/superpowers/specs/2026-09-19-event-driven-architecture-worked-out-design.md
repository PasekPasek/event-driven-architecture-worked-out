# Event-Driven Architecture, Worked Out — Design

Status: approved
Repo: `PasekPasek/event-driven-architecture-worked-out` (new, sibling to `event-loop-worked-out` and `auth-worked-out`)
Live target: `https://pasekpasek.github.io/event-driven-architecture-worked-out/` (GitHub Pages)

## Purpose

A single-page, dependency-free interactive explainer for event-driven architecture — same
"workshop plate" format as `event-loop-worked-out` and `auth-worked-out` — built from first
principles rather than a diagram of boxes and arrows, ending with AI agents as a worked
application of the same primitives (event streams, delivery guarantees, ordering, replay-as-state).

Audience: the author, first — "chce to dobrze zrozumieć" (wants to genuinely understand this),
same as the two prior pages. Everything on the page must be either verified by running real code,
or a direct citation of a primary source (official docs, a real captured API response, or real
code from a named repository). No invented "ground truth."

## Why this design, not the alternatives considered

- **Rejected: two parallel tracks** (classic broker EDA vs. AI-agent EDA as separate halves).
  Cleaner for skimming, but breaks the "built up from first principles" narrative that makes the
  sibling pages work, and treats agents as a different topic rather than an application of the
  same primitives.
- **Rejected: agent-first framing**, with Kafka/SQS/etc. only as sidebars. Better fit for "AI
  agents" alone, but shortchanges "event driven architecture" as the thing being explained — the
  user asked to understand EDA itself, with agents included, not an agents piece with EDA as
  backstory.
- **Chosen: one continuous arc**, foundations → build-it-yourself → real broker semantics → SSE →
  AI streaming → agents → event sourcing → failure handling → rules. Matches
  `event-loop-worked-out`'s structure exactly: three facts → naive drafts → the real thing → edge
  cases → capstone rules → explicit scope cut.

## Sources (the three anchors, replacing "one C library" for the event loop)

1. **Broker/queue semantics** — primary docs, quoted where a claim is non-obvious:
   - Apache Kafka docs (partitions, consumer groups, offset commit, ordering-within-partition-only)
   - AWS SQS docs (visibility timeout, standard vs FIFO, message group ID, redrive/DLQ)
   - AWS SNS + EventBridge docs (fanout, pattern matching, explicitly no ordering guarantee)
   - NATS docs (core NATS at-most-once vs JetStream at-least-once/exactly-once)
2. **SSE** — grounded in real, working code found in `github.com/i-am-alice/4th-devs`,
   `05_01_agent_graph/src/server.ts` (`sseHandler`: raw `text/event-stream` response, a replay
   buffer written on connect, `subscribe`/cleanup on `close`/`aborted`) and
   `src/dashboard/app.js` (`new EventSource("/events")`, `es.onmessage`). Cross-checked against the
   WHATWG HTML spec's EventSource/`text/event-stream` parsing algorithm for the wire format
   (`data:`/`event:`/`id:`/`retry:` fields, `Last-Event-ID` reconnect header).
3. **AI streaming** — Anthropic Messages API and OpenAI streaming docs for the documented SSE
   event types (`message_start`, `content_block_start`, `content_block_delta`,
   `content_block_stop`, `message_delta`, `message_stop` / OpenAI's equivalents), illustrated with
   one real captured stream (a tool-call turn) saved verbatim as a fixture, the same way the
   event-loop page reports numbers "measured on Node 24.0.0."
4. **Agent orchestration** — real code read in depth from `4th-devs`:
   - `05_01_agent_graph/src/events.ts` — the event bus itself (seq counter, bounded replay buffer,
     sync emit with async-safe listener errors)
   - `05_01_agent_graph/src/scheduler/graph.ts` + `loop.ts` — DAG dependency resolution,
     `findReadyTasks`, parent-unblocking, per-round processing (`processSession`)
   - `05_01_agent_graph/src/scheduler/recovery.ts` — transient-error classification and the
     exponential backoff formula (`computeRetryDelayMs`)
   - `03_02_events/docs/heartbeat.md` — the round-based heartbeat loop (emit started → reconcile →
     resolve waits → claim+run per agent → emit idle/finished → persist round snapshot)
   - `03_02_events/docs/schemas.md` — the JSONL append-only event log and the task file's
     `claimed_by`/`claimed_at`/`next_attempt_at` fields (a visibility-timeout-shaped claim, not
     copied from SQS but arrived at independently — worth calling out as convergent design)

   Scope note: `4th-devs` has ~2,600 files across ~50 course modules (image/audio/RAG/browser
   automation/etc.). Only the modules above were read in depth; the rest is unrelated coursework
   and out of scope for this page.

## Page structure

Numbered sections, each with a one-line "what's real vs. modeled" note where it has a sandbox.

1. **Three things always true about event-driven systems.**
   - A producer does not know who (if anyone) consumes an event.
   - An event describes a fact that already happened, not a request for work — a consumer failing
     doesn't un-happen it.
   - Coupling moves from "who do I call" to "what schema do I emit and what schema do I read,"
     which trades runtime coupling for schema coupling.
   - Clickable dependency map, mirroring the event-loop page's map for its three facts.

2. **If you had to build it.** Drafts, each fixing the last one's problem:
   - Draft 1: an in-process `EventEmitter` — synchronous, at-most-once, everything lost on crash.
   - Draft 2: append to a durable log before dispatching — survives crashes, but a slow consumer
     still blocks or drops.
   - Draft 3: separate producer/consumer processes over the log, consumer tracks its own read
     offset — now a consumer can restart and resume.
   - Draft 4: acknowledge-or-redeliver (a message not ack'd within a timeout is redelivered) —
     arrives at a simplified real broker.
   - Runs as real, small TypeScript (Node built-ins only), each draft a runnable file.

3. **Delivery guarantees, for real.** At-most-once / at-least-once / exactly-once defined
   precisely, then: what Kafka actually commits to (at-least-once by default, exactly-once only
   with idempotent-producer + transactional-consumer configured), what SQS standard vs FIFO queues
   promise, what SNS/EventBridge fan-out does *not* promise (no cross-subscriber ordering).

4. **Ordering and partitioning.** "The event happened first" ≠ "a consumer sees it first" unless
   something enforces it. Kafka: ordering only within a partition, keyed by partition key. SQS
   FIFO: ordering only within a message group ID. Sandbox: an interleaved-partitions timeline,
   letting the user pick a partition key and watch cross-partition reordering happen.

5. **What SSE actually is.** Plain-language explainer (explicitly requested): one-directional,
   plain HTTP, `Content-Type: text/event-stream`, a long-lived response the server keeps writing
   to. The wire format line by line (`data:`, `event:`, `id:`, `retry:`, blank line = dispatch).
   `EventSource`'s auto-reconnect using `Last-Event-ID`. Built from the real `sseHandler`/
   `EventSource` pair in `4th-devs`. Sandbox: type raw SSE bytes on the "server" side, watch the
   parsed event list build on the "client" side, including a simulated disconnect + reconnect with
   replay from the buffer.

6. **AI model streaming as an SSE application.** The realization that "streaming a chat response"
   is exactly section 5's mechanism with a specific event schema on top. Walk the real captured
   fixture (a tool-call turn): `message_start` → text deltas → `content_block_stop` →
   `tool_use` block → `message_delta` (stop_reason) → `message_stop`. Sandbox: step through the
   fixture chunk by chunk, watching the assembled message and the tool-call arguments accumulate
   character by character (mirrors how a real client must accumulate partial JSON before it's
   parseable).

7. **Agents as event-driven systems.** An agent "loop" (plan → act → observe → replan) is a
   consumer reacting to events — its own tool results, other agents' completions, a human's
   answer. Built from `4th-devs`'s real scheduler: a DAG of tasks with `depends_on` edges,
   `findReadyTasks` computing the ready set each round, a heartbeat round loop as the "phases"
   analogue for agents (matches the event-loop page's phase list structurally). Sandbox: a small
   task DAG the user steps through round by round, watching ready-set computation, claiming, and
   parent-unblocking.

8. **Event sourcing and agent state.** State is not stored directly; it's derived by folding over
   an append-only event log (`4th-devs`'s `events.jsonl` / bounded replay buffer). Why this gives
   crash recovery and observability "for free," and where it breaks down (log growth, the need for
   snapshots/compaction — named, not built). Sandbox: a scrubber over a real event log where the
   current state panel is recomputed live as the user drags through event indices.

9. **Failure, retries, and poison messages.** The real exponential-backoff formula from
   `recovery.ts` (`computeRetryDelayMs`), transient-vs-permanent error classification, dead-letter
   queues (SQS DLQ / Kafka dead-letter-topic convention), and why a consumer must be idempotent
   once at-least-once delivery is in play (a redelivered event is not a bug). Sandbox: a
   retry/backoff timeline visualizer with a poison-message counter tripping a DLQ threshold.

10. **The whole page in N rules** (mirrors event-loop's "whole page in six rules") + **Scope**:
    named and explicitly left out — sagas/distributed transactions, the transactional outbox
    pattern, CDC, exactly-once end-to-end across heterogeneous systems, non-JS/TS ecosystems,
    Windows-specific anything. Named the same way the event-loop page names Windows/worker
    threads/async_hooks as left out, not silently skipped.

## Verification ("what is real and what is a model")

A `test-model.ts`, run with Node directly (`node --experimental-strip-types` or compiled with
`tsc` first — decide at implementation time to match the sibling repos' zero-runtime-dependency
constraint), that:

- Starts a real Node `http` server using the same SSE handler shape as section 5, connects a real
  client that reads the response body as a stream and parses it byte-by-byte, and diffs the
  result against the page's JS model — including the replay-buffer-on-reconnect and
  `Last-Event-ID` behavior.
- Runs the real (or a faithfully ported, semantics-preserving) DAG scheduler from section 7
  against a fixed task graph with deterministic mock actors, capturing the emitted event sequence,
  and diffs it against what the page's simulator predicts.
- Recomputes the backoff sequence from `computeRetryDelayMs` and diffs against the numbers shown
  in section 9's visualizer.

Claims that cannot be executed locally (Kafka/SQS/SNS/EventBridge/NATS delivery and ordering
guarantees) are not modeled — they are cited and quoted from the official docs directly, exactly
as the event-loop page quotes Node's own guide text for claims it doesn't re-derive from source.
The README states this split explicitly, under a "What is real and what is a model" heading,
matching the sibling repo.

## Repo layout (matches `event-loop-worked-out` / `auth-worked-out`)

```
/
├── index.html          # the page: markup, inline CSS (workshop-plate design tokens), inline JS
├── app.js              # only if the page grows past a comfortable single-file size (auth-worked-out precedent)
├── test-model.ts        # verification harness (see above)
├── fixtures/
│   └── ai-stream-tool-call.json   # one real captured Anthropic/OpenAI streaming turn, saved verbatim
├── favicon.svg
├── og.png
├── robots.txt
├── sitemap.xml
├── .nojekyll
├── llms.txt             # short index, same shape as event-loop-worked-out's
├── llms-full.txt         # full plain-text version of the page content, section by section
├── README.md
└── LICENSE
```

No build step: open `index.html` directly or serve with `python3 -m http.server`. GitHub Pages
serves `main` directly, same as the sibling repos.

## Out of scope for this spec

- The exact visual design tokens (colors, spacing, the "workshop plate" CSS) — copied/adapted from
  the sibling pages at implementation time, not re-derived here.
- Exact wording of the fixture's captured AI stream — captured once during implementation.
- Whether `test-model.ts` runs via a raw Node flag or a `tsc` pre-step — zero-added-runtime-
  dependency is the constraint; the exact mechanism is an implementation detail.
