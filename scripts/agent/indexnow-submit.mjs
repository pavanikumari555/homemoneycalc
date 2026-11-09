/** Acceptance is not indexing. Failed requests must fail the workflow visibly. */
export async function submitIndexNow(payload, fetcher = fetch) {
  const response = await fetcher("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  await response.body?.cancel();
  if (![200, 202].includes(response.status)) throw new Error(`IndexNow request failed: HTTP ${response.status}. Verify the deployed key file and retry after fixing the cause.`);
  return response.status;
}
