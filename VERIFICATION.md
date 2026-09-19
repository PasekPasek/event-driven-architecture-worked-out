# What is real and what is a model

Three claims on this page are backed by running code, checked by `test-model.ts`:

- **The SSE parser** is checked against a real `node:http` server, including an event deliberately
  split across two TCP-level writes, over a real `fetch` + `ReadableStream` client.
- **The DAG scheduler** (ready-set computation, parent-unblocking) is checked against an
  independently-written oracle port of the real algorithm in `4th-devs`
  (`05_01_agent_graph/src/scheduler/graph.ts` and `loop.ts`) — two separate implementations of the
  same real logic, not one copied into the other.
- **The backoff formula** is checked against the literal formula in `4th-devs`
  (`05_01_agent_graph/src/scheduler/recovery.ts`, `computeRetryDelayMs`).

Everything about Kafka, SQS, SNS, EventBridge and NATS delivery/ordering guarantees is not modeled —
those systems aren't run locally. Those claims are cited and quoted from official documentation
instead; see the "Source material" section of `llms.txt` for the exact links.

Run the harness:

    node test-model.ts
