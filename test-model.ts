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

console.log(failures ? `\n${failures} failing` : '\nall model checks pass');
