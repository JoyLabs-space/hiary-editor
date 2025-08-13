"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"

// --- Icons ---
import { CodeBlockIcon } from "@/components/tiptap-icons/code-block-icon"
import { HeadingOneIcon } from "@/components/tiptap-icons/heading-one-icon"
import { HeadingTwoIcon } from "@/components/tiptap-icons/heading-two-icon"
import { HeadingThreeIcon } from "@/components/tiptap-icons/heading-three-icon"
import { ImageIcon } from "@/components/tiptap-icons/image-icon"
import { ListIcon } from "@/components/tiptap-icons/list-icon"
import { ListOrderedIcon } from "@/components/tiptap-icons/list-ordered-icon"
import { BlockquoteIcon } from "@/components/tiptap-icons/blockquote-icon"
import { ListTodoIcon } from "@/components/tiptap-icons/list-todo-icon"
import { AiSparklesIcon } from "@/components/tiptap-icons/ai-sparkles-icon"
import { MinusIcon } from "@/components/tiptap-icons/minus-icon"
import { TypeIcon } from "@/components/tiptap-icons/type-icon"
import { AtSignIcon } from "@/components/tiptap-icons/at-sign-icon"
import { SmilePlusIcon } from "@/components/tiptap-icons/smile-plus-icon"
import { FunctionSquareIcon } from "@/components/tiptap-icons/function-square-icon"

// --- Lib ---
import {
  isExtensionAvailable,
  isNodeInSchema,
} from "@/lib/tiptap-utils"
import {
  findSelectionPosition,
  hasContentAbove,
} from "@/lib/tiptap-advanced-utils"

// --- Tiptap UI ---
import type { SuggestionItem } from "@/components/tiptap-ui-utils/suggestion-menu"
import { addEmojiTrigger } from "@/components/tiptap-ui/emoji-trigger-button"
import { addMentionTrigger } from "@/components/tiptap-ui/mention-trigger-button"

// --- hiaryAI Actions ---
import { imageToLatex } from "@/components/tiptap-ui/ai-action/image-to-latex"
import { threeLineSummary } from "@/components/tiptap-ui/ai-action/three-line-summary"
import { oneLineSummary } from "@/components/tiptap-ui/ai-action/one-line-summary"

export interface SlashMenuConfig {
  enabledItems?: SlashMenuItemType[]
  customItems?: SuggestionItem[]
  itemGroups?: {
    [key in SlashMenuItemType]?: string
  }
  showGroups?: boolean
}

