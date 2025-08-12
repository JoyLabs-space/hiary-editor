"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskList, TaskItem } from "@tiptap/extension-list"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Placeholder, Selection } from "@tiptap/extensions"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Superscript } from "@tiptap/extension-superscript"
import { Subscript } from "@tiptap/extension-subscript"
import { TextAlign } from "@tiptap/extension-text-align"
import { Mathematics } from "@tiptap/extension-mathematics"
import { UniqueID } from "@tiptap/extension-unique-id"
import { Emoji, gitHubEmojis } from "@tiptap/extension-emoji"

// --- Hooks ---
import { useUiEditorState } from "@/hooks/use-ui-editor-state"

// --- Custom Extensions ---
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"
import { UiState } from "@/components/tiptap-extension/ui-state-extension"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"

// --- Tiptap UI ---
import { EmojiDropdownMenu } from "@/components/tiptap-ui/emoji-dropdown-menu"
import { SlashDropdownMenu } from "@/components/tiptap-ui/slash-dropdown-menu-dev" // 나중에는 dev 빼야함.
import { DragContextMenu } from "@/components/tiptap-ui/drag-context-menu"
// import { AiMenu } from "@/components/tiptap-ui/ai-menu-dev/ai-menu" // 나중에는 dev 빼야함.
import { useMathModal, MathInputModal } from "@/components/tiptap-ui/math-input-modal"
import { PasteModal } from "@/components/tiptap-ui/paste-modal/paste-modal"

// --- Contexts ---
import { AppProvider } from "@/contexts/app-context"
import { UserProvider } from "@/contexts/user-context"
// Use DEV overrides to avoid any TipTap Pro/Cloud calls
import { CollabProviderDev as CollabProvider, AiProviderDev as AiProvider } from "@/components/tiptap-templates/notion-like-dev/dev-context-overrides"
import { useCollab } from "@/contexts/collab-context"
import { useAi } from "@/contexts/ai-context"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import Paragraph from '@tiptap/extension-paragraph'
import { CodeBlockLanguageDropdown } from "@/components/tiptap-ui/code-block-language-dropdown/CodeBlockLanguageDropdown"
import { imageToLatex } from "@/components/tiptap-ui/ai-actions-dev/image-to-latex/image-to-latex"
import { TableKit } from '@tiptap/extension-table'

// --- Styles ---
import "@/components/tiptap-templates/notion-like-dev/notion-like-editor-dev.scss"
import "@/components/tiptap-ui/paste-modal/paste-modal.scss";

// --- Content ---
import { MobileToolbar } from "@/components/tiptap-templates/notion-like-dev/notion-like-editor-mobile-toolbar"
import { NotionToolbarFloating } from "@/components/tiptap-templates/notion-like-dev/notion-like-editor-toolbar-floating"
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import "highlight.js/styles/stackoverflow-dark.min.css";
import Youtube from '@tiptap/extension-youtube'

// 언어 등록
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import cpp from "highlight.js/lib/languages/cpp";
import json from "highlight.js/lib/languages/json";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import csharp from "highlight.js/lib/languages/csharp";
import sql from "highlight.js/lib/languages/sql";
import bash from "highlight.js/lib/languages/bash";
import markdown from "highlight.js/lib/languages/markdown";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import scss from "highlight.js/lib/languages/scss";
import less from "highlight.js/lib/languages/less";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import { TapIndent } from "@/components/tiptap-ui/tap-indent/tap-indent"
import { TableHoverControls } from "@/components/tiptap-ui/table-hover-controls/table-hover-controls"
import { ImageUploadFloatDev } from "@/components/tiptap-ui/image-upload-float-dev"

lowlight.registerLanguage("css", css);
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("javascript", js);
lowlight.registerLanguage("jsx", js);
lowlight.registerLanguage("ts", ts);
lowlight.registerLanguage("tsx", ts);
lowlight.registerLanguage("typescript", ts);
lowlight.registerLanguage("json", json);
lowlight.registerLanguage("html", html);
lowlight.registerLanguage("xml", html);
lowlight.registerLanguage("python", python);
lowlight.registerLanguage("cpp", cpp);
lowlight.registerLanguage("c", c);
lowlight.registerLanguage("java", java);
lowlight.registerLanguage("csharp", csharp);
lowlight.registerLanguage("sql", sql);
lowlight.registerLanguage("bash", bash);
lowlight.registerLanguage("markdown", markdown);
lowlight.registerLanguage("php", php);
lowlight.registerLanguage("ruby", ruby);
lowlight.registerLanguage("scss", scss);
lowlight.registerLanguage("less", less);
lowlight.registerLanguage("go", go);
lowlight.registerLanguage("rust", rust);
lowlight.registerLanguage("swift", swift);
lowlight.registerLanguage("kotlin", kotlin);

