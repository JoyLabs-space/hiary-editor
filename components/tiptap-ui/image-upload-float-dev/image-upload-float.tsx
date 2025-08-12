"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Menu, MenuContent, useFloatingMenuStore } from "@/components/tiptap-ui-primitive/menu"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { imageToLatex } from "@/components/tiptap-ui/ai-actions-dev/image-to-latex/image-to-latex"

type Props = { editor?: Editor | null }

function bytesToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export const ImageUploadFloatDev: React.FC<Props> = ({ editor }) => {
  const { store } = useFloatingMenuStore()
  const [isOpen, setIsOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = React.useState(false)

  const close = React.useCallback(() => setIsOpen(false), [])
  const open = React.useCallback(() => setIsOpen(true), [])

  React.useEffect(() => {
    const openHandler = () => open()
    const closeHandler = () => close()
    window.addEventListener("open-dev-ai-menu-image-to-latex", openHandler)
    window.addEventListener("close-dev-ai-menu-image-to-latex", closeHandler)
    return () => {
      window.removeEventListener("open-dev-ai-menu-image-to-latex", openHandler)
      window.removeEventListener("close-dev-ai-menu-image-to-latex", closeHandler)
    }
  }, [open, close])

  const handleFiles = React.useCallback(
    async (files: FileList | File[] | null) => {
      if (!editor || !files || files.length === 0) return
      const file = Array.isArray(files) ? files[0] : files.item(0)
      if (!file) return

      try {
        const buffer = await file.arrayBuffer()
        const base64 = bytesToBase64(buffer)
        const mime = file.type || "application/octet-stream"
        const dataUrl = `data:${mime};base64,${base64}`
        const userId =
          (typeof window !== "undefined" && window.localStorage.getItem("_tiptap_user_id")) ||
          "dev-user"

        const res = await imageToLatex({
          imageBase64: dataUrl,
          imageContentType: mime,
          fileName: file.name,
          userId,
        })
        const latex = extractLatexFromMathpixRaw(res?.mathpixRaw)
        if (!latex) {
          console.warn("No LaTeX returned from OCR")
          close()
          return
        }
        const isBlock = latex.startsWith("\\begin")
        const content = isBlock
          ? { type: "mathBlock", attrs: { latex } }
          : { type: "mathInline", attrs: { latex } }

        editor.chain().focus().insertContentAt(editor.state.selection.from, content).run()
      } catch (err) {
        console.error("OCR failed", err)
      } finally {
        close()
      }
    },
    [editor, close]
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  if (!editor || !isOpen) return null

  return (
    <Menu open={isOpen} placement="bottom-start" store={store}>
      <MenuContent className="tiptap-ai-menu" flip={false} style={{ width: 360 }}>
        <div
          style={{
            border: "1px dashed var(--border-primary, #ccc)",
            borderRadius: 12,
            padding: 16,
            background: isDragOver ? "rgba(0,0,0,0.03)" : "transparent",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
        >
          <div style={{ fontWeight: 600 }}>수식 이미지 변환</div>
          <div style={{ color: "var(--text-secondary, #666)", fontSize: 13 }}>
            이미지를 드롭하거나, 아래 버튼을 눌러 업로드하면 OCR 후 수식으로 삽입됩니다.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              type="button"
              data-style="ghost"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = ""
                  inputRef.current.click()
                }
              }}
            >
              이미지 선택
            </Button>
            <Button type="button" data-style="ghost" onClick={close}>
              닫기
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      </MenuContent>
    </Menu>
  )
}

function extractLatexFromMathpixRaw(
  raw: Record<string, unknown> | undefined
): string {
  const candidates: Array<keyof typeof raw> = [
    "latex_styled" as keyof typeof raw,
    "latex" as keyof typeof raw,
    "text" as keyof typeof raw,
  ]
  for (const key of candidates) {
    const val = raw ? (raw as Record<string, unknown>)[key as string] : undefined
    if (typeof val === "string" && val.trim()) {
      return val.trim()
    }
  }
  return ""
}