const texts = {
  // hiaryAI (keep at top to prioritize in menu ordering)
  hiaryai_image_to_latex: {
    title: "Image → LaTeX",
    subtext: "이미지를 인식하여 LaTeX로 변환",
    aliases: ["image", "latex", "ocr", "mathpix", "hiaryAI"],
    badge: AiSparklesIcon,
    group: "hiaryAI",
  },
  hiaryai_three_line_summary: {
    title: "Three-line Summary",
    subtext: "문서를 세 줄로 요약",
    aliases: ["summary", "three", "3", "lines", "hiaryAI"],
    badge: AiSparklesIcon,
    group: "hiaryAI",
  },
  hiaryai_one_line_summary: {
    title: "One-line Summary",
    subtext: "문서를 한 줄로 요약",
    aliases: ["summary", "one", "1", "line", "hiaryAI"],
    badge: AiSparklesIcon,
    group: "hiaryAI",
  },
  // AI
  continue_writing: {
    title: "Continue Writing",
    subtext: "Continue writing from the current position",
    aliases: ["continue", "write", "continue writing", "ai"],
    badge: AiSparklesIcon,
    group: "AI",
  },
  ai_ask_button: {
    title: "Ask AI",
    subtext: "Ask AI to generate content",
    aliases: ["ai", "ask", "generate"],
    badge: AiSparklesIcon,
    group: "AI",
  },

  // Style
  text: {
    title: "Text",
    subtext: "Regular text paragraph",
    aliases: ["p", "paragraph", "text"],
    badge: TypeIcon,
    group: "Style",
  },
  heading_1: {
    title: "Heading 1",
    subtext: "Top-level heading",
    aliases: ["h", "heading1", "h1"],
    badge: HeadingOneIcon,
    group: "Style",
  },
  heading_2: {
    title: "Heading 2",
    subtext: "Key section heading",
    aliases: ["h2", "heading2", "subheading"],
    badge: HeadingTwoIcon,
    group: "Style",
  },
  heading_3: {
    title: "Heading 3",
    subtext: "Subsection and group heading",
    aliases: ["h3", "heading3", "subheading"],
    badge: HeadingThreeIcon,
    group: "Style",
  },
  bullet_list: {
    title: "Bullet List",
    subtext: "List with unordered items",
    aliases: ["ul", "li", "list", "bulletlist", "bullet list"],
    badge: ListIcon,
    group: "Style",
  },
  ordered_list: {
    title: "Numbered List",
    subtext: "List with ordered items",
    aliases: ["ol", "li", "list", "numberedlist", "numbered list"],
    badge: ListOrderedIcon,
    group: "Style",
  },
  task_list: {
    title: "To-do list",
    subtext: "List with tasks",
    aliases: ["tasklist", "task list", "todo", "checklist"],
    badge: ListTodoIcon,
    group: "Style",
  },
  quote: {
    title: "Blockquote",
    subtext: "Blockquote block",
    aliases: ["quote", "blockquote"],
    badge: BlockquoteIcon,
    group: "Style",
  },
  code_block: {
    title: "Code Block",
    subtext: "Code block with syntax highlighting",
    aliases: ["code", "pre"],
    badge: CodeBlockIcon,
    group: "Style",
  },

  // Insert
  mention: {
    title: "Mention",
    subtext: "Mention a user or item",
    aliases: ["mention", "user", "item", "tag"],
    badge: AtSignIcon,
    group: "Insert",
  },
  emoji: {
    title: "Emoji",
    subtext: "Insert an emoji",
    aliases: ["emoji", "emoticon", "smiley"],
    badge: SmilePlusIcon,
    group: "Insert",
  },
  divider: {
    title: "Separator",
    subtext: "Horizontal line to separate content",
    aliases: ["hr", "horizontalRule", "line", "separator"],
    badge: MinusIcon,
    group: "Insert",
  },
  inline_math: {
    title: "인라인 수식",
    subtext: "텍스트 중간에 수식 삽입",
    aliases: ["math", "latex", "formula", "equation", "inline"],
    badge: FunctionSquareIcon,
    group: "Insert",
  },
  block_math: {
    title: "블록 수식",
    subtext: "독립된 블록으로 수식 삽입",
    aliases: ["math", "latex", "formula", "equation", "block"],
    badge: FunctionSquareIcon,
    group: "Insert",
  },
  table: {
    title: "테이블",
    subtext: "3x3 테이블 삽입",
    aliases: ["TableKit"],
    badge: FunctionSquareIcon,
    group: "Insert",
  },

  // Table utilities
  table_add_row: {
    title: "행 추가(아래)",
    subtext: "현재 행 아래에 새 행을 추가",
    aliases: ["row", "add row", "행 추가"],
    badge: FunctionSquareIcon,
    group: "Insert",
  },

  // Upload
  image: {
    title: "Image",
    subtext: "Resizable image with caption",
    aliases: [
      "image",
      "imageUpload",
      "upload",
      "img",
      "picture",
      "media",
      "url",
    ],
    badge: ImageIcon,
    group: "Upload",
  },
}

export type SlashMenuItemType = keyof typeof texts

