// Real-time subscription hooks for Supabase
import { useEffect, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { createClient } from './supabase-client'
import type { PostAnalytics, UserComment } from './supabase-db'

/**
 * Hook to subscribe to post analytics in real-time
 */
export function usePostAnalytics(wordpressPostId: number | null) {
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  let channel: RealtimeChannel | null = null

  useEffect(() => {
    if (!wordpressPostId) return

    const subscribeToAnalytics = async () => {
      try {
        // Get initial data
        const { data, error } = await supabase
          .from('posts_analytics')
          .select('*')
          .eq('wordpress_post_id', wordpressPostId)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to fetch analytics:', error)
        } else if (data) {
          setAnalytics(data)
        }

        // Subscribe to changes
        channel = supabase
          .channel(`analytics:${wordpressPostId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'posts_analytics',
              filter: `wordpress_post_id=eq.${wordpressPostId}`,
            },
            (payload) => {
              if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                setAnalytics(payload.new as PostAnalytics)
              }
            }
          )
          .subscribe()
      } catch (error) {
        console.error('Subscription error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    subscribeToAnalytics()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [wordpressPostId, supabase])

  return { analytics, isLoading }
}

/**
 * Hook to subscribe to comments in real-time
 */
export function usePostComments(wordpressPostId: number | null) {
  const [comments, setComments] = useState<UserComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  let channel: RealtimeChannel | null = null

  useEffect(() => {
    if (!wordpressPostId) return

    const subscribeToComments = async () => {
      try {
        // Get initial data
        const { data, error } = await supabase
          .from('user_comments')
          .select('*')
          .eq('wordpress_post_id', wordpressPostId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to fetch comments:', error)
        } else {
          setComments(data || [])
        }

        // Subscribe to new comments
        channel = supabase
          .channel(`comments:${wordpressPostId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_comments',
              filter: `wordpress_post_id=eq.${wordpressPostId}`,
            },
            (payload) => {
              setComments((prev) => [payload.new as UserComment, ...prev])
            }
          )
          .subscribe()
      } catch (error) {
        console.error('Subscription error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    subscribeToComments()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [wordpressPostId, supabase])

  return { comments, isLoading }
}

/**
 * Hook to subscribe to presence changes (online users)
 */
export function usePresence(channel: string) {
  const [onlineUsers, setOnlineUsers] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const subscription = supabase
      .channel(channel, {
        config: {
          presence: {
            key: Math.random().toString(36).substring(7),
          },
        },
      })
      .on('presence', { event: 'sync' }, () => {
        const state = subscription.presenceState()
        setOnlineUsers(Object.values(state).flat())
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await subscription.track({
            user: 'anonymous',
            timestamp: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [channel, supabase])

  return { onlineUsers }
}
