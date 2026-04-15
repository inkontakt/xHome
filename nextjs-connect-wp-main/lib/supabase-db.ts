// Supabase database utilities for common operations
import { createClient } from './supabase-client'
import { getSupabaseServiceClient } from './supabase-server'

// Types for database tables
export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface PostAnalytics {
  id: string
  wordpress_post_id: number
  views: number
  comments_count: number
  last_updated: string
  created_at: string
}

export interface UserComment {
  id: string
  user_id: string
  post_id: number
  wordpress_post_id: number
  content: string
  created_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: string
  verified: boolean
}

export interface UserInteraction {
  id: string
  user_id: string
  post_id: number
  interaction_type: 'view' | 'save' | 'like'
  created_at: string
}

// User Profile operations
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  profile: Partial<UserProfile>
): Promise<UserProfile | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to update user profile:', error)
    return null
  }
}

// Analytics operations
export async function getPostAnalytics(
  wordpressPostId: number
): Promise<PostAnalytics | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('posts_analytics')
      .select('*')
      .eq('wordpress_post_id', wordpressPostId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to fetch post analytics:', error)
    return null
  }
}

export async function incrementPostViews(wordpressPostId: number): Promise<void> {
  const supabase = await getSupabaseServiceClient()

  try {
    await supabase.rpc('increment_post_views', {
      post_id: wordpressPostId,
    })
  } catch (error) {
    console.error('Failed to increment post views:', error)
  }
}

// Comments operations
export async function getPostComments(wordpressPostId: number): Promise<UserComment[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_comments')
      .select('*')
      .eq('wordpress_post_id', wordpressPostId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch comments:', error)
    return []
  }
}

export async function createComment(
  userId: string,
  wordpressPostId: number,
  content: string
): Promise<UserComment | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('user_comments')
      .insert([
        {
          user_id: userId,
          wordpress_post_id: wordpressPostId,
          content,
        },
      ])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to create comment:', error)
    return null
  }
}

// Newsletter operations
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        // Unique constraint violation
        console.warn('Email already subscribed')
        return false
      }
      throw error
    }

    return true
  } catch (error) {
    console.error('Failed to subscribe to newsletter:', error)
    return false
  }
}

export async function isEmailSubscribed(email: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('id')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return false
      throw error
    }

    return !!data
  } catch (error) {
    console.error('Failed to check subscription:', error)
    return false
  }
}

// User Interactions
export async function recordInteraction(
  userId: string,
  wordpressPostId: number,
  interactionType: 'view' | 'save' | 'like'
): Promise<void> {
  const supabase = createClient()

  try {
    await supabase.from('user_interactions').insert([
      {
        user_id: userId,
        post_id: wordpressPostId,
        interaction_type: interactionType,
      },
    ])
  } catch (error) {
    console.error('Failed to record interaction:', error)
  }
}

export async function getUserInteractions(
  userId: string,
  interactionType?: 'view' | 'save' | 'like'
): Promise<UserInteraction[]> {
  const supabase = createClient()

  try {
    let query = supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)

    if (interactionType) {
      query = query.eq('interaction_type', interactionType)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch user interactions:', error)
    return []
  }
}
