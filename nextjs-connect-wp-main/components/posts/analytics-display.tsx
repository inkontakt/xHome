'use client'

import { usePostAnalytics } from '@/lib/supabase-realtime'
import { Eye, MessageSquare } from 'lucide-react'

interface AnalyticsDisplayProps {
  postId: number
}

export function AnalyticsDisplay({ postId }: AnalyticsDisplayProps) {
  const { analytics, isLoading } = usePostAnalytics(postId)

  if (isLoading) {
    return <div className="text-sm text-gray-500">Loading analytics...</div>
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="flex gap-6 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span>{analytics.views || 0} views</span>
      </div>
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        <span>{analytics.comments_count || 0} comments</span>
      </div>
    </div>
  )
}
