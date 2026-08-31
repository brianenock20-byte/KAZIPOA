export function normalizeTrpcResponse(response: Response): Response {
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (contentType.includes("json")) return response;

  const retryStatus = response.status >= 400 ? response.status : 503;
  return new Response(JSON.stringify({
    error: {
      json: {
        message: `Temporary API response unavailable (HTTP ${retryStatus})`,
        code: "INTERNAL_SERVER_ERROR",
        data: { code: "INTERNAL_SERVER_ERROR", httpStatus: retryStatus },
      },
    },
  }), {
    status: retryStatus,
    headers: { "content-type": "application/json" },
  });
}

export async function fetchTrpcResponse(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  fetcher: typeof globalThis.fetch = globalThis.fetch,
): Promise<Response> {
  const response = await fetcher(input, {
    ...(init ?? {}),
    credentials: "include",
  });
  return normalizeTrpcResponse(response);
}
