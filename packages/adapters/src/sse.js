// A small server-sent events (SSE) reader. All three protocols commonly arrive as `data: {json}` lines.

/**
 * Yield each JSON `data:` payload from an SSE body. Accepts a fetch Response, a ReadableStream of bytes
 * or strings, or any async iterable of chunks. Skips comments, `[DONE]` and payloads that are not JSON.
 */
export async function* readEventStream(source) {
  const body = source && typeof source === "object" && "body" in source && !(Symbol.asyncIterator in source) ? source.body : source;
  if (!body) return;
  const decoder = new TextDecoder();
  let buffer = "";
  let data = [];

  function* flushEvent() {
    if (!data.length) return;
    const payload = data.join("\n");
    data = [];
    if (payload.trim() === "[DONE]") return;
    try { yield JSON.parse(payload); } catch { /* not JSON: ignore */ }
  }
  function* lines(final) {
    let nl;
    while ((nl = buffer.search(/\r\n|\r|\n/)) >= 0) {
      const line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + (buffer[nl] === "\r" && buffer[nl + 1] === "\n" ? 2 : 1));
      if (line === "") yield* flushEvent();
      else if (line.startsWith("data:")) data.push(line.slice(5).replace(/^ /, ""));
      // event:, id:, retry: and comments (":") are not needed here.
    }
    if (final) {
      if (buffer.startsWith("data:")) data.push(buffer.slice(5).replace(/^ /, ""));
      buffer = "";
      yield* flushEvent();
    }
  }

  const iterable = typeof body.getReader === "function" ? readerIterable(body) : body;
  for await (const chunk of iterable) {
    buffer += typeof chunk === "string" ? chunk : decoder.decode(chunk, { stream: true });
    yield* lines(false);
  }
  buffer += decoder.decode();
  yield* lines(true);
}

async function* readerIterable(stream) {
  const reader = stream.getReader();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}
