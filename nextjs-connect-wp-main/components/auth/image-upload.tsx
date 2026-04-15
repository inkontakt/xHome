'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { uploadFile, getPublicUrl } from '@/lib/supabase-storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ImageUploadProps {
  bucket: string
  folder?: string
  onUploadComplete?: (url: string, path: string) => void
  maxSizeMB?: number
  inputId?: string
  initialUrl?: string | null
  buttonClassName?: string
}

export function ImageUpload({
  bucket,
  folder = '',
  onUploadComplete,
  maxSizeMB = 5,
  inputId,
  initialUrl = null,
  buttonClassName,
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(initialUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fallbackId = useId()
  const resolvedId = inputId ?? `file-upload-${fallbackId}`

  useEffect(() => {
    setUploadedUrl(initialUrl)
  }, [initialUrl])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setLoading(true)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }

      // Validate file size
      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`)
      }

      // Upload file
      const result = await uploadFile(file, bucket, folder)
      setUploadedUrl(result.url)
      onUploadComplete?.(result.url, result.path)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="border-2 border-dashed rounded-lg p-6">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
          className="hidden"
          id={resolvedId}
        />

        <label htmlFor={resolvedId} className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className={buttonClassName}
          >
            {loading ? 'Uploading...' : 'Choose Image'}
          </Button>
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {uploadedUrl && (
          <div className="mt-4">
            <img
              src={uploadedUrl}
              alt="Uploaded"
              className="w-full h-auto rounded"
            />
            <p className="mt-2 text-sm text-green-600">Upload successful!</p>
          </div>
        )}
      </div>
    </div>
  )
}
