"use client"

import * as React from "react"

/**
 * Hook that throttles a callback function.
 * The callback will only be executed at most once per specified delay.
 * 
 * @param callback The function to throttle
 * @param delay The throttle delay in milliseconds
 * @returns The throttled callback function
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = React.useRef(callback)
  const lastCallTimeRef = React.useRef(0)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Update callback ref when callback changes
  callbackRef.current = callback

  const throttledCallback = React.useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      const timeSinceLastCall = now - lastCallTimeRef.current

      if (timeSinceLastCall >= delay) {
        // If enough time has passed, execute immediately
        lastCallTimeRef.current = now
        callbackRef.current(...args)
      } else {
        // If not enough time has passed, schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        timeoutRef.current = setTimeout(() => {
          lastCallTimeRef.current = Date.now()
          callbackRef.current(...args)
          timeoutRef.current = null
        }, delay - timeSinceLastCall)
      }
    },
    [delay]
  ) as T

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return throttledCallback
} 