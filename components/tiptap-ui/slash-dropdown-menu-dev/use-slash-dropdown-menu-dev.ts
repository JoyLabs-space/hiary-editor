"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"

// 운영 버전 훅을 재사용하되, dev 전용 커스텀 아이템/그룹만 오버레이할 수 있도록 래핑
import {
  useSlashDropdownMenu as useSlashDropdownMenuProd,
  type SlashMenuConfig,
} from "@/components/tiptap-ui/slash-dropdown-menu/use-slash-dropdown-menu"
import type { SuggestionItem } from "@/components/tiptap-ui-utils/suggestion-menu"

export type SlashMenuConfigDev = SlashMenuConfig & {
  devItems?: SuggestionItem[]
}

export function useSlashDropdownMenu(config?: SlashMenuConfigDev) {
  const prod = useSlashDropdownMenuProd(config)

  const getSlashMenuItems = React.useCallback(
    (editor: Editor) => {
      const base = prod.getSlashMenuItems(editor)
      const devItems = config?.devItems || []
      return [...base, ...devItems]
    },
    [prod, config?.devItems]
  )

  return { ...prod, getSlashMenuItems }
}


