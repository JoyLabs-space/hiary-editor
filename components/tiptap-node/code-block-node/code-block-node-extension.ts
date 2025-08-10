import { CodeBlock } from '@tiptap/extension-code-block'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { CodeBlockNode } from './code-block-node'

export const CodeBlockWithLanguage = CodeBlock.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      language: {
        default: '',
        parseHTML: element => element.getAttribute('data-language') || '',
        renderHTML: attributes => {
          if (!attributes.language) {
            return {}
          }
          return {
            'data-language': attributes.language,
          }
        },
      },
    }
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNode)
  },
}) 