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
- **AI model streaming as an SSE application.** A stepper over a real Anthropic streaming tool-call
  turn, watching tool arguments accumulate as partial JSON until the block closes.
- **Agents as event-driven systems.** A live DAG scheduler sandbox — the same `findReadyTasks`/
  `runRound` code `test-model.ts` checks against an independent oracle port of a real open-source
  agent scheduler.
- **Event sourcing and agent state.** A scrubber over an event log, with state recomputed live as a
  fold.
- **Failure, retries, poison messages.** The real exponential-backoff formula, visualized, with a
  dead-letter cutoff.

## What is real and what is a model

Three things on this page are backed by running code, checked by `test-model.ts`:

- **The SSE parser** — against a real `node:http` server, including an event deliberately split
  across two TCP-level writes, over a real `fetch` + `ReadableStream` client.
- **The DAG scheduler** (ready-set computation, parent-unblocking) — against an independently-written
  oracle port of the real algorithm in [4th-devs](https://github.com/i-am-alice/4th-devs)
  (`05_01_agent_graph/src/scheduler/graph.ts` and `loop.ts`): two separate implementations of the
  same real logic, not one copy-pasted into the other.
- **The backoff formula** — against the literal formula in `4th-devs`
  (`05_01_agent_graph/src/scheduler/recovery.ts`, `computeRetryDelayMs`).

```bash
node test-model.ts
```

Broker delivery/ordering guarantees (Kafka, SQS, SNS, EventBridge) are **not** run locally — they're
cited and quoted from official documentation. The §06 streaming fixture is quoted verbatim from
Anthropic's own published [streaming documentation](https://platform.claude.com/docs/en/build-with-claude/streaming),
not captured from a live API call; `fixtures/build-fixture.mjs` rebuilds it from
`fixtures/ai-stream-raw.txt`.

## Scope

What a JS/TS backend developer needs to reason about queues, SSE and agent orchestration. Sagas and
distributed transactions, the transactional outbox pattern, CDC, end-to-end exactly-once across
heterogeneous systems, non-JS/TS ecosystems, and anything Windows-specific are named and left out.

## Running it

One file, no build step. `test-model.ts` runs directly on Node 24's native TypeScript type-stripping —
no compiler, no dependencies.

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
