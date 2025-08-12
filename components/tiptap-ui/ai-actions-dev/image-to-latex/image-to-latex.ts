import { callLambdaJson } from "../_shared/http"

export type ImageToLatexInput = {
  imageUrl: string
}

export type ImageToLatexResponse = {
  latex: string
}

export async function imageToLatex(
  input: ImageToLatexInput,
  options?: { url?: string; apiKey?: string | null; signal?: AbortSignal }
): Promise<ImageToLatexResponse> {
  const url = options?.url || process.env.NEXT_PUBLIC_AI_IMAGE_TO_LATEX_URL || ""
  const apiKey = options?.apiKey || process.env.NEXT_PUBLIC_AI_API_KEY || null
  return await callLambdaJson<ImageToLatexResponse>({
    url,
    apiKey,
    body: input,
    signal: options?.signal,
  })
}


