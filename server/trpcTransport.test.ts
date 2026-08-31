import { describe, expect, it, vi } from "vitest";
import { fetchTrpcResponse, normalizeTrpcResponse } from "../client/src/lib/trpcTransport";

describe("tRPC transport response guard", () => {
  it("passes valid JSON responses through unchanged", async () => {
    const response = new Response('{"result":{"data":{"json":null}}}', {
      status: 200,
      headers: { "content-type": "application/json" },
    });

    const normalized = normalizeTrpcResponse(response);

    expect(normalized).toBe(response);
    expect(await normalized.text()).toContain('"result"');
  });

  it("converts an HTML response into a JSON-shaped retryable error", async () => {
    const normalized = normalizeTrpcResponse(new Response("<!doctype html>", {
      status: 200,
      headers: { "content-type": "text/html" },
    }));

    expect(normalized.status).toBe(503);
    expect(normalized.headers.get("content-type")).toContain("application/json");
    await expect(normalized.json()).resolves.toMatchObject({
      error: { json: { code: "INTERNAL_SERVER_ERROR", data: { httpStatus: 503 } } },
    });
  });

  it("preserves a failing HTTP status while normalizing plain text", async () => {
    const fetcher = vi.fn(async () => new Response("upstream unavailable", {
      status: 502,
      headers: { "content-type": "text/plain" },
    }));

    const normalized = await fetchTrpcResponse("/api/trpc/marketplace.metrics", undefined, fetcher);

    expect(fetcher).toHaveBeenCalledWith("/api/trpc/marketplace.metrics", { credentials: "include" });
    expect(normalized.status).toBe(502);
    await expect(normalized.json()).resolves.toMatchObject({
      error: { json: { data: { httpStatus: 502 } } },
    });
  });
});
