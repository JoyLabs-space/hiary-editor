import { callLambdaJson } from "../_shared/http"

export type SummaryMeta = { userId: string; postId: string; submissionId?: string }
export type OneLineSummaryInput = {
  doc: Record<string, unknown>
  fetchLinks?: boolean | "auto"
  links?: string[]
  meta: SummaryMeta
  bedrockRegion?: string
  models?: unknown
  modelIds?: unknown
  modelMap?: Record<string, string>
}

export type OneLineSummaryResponse = {
  summary: string[]
  modelId?: string
  bedrockRegion?: string
  consumedLinks?: string[]
}

export async function oneLineSummary(
  input: OneLineSummaryInput,
  options?: { url?: string; apiKey?: string | null; signal?: AbortSignal }
): Promise<OneLineSummaryResponse> {
  const baseUrl = options?.url || process.env.NEXT_PUBLIC_AI_SUMMARY_URL || "https://lo36a3z6gcw4f6dl2s23bqmlaq0wykkh.lambda-url.ap-northeast-2.on.aws/"
  const url = baseUrl.includes("?") ? `${baseUrl}&mode=1` : `${baseUrl}?mode=1`
  const apiKey = options?.apiKey || process.env.NEXT_PUBLIC_AI_API_KEY || null
  return await callLambdaJson<OneLineSummaryResponse>({
    url,
    apiKey,
    body: input,
    signal: options?.signal,
  })
}


