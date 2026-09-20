# Event-Driven Architecture, Worked Out

A single-page, dependency-free interactive explainer for event-driven architecture, built up from
three facts rather than a diagram of boxes and queues — ending with AI agents as a worked application
of the same mechanism.

**Live: https://pasekpasek.github.io/event-driven-architecture-worked-out/**

## What's in it

- **Three things always true.** A producer doesn't know its consumers; an event is a fact, not a
  request; coupling moves from runtime calls to schema shape.
- **If you had to build it.** Four drafts — an in-process EventEmitter, a durable log, a
  self-tracking reader, acknowledge-or-redeliver — arriving at the shape every real broker takes,
  then the same first two drafts as a real shipped event bus, and the edge where an in-process bus
  stops being enough.
- **Delivery guarantees, for real.** What Kafka, SQS, SNS and EventBridge actually commit to, cited
  from their own docs.
- **Ordering, partitioning and parallelism.** Why "happened first" isn't "seen first," why a
  partition is the unit of parallelism as well as of order, and why competing consumers and fan-out
  are different things the word "queue" hides — with a sandbox over partition keys and Message
  Group IDs.
- **What goes in an event, and what breaks when it changes.** Event notification vs.
  event-carried state transfer vs. event sourcing, then schema evolution: a sandbox where you add,
  rename or retype a field and watch which of three consumers you don't control breaks — including
  the type change that only one of them notices while the other two keep running and produce a
  wrong number.
- **Agents as event-driven systems.** A live DAG scheduler sandbox — the same `findReadyTasks`/
  `runRound` code `test-model.ts` checks against an independent oracle port of a real open-source
  agent scheduler.
- **Event sourcing and agent state.** A scrubber over an event log, with state recomputed live as a
  fold.
- **Failure, retries, poison messages.** The real exponential-backoff formula, visualized, with a
  dead-letter cutoff — plus idempotency written down rather than asserted: three consumer designs,
  a sandbox that redelivers the same event, and the out-of-order case where an idempotent write is
  still wrong.
- **The dual write: outbox and CDC.** Why writing to a database and publishing an event can't be
  atomic, with a sandbox that kills the process between the two writes so you can watch direct mode
  lose the event and outbox mode survive it.
- **What you give up.** The bill: no stack trace, no "find all callers", eventual consistency as a
  UX problem, testing that moves to the seams, and a broker to operate — with a sandbox showing the
  same incident's logs with and without a correlation id, and a straight answer about when not to
  do any of this.

## What is real and what is a model

Four of the page's models are backed by running code, checked by `test-model.ts` (18 checks):

- **The DAG scheduler** (ready-set computation, parent-unblocking, and the case where a child comes
  back `blocked` and still has to unblock its parent) — against an independently-written oracle port
  of the real algorithm in [4th-devs](https://github.com/i-am-alice/4th-devs)
  (`05_01_agent_graph/src/scheduler/graph.ts` and `loop.ts`): two separate implementations of the
  same real logic, not one copy-pasted into the other.
- **The backoff formula** — against the literal formula in `4th-devs`
  (`05_01_agent_graph/src/scheduler/recovery.ts`, `computeRetryDelayMs`).
- **The schema-evolution matrix** — the §05 sandbox's five changes × three consumers are asserted
  verdict by verdict, so the page's claim that a retype fails silently for two of the three is
  executed rather than described.
- **The idempotency models** — that `balance += amount` really does reach 1000 after one 500 payment
  and one redelivery, that an absolute write reaches 500, and that an absolute write applied out of
  order is idempotent and still wrong.

```bash
node test-model.ts
```

Broker delivery/ordering guarantees (Kafka, SQS, SNS, EventBridge), the schema-compatibility
vocabulary (Confluent) and the event-shape taxonomy (Fowler) are **not** run locally — they're
cited and quoted from primary sources.

## Scope

What a JS/TS backend developer needs to reason about queues, event schemas and agent
orchestration. The outbox and change-data-capture get a section of their own (§09), and §10 is the
argument against doing any of this when you don't need it.

Server-Sent Events used to be two sections here and has been pulled out into
[streaming-worked-out](https://github.com/PasekPasek/streaming-worked-out). SSE is a transport, not
an architecture, and two sections of HTTP mechanics taught the wrong lesson about what event-driven
means. What stays is the part that genuinely is event-driven: the in-process bus in §02, and the
`subscribe(event => res.write(event))` seam that names the edge between the two pages. Sagas and
end-to-end exactly-once are named and explained in §11 rather than built, since each is a page of
its own.

## Running it

One file, no build step. `test-model.ts` runs directly on Node 24's native TypeScript type-stripping —
no compiler, no dependencies.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Credits

Built by [Paweł Pasek](https://github.com/PasekPasek). Companion to
[event-loop-worked-out](https://github.com/PasekPasek/event-loop-worked-out),
[auth-worked-out](https://github.com/PasekPasek/auth-worked-out) and
[streaming-worked-out](https://github.com/PasekPasek/streaming-worked-out), which use the same
workshop-plate design. The in-process event bus, DAG scheduler, backoff formula and heartbeat loop
are grounded in
[4th-devs](https://github.com/i-am-alice/4th-devs), an open-source agent-orchestration course
repository.
