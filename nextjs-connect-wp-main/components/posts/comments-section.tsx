'use client'

import { useState } from 'react'
import { useAuth } from '@/components/auth/auth-context'
import { usePostComments } from '@/lib/supabase-realtime'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDistanceToNow } from 'date-fns'

interface CommentsSectionProps {
  postId: number
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { user } = useAuth()
  const { comments, isLoading } = usePostComments(postId)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('Please sign in to comment')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content,
          userId: user.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to post comment')
        return
      }

      setContent('')
    } catch (err) {
      setError('An error occurred while posting your comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <h3 className="text-xl font-bold">Comments ({comments.length})</h3>

      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
            disabled={submitting}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={submitting || !content.trim()}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-gray-600">
          Please sign in to comment on this post.
        </p>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 border rounded-lg bg-gray-50"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-sm">Anonymous User</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
