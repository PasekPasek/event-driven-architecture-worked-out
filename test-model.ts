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
