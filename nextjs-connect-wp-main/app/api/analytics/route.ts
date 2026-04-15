// Analytics API endpoint for tracking post views
import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServiceClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    const supabase = await getSupabaseServiceClient()

    const { data, error } = await supabase
      .from('posts_analytics')
      .select('*')
      .eq('wordpress_post_id', parseInt(postId))
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found - create default analytics
        return NextResponse.json({
          wordpress_post_id: parseInt(postId),
          views: 0,
          comments_count: 0,
          last_updated: new Date().toISOString(),
        })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId } = body

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 })
    }

    const supabase = await getSupabaseServiceClient()

    // Increment views using RPC function
    const { error } = await supabase.rpc('increment_post_views', {
      post_id: postId,
    })

    if (error) {
      // If RPC fails, try direct update
      await supabase
        .from('posts_analytics')
        .update({
          views: 1,
          last_updated: new Date().toISOString(),
        })
        .eq('wordpress_post_id', postId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to update analytics' },
      { status: 500 }
    )
  }
}
