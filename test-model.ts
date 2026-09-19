// Checks the page's models against something real: a real HTTP server + real
// client for SSE, an independently-written oracle port of 4th-devs' scheduler
// algorithm for the agent scheduler, and the literal source formula for backoff.
//
//   node test-model.ts

import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';

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

// ── sse ──────────────────────────────────────────────────────────────────
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

console.log(failures ? `\n${failures} failing` : '\nall model checks pass');
process.exit(failures ? 1 : 0);