export interface NotionEditorDevProps {
  room: string
  placeholder?: string
}

export interface EditorProviderProps {
  placeholder?: string
  aiToken?: string | null
}

export function LoadingSpinner({ text = "Connecting..." }: { text?: string }) {
  return (
    <div className="spinner-container">
      <div className="spinner-content">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="spinner-loading-text">{text}</div>
      </div>
    </div>
  )
}

export function EditorContentAreaDev() {
  const { editor } = React.useContext(EditorContext)!
  const {
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    aiGenerationHasMessage,
  } = useUiEditorState(editor)

  const { modalProps } = useMathModal()

  const [pasteModalState, setPasteModalState] = React.useState({
    isOpen: false,
    content: '',
    position: null as { x: number; y: number } | null,
  })

  React.useEffect(() => {
    const handleShowPasteModal = (event: CustomEvent) => {
      const { content, position } = event.detail
      setPasteModalState({ isOpen: true, content, position })
    }
    window.addEventListener('show-paste-modal', handleShowPasteModal as EventListener)
    return () => window.removeEventListener('show-paste-modal', handleShowPasteModal as EventListener)
  }, [])

  const handlePasteModalClose = React.useCallback(() => {
    setPasteModalState({ isOpen: false, content: '', position: null })
  }, [])

  React.useEffect(() => {
    if (!editor) return
    if (!aiGenerationIsLoading && aiGenerationIsSelection && aiGenerationHasMessage) {
      editor.commands.resetUiState()
      editor.commands.setCodeBlock()
      editor.commands.toggleCodeBlock()
    }
  }, [aiGenerationHasMessage, aiGenerationIsLoading, aiGenerationIsSelection, editor])

  // DEV: listen OCR result and replace imageUpload node with math node
  React.useEffect(() => {
    if (!editor) return
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ latex: string }>
      const latex = (ev.detail?.latex || "").trim()
      if (!latex) return
      const isBlock = latex.startsWith("\\begin")

      let imageUploadPos: number | null = null
      editor.state.doc.descendants((node, pos) => {
        if (imageUploadPos !== null) return false
        if (node.type.name === "imageUpload") {
          imageUploadPos = pos
          return false
        }
        return true
      })

      const content = isBlock
        ? { type: "mathBlock", attrs: { latex } }
        : { type: "mathInline", attrs: { latex } }

      editor.chain().focus()
        .command(({ tr }) => {
          if (imageUploadPos !== null) {
            tr.delete(imageUploadPos, imageUploadPos + 1)
          }
          return true
        })
        .insertContentAt(imageUploadPos ?? editor.state.selection.from, content)
        .run()
    }
    window.addEventListener("hiary-dev-ocr-result", handler as EventListener)
    return () => window.removeEventListener("hiary-dev-ocr-result", handler as EventListener)
  }, [editor])

  if (!editor) return null

  return (
    <>
      {modalProps && <MathInputModal {...modalProps} />}
      <EditorContent
        editor={editor}
        role="presentation"
        className="notion-like-editor-content"
        style={{ cursor: editor.view.dragging ? "grabbing" : "auto" }}
        spellCheck={false}
      >
        <MobileToolbar />
        <DragContextMenu />
        {/* <AiMenu /> */}
        <ImageUploadFloatDev editor={editor} />
        <EmojiDropdownMenu />
        <SlashDropdownMenu
          config={{
            enabledItems: [
              // // AI (DEV)
              // "one_line_summary",
              // "three_line_summary",
              // "img_2_math_eq",
              // Common
              "text",
              "heading_1",
              "heading_2",
              "heading_3",
              "bullet_list",
              "ordered_list",
              "task_list",
              "quote",
              "code_block",
              "mention",
              "emoji",
              "divider",
              "inline_math",
              "block_math",
              "table",
              "table_add_row",
              "image",
            ],
            showGroups: true,
          }}
        />
        <NotionToolbarFloating />
        <CodeBlockLanguageDropdown editor={editor} />
        <TableHoverControls editor={editor} />
      </EditorContent>
      <PasteModal
        editor={editor}
        isOpen={pasteModalState.isOpen}
        onClose={handlePasteModalClose}
        pastedContent={pasteModalState.content}
        position={pasteModalState.position}
      />
    </>
  )
}

