// Checks the page's models against something real: an independently-written
// oracle port of 4th-devs' scheduler algorithm for the agent scheduler, the
// literal source formula for backoff, and executed verdict matrices for the
// schema-evolution and idempotency models.
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

  // The blocked path: a child that comes back 'blocked' is finished as far as its
  // parent is concerned, so the parent must still become ready. Both
  // implementations claim this; until now neither was ever asked to prove it.
  const blocksSanityCheck = (t: OracleTask) =>
    (t.id === 'sanity-check' ? 'blocked' : 'completed') as 'completed' | 'blocked';

  const blockedPageTasks = buildFixtureGraph();
  const blockedPageTrace: string[] = [];
  for (let round = 0; round < 5; round++) {
    const events = runRound(blockedPageTasks, blocksSanityCheck);
    if (events.length === 0) break;
    blockedPageTrace.push(...events.map((e) => `${e.type === 'task.completed' ? 'completed' : e.type === 'task.started' ? 'start' : 'blocked'}:${e.id}`));
  }

  const blockedOracleTasks = new Map(buildFixtureGraph().map((t) => [t.id, t]));
  const blockedOracleTrace: string[] = [];
  for (let round = 0; round < 5; round++) {
    const trace = oracleRunRound(blockedOracleTasks, (t) =>
      (t.id === 'sanity-check' ? 'blocked' : 'done') as 'done' | 'blocked');
    if (trace.length === 0) break;
    blockedOracleTrace.push(...trace.map((e) => e.replace('done:', 'completed:')));
  }

  check(
    'scheduler: a blocked child still unblocks its parent, and both ports agree it does',
    JSON.stringify(blockedPageTrace) === JSON.stringify(blockedOracleTrace),
    `page:   ${JSON.stringify(blockedPageTrace)}\n    oracle: ${JSON.stringify(blockedOracleTrace)}`,
  );
  check(
    'scheduler: sanity-check blocks, yet price-check and notify still complete',
    blockedPageTrace.includes('blocked:sanity-check')
      && blockedPageTrace.includes('completed:price-check')
      && blockedPageTrace.includes('completed:notify'),
    `trace: ${JSON.stringify(blockedPageTrace)}`,
  );
}

await checkScheduler();

// ── event shape / schema evolution ───────────────────────────────────────
{
  interface Verdict { verdict: string; cls: string; why: string }
  const { shapeDeliver, SHAPE_CONSUMERS } = loadModel<{
    shapeDeliver: (k: string) => { published: Array<Record<string, unknown>>; verdicts: Verdict[] };
    SHAPE_CONSUMERS: Array<{ name: string }>;
  }>('shape', ['shapeDeliver', 'SHAPE_CONSUMERS']);

  // tolerant reader, strict validator, billing total — in that order.
  const expected: Record<string, string[]> = {
    none: ['ok', 'ok', 'ok'],
    add: ['ok', 'rejects', 'ok'],
    rename: ['breaks', 'rejects', 'breaks'],
    retype: ['silently wrong', 'rejects', 'silently wrong'],
    v2: ['ok', 'ok', 'ok'],
  };

  check(
    'shape: the consumer order the page renders matches the order this table asserts',
    JSON.stringify(SHAPE_CONSUMERS.map((c) => c.name))
      === JSON.stringify(['tolerant reader', 'strict validator', 'billing total']),
    JSON.stringify(SHAPE_CONSUMERS.map((c) => c.name)),
  );

  for (const [change, want] of Object.entries(expected)) {
    const got = shapeDeliver(change).verdicts.map((v) => v.verdict);
    check(
      `shape: "${change}" produces ${want.join(' / ')}`,
      JSON.stringify(got) === JSON.stringify(want),
      `expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}`,
    );
  }

  // The whole point of the v2 row: the old event is still published, untouched.
  const v2 = shapeDeliver('v2');
  const v1Again = v2.published.find((e) => e.type === 'order.placed');
  check(
    'shape: publishing v2 leaves the v1 event byte-identical, which is why nobody breaks',
    v2.published.length === 2
      && JSON.stringify(v1Again) === JSON.stringify({ type: 'order.placed', orderId: 'o-1042', total: 4999 }),
    JSON.stringify(v2.published),
  );

  // The silent failure is the reason rule 3 exists: assert it really is silent.
  const retype = shapeDeliver('retype').verdicts;
  check(
    'shape: a retype is caught only by the validator; the other two run on and are wrong',
    retype[1].verdict === 'rejects'
      && retype[0].verdict === 'silently wrong'
      && retype[2].why.includes('049.99'),
    JSON.stringify(retype.map((v) => v.why)),
  );
}

// ── idempotency ──────────────────────────────────────────────────────────
{
  interface Inbox { balance: number; processed: string[]; lastSeq: number }
  const { createInbox, applyDelivery, IDEMPOTENCY_EVENTS } = loadModel<{
    createInbox: () => Inbox;
    applyDelivery: (mode: string, s: Inbox, e: Record<string, number | string>) => string;
    IDEMPOTENCY_EVENTS: Record<string, Record<string, number | string>>;
  }>('idempotency', ['createInbox', 'applyDelivery', 'IDEMPOTENCY_EVENTS']);

  const run = (mode: string, sequence: Array<'1' | '2'>) => {
    const state = createInbox();
    const outcomes = sequence.map((n) => applyDelivery(mode, state, IDEMPOTENCY_EVENTS[n]));
    return { state, outcomes };
  };

  check(
    'idempotency: balance += amount double-counts a redelivery (1000, not 500)',
    run('delta', ['1', '1']).state.balance === 1000,
    `got ${run('delta', ['1', '1']).state.balance}`,
  );
  check(
    'idempotency: an absolute write survives a redelivery unchanged (500)',
    run('absolute', ['1', '1']).state.balance === 500,
    `got ${run('absolute', ['1', '1']).state.balance}`,
  );
  {
    const { state, outcomes } = run('dedup', ['1', '1']);
    check(
      'idempotency: a dedup table drops the redelivery before it touches the balance',
      state.balance === 500 && outcomes[1] === 'ignored' && state.processed.length === 1,
      `balance ${state.balance}, outcomes ${JSON.stringify(outcomes)}, processed ${JSON.stringify(state.processed)}`,
    );
  }
  {
    // Idempotent is not order-proof: an older absolute write lands after a newer one.
    const { state, outcomes } = run('absolute', ['1', '2', '1']);
    check(
      'idempotency: an out-of-order absolute redelivery walks the balance backwards (500, flagged stale)',
      state.balance === 500 && outcomes[2] === 'stale write',
      `balance ${state.balance}, outcomes ${JSON.stringify(outcomes)}`,
    );
    const dedup = run('dedup', ['1', '2', '1']);
    check(
      'idempotency: the dedup consumer survives the same out-of-order redelivery (800)',
      dedup.state.balance === 800,
      `got ${dedup.state.balance}`,
    );
  }
}

console.log(failures ? `\n${failures} failing` : '\nall model checks pass');
process.exit(failures ? 1 : 0);
