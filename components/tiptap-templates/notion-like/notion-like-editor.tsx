"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"
// Collaboration imports removed for standalone mode

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { Mention } from "@tiptap/extension-mention"
import { TaskList, TaskItem } from "@tiptap/extension-list"
import { Color, TextStyle } from "@tiptap/extension-text-style"
import { Placeholder, Selection } from "@tiptap/extensions"
// Collaboration extensions removed for standalone mode
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
import { MentionDropdownMenu } from "@/components/tiptap-ui/mention-dropdown-menu"
import { SlashDropdownMenu } from "@/components/tiptap-ui/slash-dropdown-menu"
import { DragContextMenu } from "@/components/tiptap-ui/drag-context-menu"
import { AiMenu } from "@/components/tiptap-ui/ai-menu"

// --- Contexts ---
import { AppProvider } from "@/contexts/app-context"
import { UserProvider, useUser } from "@/contexts/user-context"
import { CollabProvider, useCollab } from "@/contexts/collab-context"
import { AiProvider, useAi } from "@/contexts/ai-context"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { TIPTAP_AI_APP_ID } from "@/lib/tiptap-collab-utils"

// --- Styles ---
import "@/components/tiptap-templates/notion-like/notion-like-editor.scss"

// --- Content ---
import { NotionEditorHeader } from "@/components/tiptap-templates/notion-like/notion-like-editor-header"
import { MobileToolbar } from "@/components/tiptap-templates/notion-like/notion-like-editor-mobile-toolbar"
import { NotionToolbarFloating } from "@/components/tiptap-templates/notion-like/notion-like-editor-toolbar-floating"

export interface NotionEditorProps {
  room: string
  placeholder?: string
}

export interface EditorProviderProps {
  placeholder?: string
  aiToken?: string | null
}

/**
 * Loading spinner component shown while connecting to the notion server
 */
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

/**
 * EditorContent component that renders the actual editor
 */
export function EditorContentArea() {
  const { editor } = React.useContext(EditorContext)!
  const {
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    aiGenerationHasMessage,
  } = useUiEditorState(editor)

  // Selection based effect to handle AI generation acceptance
  React.useEffect(() => {
    if (!editor) return

    if (
      !aiGenerationIsLoading &&
      aiGenerationIsSelection &&
      aiGenerationHasMessage
    ) {
      editor.chain().focus().aiAccept().run()
      editor.commands.resetUiState()
    }
  }, [
    aiGenerationHasMessage,
    aiGenerationIsLoading,
    aiGenerationIsSelection,
    editor,
  ])

  // 에디터 내용을 JSON으로 추출하는 함수
  const getDocumentAsJson = React.useCallback(() => {
    if (!editor) return

    try {
      // 에디터의 JSON 내용 가져오기
      const jsonContent = editor.getJSON()

      return jsonContent;
      
    } catch (error) {
      console.error('에디터 내용 추출 중 오류 발생:', error)
    }
  }, [editor])

  // JSON 데이터로 에디터 내용을 설정하는 함수
  const setEditorJsonData = React.useCallback((data: Record<string, unknown>) => {
    if (!editor) {
      console.error('에디터가 초기화되지 않았습니다.')
      return
    }

    try {
      // JSON 데이터를 에디터에 설정
      editor.commands.setContent(data)
    } catch (error) {
      console.error('에디터 내용 설정 중 오류 발생:', error)
    }
  }, [editor])

  // 부모로부터 메시지를 받는 리스너
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'EDITOR_JSON_DATA':
            // 부모가 현재 문서 내용을 요청할 때
            const jsonData = getDocumentAsJson();
            if (jsonData) {
              sendToParent('documentData', jsonData);
            }
            break;
          case 'SET_EDITOR_JSON_DATA':
            const data = event.data.data;
            setEditorJsonData(data);
            break;
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [getDocumentAsJson, setEditorJsonData]);

  // 부모 윈도우로 데이터를 전송하는 함수
  const sendToParent = React.useCallback((type: string, data: Record<string, unknown>) => {
    if (window.parent && window.parent !== window) {
      console.log('DEBUG - sendToParent', data)
      window.parent.postMessage({
        type: 'EDITOR_JSON_DATA',
        data,
        source: 'notion-like-editor',
        payload: data,
      }, '*');
    }
  }, []);