export function EditorProviderDev(props: EditorProviderProps) {
  const { placeholder = "Start writing..." } = props

  const extensions = [
    StarterKit.configure({
      horizontalRule: false,
      dropcursor: { width: 2 },
      link: { openOnClick: false },
    }),
    HorizontalRule,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({ placeholder, emptyNodeClass: "is-empty with-slash" }),
    Emoji.configure({
      emojis: gitHubEmojis.filter((emoji) => !emoji.name.includes("regional")),
      forceFallbackImages: true,
    }),
    Mathematics.configure({
      inlineOptions: { onClick: (node, pos) => {
        if (!editor) return
        const latex = prompt('수식을 수정하세요:', node.attrs.latex)
        if (latex !== null) editor.chain().setNodeSelection(pos).updateInlineMath({ latex }).focus().run()
      }},
      blockOptions: { onClick: (node, pos) => {
        if (!editor) return
        const latex = prompt('수식을 수정하세요:', node.attrs.latex)
        if (latex !== null) editor.chain().setNodeSelection(pos).updateBlockMath({ latex }).focus().run()
      }},
      katexOptions: { throwOnError: false }
    }),
    Superscript,
    Subscript,
    Color,
    TextStyle,
    TaskList,
    TaskItem.configure({ nested: true }),
    Highlight.configure({ multicolor: true }),
    Selection,
    Image,
    ImageUploadNode.configure({
      accept: "image/*",
      maxSize: MAX_FILE_SIZE,
      limit: 1,
      upload: async (file: File) => {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const bytes = new Uint8Array(arrayBuffer)
          let binary = ""
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
          const base64 = btoa(binary)
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
          const raw = res?.mathpixRaw as Record<string, unknown> | undefined
          const rawLatexStyled = typeof raw?.latex_styled === 'string' ? raw?.latex_styled : ''
          const rawLatex = typeof raw?.latex === 'string' ? raw?.latex : ''
          const rawText = typeof raw?.text === 'string' ? raw?.text : ''
          const math = (rawLatexStyled || rawLatex || rawText).trim()
          if (math) {
            window.dispatchEvent(new CustomEvent("hiary-dev-ocr-result", { detail: { latex: math } }))
          }
        } catch (err) {
          console.error("Image OCR failed", err)
        }
        // returning empty string triggers upload error state inside node view
        // which is fine because we replace the node ourselves
        return ""
      },
      onError: (error) => console.error("Upload failed:", error),
    }),
    UniqueID,
    Typography,
    UiState,
    Paragraph,
    CodeBlockLowlight.configure({ lowlight, defaultLanguage: 'javascript' }),
    TapIndent,
    TableKit.configure({ table: { resizable: true } }),
    Youtube,
  ]

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: { class: "notion-like-editor" },
    },
    extensions,
  })

  if (!editor) return <LoadingSpinner />

  return (
    <div className="notion-like-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <EditorContentAreaDev />
      </EditorContext.Provider>
    </div>
  )
}

export function NotionEditorDev({ room, placeholder = "Start writing..." }: NotionEditorDevProps) {
  return (
    <UserProvider>
      <AppProvider>
        <CollabProvider room={room}>
          {/* <AiProvider> */}
          <NotionEditorContentDev placeholder={placeholder} />
          {/* </AiProvider> */}
        </CollabProvider>
      </AppProvider>
    </UserProvider>
  )
}

export function NotionEditorContentDev({ placeholder }: { placeholder?: string }) {
  const { provider, hasCollab } = useCollab()
  const { aiToken, hasAi } = useAi()
  if ((hasCollab && !provider) || (hasAi && !aiToken)) {
    return <LoadingSpinner />
  }
  return <EditorProviderDev placeholder={placeholder} aiToken={aiToken} />
}


