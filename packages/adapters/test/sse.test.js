import { test } from "node:test";
import assert from "node:assert/strict";
import { readEventStream } from "../src/index.js";

async function collect(src) { const out = []; for await (const e of readEventStream(src)) out.push(e); return out; }

test("readEventStream parses data lines across chunk boundaries", async () => {
  const text = ': ping\n\ndata: {"type":"start"}\n\ndata: {"type":"text-del' + 'ta","id":"a","delta":"Hi"}\r\n\r\nevent: x\ndata: not json\n\ndata: [DONE]\n\n';
  const bytes = new TextEncoder().encode(text);
  const chunks = [bytes.slice(0, 7), bytes.slice(7, 40), bytes.slice(40)];
  const stream = new ReadableStream({ start(c) { for (const ch of chunks) c.enqueue(ch); c.close(); } });
  assert.deepEqual(await collect(stream), [{ type: "start" }, { type: "text-delta", id: "a", delta: "Hi" }]);
});

test("readEventStream reads a Response body and a final event without a blank line", async () => {
  const res = new Response('data: {"type":"RUN_STARTED"}\n\ndata: {"type":"RUN_FINISHED"}');
  assert.deepEqual(await collect(res), [{ type: "RUN_STARTED" }, { type: "RUN_FINISHED" }]);
});

test("readEventStream joins multi-line data and accepts string iterables", async () => {
  async function* gen() { yield 'data: {"a":\n'; yield "data: 1}\n\n"; }
  assert.deepEqual(await collect(gen()), [{ a: 1 }]);
});
