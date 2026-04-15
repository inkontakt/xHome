'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  postId: number
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // Track post view
    const trackView = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId }),
        })
      } catch (error) {
        console.error('Failed to track view:', error)
      }
    }

    trackView()
  }, [postId])

  return null
}
