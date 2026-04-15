// Comments API endpoint for creating and retrieving comments
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
      .from('user_comments')
      .select('*')
      .eq('wordpress_post_id', parseInt(postId))
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postId, content, userId } = body

    if (!postId || !content || !userId) {
      return NextResponse.json(
        { error: 'postId, content, and userId are required' },
        { status: 400 }
      )
    }

    // Validate content length
    if (content.trim().length === 0 || content.length > 5000) {
      return NextResponse.json(
        { error: 'Content must be between 1 and 5000 characters' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServiceClient()

    // Check if user exists (basic validation)
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Insert comment
    const { data, error } = await supabase
      .from('user_comments')
      .insert([
        {
          user_id: userId,
          wordpress_post_id: parseInt(postId),
          content: content.trim(),
        },
      ])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const commentId = searchParams.get('commentId')
    const userId = searchParams.get('userId')

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'commentId and userId are required' },
        { status: 400 }
      )
    }

    const supabase = await getSupabaseServiceClient()

    // Verify the comment belongs to the user
    const { data: commentData } = await supabase
      .from('user_comments')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (!commentData || commentData.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete comment
    const { error } = await supabase
      .from('user_comments')
      .delete()
      .eq('id', commentId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Comments API error:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
