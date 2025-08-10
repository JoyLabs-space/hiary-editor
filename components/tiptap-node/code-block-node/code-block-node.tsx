import React from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { CodeBlockLanguageDropdown } from '@/components/tiptap-ui/code-block-language-dropdown/CodeBlockLanguageDropdown'
import type { Editor } from '@tiptap/react'

interface CodeBlockNodeProps {
  node: any
  editor: Editor
  pos: number
}

export function CodeBlockNode({ node, editor, pos }: CodeBlockNodeProps) {
  return (
    <NodeViewWrapper className="code-block-node">
      <div className="code-block-header">
        <CodeBlockLanguageDropdown 
          editor={editor} 
          node={node} 
          pos={pos} 
        />
      </div>
      <NodeViewContent as="pre" className="code-block-content">
        <code className={`language-${node.attrs.language || ''}`}>
          {node.textContent}
        </code>
      </NodeViewContent>
    </NodeViewWrapper>
  )
} 