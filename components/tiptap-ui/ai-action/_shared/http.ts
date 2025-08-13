export type LambdaRequestInit = {
  url: string
  apiKey?: string | null
  body: unknown
  signal?: AbortSignal
}

export async function callLambdaJson<TResponse = unknown>(
  init: LambdaRequestInit
): Promise<TResponse> {
  const { url, apiKey, body, signal } = init
  if (!url) throw new Error("Lambda URL is not configured")

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Lambda error ${res.status}: ${text}`)
  }
  return (await res.json()) as TResponse
}


