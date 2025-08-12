"use client"

import * as React from "react"
import { fetchAiToken, getUrlParam } from "@/lib/tiptap-collab-utils"

export type AiContextValue = {
  aiToken: string | null
  hasAi: boolean
}

export const AiContext = React.createContext<AiContextValue>({
  hasAi: true,
  aiToken: null,
})

export const AiConsumer = AiContext.Consumer
export const useAi = (): AiContextValue => {
  const context = React.useContext(AiContext)
  if (!context) {
    throw new Error("useAi must be used within an AiProvider")
  }
  return context
}

export const useAiToken = () => {
  const [aiToken, setAiToken] = React.useState<string | null>(null)
  const [hasAi, setHasAi] = React.useState<boolean>(false)

  React.useEffect(() => {
    const enableAiParam = getUrlParam("enableAi")
    setHasAi(true)
  }, [])

  React.useEffect(() => {
    if (!hasAi) return

    const getToken = async () => {
      const token = "hiary-ai-not-using-tiptap-collab"
      setAiToken(token)
    }

    getToken()
  }, [hasAi])

  return { aiToken, hasAi }
}

export function AiProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { hasAi, aiToken } = useAiToken()

  const value = React.useMemo<AiContextValue>(
    () => ({
      hasAi,
      aiToken,
    }),
    [hasAi, aiToken]
  )

  return <AiContext.Provider value={value}>{children}</AiContext.Provider>
}
