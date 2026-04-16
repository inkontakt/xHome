'use client'

import { useState } from 'react'

import ImageLightbox from '@/components/estimate-details/image-lightbox'

type EstimateImage = {
  file_name: string | null
  file_url: string | null
  file_mime_type: string | null
  file_position: number | null
}

type ImageGalleryProps = {
  imageFiles: EstimateImage[]
  showSupabaseLabel?: boolean
  emptyMessage: string
}

const ImageGallery = ({ imageFiles, showSupabaseLabel = false, emptyMessage }: ImageGalleryProps) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0)

  const handleImageClick = (index: number) => {
    setLightboxStartIndex(index)
    setLightboxOpen(true)
  }

  return (
    <>
      <section className='rounded-lg border bg-background p-4 shadow-sm'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Image Gallery</h2>
          {showSupabaseLabel ? <span className='text-xs text-muted-foreground'>Supabase</span> : null}
        </div>
        <div className='mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'>
          {imageFiles.length > 0 ? (
            imageFiles.map((image, index) => (
              <button
                key={image.file_url ?? image.file_name ?? index}
                onClick={() => handleImageClick(index)}
                className='group relative aspect-square cursor-pointer overflow-hidden rounded-md border-0 bg-muted p-0 transition-colors hover:bg-primary'
                aria-label={`View photo ${index + 1} in detail`}
              >
                {image.file_url ? (
                  <img
                    src={image.file_url}
                    alt={image.file_name ?? 'Estimate image'}
                    className='h-full w-full object-cover transition-transform group-hover:scale-105'
                    loading='lazy'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center bg-muted'>
                    <span className='text-sm text-muted-foreground'>Image URL missing</span>
                  </div>
                )}
                <div className='absolute right-0 bottom-0 bg-white/90 px-3 py-2 backdrop-blur-sm'>
                  <span className='text-sm font-semibold text-foreground'>Photo #{index + 1}</span>
                </div>
              </button>
            ))
          ) : (
            <div className='col-span-full flex h-48 items-center justify-center rounded-md border border-dashed bg-muted/40 px-4 text-center text-sm text-muted-foreground'>
              {emptyMessage}
            </div>
          )}
        </div>
        <p className='mt-3 text-xs text-muted-foreground'>
          {imageFiles.length > 0
            ? 'Click on any image to view it in full screen with navigation controls.'
            : emptyMessage}
        </p>
      </section>

      <ImageLightbox
        images={imageFiles}
        initialIndex={lightboxStartIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  )
}

export default ImageGallery
