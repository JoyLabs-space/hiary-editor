"use client"

import * as React from "react"
import { AiMenu as AiMenuProd } from "@/components/tiptap-ui/ai-menu/ai-menu"

// Dev 전용 래퍼: 초기에는 운영 버전과 동일하게 동작하되, 추후 dev 전용 동작/아이템을 주입 가능
export function AiMenuDev(props: React.ComponentProps<typeof AiMenuProd>) {
  return <AiMenuProd {...props} />
}