const getItemImplementations = () => {
  return {
    // hiaryAI
    hiaryai_image_to_latex: {
      check: () => true,
      action: ({ editor }: { editor: Editor }) => {
        try {
          // 1) 이미지 업로드 패널 노드 삽입 (드롭/클릭 업로드 지원)
          editor
            .chain()
            .focus()
            .insertContent({
              type: "imageUpload",
              attrs: {
                accept: "image/*",
                limit: 1,
                mode: "ocrToLatex",
              },
            })
            .run()

          // 2) 업로드 노드에서 실제 파일 선택/드롭이 완료되면
          //    image-upload-node.tsx가 이미지 업로드를 수행하고 이미지 노드를 삽입하도록 되어있으나,
          //    OCR→LaTeX 플로우에선 업로드 대신 클라이언트에서 base64를 바로 보내어 OCR 호출.
          //    여기서는 간단히 파일 선택 다이얼로그를 띄워 OCR만 진행하고, 결과를 수식으로 삽입한다.

          const input = document.createElement("input")
          input.type = "file"
          input.accept = "image/*"
          input.style.position = "fixed"
          input.style.left = "-9999px"
          document.body.appendChild(input)
          input.onchange = () => {
            const file = input.files?.[0]
            document.body.removeChild(input)
            if (!file) return

            const reader = new FileReader()
            reader.onload = async () => {
              try {
                const base64 = String(reader.result || "")
                const userId =
                  window.localStorage.getItem("_tiptap_user_id") || "anonymous"

                const response = await imageToLatex({
                  imageBase64: base64,
                  imageContentType: file.type || undefined,
                  fileName: file.name || undefined,
                  userId,
                })

                type MathpixRaw = {
                  latex_styled?: string
                  latex?: string
                  text?: string
                }
                type MathpixResponse = { mathpixRaw?: MathpixRaw }
                const raw: MathpixRaw = (response as MathpixResponse).mathpixRaw || {}
                const latexRaw = raw.latex_styled || raw.latex || raw.text || ""

                const latex: string = String(latexRaw || "").trim()
                if (latex) {
                  const isBlock = /^\\begin\{[\s\S]+?\}/.test(latex)
                   const hasMathExt = Boolean(
                     isExtensionAvailable(editor, ["Mathematics"]) ||
                     editor.schema.nodes["inlineMath"] || editor.schema.nodes["blockMath"]
                   )

                  if (hasMathExt && isBlock) {
                    // Block math
                    editor.chain().focus().insertContent({ type: "blockMath", attrs: { latex } }).run()
                  } else if (hasMathExt) {
                    // Inline math
                    editor.chain().focus().insertContent({ type: "inlineMath", attrs: { latex } }).run()
                  } else {
                    // 확장 없으면 텍스트로 폴백
                    editor.chain().focus().insertContent({
                      type: "paragraph",
                      content: [{ type: "text", text: latex }],
                    }).run()
                  }
                } else {
                  editor.chain().focus().insertContent({
                    type: "paragraph",
                    content: [
                      { type: "text", text: "LaTeX 추출 결과가 없습니다." },
                    ],
                  }).run()
                }
              } catch (err) {
                console.error("imageToLatex failed", err)
              }
            }
            reader.readAsDataURL(file)
          }
          input.click()
        } catch (error) {
          console.error("Failed to start Image→LaTeX flow", error)
        }
      },
    },
    hiaryai_three_line_summary: {
      check: () => true,
      action: ({ editor }: { editor: Editor }) => {
        ;(async () => {
          try {
            const doc = editor.getJSON()
            const params = new URLSearchParams(window.location.search)
            const userId =
              window.localStorage.getItem("_tiptap_user_id") || "anonymous"
            const postId =
              params.get("postId") || window.location.pathname || "post"

            const res = await threeLineSummary({
              doc,
              meta: { userId, postId },
            })

            const lines = Array.isArray(res.summary) ? res.summary : []
            if (lines.length > 0) {
              const content = lines.map((line) => ({
                type: "paragraph",
                content: [{ type: "text", text: String(line) }],
              }))
              editor.chain().focus().insertContent(content).run()
            }
          } catch (err) {
            console.error("threeLineSummary failed", err)
          }
        })()
      },
    },
    hiaryai_one_line_summary: {
      check: () => true,
      action: ({ editor }: { editor: Editor }) => {
        ;(async () => {
          try {
            const doc = editor.getJSON()
            const params = new URLSearchParams(window.location.search)
            const userId =
              window.localStorage.getItem("_tiptap_user_id") || "anonymous"
            const postId =
              params.get("postId") || window.location.pathname || "post"

            const res = await oneLineSummary({
              doc,
              meta: { userId, postId },
            })

            const text = Array.isArray(res.summary) ? res.summary[0] : null
            if (text) {
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "paragraph",
                  content: [{ type: "text", text: String(text) }],
                })
                .run()
            }
          } catch (err) {
            console.error("oneLineSummary failed", err)
          }
        })()
      },
    },
    // AI
    continue_writing: {
      check: (editor: Editor) => {
        const { hasContent } = hasContentAbove(editor)
        const extensionsReady = isExtensionAvailable(editor, [
          "ai",
          "aiAdvanced",
        ])
        return extensionsReady && hasContent
      },
      action: ({ editor }: { editor: Editor }) => {
        const editorChain = editor.chain().focus()

        const nodeSelectionPosition = findSelectionPosition({ editor })

        if (nodeSelectionPosition !== null) {
          editorChain.setNodeSelection(nodeSelectionPosition)
        }

        editorChain.run()

        const chainAny = editor.chain().focus() as unknown as {
          aiGenerationShow?: () => { run: () => boolean }
        }
        if (typeof chainAny.aiGenerationShow === "function") {
          chainAny.aiGenerationShow().run()
        }
      },
    },
    ai_ask_button: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["ai", "aiAdvanced"]),
      action: ({ editor }: { editor: Editor }) => {
        const editorChain = editor.chain().focus()

        const nodeSelectionPosition = findSelectionPosition({ editor })

        if (nodeSelectionPosition !== null) {
          editorChain.setNodeSelection(nodeSelectionPosition)
        }

        editorChain.run()

        const chainAny = editor.chain().focus() as unknown as {
          aiGenerationShow?: () => { run: () => boolean }
        }
        if (typeof chainAny.aiGenerationShow === "function") {
          chainAny.aiGenerationShow().run()
        }
      },
    },

    // Style
    text: {
      check: (editor: Editor) => isNodeInSchema("paragraph", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setParagraph().run()
      },
    },
    heading_1: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 1 }).run()
      },
    },
    heading_2: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 2 }).run()
      },
    },
    heading_3: {
      check: (editor: Editor) => isNodeInSchema("heading", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleHeading({ level: 3 }).run()
      },
    },
    bullet_list: {
      check: (editor: Editor) => isNodeInSchema("bulletList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBulletList().run()
      },
    },
    ordered_list: {
      check: (editor: Editor) => isNodeInSchema("orderedList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleOrderedList().run()
      },
    },
    task_list: {
      check: (editor: Editor) => isNodeInSchema("taskList", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleTaskList().run()
      },
    },
    quote: {
      check: (editor: Editor) => isNodeInSchema("blockquote", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleBlockquote().run()
      },
    },
    code_block: {
      check: (editor: Editor) => isNodeInSchema("codeBlock", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().toggleNode("codeBlock", "paragraph").run()
      },
    },

    // Insert
    mention: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["mention", "mentionAdvanced"]),
      action: ({ editor }: { editor: Editor }) => addMentionTrigger(editor),
    },
    emoji: {
      check: (editor: Editor) =>
        isExtensionAvailable(editor, ["emoji", "emojiPicker"]),
      action: ({ editor }: { editor: Editor }) => addEmojiTrigger(editor),
    },
    divider: {
      check: (editor: Editor) => isNodeInSchema("horizontalRule", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().setHorizontalRule().run()
      },
    },
    inline_math: {
      check: (editor: Editor) => isExtensionAvailable(editor, ["Mathematics", "inlineMath"]),
      action: ({ editor }: { editor: Editor }) => {
        // 모달 상태를 전역으로 관리하기 위해 커스텀 이벤트 사용
        const event = new CustomEvent('open-math-modal', {
          detail: {
            type: 'inline',
            editor
          }
        })
        window.dispatchEvent(event)
      },
    },
    block_math: {
      check: (editor: Editor) => isExtensionAvailable(editor, ["Mathematics", "blockMath"]),
      action: ({ editor }: { editor: Editor }) => {
        // 모달 상태를 전역으로 관리하기 위해 커스텀 이벤트 사용
        const event = new CustomEvent('open-math-modal', {
          detail: {
            type: 'block',
            editor
          }
        })
        window.dispatchEvent(event)
      },
    },
    table: {
      check: (editor: Editor) => isNodeInSchema("table", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      },
    },
    table_add_row: {
      check: (editor: Editor) => editor.isActive('table'),
      action: ({ editor }: { editor: Editor }) => {
        editor.chain().focus().addRowAfter().run()
      },
    },
    // Upload
    image: {
      check: (editor: Editor) => isNodeInSchema("image", editor),
      action: ({ editor }: { editor: Editor }) => {
        editor
          .chain()
          .focus()
          .insertContent({
            type: "imageUpload",
          })
          .run()
      },
    },
  }
}

