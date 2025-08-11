import React from 'react'
import { NodeViewWrapper, NodeViewContent, type ReactNodeViewProps } from '@tiptap/react'
import { CodeBlockLanguageDropdown } from '@/components/tiptap-ui/code-block-language-dropdown/CodeBlockLanguageDropdown'
import type { Editor } from '@tiptap/react'

export function CodeBlockNode({ node, editor }: ReactNodeViewProps) {
  return (
    <NodeViewWrapper className="code-block-node">
      <div className="code-block-header">
        <CodeBlockLanguageDropdown editor={editor as Editor} />
      </div>
      <pre className="code-block-content">
        <NodeViewContent as="div">
          <code className={`language-${node.attrs.language || ''}`}>
            {node.textContent}
          </code>
        </NodeViewContent>
      </pre>
    </NodeViewWrapper>
  )
} 