"use client"

import * as React from "react"
import { type Editor } from "@tiptap/react"

// 최소 UI만 사용 (프리미티브)
import { Menu, MenuContent, useFloatingMenuStore } from "@/components/tiptap-ui-primitive/menu"
import { ComboboxList } from "@/components/tiptap-ui-primitive/combobox"
import { Card } from "@/components/tiptap-ui-primitive/card/card"

// DEV 전용 상태 훅 (프로 동작 제거)
import { useAiMenuState, useAiMenuStateProvider } from "./ai-menu-hooks"

// 스타일 (UI 틀만 사용)
import "@/components/tiptap-ui/ai-menu/ai-menu.scss"

export function AiMenuStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { value, AiMenuStateContext } = useAiMenuStateProvider()

  return (
    <AiMenuStateContext.Provider value={value}>
      {children}
    </AiMenuStateContext.Provider>
  )
}

export function AiMenuContent({
  editor: providedEditor,
}: {
  editor?: Editor | null
}) {
  // editor는 타입만 유지 (내부 기능 비활성화)
  const editor = providedEditor ?? null
  const { state, updateState, setFallbackAnchor, reset } = useAiMenuState()
  const { show, store } = useFloatingMenuStore()
  // 최소 동작: 커스텀 이벤트로 열고 닫기 (외부에서 dispatch)
  React.useEffect(() => {
    const handleOpen = (e: Event) => {
      const element = (editor?.view?.dom as HTMLElement) || document.body
      const rect = element.getBoundingClientRect()
      setFallbackAnchor(element, rect)
      updateState({ isOpen: true })
      show(element)
    }
    const handleClose = (e: Event) => {
      updateState({ isOpen: false })
      reset()
      store?.hideAll()
    }
    window.addEventListener("open-dev-ai-menu", handleOpen)
    window.addEventListener("close-dev-ai-menu", handleClose)
    return () => {
      window.removeEventListener("open-dev-ai-menu", handleOpen)
      window.removeEventListener("close-dev-ai-menu", handleClose)
    }
  }, [editor, setFallbackAnchor, updateState, reset, show, store])

  if (!state.isOpen) return null

  return (
    <Menu open={state.isOpen} placement="bottom-start" store={store}>
      <MenuContent className="tiptap-ai-menu" flip={false}>
        <Card>
          <ComboboxList>
            {/* Placeholder items only; no behavior */}
            <button className="tiptap-button" type="button">
              <span className="tiptap-button-text">Image to LaTeX</span>
            </button>
            <button className="tiptap-button" type="button">
              <span className="tiptap-button-text">한줄 요약</span>
            </button>
            <button className="tiptap-button" type="button">
              <span className="tiptap-button-text">세줄 요약</span>
            </button>
          </ComboboxList>
        </Card>
      </MenuContent>
    </Menu>
  )
}

export function AiMenu({ editor }: { editor?: Editor | null }) {
  return (
    <AiMenuStateProvider>
      <AiMenuContent editor={editor} />
    </AiMenuStateProvider>
  )
}
