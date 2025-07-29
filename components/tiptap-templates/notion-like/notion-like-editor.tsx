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
import { Ai } from "@tiptap-pro/extension-ai"
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
import { useMathModal, MathInputModal } from "@/components/tiptap-ui/math-input-modal"
import { PasteModal } from "@/components/tiptap-ui/paste-modal/paste-modal"

// --- Contexts ---
import { AppProvider } from "@/contexts/app-context"
import { UserProvider, useUser } from "@/contexts/user-context"
import { CollabProvider, useCollab } from "@/contexts/collab-context"
import { AiProvider, useAi } from "@/contexts/ai-context"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/lib/tiptap-utils"
import { TIPTAP_AI_APP_ID } from "@/lib/tiptap-collab-utils"
import Paragraph from '@tiptap/extension-paragraph'
import { CodeBlockLanguageDropdown } from "@/components/tiptap-ui/code-block-language-dropdown/CodeBlockLanguageDropdown"
import { TableKit } from '@tiptap/extension-table'

// --- Styles ---
import "@/components/tiptap-templates/notion-like/notion-like-editor.scss"
import "@/components/tiptap-ui/paste-modal/paste-modal.scss";

// --- Content ---
import { NotionEditorHeader } from "@/components/tiptap-templates/notion-like/notion-like-editor-header"
import { MobileToolbar } from "@/components/tiptap-templates/notion-like/notion-like-editor-mobile-toolbar"
import { NotionToolbarFloating } from "@/components/tiptap-templates/notion-like/notion-like-editor-toolbar-floating"
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { lowlight } from 'lowlight'
import "highlight.js/styles/stackoverflow-dark.min.css";
import Youtube from '@tiptap/extension-youtube'

// 해당 부분에서 필요한 언어를 import 하여 lowlight에 적용할 수 있습니다.
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
  
  // 수식 모달 훅 사용
  const { modalProps } = useMathModal()
  
  // 붙여넣기 모달 상태
  const [pasteModalState, setPasteModalState] = React.useState({
    isOpen: false,
    content: '',
    position: null as { x: number; y: number } | null,
  })

  // 붙여넣기 모달 이벤트 리스너
  React.useEffect(() => {
    const handleShowPasteModal = (event: CustomEvent) => {
      const { content, position } = event.detail
      setPasteModalState({
        isOpen: true,
        content,
        position,
      })
    }

    window.addEventListener('show-paste-modal', handleShowPasteModal as EventListener)
    
    return () => {
      window.removeEventListener('show-paste-modal', handleShowPasteModal as EventListener)
    }
  }, [])

  const handlePasteModalClose = React.useCallback(() => {
    setPasteModalState({
      isOpen: false,
      content: '',
      position: null,
    })
  }, [])

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
  // JSON 데이터로 에디터 내용을 설정하는 함수
  const setEditorJsonDataRead = React.useCallback((data: Record<string, unknown>) => {
    if (!editor) {
      console.error('에디터가 초기화되지 않았습니다.')
      return
    }

    try {
      // JSON 데이터를 에디터에 설정
      editor.commands.setContent(data)
      editor.setEditable(false)
    } catch (error) {
      console.error('에디터 내용 설정 중 오류 발생:', error)
    }
  }, [editor])

  // 부모로부터 메시지를 받는 리스너
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log(event)
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
            console.log('DEBUG - SET_EDITOR_JSON_DATA', data)
            setEditorJsonData(data);
            break;
          case 'SET_EDITOR_JSON_DATA_READ':
            const dataRead = event.data.data;
            console.log('DEBUG - SET_EDITOR_JSON_DATA_FROM_PARENT', dataRead)
            setEditorJsonDataRead(dataRead);
            break;
          case 'change-color': {
            const isDark = event.data.color === 'dark'
            document.body.classList.toggle('code-dark', isDark)
            console.log(isDark)
            break;
          }
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
    <>
      {modalProps && <MathInputModal {...modalProps} />}
      <EditorContent
        editor={editor}
        role="presentation"
        className="notion-like-editor-content"
        style={{
          cursor: editor.view.dragging ? "grabbing" : "auto",
        }}
        spellCheck={false}
      >
        <MobileToolbar />
        <DragContextMenu />
        <AiMenu />
        <EmojiDropdownMenu />
        <MentionDropdownMenu />
        <SlashDropdownMenu />
        <NotionToolbarFloating />
        <CodeBlockLanguageDropdown editor={editor} />
      </EditorContent>
      
      {/* 붙여넣기 모달 */}
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
    Paragraph,
    CodeBlockLowlight.configure({
      lowlight,
      defaultLanguage: 'javascript',
    }),
    TapIndent,
    TableKit.configure({
      table: { resizable: true },
    }),
    Youtube,
  ]

  // No collaboration extensions for standalone mode

  // Add AI extension only if token is available
  if (aiToken) {
    extensions.push(
      Ai.configure({
        appId: TIPTAP_AI_APP_ID,
        token: aiToken,
        autocompletion: false,
        showDecorations: true,
        hideDecorationsOnStreamEnd: false,
        onLoading: (context) => {
          context.editor.commands.aiGenerationSetIsLoading(true)
          context.editor.commands.aiGenerationHasMessage(false)
        },
        onChunk: (context) => {
          context.editor.commands.aiGenerationSetIsLoading(true)
          context.editor.commands.aiGenerationHasMessage(true)
        },
        onSuccess: (context) => {
          const hasMessage = !!context.response
          context.editor.commands.aiGenerationSetIsLoading(false)
          context.editor.commands.aiGenerationHasMessage(hasMessage)
        },
      })
    )
  }

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
        <NotionEditorHeader />
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

  console.log('DEBUG - hasCollab:', hasCollab, 'provider:', !!provider)
  console.log('DEBUG - hasAi:', hasAi, 'aiToken:', !!aiToken)

  // Show loading only if collab or AI features are enabled but tokens are still loading
  if ((hasCollab && !provider) || (hasAi && !aiToken)) {
    console.log('DEBUG - Showing LoadingSpinner')
    return <LoadingSpinner />
  }

  console.log('DEBUG - Rendering EditorProvider')

  return (
    <EditorProvider
      placeholder={placeholder}
      aiToken={aiToken}
    />
  )
}

