"use client"

import * as React from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"
import { FunctionSquareIcon } from "@/components/tiptap-icons/function-square-icon"
import { useMathematics, type UseMathematicsConfig } from "./use-mathematics"
import { MathInputModal } from "../math-input-modal/math-input-modal"

export interface MathematicsButtonProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "onClick" | "type">,
    UseMathematicsConfig {}

/**
 * Mathematics button component for inserting LaTeX formulas
 */
export function MathematicsButton({
  editor,
  hideWhenUnavailable = false,
  type: mathType = "inline",
  onInserted,
  ...props
}: MathematicsButtonProps) {
  const { 
    isVisible, 
    handleInsert, 
    canInsert, 
    isModalOpen,
    handleModalSubmit,
    handleModalCancel,
    label 
  } = useMathematics({
    editor,
    hideWhenUnavailable,
    type: mathType,
    onInserted,
  })

  if (!isVisible) {
    return null
  }

  return (
    <>
      <Button
        type="button"
        data-style="ghost"
        disabled={!canInsert}
        onClick={handleInsert}
        tooltip={label}
        {...props}
      >
        <FunctionSquareIcon className="tiptap-button-icon" />
      </Button>

      <MathInputModal
        isOpen={isModalOpen}
        onClose={handleModalCancel}
        onSubmit={handleModalSubmit}
        title={mathType === "inline" ? "인라인 수식 입력" : "블록 수식 입력"}
        placeholder={mathType === "inline" ? "e.g. a^2 + b^2 = c^2" : "e.g. \\int_a^b f(x) dx"}
        example={mathType === "inline" ? "a^2 + b^2 = c^2" : "\\sum_{i=1}^n i = n(n+1)/2"}
        type={mathType}
      />
    </>
  )
} 