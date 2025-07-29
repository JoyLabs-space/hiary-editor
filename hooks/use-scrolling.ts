"use client"

import * as React from "react"
import { useThrottledCallback } from "./use-throttled-callback"

/**
 * Hook that detects whether the user is currently scrolling.
 * Returns true while scrolling and false when scrolling stops.
 * 
 * @param delay The delay in milliseconds to wait after scrolling stops before returning false
 * @returns Boolean indicating whether the user is currently scrolling
 */
export function useScrolling(delay: number = 150): boolean {
  const [isScrolling, setIsScrolling] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleScroll = useThrottledCallback(() => {
    setIsScrolling(true)
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout to detect when scrolling stops
    timeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
      timeoutRef.current = null
    }, delay)
  }, 16) // Throttle to ~60fps

  React.useEffect(() => {
    const handleScrollEvent = () => {
      handleScroll()
    }

    // Listen to scroll events on window and document
    window.addEventListener('scroll', handleScrollEvent, { passive: true })
    document.addEventListener('scroll', handleScrollEvent, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScrollEvent)
      document.removeEventListener('scroll', handleScrollEvent)
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleScroll])

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return isScrolling
} 