// iframe 프로젝트 코드 안에서
React.useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      // 또는 부모에게 알릴 수도 있음
      window.parent.postMessage({ type: 'SAVE_PRESSED' }, '*');
    }
    window.parent.postMessage({ type: 'IFRAME_KEYDOWN' }, '*');
  };

  document.addEventListener('keydown', handleKeyDown);
  
  // Cleanup function
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, []);

  if (!editor) {
    return null
  }

  return (
    <EditorContent
      editor={editor}
      role="presentation"
      className="notion-like-editor-content"
      style={{
        cursor: editor.view.dragging ? "grabbing" : "auto",
      }}
    >
      <MobileToolbar />

      <DragContextMenu />
      <AiMenu />
      <EmojiDropdownMenu />
      <MentionDropdownMenu />
      <SlashDropdownMenu />
      <NotionToolbarFloating />
    </EditorContent>
  )
}

/**
 * Component that creates and provides the editor instance
 */
export function EditorProvider(props: EditorProviderProps) {
  const { placeholder = "Start writing...", aiToken } = props

  const { user } = useUser()

  // Build extensions conditionally
  const extensions = [
    StarterKit.configure({
      horizontalRule: false,
      dropcursor: {
        width: 2,
      },
      link: { openOnClick: false },
    }),
    HorizontalRule,
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Placeholder.configure({
      placeholder,
      emptyNodeClass: "is-empty with-slash",
    }),
    Mention,
    Emoji.configure({
      emojis: gitHubEmojis.filter(
        (emoji) => !emoji.name.includes("regional")
      ),
      forceFallbackImages: true,
    }),
    Mathematics.configure({
      inlineOptions: {
        onClick: (node, pos) => {
          if (!editor) return
          const latex = prompt('수식을 수정하세요:', node.attrs.latex)
          if (latex !== null) {
            editor.chain().setNodeSelection(pos).updateInlineMath({ latex }).focus().run()
          }
        },
      },
      blockOptions: {
        onClick: (node, pos) => {
          if (!editor) return
          const latex = prompt('수식을 수정하세요:', node.attrs.latex)
          if (latex !== null) {
            editor.chain().setNodeSelection(pos).updateBlockMath({ latex }).focus().run()
          }
        },
      },
      katexOptions: {
        throwOnError: false,
        macros: {
          '\\R': '\\mathbb{R}',
          '\\N': '\\mathbb{N}',
          '\\Z': '\\mathbb{Z}',
          '\\Q': '\\mathbb{Q}',
          '\\C': '\\mathbb{C}',
        },
      },
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
      limit: 3,
      upload: handleImageUpload,
      onError: (error) => console.error("Upload failed:", error),
    }),
    UniqueID,
    Typography,
    UiState,
  ]

  // No collaboration extensions for standalone mode

  // AI extension removed for standalone mode

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        class: "notion-like-editor",
      },
    },
    extensions,
  })

  if (!editor) {
    return <LoadingSpinner />
  }

  return (
    <div className="notion-like-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <EditorContentArea />
      </EditorContext.Provider>
    </div>
  )
}

/**
 * Full editor with all necessary providers, ready to use with just a room ID
 */
export function NotionEditor({
  room,
  placeholder = "Start writing...",
}: NotionEditorProps) {
  return (
    <UserProvider>
      <AppProvider>
        <CollabProvider room={room}>
          <AiProvider>
            <NotionEditorContent placeholder={placeholder} />
          </AiProvider>
        </CollabProvider>
      </AppProvider>
    </UserProvider>
  )
}

/**
 * Internal component that handles the editor loading state
 */
export function NotionEditorContent({ placeholder }: { placeholder?: string }) {
  const { provider, ydoc, hasCollab } = useCollab()
  const { aiToken, hasAi } = useAi()

  // Show loading only if collab or AI features are enabled but tokens are still loading
  if ((hasCollab && !provider) || (hasAi && !aiToken)) {
    return <LoadingSpinner />
  }

  return (
    <EditorProvider
      placeholder={placeholder}
      aiToken={aiToken}
    />
  )
}

