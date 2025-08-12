import { callLambdaJson } from "../_shared/http"

// Request per lambda_function.py (Mathpix OCR):
// imageBase64 (required), imageContentType (optional), fileName (optional), userId (required)
export type ImageToLatexInput = {
  imageBase64: string
  imageContentType?: string | null
  fileName?: string | null
  userId: string
}

// Response summary fields we rely on
export type ImageToLatexResponse = {
  imagePublicUrl?: string
  mathpixRaw?: Record<string, unknown>
  submissionId?: string
  timestamp?: string
  userId?: string
}

export async function imageToLatex(
  input: ImageToLatexInput,
  options?: { url?: string; apiKey?: string | null; signal?: AbortSignal }
): Promise<ImageToLatexResponse> {
  const url = (
    options?.url ||
    process.env.NEXT_PUBLIC_AI_IMAGE_TO_LATEX_URL ||
    // Fallback to provided function URL for DEV
    "https://afsmdmthqd3vnu5x4to37j3ubu0mubwx.lambda-url.ap-northeast-2.on.aws/"
  ).trim()
  const apiKey = options?.apiKey || process.env.NEXT_PUBLIC_AI_API_KEY || null
  return await callLambdaJson<ImageToLatexResponse>({
    url,
    apiKey,
    body: input,
    signal: options?.signal,
  })
}
