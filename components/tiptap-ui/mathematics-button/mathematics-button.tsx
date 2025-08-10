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
        type={mathType}
      />
    </>
  )
} 