function organizeItemsByGroups(
  items: SuggestionItem[],
  showGroups: boolean
): SuggestionItem[] {
  if (!showGroups) {
    return items.map((item) => ({ ...item, group: "" }))
  }

  const groups: { [groupLabel: string]: SuggestionItem[] } = {}

  // Group items
  items.forEach((item) => {
    const groupLabel = item.group || ""
    if (!groups[groupLabel]) {
      groups[groupLabel] = []
    }
    groups[groupLabel].push(item)
  })

  // Flatten groups in order (this maintains the visual order for keyboard navigation)
  const organizedItems: SuggestionItem[] = []
  Object.entries(groups).forEach(([, groupItems]) => {
    organizedItems.push(...groupItems)
  })

  return organizedItems
}

/**
 * Custom hook for slash dropdown menu functionality
 */
export function useSlashDropdownMenu(config?: SlashMenuConfig) {
  const getSlashMenuItems = React.useCallback(
    (editor: Editor) => {
      const items: SuggestionItem[] = []

      const enabledItems =
        config?.enabledItems || (Object.keys(texts) as SlashMenuItemType[])
      const showGroups = config?.showGroups !== false

      // Debug logs removed

      const itemImplementations = getItemImplementations()

      enabledItems.forEach((itemType) => {
        const itemImpl = itemImplementations[itemType]
        const itemText = texts[itemType]

        // Debug log removed

        if (itemImpl && itemText && itemImpl.check(editor)) {
          const item: SuggestionItem = {
            onSelect: ({ editor }) => itemImpl.action({ editor }),
            ...itemText,
          }

          if (config?.itemGroups?.[itemType]) {
            item.group = config.itemGroups[itemType]
          } else if (!showGroups) {
            item.group = ""
          }

          items.push(item)
        }
      })

      if (config?.customItems) {
        items.push(...config.customItems)
      }

      // Reorganize items by groups to ensure keyboard navigation works correctly
      return organizeItemsByGroups(items, showGroups)
    },
    [config]
  )

  return {
    getSlashMenuItems,
    config,
  }
}
