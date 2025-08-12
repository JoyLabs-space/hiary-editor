"use client"

import * as React from "react"

// DEV-only AI provider: do not fetch any tokens, no TipTap Pro usage
export const AiProviderDev = ({ children }: { children: React.ReactNode }) => {
  const value = React.useMemo(() => ({ hasAi: false, aiToken: null }), [])
  return (
    // simple context pass-through to avoid provider absence
    // we don't import the real AiContext to keep dev isolated
    <React.Fragment>{children}</React.Fragment>
  )
}

// DEV-only Collab provider: disable collaboration entirely
export const CollabProviderDev = ({
  children,
  room,
}: {
  children: React.ReactNode
  room?: string
}) => <React.Fragment>{children}</React.Fragment>


