import { callLambdaJson } from "../_shared/http"

export type SummaryMeta = { userId: string; postId: string; submissionId?: string }
export type ThreeLineSummaryInput = {
  doc: Record<string, unknown>
  fetchLinks?: boolean | "auto"
  links?: string[]
  meta: SummaryMeta
  bedrockRegion?: string
  models?: unknown
  modelIds?: unknown
  modelMap?: Record<string, string>
  // Optional Bedrock Inference Profile identifiers
  inferenceProfileArn?: string
  inferenceProfileId?: string
}

export type ThreeLineSummaryResponse = {
  summary: string[]
  modelId?: string
  bedrockRegion?: string
  consumedLinks?: string[]
}

export async function threeLineSummary(
  input: ThreeLineSummaryInput,
  options?: { url?: string; apiKey?: string | null; signal?: AbortSignal }
): Promise<ThreeLineSummaryResponse> {
  const baseUrl = options?.url || process.env.NEXT_PUBLIC_AI_SUMMARY_URL || "https://lo36a3z6gcw4f6dl2s23bqmlaq0wykkh.lambda-url.ap-northeast-2.on.aws/"
  const url = baseUrl.includes("?") ? `${baseUrl}&mode=3` : `${baseUrl}?mode=3`
  const apiKey = options?.apiKey || process.env.NEXT_PUBLIC_AI_API_KEY || null
  const envProfileArn = process.env.NEXT_PUBLIC_BEDROCK_INFERENCE_PROFILE_ARN
  const envProfileId = process.env.NEXT_PUBLIC_BEDROCK_INFERENCE_PROFILE_ID

  const body = {
    ...input,
    ...(input.inferenceProfileArn || envProfileArn
      ? { inferenceProfileArn: input.inferenceProfileArn || envProfileArn }
      : {}),
    ...(input.inferenceProfileId || envProfileId
      ? { inferenceProfileId: input.inferenceProfileId || envProfileId }
      : {}),
  }
  return await callLambdaJson<ThreeLineSummaryResponse>({
    url,
    apiKey,
    body: input,
    signal: options?.signal,
  })
}


