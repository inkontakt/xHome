// Supabase Storage utilities for file uploads and retrieval
import { createClient } from './supabase-client'

export interface UploadResult {
  path: string
  url: string
}

/**
 * Upload a file to Supabase Storage
 * @param file - File to upload
 * @param bucket - Bucket name ('blog-images' or 'user-uploads')
 * @param folder - Optional folder path inside bucket
 */
export async function uploadFile(
  file: File,
  bucket: string,
  folder: string = ''
): Promise<UploadResult> {
  const supabase = createClient()
  
  // Generate unique filename
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
  const filePath = folder ? `${folder}/${fileName}` : fileName

  try {
    const { error, data } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const url = getPublicUrl(bucket, filePath)

    return {
      path: filePath,
      url,
    }
  } catch (error) {
    console.error('Storage upload error:', error)
    throw error
  }
}

/**
 * Get public URL for a file in Supabase Storage
 * @param bucket - Bucket name
 * @param path - File path in bucket
 */
export function getPublicUrl(bucket: string, path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - Bucket name
 * @param path - File path in bucket
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  const supabase = createClient()

  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('Storage delete error:', error)
    throw error
  }
}

/**
 * List files in a bucket folder
 * @param bucket - Bucket name
 * @param folder - Folder path
 */
export async function listFiles(bucket: string, folder: string = '') {
  const supabase = createClient()

  try {
    const { error, data } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      })

    if (error) {
      throw new Error(`List failed: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Storage list error:', error)
    return []
  }
}
