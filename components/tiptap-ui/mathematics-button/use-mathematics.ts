"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useIsMobile } from "@/hooks/use-mobile"

// --- Constants ---
const MATHEMATICS_SHORTCUT_KEY = ["mod", "m"]

export interface UseMathematicsConfig {
  editor?: Editor | null
  hideWhenUnavailable?: boolean
  type?: "inline" | "block"
  onInserted?: () => void
}

/**
 * Checks if the editor has the Mathematics extension
 */
function hasMathematicsExtension(editor: Editor | null): boolean {
  if (!editor) return false
  return editor.extensionManager.extensions.some(ext => 
    ["Mathematics", "inlineMath", "blockMath"].includes(ext.name)
  )
}

/**
 * Checks if mathematics can be inserted
 */
function canInsertMathematics(editor: Editor | null, type: "inline" | "block"): boolean {
  if (!editor || !hasMathematicsExtension(editor)) return false
  
  if (type === "inline") {
    return editor.can().insertInlineMath({ latex: "" })
  } else {
    return editor.can().insertBlockMath({ latex: "" })
  }
}

/**
 * Inserts mathematics
 */
function insertMathematics(editor: Editor | null, type: "inline" | "block", latex: string = ""): boolean {
  if (!editor || !canInsertMathematics(editor, type)) return false
  
  if (type === "inline") {
    return editor.chain().focus().insertInlineMath({ latex }).run()
  } else {
    return editor.chain().focus().insertBlockMath({ latex }).run()
  }
}

/**
 * Checks if the button should be shown
 */
function shouldShowButton({
  editor,
  hideWhenUnavailable,
}: {
  editor: Editor | null
  hideWhenUnavailable: boolean
}): boolean {
  if (!editor || !editor.isEditable) return false
  
  if (hideWhenUnavailable && !hasMathematicsExtension(editor)) {
    return false
  }
  
  return true
}

/**
 * Custom hook that provides mathematics functionality for Tiptap editor
 */
export function useMathematics(config: UseMathematicsConfig = {}) {
  const {
    editor: providedEditor,
    hideWhenUnavailable = false,
    type = "inline",
    onInserted,
  } = config

  const { editor } = useTiptapEditor(providedEditor)
  const isMobile = useIsMobile()
  const [isVisible, setIsVisible] = React.useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false)
  const canInsert = canInsertMathematics(editor, type)

  React.useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(shouldShowButton({ editor, hideWhenUnavailable }))
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable])

  const handleInsert = React.useCallback(() => {
    if (!editor) return false
    
    // 모달 열기
    setIsModalOpen(true)
    return true
  }, [editor])

  const handleModalSubmit = React.useCallback((latex: string) => {
    if (!editor) return false

    const success = insertMathematics(editor, type, latex)
    if (success) {
      onInserted?.()
    }
    setIsModalOpen(false)
    return success
  }, [editor, type, onInserted])

  const handleModalCancel = React.useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // useHotkeys(
  //   MATHEMATICS_SHORTCUT_KEY,
  //   (event) => {
  //     event.preventDefault()
  //     handleInsert()
  //   },
  //   {
  //     enabled: isVisible && canInsert,
  //     enableOnContentEditable: !isMobile,
  //     enableOnFormTags: true,
  //   }
  // )

  return {
    isVisible,
    handleInsert,
    canInsert,
    isModalOpen,
    handleModalSubmit,
    handleModalCancel,
    label: type === "inline" ? "인라인 수식" : "블록 수식",
    Icon: null, // Will be set in the button component
  }
} 